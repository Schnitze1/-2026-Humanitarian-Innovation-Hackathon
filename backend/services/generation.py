import os
import re
import json
import uuid
from transformers import AutoTokenizer, AutoModelForCausalLM
import config

citation_regex = re.compile(r'\[(src_[a-fA-F0-9]+#c\d+)\]')
_tokenizer = None
_model = None


def get_offline_llm():
    """
    :return: A tuple of (tokenizer, model) or (None, None) if not available.
    """
    global _tokenizer, _model
    if _model is None:
        try:
            _tokenizer = AutoTokenizer.from_pretrained(
                config.offline_llm_name, cache_dir=str(config.cache_dir)
            )
            _model = AutoModelForCausalLM.from_pretrained(
                config.offline_llm_name, cache_dir=str(config.cache_dir)
            )
        except Exception:
            pass
    return _tokenizer, _model


def parse_citations(text: str) -> tuple[str, list[dict]]:
    """
    :param text: Raw text generated containing source citations like [src_xxxx#cxx].
    :return: A tuple containing (cleaned_text_without_bracketed_citations, list_of_parsed_spans).
    """
    raw_sentences = re.split(r'(?<=[.!?])\s+', text)
    spans = []
    cleaned_sentences = []

    for sent in raw_sentences:
        if not sent.strip():
            continue
        match = citation_regex.search(sent)
        if match:
            source_chunk = match.group(1)
            cleaned_sent = re.sub(r'\s*\[src_[a-fA-F0-9]+#c\d+\]\s*(\.|\?|!)', r'\1', sent)
            cleaned_sent = re.sub(r'\s*\[src_[a-fA-F0-9]+#c\d+\]\s*', '', cleaned_sent).strip()
            cleaned_sentences.append(cleaned_sent)
            span_text = cleaned_sent
            if span_text.endswith(('.', '?', '!')):
                span_text = span_text[:-1].strip()
            spans.append({
                "span_id": f"s{len(spans) + 1}",
                "text": span_text,
                "source_chunk": source_chunk
            })
        else:
            cleaned_sentences.append(sent.strip())

    cleaned_text = " ".join(cleaned_sentences)
    return cleaned_text, spans


def generate_report(source_id: str, report_type: str, audience: str) -> dict:
    """
    :param source_id: Source ID of the ingested reference document.
    :param report_type: Type of report to generate (e.g., public, donor, internal).
    :param audience: Target audience for the generated output.
    :return: A dict containing report_id, content, and spans list.
    """
    index_file = config.index_dir / f"{source_id}.json"
    if not os.path.exists(index_file):
        raise FileNotFoundError(f"Source ID {source_id} does not exist")

    with open(index_file, "r", encoding="utf-8") as f:
        chunks = json.load(f)

    if not chunks:
        raise ValueError("No chunks found in source index")

    tokenizer, model = get_offline_llm()
    raw_content = ""
    if model is not None and tokenizer is not None:
        try:
            context = "\n".join([f"[{c['chunk_id']}] {c['text']}" for c in chunks[:3]])
            prompt = (
                f"Context:\n{context}\n\n"
                f"Write a {report_type} report for {audience} based on the context. "
                f"For each statement, append the source chunk ID in brackets like [src_id#c0].\n"
            )
            inputs = tokenizer(prompt, return_tensors="pt")
            outputs = model.generate(**inputs, max_new_tokens=150)
            raw_content = tokenizer.decode(outputs[0], skip_special_tokens=True)
        except Exception:
            pass

    if not raw_content:
        sentences = []
        for idx, c in enumerate(chunks[:3]):
            text = c['text']
            if text.endswith('.'):
                text = text[:-1]
            sentences.append(f"{text} [{source_id}#c{idx}].")
        raw_content = " ".join(sentences)
    cleaned_text, spans = parse_citations(raw_content)
    report_id = f"rep_{uuid.uuid4().hex[:8]}"
    report_data = {
        "report_id": report_id,
        "content": cleaned_text,
        "spans": spans
    }

    report_file = config.reports_dir / f"{report_id}.json"
    with open(report_file, "w", encoding="utf-8") as f:
        json.dump(report_data, f, indent=2)

    return report_data

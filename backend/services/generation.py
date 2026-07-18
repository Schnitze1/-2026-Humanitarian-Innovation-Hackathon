import os
import re
import json
import uuid
from transformers import AutoTokenizer, AutoModelForCausalLM
import config
from services.indexing import search_similar_chunks

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


def generate_report(source_id: str, report_type: str, audience: str, ngo_profile: str = "general", dataset_topic: str = "General Context") -> dict:
    """
    :param source_id: Source ID of the ingested reference document.
    :param report_type: Type of report to generate (e.g., public, donor, internal).
    :param audience: Target audience for the generated output.
    :param ngo_profile: The profile of the NGO (e.g. service_welfare_health).
    :param dataset_topic: The topic of the dataset being analyzed.
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
    
    try:
        import profiles
        ngo_instruction = profiles.NGO_PROFILES.get(ngo_profile, profiles.NGO_PROFILES["general"])
    except Exception:
        ngo_instruction = "General Non-Governmental Organization - Focus on overarching humanitarian impact."

    query = f"Key details and metrics regarding {dataset_topic} for {report_type} report aimed at {audience} audience"
    try:
        top_chunks = search_similar_chunks(query, source_id, top_k=2)
        if not top_chunks:
            top_chunks = chunks[:2]
    except Exception:
        top_chunks = chunks[:2]

    if model is not None and tokenizer is not None:
        try:
            context = "\n".join([f"[{c['chunk_id']}] {c['text']}" for c in top_chunks])
            messages = [
                {"role": "system", "content": (
                    "You are a professional AI reporting assistant for NGOs. "
                    f"Your client profile: {ngo_instruction}\n"
                    f"You must interpret the provided data through the lens of this NGO profile, highlighting relevant insights where possible.\n"
                    "You synthesize dense data into a coherent, natural language paragraph. "
                    "You NEVER output bullet points or raw lists. You ALWAYS write in full sentences.\n\n"
                    "EXAMPLE INPUT CONTEXT:\n"
                    "[src_123#c1] Data Record: COMMODITY is Food, OBS_VALUE is 90.5.\n"
                    "EXAMPLE OUTPUT:\n"
                    "The data indicates that the observed value for food commodities reached 90.5 [src_123#c1]. This demonstrates a key metric for the region."
                )},
                {"role": "user", "content": (
                    f"Write a 1-paragraph {report_type} report tailored for a {audience} audience based on the data below.\n"
                    f"Connect the data to our NGO profile's perspective and the topic of '{dataset_topic}'. If the connection is abstract, simply summarize the data accurately.\n"
                    f"Focus ONLY on factual accuracy and original synthesis to maintain trust with our donors.\n\n"
                    f"RULES:\n"
                    f"1. Write a fluent paragraph. NO LISTS. NO BULLET POINTS. Do not just copy the data fields.\n"
                    f"2. Every single fact or number must end with its exact source ID in brackets, e.g. [src_abc#c5].\n"
                    f"3. Maintain rigorous factual accuracy and original phrasing.\n"
                    f"4. NEVER refuse to write the report. You must always provide a summary of the data.\n\n"
                    f"CONTEXT:\n{context}\n\n"
                    f"REPORT:"
                )}
            ]
            prompt = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
            inputs = tokenizer(prompt, return_tensors="pt")
            outputs = model.generate(**inputs, max_new_tokens=400, temperature=0.7, do_sample=True, repetition_penalty=1.1)
            raw_content = tokenizer.decode(outputs[0][inputs.input_ids.shape[1]:], skip_special_tokens=True)
        except Exception:
            pass

    if not raw_content:
        # Offline dummy fallback (Testing)
        sentences = []
        for c in top_chunks:
            text = c['text']
            if text.endswith('.'):
                text = text[:-1]
            sentences.append(f"{text} [{c['chunk_id']}].")
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

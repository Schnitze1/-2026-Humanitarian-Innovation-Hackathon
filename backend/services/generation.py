import os
import re
import json
import uuid
from transformers import AutoTokenizer, AutoModelForCausalLM
import config
from services.indexing import search_similar_chunks

citation_regex = re.compile(r"\[(src_[a-fA-F0-9]+#c\d+)\]")
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
    raw_sentences = re.split(r"(?<=[.!?])\s+", text)
    spans = []
    cleaned_sentences = []

    for sent in raw_sentences:
        if not sent.strip():
            continue
        match = citation_regex.search(sent)
        if match:
            source_chunk = match.group(1)
            cleaned_sent = re.sub(
                r"\s*\[src_[a-fA-F0-9]+#c\d+\]\s*(\.|\?|!)", r"\1", sent
            )
            cleaned_sent = re.sub(
                r"\s*\[src_[a-fA-F0-9]+#c\d+\]\s*", "", cleaned_sent
            ).strip()
            cleaned_sentences.append(cleaned_sent)
            span_text = cleaned_sent
            if span_text.endswith((".", "?", "!")):
                span_text = span_text[:-1].strip()
            spans.append(
                {
                    "span_id": f"s{len(spans) + 1}",
                    "text": span_text,
                    "source_chunk": source_chunk,
                }
            )
        else:
            cleaned_sentences.append(sent.strip())

    cleaned_text = " ".join(cleaned_sentences)
    return cleaned_text, spans


def generate_report(
    source_id: str,
    report_type: str,
    audience: str,
    ngo_profile: str = "general",
    dataset_topic: str = "General Context",
    custom_guidelines: str | None = None,
) -> dict:
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

        ngo_instruction = profiles.NGO_PROFILES.get(
            ngo_profile, profiles.NGO_PROFILES["general"]
        )
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
                {
                    "role": "system",
                    "content": (
                        "You are a professional AI reporting assistant writing ON BEHALF of the following NGO: {ngo_instruction}\n"
                        "CRITICAL INSTRUCTION: Do NOT describe the NGO or explain what the NGO does. They already know who they are.\n"
                        "Your job is to summarize the provided data clearly and simply for a non-technical audience, finding actionable insights that align with the NGO's mission.\n"
                        + (f"\nIMPORTANT CUSTOM GUIDELINES:\n{custom_guidelines}\n\n" if custom_guidelines else "") +
                        "You synthesize dense data into a coherent, natural language paragraph. "
                        "You NEVER output bullet points or raw lists. You ALWAYS write in full sentences.\n\n"
                        "EXAMPLE INPUT CONTEXT:\n"
                        "[src_123#c1] Data Record: COMMODITY is Food, OBS_VALUE is 90.5.\n"
                        "EXAMPLE OUTPUT:\n"
                        "The recent data highlights a significant trend, with food commodities reaching an observed value of 90.5 [src_123#c1]."
                    ),
                },
                {
                    "role": "user",
                    "content": (
                        f"Write a simple, 1-paragraph {report_type} report tailored for a non-technical {audience} audience based on the data below.\n"
                        f"Highlight the most important trends and facts from the data in a clear, easy-to-understand way that is relevant to '{dataset_topic}'.\n"
                        f"DO NOT write about the organization itself. Focus ONLY on explaining the external dataset accurately.\n\n"
                        f"RULES:\n"
                        f"1. You MUST include specific numbers, percentages, or data points from the context. Do NOT write a generic summary.\n"
                        f"2. MANDATORY: Every single sentence or factual claim MUST end with its exact source ID in brackets, matching the context exactly (e.g. [src_abc#c5]).\n"
                        f"3. FAILURE TO INCLUDE BRACKETS [src_...] IS A CRITICAL ERROR. If you write a fact, you MUST cite it.\n"
                        f"4. Write a fluent paragraph. NO LISTS. NO BULLET POINTS.\n"
                        f"5. Maintain rigorous factual accuracy and original phrasing.\n\n"
                        f"CONTEXT:\n{context}\n\n"
                        f"REPORT:"
                    ),
                },
            ]
            prompt = tokenizer.apply_chat_template(
                messages, tokenize=False, add_generation_prompt=True
            )
            inputs = tokenizer(prompt, return_tensors="pt")
            outputs = model.generate(
                **inputs,
                max_new_tokens=400,
                temperature=0.7,
                do_sample=True,
                repetition_penalty=1.1,
            )
            raw_content = tokenizer.decode(
                outputs[0][inputs.input_ids.shape[1] :], skip_special_tokens=True
            )
        except Exception:
            pass

    if not raw_content:
        # Offline dummy fallback (Testing)
        sentences = []
        for c in top_chunks:
            text = c["text"]
            if text.endswith("."):
                text = text[:-1]
            sentences.append(f"{text} [{c['chunk_id']}].")
        raw_content = " ".join(sentences)
    cleaned_text, spans = parse_citations(raw_content)
    report_id = f"rep_{uuid.uuid4().hex[:8]}"
    report_data = {"report_id": report_id, "content": cleaned_text, "spans": spans}

    report_file = config.reports_dir / f"{report_id}.json"
    with open(report_file, "w", encoding="utf-8") as f:
        json.dump(report_data, f, indent=2)

    return report_data

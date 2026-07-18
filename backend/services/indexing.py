import os
import json
import uuid
import pandas as pd
import numpy as np
from sentence_transformers import SentenceTransformer
import config

_model = None


def get_embedding_model():
    """
    :return: The loaded SentenceTransformer model instance.
    """
    global _model
    if _model is None:
        _model = SentenceTransformer(
            config.embed_model_name, cache_folder=str(config.cache_dir)
        )
    return _model


def ingest_document(content: bytes, name: str, program_name: str) -> tuple[str, int]:
    """
    :param content: Binary content of the uploaded document.
    :param name: Filename of the document (used to detect format).
    :param program_name: Context/program name associated with this ingestion.
    :return: A tuple of (source_id, number_of_chunks_indexed).
    """
    source_id = f"src_{uuid.uuid4().hex[:8]}"
    try:
        text_content = content.decode("utf-8")
    except UnicodeDecodeError:
        text_content = content.decode("latin-1")
    _, ext = os.path.splitext(name.lower())
    chunks = []

    if ext == ".csv":
        from io import StringIO

        df = pd.read_csv(StringIO(text_content))

        # Performance optimization: Cap large datasets to 10000 rows to prevent CPU embedding lockup
        if len(df) > 10000:
            df = df.sample(n=10000, random_state=42)

        # Group into markdown tables of 10 rows to improve AI context readability
        # and prevent repetitive run-on sentences.
        chunk_size = 10
        for i in range(0, len(df), chunk_size):
            chunk_df = df.iloc[i : i + chunk_size]

            cols = list(chunk_df.columns)
            md_lines = ["| " + " | ".join(str(c) for c in cols) + " |"]
            md_lines.append("|" + "|".join(["---"] * len(cols)) + "|")

            for _, row in chunk_df.iterrows():
                md_lines.append(
                    "| " + " | ".join(str(v) if pd.notna(v) else "" for v in row) + " |"
                )

            chunks.append("\n".join(md_lines))
    else:
        import textwrap

        raw_chunks = [c.strip() for c in text_content.split("\n\n") if c.strip()]
        if not raw_chunks:
            raw_chunks = [c.strip() for c in text_content.split("\n") if c.strip()]

        # Enforce maximum chunk size
        max_chunk_chars = 1000
        for chunk in raw_chunks:
            if len(chunk) > max_chunk_chars:
                wrapped = textwrap.wrap(
                    chunk, width=max_chunk_chars, break_long_words=False
                )
                chunks.extend(wrapped)
            else:
                chunks.append(chunk)

    if not chunks:
        raise ValueError("No text chunks found in document")

    model = get_embedding_model()
    embeddings = model.encode(chunks)

    index_data = []
    for idx, (chunk_text, emb) in enumerate(zip(chunks, embeddings)):
        chunk_id = f"{source_id}#c{idx}"
        index_data.append(
            {
                "chunk_id": chunk_id,
                "text": chunk_text,
                "embedding": (
                    emb.tolist()
                    if isinstance(emb, np.ndarray)
                    else [float(x) for x in emb]
                ),
            }
        )

    index_file = config.index_dir / f"{source_id}.json"
    with open(index_file, "w", encoding="utf-8") as f:
        json.dump(index_data, f, indent=2)

    return source_id, len(chunks)


def search_similar_chunks(query: str, source_id: str, top_k: int = 3) -> list[dict]:
    """
    :param query: Query string to compare against chunk embeddings.
    :param source_id: Ingested document source ID to search within.
    :param top_k: Number of highest scoring chunks to return.
    :return: A list of dicts containing the top_k matching chunks.
    """
    index_file = config.index_dir / f"{source_id}.json"
    if not os.path.exists(index_file):
        raise FileNotFoundError(f"Index for source {source_id} not found")

    with open(index_file, "r", encoding="utf-8") as f:
        index_data = json.load(f)

    if not index_data:
        return []

    model = get_embedding_model()
    query_emb = model.encode([query])[0]

    results = []
    for chunk in index_data:
        emb = np.array(chunk["embedding"])
        norm_q = np.linalg.norm(query_emb)
        norm_e = np.linalg.norm(emb)
        if norm_q > 0 and norm_e > 0:
            sim = float(np.dot(query_emb, emb) / (norm_q * norm_e))
        else:
            sim = 0.0
        results.append((sim, chunk))

    results.sort(key=lambda x: x[0], reverse=True)
    return [r[1] for r in results[:top_k]]

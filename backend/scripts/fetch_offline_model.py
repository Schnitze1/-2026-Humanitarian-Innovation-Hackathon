import os
import sys
from pathlib import Path
from transformers import AutoTokenizer, AutoModelForCausalLM
from sentence_transformers import SentenceTransformer

# Add backend directory to path.
base_dir = Path(__file__).resolve().parent.parent
sys.path.append(str(base_dir))
import config


def download_models():
    print(f"Downloading Embedding Model: {config.embed_model_name}")
    SentenceTransformer(config.embed_model_name, cache_folder=str(config.cache_dir))
    print("Embedding model cached successfully.")

    print(f"\nDownloading Local LLM Model: {config.offline_llm_name}")
    AutoTokenizer.from_pretrained(config.offline_llm_name, cache_dir=str(config.cache_dir))
    AutoModelForCausalLM.from_pretrained(
        config.offline_llm_name, cache_dir=str(config.cache_dir))
    print("Local LLM model cached successfully.")


if __name__ == "__main__":
    download_models()

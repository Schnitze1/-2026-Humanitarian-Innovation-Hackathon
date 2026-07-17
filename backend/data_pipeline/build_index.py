import os
import sys
import argparse
from pathlib import Path

# Add backend to path.
base_dir = Path(__file__).resolve().parent.parent
sys.path.append(str(base_dir))

from services.indexing import ingest_document


def main():
    parser = argparse.ArgumentParser(
        description="Aiga local index")
    parser.add_argument(
        "path", type=str, help="Path to file or directory containing files")
    parser.add_argument("--program_name", type=str,
                        default="general", help="Name of the program context")

    args = parser.parse_args()
    input_path = Path(args.path)

    if not input_path.exists():
        print(f"Error: Path {input_path} does not exist.")
        sys.exit(1)

    files_to_process = []
    if input_path.is_file():
        files_to_process.append(input_path)
    elif input_path.is_dir():
        for item in input_path.iterdir():
            if item.is_file() and item.suffix.lower() in [".txt", ".csv", ".md"]:
                files_to_process.append(item)

    if not files_to_process:
        print("No valid files (.txt, .csv) found to process.")
        sys.exit(1)

    print(f"Found {len(files_to_process)} file(s).")
    for f in files_to_process:
        print(f"Reading {f.name}")
        try:
            with open(f, "rb") as file_io:
                bytes_content = file_io.read()
            source_id, chunks_indexed = ingest_document(
                bytes_content, f.name, args.program_name)
            print(
                f"Success: Indexed {f.name} -> ID: {source_id} ({chunks_indexed} chunks)")
        except Exception as e:
            print(f"Error indexing {f.name}: {e}")


if __name__ == "__main__":
    main()

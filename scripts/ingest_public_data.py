from __future__ import annotations

import argparse
import csv
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"

OUTPUT = DATA_DIR / "annotations" / "dataset_sources.csv"


FIELDNAMES = [
    "sample_id",
    "session_id",
    "speaker_id",
    "audio_path",
    "transcript_path",
    "label",
    "scenario",
    "fraud_type",
    "language",
    "transaction_amount",
    "transaction_currency",
    "transaction_type",
    "recipient_new",
    "prior_transactions",
    "time_since_last_transaction",
    "speaker_baseline_available",
    "source",
    "source_dataset",
    "consent_status",
]


def write_header() -> None:
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)

    with OUTPUT.open(
        "w",
        newline="",
        encoding="utf-8",
    ) as handle:
        writer = csv.DictWriter(
            handle,
            fieldnames=FIELDNAMES,
        )
        writer.writeheader()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--reset",
        action="store_true",
        help="Reset the source annotation table.",
    )

    args = parser.parse_args()

    if args.reset or not OUTPUT.exists():
        write_header()

    print(f"Source annotation file: {OUTPUT}")
    print("No samples are automatically invented or relabeled.")
    print("Dataset-specific ingestion adapters should populate this file.")


if __name__ == "__main__":
    main()
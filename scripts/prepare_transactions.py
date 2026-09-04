from __future__ import annotations

import argparse
from pathlib import Path

import pandas as pd


ROOT = Path(__file__).resolve().parents[1]

RAW_DIR = ROOT / "data" / "raw" / "transactions"
PROCESSED_DIR = ROOT / "data" / "processed" / "transactions"


def find_pickles(root: Path) -> list[Path]:
    return sorted(root.rglob("*.pkl"))


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--input",
        type=Path,
        default=RAW_DIR / "fraud_detection_handbook",
    )
    args = parser.parse_args()

    files = find_pickles(args.input)

    if not files:
        raise FileNotFoundError(
            f"No .pkl transaction files found under {args.input}"
        )

    print(f"Found {len(files)} transaction files.")

    frames = []

    for file in files:
        print(f"Reading {file}")
        frames.append(pd.read_pickle(file))

    transactions = pd.concat(
        frames,
        ignore_index=True,
    )

    print()
    print(f"Rows: {len(transactions):,}")
    print("Columns:")
    print(list(transactions.columns))

    PROCESSED_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    output = PROCESSED_DIR / "transactions_combined.parquet"

    transactions.to_parquet(
        output,
        index=False,
    )

    print()
    print(f"Saved: {output}")


if __name__ == "__main__":
    main()
from __future__ import annotations

import csv
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DATASET_PATH = ROOT / "data" / "annotations" / "dataset.csv"


def main() -> None:
    if not DATASET_PATH.exists():
        print("Dataset file not found.")
        return

    with DATASET_PATH.open(
        "r",
        newline="",
        encoding="utf-8",
    ) as handle:
        rows = list(csv.DictReader(handle))

    print("SentinelPay Dataset Report")
    print("=" * 30)

    if not rows:
        print("No samples available.")
        return

    labels = Counter(
        row["label"]
        for row in rows
    )

    scenarios = Counter(
        row["scenario"]
        for row in rows
    )

    languages = Counter(
        row["language"]
        for row in rows
    )

    speakers = {
        row["speaker_id"]
        for row in rows
    }

    sessions = {
        row["session_id"]
        for row in rows
    }

    print(f"Samples:   {len(rows)}")
    print(f"Speakers:  {len(speakers)}")
    print(f"Sessions:  {len(sessions)}")

    print("\nLabels")
    print("-" * 30)
    print(f"Legitimate:             {labels.get('0', 0)}")
    print(f"Fraud/social-engineering: {labels.get('1', 0)}")

    print("\nScenarios")
    print("-" * 30)

    for name, count in sorted(scenarios.items()):
        print(f"{name}: {count}")

    print("\nLanguages")
    print("-" * 30)

    for language, count in sorted(languages.items()):
        print(f"{language}: {count}")


if __name__ == "__main__":
    main()
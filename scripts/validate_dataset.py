from __future__ import annotations

import csv
import sys
from pathlib import Path
from collections import Counter, defaultdict


ROOT = Path(__file__).resolve().parents[1]
DATASET_PATH = ROOT / "data" / "annotations" / "dataset.csv"

REQUIRED_COLUMNS = [
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


def fail(message: str) -> None:
    print(f"[FAIL] {message}")


def main() -> int:
    if not DATASET_PATH.exists():
        fail(f"Dataset file does not exist: {DATASET_PATH}")
        return 1

    with DATASET_PATH.open("r", newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)

        if reader.fieldnames is None:
            fail("CSV has no header.")
            return 1

        missing_columns = [
            column
            for column in REQUIRED_COLUMNS
            if column not in reader.fieldnames
        ]

        if missing_columns:
            fail(
                "Missing required columns: "
                + ", ".join(missing_columns)
            )
            return 1

        rows = list(reader)

    print("SentinelPay dataset validation")
    print("-" * 32)

    if not rows:
        print("Dataset contains only the header.")
        print("Validation structure: PASS")
        print("No samples have been added yet.")
        return 0

    errors = []

    sample_ids = set()
    session_to_speakers = defaultdict(set)
    scenario_labels = defaultdict(set)
    speaker_sessions = defaultdict(set)

    label_counts = Counter()
    source_counts = Counter()

    for row_number, row in enumerate(rows, start=2):
        sample_id = row["sample_id"].strip()
        session_id = row["session_id"].strip()
        speaker_id = row["speaker_id"].strip()

        if not sample_id:
            errors.append(f"Row {row_number}: missing sample_id")

        if sample_id in sample_ids:
            errors.append(
                f"Row {row_number}: duplicate sample_id={sample_id}"
            )

        sample_ids.add(sample_id)

        if not session_id:
            errors.append(f"Row {row_number}: missing session_id")

        if not speaker_id:
            errors.append(f"Row {row_number}: missing speaker_id")

        label = row["label"].strip()

        if label not in {"0", "1"}:
            errors.append(
                f"Row {row_number}: label must be 0 or 1, got {label!r}"
            )
        else:
            label_counts[label] += 1

        scenario = row["scenario"].strip()

        if not scenario:
            errors.append(
                f"Row {row_number}: missing scenario"
            )

        session_to_speakers[session_id].add(speaker_id)
        speaker_sessions[speaker_id].add(session_id)

        if scenario and label in {"0", "1"}:
            scenario_labels[scenario].add(int(label))

        source = row["source"].strip()

        if not source:
            errors.append(
                f"Row {row_number}: missing source"
            )
        else:
            source_counts[source] += 1

        recipient_new = row["recipient_new"].strip()

        if recipient_new not in {"0", "1"}:
            errors.append(
                f"Row {row_number}: recipient_new must be 0 or 1"
            )

        baseline = row["speaker_baseline_available"].strip()

        if baseline not in {"0", "1"}:
            errors.append(
                f"Row {row_number}: speaker_baseline_available must be 0 or 1"
            )

    print(f"Samples:       {len(rows)}")
    print(f"Sessions:      {len(session_to_speakers)}")
    print(f"Speakers:      {len(speaker_sessions)}")
    print(f"Legitimate:    {label_counts['0']}")
    print(f"Fraud:         {label_counts['1']}")

    print("\nSource distribution:")
    for source, count in sorted(source_counts.items()):
        print(f"  {source}: {count}")

    print("\nScenario label coverage:")

    leakage_scenarios = []

    for scenario, labels in sorted(scenario_labels.items()):
        label_text = ", ".join(str(value) for value in sorted(labels))
        print(f"  {scenario}: labels={label_text}")

        if len(labels) == 1:
            leakage_scenarios.append(scenario)

    if leakage_scenarios:
        print("\n[WARNING] Scenario/label proxy candidates:")
        for scenario in leakage_scenarios:
            print(f"  {scenario}")
        print(
            "These scenarios contain only one label in the current dataset. "
            "This does not automatically prove leakage, but they require review."
        )

    if errors:
        print("\nValidation errors:")
        for error in errors:
            print(f"  - {error}")

        print(f"\nValidation: FAIL ({len(errors)} errors)")
        return 1

    print("\nValidation: PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
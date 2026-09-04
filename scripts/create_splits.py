from __future__ import annotations

import csv
import json
import random
import sys
from collections import defaultdict
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]

DATASET_PATH = ROOT / "data" / "annotations" / "dataset.csv"
SPLITS_DIR = ROOT / "data" / "splits"
MANIFEST_PATH = SPLITS_DIR / "split_manifest.json"

TRAIN_RATIO = 0.70
VALIDATION_RATIO = 0.15
TEST_RATIO = 0.15

SEED = 42


def write_csv(path: Path, rows: list[dict], fieldnames: list[str]) -> None:
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(
            handle,
            fieldnames=fieldnames,
        )
        writer.writeheader()
        writer.writerows(rows)


def main() -> int:
    if not DATASET_PATH.exists():
        print(f"Dataset not found: {DATASET_PATH}")
        return 1

    with DATASET_PATH.open(
        "r",
        newline="",
        encoding="utf-8",
    ) as handle:
        reader = csv.DictReader(handle)
        rows = list(reader)
        fieldnames = reader.fieldnames or []

    if not rows:
        print("Dataset is empty. Add real samples before creating splits.")
        return 1

    required = {
        "sample_id",
        "session_id",
        "speaker_id",
        "label",
    }

    missing = required - set(fieldnames)

    if missing:
        print(
            "Missing required columns: "
            + ", ".join(sorted(missing))
        )
        return 1

    random.seed(SEED)

    speaker_to_rows = defaultdict(list)

    for row in rows:
        speaker_to_rows[row["speaker_id"]].append(row)

    speakers = list(speaker_to_rows.keys())

    if len(speakers) < 3:
        print(
            "Need at least 3 distinct speakers for "
            "speaker-disjoint train/validation/test splitting."
        )
        return 1

    random.shuffle(speakers)

    total_speakers = len(speakers)

    train_count = max(
        1,
        round(total_speakers * TRAIN_RATIO),
    )

    validation_count = max(
        1,
        round(total_speakers * VALIDATION_RATIO),
    )

    if train_count + validation_count >= total_speakers:
        train_count = max(1, total_speakers - 2)
        validation_count = 1

    test_count = total_speakers - train_count - validation_count

    if test_count < 1:
        print("Unable to create a non-empty test speaker set.")
        return 1

    train_speakers = speakers[:train_count]
    validation_speakers = speakers[
        train_count : train_count + validation_count
    ]
    test_speakers = speakers[
        train_count + validation_count :
    ]

    train_rows = [
        row
        for speaker in train_speakers
        for row in speaker_to_rows[speaker]
    ]

    validation_rows = [
        row
        for speaker in validation_speakers
        for row in speaker_to_rows[speaker]
    ]

    test_rows = [
        row
        for speaker in test_speakers
        for row in speaker_to_rows[speaker]
    ]

    train_ids = {row["speaker_id"] for row in train_rows}
    validation_ids = {
        row["speaker_id"] for row in validation_rows
    }
    test_ids = {row["speaker_id"] for row in test_rows}

    if train_ids & validation_ids:
        raise RuntimeError("Speaker leakage: train/validation")

    if train_ids & test_ids:
        raise RuntimeError("Speaker leakage: train/test")

    if validation_ids & test_ids:
        raise RuntimeError("Speaker leakage: validation/test")

    all_sessions = {
        row["session_id"]
        for row in rows
    }

    split_sessions = {
        "train": {
            row["session_id"]
            for row in train_rows
        },
        "validation": {
            row["session_id"]
            for row in validation_rows
        },
        "test": {
            row["session_id"]
            for row in test_rows
        },
    }

    if split_sessions["train"] & split_sessions["test"]:
        raise RuntimeError("Session leakage: train/test")

    if split_sessions["validation"] & split_sessions["test"]:
        raise RuntimeError("Session leakage: validation/test")

    if split_sessions["train"] & split_sessions["validation"]:
        raise RuntimeError("Session leakage: train/validation")

    if (
        set().union(
            split_sessions["train"],
            split_sessions["validation"],
            split_sessions["test"],
        )
        != all_sessions
    ):
        raise RuntimeError("Not all sessions were assigned to a split")

    SPLITS_DIR.mkdir(parents=True, exist_ok=True)

    write_csv(
        SPLITS_DIR / "train.csv",
        train_rows,
        fieldnames,
    )

    write_csv(
        SPLITS_DIR / "validation.csv",
        validation_rows,
        fieldnames,
    )

    write_csv(
        SPLITS_DIR / "test.csv",
        test_rows,
        fieldnames,
    )

    manifest = {
        "strategy": "speaker_and_session_disjoint",
        "seed": SEED,
        "ratios": {
            "train": TRAIN_RATIO,
            "validation": VALIDATION_RATIO,
            "test": TEST_RATIO,
        },
        "speakers": {
            "train": sorted(train_ids),
            "validation": sorted(validation_ids),
            "test": sorted(test_ids),
        },
        "counts": {
            "samples": {
                "train": len(train_rows),
                "validation": len(validation_rows),
                "test": len(test_rows),
            },
            "speakers": {
                "train": len(train_ids),
                "validation": len(validation_ids),
                "test": len(test_ids),
            },
            "sessions": {
                "train": len(split_sessions["train"]),
                "validation": len(split_sessions["validation"]),
                "test": len(split_sessions["test"]),
            },
        },
    }

    with MANIFEST_PATH.open(
        "w",
        encoding="utf-8",
    ) as handle:
        json.dump(
            manifest,
            handle,
            indent=2,
        )

    print("Dataset split created successfully.")
    print()
    print(f"Train:      {len(train_rows)} samples")
    print(f"Validation: {len(validation_rows)} samples")
    print(f"Test:       {len(test_rows)} samples")
    print()
    print("Speaker-disjoint: PASS")
    print("Session-disjoint: PASS")

    return 0


if __name__ == "__main__":
    sys.exit(main())
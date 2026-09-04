from __future__ import annotations

import csv
import hashlib
import json
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]

RAW_AUDIO = ROOT / "data" / "raw" / "audio" / "teleantifraud"
RAW_TRANSCRIPTS = ROOT / "data" / "raw" / "transcripts" / "teleantifraud"

BINARY_DIR = (
    RAW_TRANSCRIPTS
    / "binary_classification"
    / "binary_classification"
)

SFT_DIR = RAW_TRANSCRIPTS / "sft" / "sft"

OUTPUT_DIR = ROOT / "data" / "processed" / "audio" / "teleantifraud"
OUTPUT_FILE = OUTPUT_DIR / "metadata.csv"


# SentinelPay canonical schema
FIELDS = [
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


# Fraud types explicitly observed in the SFT data.
FRAUD_TYPES = {
    "客服诈骗",
    "银行诈骗",
    "投资诈骗",
    "钓鱼诈骗",
    "彩票诈骗",
    "绑架诈骗",
    "身份盗窃",
}


def normalize_slashes(value: str) -> str:
    return value.replace("\\", "/").lstrip("./")


def make_id(prefix: str, audio_path: str) -> str:
    digest = hashlib.sha1(audio_path.encode("utf-8")).hexdigest()[:16]
    return f"{prefix}_{digest}"


def extract_binary_audio(item: dict[str, Any]) -> str | None:
    """
    Extract the audio path from the binary classification structure.
    """
    try:
        content = item["prompt"][1]["content"]

        for part in content:
            if part.get("type") == "audio":
                audio_url = part.get("audio_url")
                if audio_url:
                    return normalize_slashes(audio_url)
    except (KeyError, IndexError, TypeError):
        pass

    return None


def find_audio_file(relative_audio_path: str) -> Path | None:
    """
    Resolve the dataset-relative audio path against the extracted
    TeleAntiFraud audio directory.
    """
    relative_audio_path = normalize_slashes(relative_audio_path)

    candidate = RAW_AUDIO / relative_audio_path

    if candidate.is_file():
        return candidate

    # Fallback: recursive filename/path search.
    matches = list(RAW_AUDIO.rglob(Path(relative_audio_path).name))

    if len(matches) == 1:
        return matches[0]

    # Exact suffix matching is useful if the archive has one
    # additional directory level.
    suffix = Path(relative_audio_path).as_posix()

    suffix_matches = [
        p
        for p in RAW_AUDIO.rglob("*")
        if p.is_file() and p.as_posix().replace("\\", "/").endswith(suffix)
    ]

    if len(suffix_matches) == 1:
        return suffix_matches[0]

    return None


def base_record(
    sample_id: str,
    audio_relative: str,
    source_split: str,
) -> dict[str, Any]:
    return {
        "sample_id": sample_id,
        "session_id": sample_id,
        "speaker_id": "",
        "audio_path": str(
            Path("data") / "raw" / "audio" / "teleantifraud" / audio_relative
        ).replace("\\", "/"),
        "transcript_path": "",
        "label": "",
        "scenario": "",
        "fraud_type": "",
        "language": "zh",
        "transaction_amount": "",
        "transaction_currency": "",
        "transaction_type": "",
        "recipient_new": "",
        "prior_transactions": "",
        "time_since_last_transaction": "",
        "speaker_baseline_available": "false",
        "source": "public_dataset",
        "source_dataset": "TeleAntiFraud",
        "consent_status": "dataset_license",
        "_split": source_split,
    }


def load_binary_file(path: Path, split: str) -> list[dict[str, Any]]:
    with path.open("r", encoding="utf-8") as f:
        items = json.load(f)

    records = []

    for index, item in enumerate(items):
        audio_relative = extract_binary_audio(item)

        if not audio_relative:
            print(
                f"[WARNING] No audio path in binary item "
                f"{split}:{index}"
            )
            continue

        answer = str(item.get("answer", "")).strip().lower()

        if answer == "fraud":
            label = "1"
        elif answer == "normal":
            label = "0"
        else:
            print(
                f"[WARNING] Unexpected binary label "
                f"{split}:{index}: {answer!r}"
            )
            continue

        sample_id = make_id(
            f"teleantifraud_binary_{split}",
            audio_relative,
        )

        record = base_record(
            sample_id,
            audio_relative,
            split,
        )

        record["label"] = label

        records.append(record)

    return records


def extract_sft_scene_and_fraud_type(
    item: dict[str, Any],
) -> tuple[str, str]:
    """
    Extract scenario and fraud type from the assistant's
    JSON answer when those values occur explicitly.
    """
    scenario = ""
    fraud_type = ""

    messages = item.get("messages", [])

    for message in messages:
        if message.get("role") != "assistant":
            continue

        content = message.get("content", "")

        if not isinstance(content, str):
            continue

        try:
            start = content.find("{")
            end = content.rfind("}")

            if start != -1 and end != -1 and end > start:
                obj = json.loads(content[start : end + 1])

                if isinstance(obj, dict):
                    scene = obj.get("scene")
                    if isinstance(scene, str):
                        scenario = scene

        except (json.JSONDecodeError, TypeError):
            pass

    answers = item.get("answers")

    if isinstance(answers, str) and answers in FRAUD_TYPES:
        fraud_type = answers

    return scenario, fraud_type


def load_sft_file(path: Path, split: str) -> list[dict[str, Any]]:
    records = []

    with path.open("r", encoding="utf-8") as f:
        for index, line in enumerate(f, 1):
            line = line.strip()

            if not line:
                continue

            item = json.loads(line)

            audios = item.get("audios", [])

            if not audios:
                print(
                    f"[WARNING] No audio path in SFT item "
                    f"{split}:{index}"
                )
                continue

            audio_relative = normalize_slashes(audios[0])

            answers = item.get("answers")

            if answers == "fraud":
                label = "1"
            elif answers == "normal":
                label = "0"
            elif answers in FRAUD_TYPES:
                # Explicit fraud types are fraudulent.
                label = "1"
            else:
                label = ""

            scenario, fraud_type = extract_sft_scene_and_fraud_type(item)

            sample_id = make_id(
                f"teleantifraud_sft_{split}",
                audio_relative + f"#{index}",
            )

            record = base_record(
                sample_id,
                audio_relative,
                split,
            )

            record["label"] = label
            record["scenario"] = scenario
            record["fraud_type"] = fraud_type

            records.append(record)

    return records


def validate_audio(records: list[dict[str, Any]]) -> tuple[int, list[str]]:
    missing = []

    for record in records:
        audio_relative = record["audio_path"].split(
            "data/raw/audio/teleantifraud/",
            1,
        )[-1]

        resolved = find_audio_file(audio_relative)

        if resolved is None:
            missing.append(
                f"{record['sample_id']} -> {audio_relative}"
            )

    return len(records) - len(missing), missing


def write_csv(records: list[dict[str, Any]]) -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    with OUTPUT_FILE.open(
        "w",
        encoding="utf-8",
        newline="",
    ) as f:
        writer = csv.DictWriter(
            f,
            fieldnames=FIELDS,
            extrasaction="ignore",
        )

        writer.writeheader()

        for record in records:
            writer.writerow(record)


def print_summary(records: list[dict[str, Any]], missing: list[str]) -> None:
    from collections import Counter

    labels = Counter(
        r["label"]
        for r in records
        if r["label"] != ""
    )

    scenarios = Counter(
        r["scenario"]
        for r in records
        if r["scenario"] != ""
    )

    fraud_types = Counter(
        r["fraud_type"]
        for r in records
        if r["fraud_type"] != ""
    )

    splits = Counter(r["_split"] for r in records)

    print()
    print("=" * 60)
    print("TeleAntiFraud normalization report")
    print("=" * 60)

    print(f"Total normalized records : {len(records)}")
    print(f"Train records            : {splits.get('train', 0)}")
    print(f"Test records             : {splits.get('test', 0)}")
    print()
    print("Labels:")
    for key, value in labels.items():
        print(f"  {key}: {value}")

    print()
    print("Scenarios:")
    for key, value in scenarios.most_common():
        print(f"  {key}: {value}")

    print()
    print("Fraud types:")
    for key, value in fraud_types.most_common():
        print(f"  {key}: {value}")

    print()
    print(f"Audio references found : {len(records) - len(missing)}")
    print(f"Audio references missing: {len(missing)}")

    if missing:
        print()
        print("First 20 missing audio references:")
        for item in missing[:20]:
            print(f"  {item}")

    print()
    print(f"Output: {OUTPUT_FILE}")
    print("=" * 60)


def main() -> None:
    all_records: list[dict[str, Any]] = []

    print("Loading binary classification data...")

    all_records.extend(
        load_binary_file(
            BINARY_DIR / "train.json",
            "train",
        )
    )

    all_records.extend(
        load_binary_file(
            BINARY_DIR / "test.json",
            "test",
        )
    )

    print("Loading SFT data...")

    all_records.extend(
        load_sft_file(
            SFT_DIR / "train.jsonl",
            "train",
        )
    )

    all_records.extend(
        load_sft_file(
            SFT_DIR / "test.jsonl",
            "test",
        )
    )

    print(f"Loaded {len(all_records)} records.")

    print("Validating audio references...")

    found, missing = validate_audio(all_records)

    print(f"Audio found: {found}")
    print(f"Audio missing: {len(missing)}")

    write_csv(all_records)

    print_summary(all_records, missing)


if __name__ == "__main__":
    main()
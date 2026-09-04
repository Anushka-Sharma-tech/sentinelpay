from __future__ import annotations

import ast
from pathlib import Path

import pandas as pd


ROOT = Path(__file__).resolve().parents[1]

SHARD_DIR = (
    ROOT
    / "data"
    / "raw"
    / "audio"
    / "asvspoof2021_df"
    / "hf_shards"
    / "data"
)

SELECTED_FILE = (
    ROOT
    / "data"
    / "processed"
    / "audio"
    / "asvspoof2021_df"
    / "compact_metadata.csv"
)

OUTPUT_DIR = (
    ROOT
    / "data"
    / "raw"
    / "audio"
    / "asvspoof2021_df"
    / "audio"
)


def extract_trial_id(path_value: object) -> str | None:
    """
    Extract the ASVspoof trial ID from the HF path.

    Examples:
        DF_E_2974031.flac -> DF_E_2974031
        some/path/DF_E_2974031.flac -> DF_E_2974031
    """

    if not isinstance(path_value, str):
        return None

    import re

    match = re.search(r"(DF_E_\d+)", path_value)

    if match:
        return match.group(1)

    return None

def extract_audio_bytes(audio_value: object) -> bytes:
    """
    Extract raw audio bytes from the Hugging Face Audio feature.
    """
    if isinstance(audio_value, dict):
        raw_bytes = audio_value.get("bytes")

        if raw_bytes is not None:
            if isinstance(raw_bytes, bytes):
                return raw_bytes

            if isinstance(raw_bytes, bytearray):
                return bytes(raw_bytes)

            if isinstance(raw_bytes, list):
                return bytes(raw_bytes)

        # Sometimes the object may expose a local path.
        audio_path = audio_value.get("path")

        if audio_path:
            path = Path(str(audio_path))

            if path.exists():
                return path.read_bytes()

    raise ValueError(
        f"Could not extract audio bytes from value of type "
        f"{type(audio_value).__name__}"
    )


def main() -> None:
    selected = pd.read_csv(SELECTED_FILE)

    required_columns = {
        "trial_id",
        "speaker_id",
        "label_raw",
        "codec",
        "source",
        "attack",
        "shard",
    }

    missing = required_columns - set(selected.columns)

    if missing:
        raise ValueError(
            f"compact_metadata.csv is missing columns: "
            f"{sorted(missing)}"
        )

    selected_ids = set(
        selected["trial_id"].astype(str)
    )

    print("=" * 70)
    print("ASVspoof SELECTED AUDIO EXTRACTION")
    print("=" * 70)
    print(f"Selected trials: {len(selected_ids):,}")
    print()

    OUTPUT_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    found_ids: set[str] = set()
    duplicate_ids: list[str] = []

    shard_numbers = sorted(
        selected["shard"]
        .astype(int)
        .unique()
    )

    print("Shards:")
    print(shard_numbers)
    print()

    for shard_number in shard_numbers:

        shard_file = (
            SHARD_DIR
            / f"test-{shard_number:05d}-of-00080.parquet"
        )

        if not shard_file.exists():
            raise FileNotFoundError(
                f"Missing shard: {shard_file}"
            )

        print(f"Reading {shard_file.name}...")

        df = pd.read_parquet(shard_file)

        print(f"  Rows in shard: {len(df):,}")
        print(f"  Columns: {df.columns.tolist()}")

        required_hf_columns = {
            "path",
            "audio",
            "label",
            "notes",
        }

        missing_hf = required_hf_columns - set(df.columns)

        if missing_hf:
            raise ValueError(
                f"{shard_file.name} is missing columns: "
                f"{sorted(missing_hf)}"
            )

        # The HF dataset uses path rather than utterance_id.
        df["trial_id"] = df["path"].map(
            extract_trial_id
        )

        subset = df[
            df["trial_id"].isin(selected_ids)
        ].copy()

        print(
            f"  Selected rows found: "
            f"{len(subset):,}"
        )

        for _, row in subset.iterrows():

            trial_id = str(row["trial_id"])

            if trial_id in found_ids:
                duplicate_ids.append(trial_id)
                continue

            audio_bytes = extract_audio_bytes(
                row["audio"]
            )

            output_file = (
                OUTPUT_DIR
                / f"{trial_id}.flac"
            )

            output_file.write_bytes(audio_bytes)

            found_ids.add(trial_id)

    missing_ids = sorted(
        selected_ids - found_ids
    )

    print()
    print("=" * 70)
    print("EXTRACTION REPORT")
    print("=" * 70)

    print(
        f"Expected trials       : "
        f"{len(selected_ids):,}"
    )

    print(
        f"Extracted trials      : "
        f"{len(found_ids):,}"
    )

    print(
        f"Missing trials        : "
        f"{len(missing_ids):,}"
    )

    print(
        f"Duplicate trials      : "
        f"{len(duplicate_ids):,}"
    )

    if missing_ids:
        print()
        print("FIRST MISSING TRIALS:")

        for trial_id in missing_ids[:20]:
            print(f"  {trial_id}")

    if duplicate_ids:
        print()
        print("DUPLICATE TRIALS:")

        for trial_id in duplicate_ids[:20]:
            print(f"  {trial_id}")

    print()
    print(f"Audio directory: {OUTPUT_DIR}")

    if (
        len(found_ids) == len(selected_ids)
        and not missing_ids
        and not duplicate_ids
    ):
        print()
        print(
            "STATUS: SUCCESS — "
            "ALL SELECTED AUDIO EXTRACTED"
        )
    else:
        print()
        print("STATUS: REVIEW REQUIRED")


if __name__ == "__main__":
    main()
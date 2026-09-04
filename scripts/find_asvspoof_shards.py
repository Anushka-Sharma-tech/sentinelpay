from __future__ import annotations

import math
from pathlib import Path

import pandas as pd


ROOT = Path(__file__).resolve().parents[1]

LABELS = (
    ROOT
    / "data"
    / "raw"
    / "audio"
    / "asvspoof2021_df"
    / "metadata"
    / "hf_index"
    / "data"
    / "labels.parquet"
)

SELECTED = (
    ROOT
    / "data"
    / "processed"
    / "audio"
    / "asvspoof2021_df"
    / "selected_metadata.csv"
)

OUTPUT = (
    ROOT
    / "data"
    / "processed"
    / "audio"
    / "asvspoof2021_df"
    / "selected_with_shards.csv"
)

NUM_SHARDS = 80


def main() -> None:
    print("Loading HF labels index...")
    labels = pd.read_parquet(LABELS)

    print("Loading selected ASVspoof metadata...")
    selected = pd.read_csv(SELECTED)

    # The HF build sorts by utterance_id before creating the 80 shards.
    labels = labels.sort_values("utterance_id").reset_index(drop=True)

    selected_ids = set(selected["trial_id"].astype(str))

    positions = {
        uid: i
        for i, uid in enumerate(labels["utterance_id"].astype(str))
    }

    missing_ids = [
        uid
        for uid in selected_ids
        if uid not in positions
    ]

    if missing_ids:
        print(f"ERROR: {len(missing_ids)} selected IDs not found in HF labels.")
        print("First 20:")
        for uid in missing_ids[:20]:
            print(" ", uid)
        raise SystemExit(1)

    total = len(labels)

    # Hugging Face contiguous shard sizing:
    # first remainder shards have one extra row.
    base = total // NUM_SHARDS
    remainder = total % NUM_SHARDS

    def get_shard(row_index: int) -> int:
        larger_size = base + 1
        cutoff = larger_size * remainder

        if row_index < cutoff:
            return row_index // larger_size

        return remainder + (
            (row_index - cutoff) // base
        )

    rows = []

    for uid in sorted(selected_ids):
        pos = positions[uid]
        shard = get_shard(pos)

        rows.append(
            {
                "trial_id": uid,
                "hf_row_index": pos,
                "hf_shard": shard,
                "hf_shard_file": (
                    f"test-{shard:05d}-of-{NUM_SHARDS:05d}.parquet"
                ),
            }
        )

    shard_map = pd.DataFrame(rows)

    result = selected.merge(
        shard_map,
        on="trial_id",
        how="left",
        validate="one_to_one",
    )

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    result.to_csv(OUTPUT, index=False)

    print()
    print("=" * 70)
    print("ASVspoof SHARD MAPPING")
    print("=" * 70)

    print(f"Selected trials : {len(result):,}")
    print(f"Missing trials  : {result['hf_shard'].isna().sum()}")

    print()
    print("SHARDS REQUIRED:")
    counts = result["hf_shard"].value_counts().sort_index()

    for shard, count in counts.items():
        print(
            f"  shard {int(shard):02d} : "
            f"{count:4d} selected trials"
        )

    print()
    print(
        "UNIQUE SHARDS:",
        result["hf_shard"].nunique(),
        "of",
        NUM_SHARDS,
    )

    print()
    print(f"Output: {OUTPUT}")


if __name__ == "__main__":
    main()
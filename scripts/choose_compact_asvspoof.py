from __future__ import annotations

import pandas as pd
from pathlib import Path


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

METADATA = (
    ROOT
    / "data"
    / "raw"
    / "audio"
    / "asvspoof2021_df"
    / "metadata"
    / "keys"
    / "DF"
    / "CM"
    / "trial_metadata.txt"
)

OUTPUT = (
    ROOT
    / "data"
    / "processed"
    / "audio"
    / "asvspoof2021_df"
    / "compact_metadata.csv"
)

COLUMNS = [
    "speaker_id",
    "trial_id",
    "codec",
    "source",
    "attack",
    "label_raw",
    "trim",
    "subset",
    "vocoder",
    "field10",
    "field11",
    "field12",
    "field13",
]

NUM_SHARDS = 80


def shard_for_position(pos: int, total: int) -> int:
    base = total // NUM_SHARDS
    remainder = total % NUM_SHARDS

    large_size = base + 1
    cutoff = large_size * remainder

    if pos < cutoff:
        return pos // large_size

    return remainder + ((pos - cutoff) // base)


def main() -> None:
    print("Loading labels...")
    labels = pd.read_parquet(LABELS)

    print("Loading ASVspoof metadata...")
    meta = pd.read_csv(
        METADATA,
        sep=r"\s+",
        header=None,
        names=COLUMNS,
        engine="python",
    )

    labels = labels.sort_values("utterance_id").reset_index(drop=True)

    position = pd.DataFrame({
        "trial_id": labels["utterance_id"].astype(str),
        "hf_label": labels["label"].astype(int),
        "position": range(len(labels)),
    })

    position["shard"] = position["position"].map(
        lambda x: shard_for_position(x, len(labels))
    )

    meta["trial_id"] = meta["trial_id"].astype(str)

    merged = meta.merge(
        position,
        on="trial_id",
        how="inner",
        validate="one_to_one",
    )

    # Keep the official evaluation subset only.
    merged = merged[merged["subset"] == "eval"].copy()

    print()
    print("Calculating shard statistics...")

    stats = (
        merged.groupby("shard")
        .agg(
            total=("trial_id", "size"),
            spoof=("hf_label", "sum"),
            bona_fide=("hf_label", lambda x: (x == 0).sum()),
            speakers=("speaker_id", "nunique"),
            codecs=("codec", "nunique"),
            sources=("source", "nunique"),
            attacks=("attack", "nunique"),
        )
        .reset_index()
    )

    print()
    print(stats.to_string(index=False))

    # Choose the smallest number of shards needed to obtain
    # comfortably more than 1,000 bona-fide examples.
    #
    # We start with the highest-bona-fide shards so that the
    # required number of complete Parquet files is minimized.
    ranked = stats.sort_values(
        ["bona_fide", "speakers", "codecs"],
        ascending=False,
    )

    chosen = []
    bona_total = 0

    for _, row in ranked.iterrows():
        chosen.append(int(row["shard"]))
        bona_total += int(row["bona_fide"])

        if bona_total >= 1200:
            break

    chosen = sorted(chosen)

    print()
    print("=" * 70)
    print("CHOSEN SHARDS")
    print("=" * 70)

    chosen_stats = stats[stats["shard"].isin(chosen)]

    print(chosen_stats.to_string(index=False))
    print()

    print("Shard numbers:", chosen)
    print("Total bona-fide available:", int(chosen_stats["bona_fide"].sum()))
    print("Total spoof available:", int(chosen_stats["spoof"].sum()))

    compact_pool = merged[merged["shard"].isin(chosen)].copy()

    bona = compact_pool[compact_pool["hf_label"] == 0]
    spoof = compact_pool[compact_pool["hf_label"] == 1]

    # Select exactly 1,000 of each.
    selected_bona = bona.sample(
        n=1000,
        random_state=42,
    )

    selected_spoof = spoof.sample(
        n=1000,
        random_state=42,
    )

    selected = pd.concat(
        [selected_bona, selected_spoof],
        ignore_index=True,
    )

    selected = selected.sample(
        frac=1,
        random_state=42,
    ).reset_index(drop=True)

    selected["hf_shard"] = selected["shard"]
    selected["hf_shard_file"] = selected["shard"].map(
        lambda x: f"test-{int(x):05d}-of-{NUM_SHARDS:05d}.parquet"
    )

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)

    selected.to_csv(
        OUTPUT,
        index=False,
        encoding="utf-8",
    )

    print()
    print("=" * 70)
    print("COMPACT ASVSPOOF BENCHMARK")
    print("=" * 70)
    print("Selected rows:", len(selected))
    print("Bona fide:", (selected["hf_label"] == 0).sum())
    print("Spoof:", (selected["hf_label"] == 1).sum())
    print("Speakers:", selected["speaker_id"].nunique())
    print("Codecs:", selected["codec"].nunique())
    print("Sources:", selected["source"].nunique())
    print("Shards required:", selected["hf_shard"].nunique())
    print()
    print("SHARDS:")
    print(
        selected["hf_shard"]
        .value_counts()
        .sort_index()
        .to_string()
    )
    print()
    print("Output:", OUTPUT)


if __name__ == "__main__":
    main()
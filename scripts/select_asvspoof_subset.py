from __future__ import annotations

import pandas as pd
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]

INPUT = (
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

OUTPUT_DIR = (
    ROOT
    / "data"
    / "processed"
    / "audio"
    / "asvspoof2021_df"
)

OUTPUT = OUTPUT_DIR / "selected_metadata.csv"


COLUMNS = [
    "speaker_id",
    "trial_id",
    "codec",
    "source",
    "attack",
    "label",
    "trim",
    "subset",
    "vocoder",
    "field10",
    "field11",
    "field12",
    "field13",
]


def main() -> None:
    print("Reading ASVspoof metadata...")

    df = pd.read_csv(
        INPUT,
        sep=r"\s+",
        header=None,
        names=COLUMNS,
        engine="python",
    )

    # Keep only the official evaluation partition.
    eval_df = df[df["subset"] == "eval"].copy()

    bona = eval_df[eval_df["label"] == "bonafide"].copy()
    spoof = eval_df[eval_df["label"] == "spoof"].copy()

    print(f"Evaluation rows: {len(eval_df):,}")
    print(f"Bona fide: {len(bona):,}")
    print(f"Spoof: {len(spoof):,}")

    # Reproducible selection.
    # Stratify roughly across codecs so the subset is not dominated
    # by one recording/compression condition.
    per_codec_bona = 1000 // bona["codec"].nunique()
    per_codec_spoof = 1000 // spoof["codec"].nunique()

    selected_parts = []

    for codec in sorted(bona["codec"].unique()):
        part = bona[bona["codec"] == codec]
        n = min(per_codec_bona, len(part))
        selected_parts.append(
            part.sample(n=n, random_state=42)
        )

    selected_bona = pd.concat(selected_parts)

    # Fill to exactly 1,000 if integer division left a remainder.
    if len(selected_bona) < 1000:
        remaining = bona.drop(index=selected_bona.index)
        extra = remaining.sample(
            n=min(1000 - len(selected_bona), len(remaining)),
            random_state=42,
        )
        selected_bona = pd.concat([selected_bona, extra])

    selected_parts = []

    for codec in sorted(spoof["codec"].unique()):
        part = spoof[spoof["codec"] == codec]
        n = min(per_codec_spoof, len(part))
        selected_parts.append(
            part.sample(n=n, random_state=42)
        )

    selected_spoof = pd.concat(selected_parts)

    if len(selected_spoof) < 1000:
        remaining = spoof.drop(index=selected_spoof.index)
        extra = remaining.sample(
            n=min(1000 - len(selected_spoof), len(remaining)),
            random_state=42,
        )
        selected_spoof = pd.concat([selected_spoof, extra])

    selected = pd.concat(
        [selected_bona, selected_spoof],
        ignore_index=True,
    )

    selected = selected.sample(
        frac=1,
        random_state=42,
    ).reset_index(drop=True)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    selected.to_csv(
        OUTPUT,
        index=False,
        encoding="utf-8",
    )

    print()
    print("=" * 70)
    print("ASVspoof selected benchmark")
    print("=" * 70)

    print(f"Total: {len(selected):,}")
    print()
    print("Labels:")
    print(selected["label"].value_counts().to_string())
    print()
    print("Codecs:")
    print(selected["codec"].value_counts().to_string())
    print()
    print("Sources:")
    print(selected["source"].value_counts().to_string())
    print()
    print("Speakers:")
    print(selected["speaker_id"].nunique())
    print()
    print(f"Output: {OUTPUT}")


if __name__ == "__main__":
    main()
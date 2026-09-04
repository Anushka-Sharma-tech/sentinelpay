from __future__ import annotations

from pathlib import Path

import pandas as pd


ROOT = Path(__file__).resolve().parents[1]

INPUT = (
    ROOT
    / "data"
    / "processed"
    / "audio"
    / "asvspoof2021_df"
    / "compact_metadata.csv"
)

AUDIO_DIR = (
    ROOT
    / "data"
    / "raw"
    / "audio"
    / "asvspoof2021_df"
    / "audio"
)

OUTPUT_DIR = (
    ROOT
    / "data"
    / "processed"
    / "audio"
    / "asvspoof2021_df"
)

OUTPUT = OUTPUT_DIR / "metadata.csv"


def main() -> None:
    df = pd.read_csv(INPUT)

    required = [
        "trial_id",
        "speaker_id",
        "codec",
        "source",
        "attack",
        "label_raw",
        "trim",
        "subset",
        "vocoder",
    ]

    missing = [c for c in required if c not in df.columns]

    if missing:
        raise ValueError(
            f"Missing columns: {missing}"
        )

    records = []

    for _, row in df.iterrows():
        trial_id = str(row["trial_id"])

        audio_file = AUDIO_DIR / f"{trial_id}.flac"

        if not audio_file.is_file():
            raise FileNotFoundError(
                f"Audio missing: {audio_file}"
            )

        raw_label = str(row["label_raw"])

        if raw_label == "spoof":
            label = 1
        elif raw_label == "bonafide":
            label = 0
        else:
            raise ValueError(
                f"Unexpected label for {trial_id}: {raw_label}"
            )

        records.append(
            {
                "sample_id": f"asvspoof2021_df_{trial_id}",
                "trial_id": trial_id,
                "speaker_id": str(row["speaker_id"]),
                "audio_path": str(
                    Path(
                        "data",
                        "raw",
                        "audio",
                        "asvspoof2021_df",
                        "audio",
                        f"{trial_id}.flac",
                    )
                ).replace("\\", "/"),
                "label": label,
                "label_name": raw_label,
                "codec": str(row["codec"]),
                "source": str(row["source"]),
                "attack": str(row["attack"]),
                "trim": str(row["trim"]),
                "subset": str(row["subset"]),
                "vocoder": str(row["vocoder"]),
                "language": "",
                "transaction_amount": "",
                "transaction_currency": "",
                "transaction_type": "",
                "recipient_new": "",
                "prior_transactions": "",
                "time_since_last_transaction": "",
                "speaker_baseline_available": "",
                "source_dataset": "ASVspoof2021_DF",
                "source_distribution": "HuggingFace redistribution",
                "consent_status": "dataset_license",
            }
        )

    out = pd.DataFrame(records)

    OUTPUT_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    out.to_csv(
        OUTPUT,
        index=False,
        encoding="utf-8",
    )

    print("=" * 70)
    print("ASVSPOOF NORMALIZATION REPORT")
    print("=" * 70)

    print(f"Records: {len(out):,}")
    print()

    print("LABELS:")
    print(out["label_name"].value_counts().to_string())

    print()
    print("CODECS:")
    print(out["codec"].value_counts().to_string())

    print()
    print("SOURCES:")
    print(out["source"].value_counts().to_string())

    print()
    print("SPEAKERS:", out["speaker_id"].nunique())

    print()
    print(
        "AUDIO FILES:",
        out["audio_path"].map(
            lambda p: (ROOT / p).is_file()
        ).sum(),
        "/",
        len(out),
    )

    print()
    print(f"OUTPUT: {OUTPUT}")
    print("=" * 70)


if __name__ == "__main__":
    main()
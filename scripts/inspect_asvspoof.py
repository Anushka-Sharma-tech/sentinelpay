import pandas as pd
from pathlib import Path

p = Path("data/raw/audio/asvspoof2021_df/metadata/keys/DF/CM/trial_metadata.txt")

columns = [
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

df = pd.read_csv(
    p,
    sep=r"\s+",
    header=None,
    names=columns,
    engine="python",
)

print("=" * 70)
print("ASVspoof 2021 DF METADATA REPORT")
print("=" * 70)

print(f"Rows: {len(df):,}")
print(f"Columns: {len(df.columns)}")
print()

for col in [
    "label",
    "subset",
    "codec",
    "source",
    "vocoder",
    "attack",
]:
    print(f"{col.upper()}:")
    print(df[col].value_counts(dropna=False).to_string())
    print()

print("UNIQUE SPEAKERS:", df["speaker_id"].nunique())
print("UNIQUE TRIALS:", df["trial_id"].nunique())

print()
print("FIRST 5 PARSED ROWS:")
print(df.head().to_string(index=False))

print()
print("NULL COUNTS:")
print(df.isna().sum().to_string())

print("=" * 70)

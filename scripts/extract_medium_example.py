import pandas as pd
from pathlib import Path

ROOT = Path.cwd()
path = ROOT / "data" / "processed" / "training" / "test.parquet"

df = pd.read_parquet(path)

row = df.iloc[617]

columns = [
    "amount",
    "hour",
    "day_of_week",
    "customer_prior_count",
    "customer_prior_mean",
    "customer_prior_std",
    "customer_time_since_previous_sec",
    "terminal_prior_count",
    "customer_terminal_prior_count",
    "TX_TIME_SECONDS",
    "TX_TIME_DAYS",
]

print("=" * 70)
print("KNOWN MEDIUM TEST EXAMPLE")
print("=" * 70)

for column in columns:
    print(f"{column}: {row[column]}")

print()
print("Dataset fraud label:", row["TX_FRAUD"])

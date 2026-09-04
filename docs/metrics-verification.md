# Exact Metrics Verification

Do not invent final metrics.

Run this from the SentinelPay project root:

```powershell
python -c "import json; p='evaluation/metrics/risk_model_metrics.json'; d=json.load(open(p, encoding='utf-8')); print(json.dumps(d, indent=2))"
```

Then copy the exact reported values into `README.md`.

Also inspect:

```powershell
Get-Content evaluation/reports/risk_model_report.md
```

The README currently contains placeholders for precision/recall/F1/AUC values specifically because those exact numbers were not available in the current conversation state.

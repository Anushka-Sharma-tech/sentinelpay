# Metrics Verification

The reported metrics are from the chronological held-out evaluation of the primary transaction-risk model.

## Validation

At the validation-selected intervention threshold of 0.25:

- Precision: 0.8947
- Recall: 0.3104
- F1: 0.4609
- PR-AUC: 0.3394
- ROC-AUC: 0.6750
- FPR: 0.0003
- FNR: 0.6896
- Expected cost: ₹96,992.88

## Held-out test

- Precision: 0.8701
- Recall: 0.3047
- F1: 0.4514
- PR-AUC: 0.3297
- ROC-AUC: 0.6538
- FPR: 0.0004
- FNR: 0.6953
- TP: 710
- TN: 260,689
- FP: 106
- FN: 1,620
- False-positive cost: ₹5,300.00
- False-negative exposure: ₹90,202.72
- Expected cost: ₹95,502.72

## Cost assumption

Expected cost is calculated as:

```text
false positives × ₹50
+ sum of amounts for missed fraudulent transactions
```

The ₹50 false-positive cost is an explicit modeling assumption, not measured merchant economics.

## Threshold protocol

The 0.25 intervention threshold was selected using validation data. The 0.60 block threshold is a conservative operational policy choice. The final test set was not used to tune these thresholds.

## Verification commands

From the project root:

```powershell
python -c "import json; p='evaluation/metrics/risk_model_metrics.json'; d=json.load(open(p, encoding='utf-8')); print(json.dumps(d, indent=2))"
Get-Content evaluation/reports/risk_model_report.md
```

If regenerated evaluation artifacts disagree with the figures above, update the documentation only after checking the underlying evaluation protocol and confirming that the held-out test set remained untouched during threshold selection.

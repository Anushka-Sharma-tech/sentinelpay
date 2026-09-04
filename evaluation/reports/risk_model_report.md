# SentinelPay Risk Model Evaluation

## Dataset

- Training samples: 1,227,908
- Validation samples: 263,122
- Test samples: 263,125
- Test set remained untouched during threshold selection.

## Operating threshold

Threshold selected using the validation set:

**0.25**

The objective was:

`false-positive cost + false-negative transaction-loss exposure`

### False-positive cost assumption

A false positive is assigned an operational cost of:

**₹50.00**

A false negative uses the affected fraud transaction amount as loss exposure.

These are explicit evaluation assumptions and should not be presented as measured real-world merchant costs.

## Validation results at selected threshold

| Metric | Value |
|---|---:|
| Precision | 0.8947 |
| Recall | 0.3104 |
| F1 | 0.4609 |
| PR-AUC | 0.3394 |
| ROC-AUC | 0.6750 |
| FPR | 0.0003 |
| FNR | 0.6896 |
| Expected cost | ₹96,992.88 |

## Held-out test results

| Metric | Value |
|---|---:|
| Precision | 0.8701 |
| Recall | 0.3047 |
| F1 | 0.4514 |
| PR-AUC | 0.3297 |
| ROC-AUC | 0.6538 |
| FPR | 0.0004 |
| FNR | 0.6953 |
| True positives | 710 |
| True negatives | 260,689 |
| False positives | 106 |
| False negatives | 1,620 |
| False-positive cost | ₹5,300.00 |
| False-negative exposure | ₹90,202.72 |
| Expected cost | ₹95,502.72 |

## Interpretation

The reported test metrics are from the held-out test set and were not used to select the operating threshold.

The false-positive cost is an explicit modeling assumption rather than a claim about actual merchant economics.


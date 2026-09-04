# SentinelPay Final Completion Checklist

## 1. Repository hygiene

- [ ] Local `git status` reviewed before pulling remote work.
- [x] `frontend/node_modules/` ignored.
- [x] Python virtual environments ignored.
- [x] `.env` and `.env.local` ignored; `.env.example` remains safe to commit.
- [x] Raw/large datasets excluded from normal Git staging.
- [ ] Final repository contains no secrets, tokens, or private data.

## 2. Current application

- [x] FastAPI starts and `/health` responds.
- [x] Transaction-risk model runs.
- [x] Risk score maps to LOW/ALLOW, MEDIUM/REVIEW, HIGH/BLOCK.
- [x] Supabase sessions and risk events are persisted.
- [x] Razorpay Test Mode order integration works.
- [x] Anonymous demonstration path does not require email OTP/sign-in.
- [x] Frontend result page no longer presents inactive voice detectors as live signals.
- [x] Test Lab example-input sidebar remains within its column while scrolling.
- [ ] Final ALLOW/REVIEW/BLOCK payment-gating tests verified after the latest local merge.

## 3. Model and evaluation

- [x] Primary model: `HistGradientBoostingClassifier`.
- [x] Primary dataset: Fraud Detection Handbook transaction data.
- [x] Chronological train/validation/test split documented.
- [x] Test set kept out of threshold selection.
- [x] Held-out precision and recall documented.
- [x] PR-AUC and ROC-AUC documented.
- [x] False-positive and false-negative cost assumptions documented.

## 4. Scope honesty

- [x] Current live system is described as transaction/tabular risk analysis.
- [x] Speech datasets are described as auxiliary research material.
- [x] ASVspoof is not described as payment-fraud ground truth.
- [x] No claim is made that the current endpoint analyzes a user's voice.
- [x] No claim is made that the model guarantees fraud detection.

## 5. Deployment

- [x] Backend deployment prepared on Render.
- [x] Frontend deployment prepared on Vercel.
- [ ] Confirm final public Render URL.
- [ ] Set Vercel `NEXT_PUBLIC_API_URL` to the final Render URL.
- [ ] Set Render `ALLOWED_ORIGINS` to the final Vercel URL.
- [ ] Verify remote `/health`.
- [ ] Verify remote transaction analysis.
- [ ] Verify remote Supabase persistence.
- [ ] Verify remote payment gating.
- [ ] Keep Razorpay in Test Mode.

## 6. Final demonstration

Recommended sequence:

```text
Open SentinelPay
  ↓
Transaction Test Lab
  ↓
Choose a representative scenario
  ↓
Run analysis
  ↓
Show risk score + factors + decision
  ↓
Show persisted session/event
  ↓
Show ALLOW → Razorpay Test Mode order
  ↓
Show REVIEW/BLOCK → order creation prevented
  ↓
Show held-out evaluation metrics
  ↓
Show architecture and repository
```

Record the five-minute video **last**, after production verification is complete.

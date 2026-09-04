# SentinelPay
**AI-Powered Payment Risk Detection & Defense**

SentinelPay is a defense-oriented payment risk detection system that analyzes transaction behavior, produces a risk score, converts that score into an operational **ALLOW / REVIEW / BLOCK** decision, and persists the resulting decision for auditability.

The project combines:

- A trained machine-learning fraud-risk model
- Cost-aware decision thresholds
- Authenticated FastAPI APIs
- Supabase authentication and persistence
- Session and risk-event tracking
- Razorpay Test Mode integration
- A Next.js frontend for interactive demonstration

The system is designed as a practical, honestly-evaluated prototype rather than a collection of disconnected models.

---

## 1. The Problem

Payment fraud is rarely just a question of whether a transaction "looks unusual." A useful fraud-defense system needs to answer several questions:

- How risky is this transaction?
- Why does the system consider it risky?
- What action should be taken?
- Can the decision be audited later?
- What is the operational cost of making the wrong decision?

SentinelPay addresses these questions through a transaction-risk pipeline that combines historical behavior, transaction characteristics, a trained classifier, and an explicit, cost-aware decision policy.

The system is intentionally **defense-only**: its purpose is to detect and respond to potentially fraudulent activity, not to facilitate fraud or payment abuse.

---

## 2. SentinelPay at a Glance

```
                         ┌──────────────────────┐
                         │    SentinelPay UI     │
                         │    Next.js Frontend   │
                         └──────────┬───────────┘
                                    │
                                    │ Authenticated API
                                    ▼
                         ┌──────────────────────┐
                         │        FastAPI        │
                         │       API Layer        │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │     Risk Analyzer      │
                         │     ML Prediction       │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │      Risk Policy       │
                         │                        │
                         │  ALLOW / REVIEW /      │
                         │  BLOCK                 │
                         └──────────┬───────────┘
                                    │
                     ┌──────────────┴──────────────┐
                     ▼                              ▼
          ┌──────────────────┐           ┌──────────────────┐
          │     Supabase      │           │     Razorpay      │
          │                    │           │    Test Mode       │
          │  sessions          │           │                    │
          │  risk_events       │           │  Test orders       │
          │  authentication    │           │                    │
          └──────────────────┘           └──────────────────┘
```

---

## 3. Core Idea

SentinelPay follows a simple principle:

> **Prediction is not the same thing as a decision.**

The ML model produces a probability-like risk score. A separate risk policy converts that score into an operational action.

```
ML score
   │
   ├── < 0.25 ──────────────► LOW / ALLOW
   │
   ├── 0.25 to < 0.60 ──────► MEDIUM / REVIEW
   │
   └── >= 0.60 ─────────────► HIGH / BLOCK
```

This separation allows the model and the operational policy to evolve independently — the model can be retrained without changing the business logic, and the thresholds can be re-tuned without retraining the model.

---

## 4. Current System

**Backend**
- FastAPI, Python, Pydantic
- Supabase authentication
- Supabase database persistence
- scikit-learn, joblib
- Razorpay Python SDK

**Frontend**
- Next.js, TypeScript, Tailwind CSS
- App Router
- Supabase client
- Dashboard-oriented UI

**ML / Data**
- Fraud Detection Handbook transaction dataset
- TeleAntiFraud metadata pipeline (auxiliary)
- ASVspoof 2021 DF benchmark (auxiliary)
- Chronological data splitting
- Held-out test evaluation
- Cost-aware threshold selection

---

## 5. Project Structure

```
SentinelPay/
│
├── backend/
│   ├── app/
│   │   ├── api/routes/
│   │   ├── audio/
│   │   ├── models/
│   │   ├── risk/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── config.py
│   │   ├── dependencies.py
│   │   └── main.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/app/
│   └── ...
│
├── data/
│   ├── raw/
│   ├── processed/
│   ├── annotations/
│   ├── splits/
│   └── scenarios/
│
├── models/
│   ├── sentinelpay_risk_v1.pkl
│   └── manifests/
│
├── experiments/
│
├── evaluation/
│   ├── metrics/
│   ├── reports/
│   └── plots/
│
├── docs/
├── tests/
├── scripts/
│
├── README.md
├── LICENSE
├── .gitignore
└── .env.example
```

**Repository design principle:** large downloaded datasets and local environment files remain outside the public source tree. The repository contains the code, metadata, evaluation artifacts, documentation, and reproducibility material required to understand and demonstrate the system.

---

## 6. Machine Learning Model

**Primary model:** `HistGradientBoostingClassifier`

Selected because it provides nonlinear decision boundaries and efficient CPU inference while keeping the implementation lightweight enough for the prototype timeline.

- Model artifact: `models/sentinelpay_risk_v1.pkl`
- Model manifest: `models/manifests/sentinelpay-v1.json`

---

## 7. Feature Engineering

The primary model uses features covering:

**Transaction behavior:** `amount`, `hour`, `day_of_week`
**Cyclical time:** `hour_sin`, `hour_cos`
**Customer history:** `customer_prior_count`, `customer_prior_mean`, `customer_prior_std`, `customer_time_since_previous_sec`, `amount_vs_customer_mean`, `amount_zscore`
**Terminal behavior:** `terminal_prior_count`, `customer_terminal_prior_count`
**Transaction timing:** `TX_TIME_SECONDS`, `TX_TIME_DAYS`

The training pipeline **deliberately excludes** `TX_FRAUD_SCENARIO`, because directly exposing the fraud scenario to the model would create an unrealistic shortcut and risk target leakage.

---

## 8. Dataset Construction

The transaction dataset contains **1,754,155 rows**, split into:

| Split | Rows |
|---|---:|
| Train | 1,227,908 |
| Validation | 263,122 |
| Test | 263,125 |

The split is **chronological**, not randomly shuffled — this reflects a real deployment setting more closely, since future transactions should not influence the training representation of past transactions. The split implementation was explicitly designed to avoid placing identical timestamps across different partitions.

Verification checks:
```
train ∩ validation = 0
train ∩ test       = 0
validation ∩ test  = 0
```

---

## 9. Evaluation Methodology

```
                  ┌─────────────┐
                  │    Train     │
                  └──────┬──────┘
                         │
                         ▼
                  ┌─────────────┐
                  │  Validation  │
                  └──────┬──────┘
                         │
                threshold selection
                         │
                         ▼
                  ┌─────────────┐
                  │     Test     │
                  └─────────────┘
```

The **test set remained untouched during threshold selection**. Thresholds were chosen on the validation set only, then applied once, unmodified, to the held-out test set. This avoids tuning the operational threshold directly on the final evaluation numbers.

---

## 10. Cost-Aware Risk Policy

Fraud systems face an asymmetric cost problem: a false positive creates operational friction for a legitimate customer, while a false negative exposes the system to the full value of a fraudulent transaction.

SentinelPay evaluates an explicit operational cost function:

```
Expected Cost =
    (False Positive Count × ₹50)
    + (Sum of fraudulent transaction amounts missed)
```

**False-positive cost assumption: ₹50.00 per false positive.**
**False-negative cost:** the actual amount of the missed fraudulent transaction.

These are explicit, stated evaluation assumptions and are not presented as measured real-world merchant costs.

---

## 11. Operating Threshold

The intervention threshold was selected using the **validation set only**, by minimizing the cost function above:

**Selected threshold: 0.25**

| Risk Score | Risk Level | Decision |
|---|---|---|
| < 0.25 | LOW | ALLOW |
| 0.25 – < 0.60 | MEDIUM | REVIEW |
| ≥ 0.60 | HIGH | BLOCK |

The 0.25 threshold is derived directly from the validation cost analysis. The 0.60 block threshold is a deliberately conservative operational choice, not a claim that 0.60 is statistically optimal.

---

## 12. Evaluation Results

Evaluation artifacts:
```
evaluation/metrics/risk_model_metrics.json
evaluation/reports/risk_model_report.md
evaluation/plots/confusion_matrix.png
```

### Validation results at selected threshold

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

### Held-out test results

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
| **Expected cost** | **₹95,502.72** |

### Interpretation

The reported test metrics come from the held-out test set and were **not** used to select the operating threshold. Test-set performance closely tracks validation-set performance (Precision 0.87 vs 0.89, Recall 0.30 vs 0.31, Expected cost within ~1.5%), which indicates the threshold generalizes rather than overfitting to validation.

At the selected threshold, the model is precision-leaning by design: it flags a small, high-confidence slice of transactions (FPR of 0.04%) rather than casting a wide net. This was a deliberate cost-minimization choice, not an accuracy ceiling — the validation sweep showed that pushing recall higher increased false positives faster than it reduced fraud-loss exposure, given the stated ₹50 false-positive cost assumption. The false-positive cost itself is an explicit modeling assumption, not a claim about actual merchant economics.

---

## 13. Auxiliary Speech Data

SentinelPay also prepared speech-related datasets as a foundation for **future** multimodal risk analysis. These are not part of the current live decision path.

**TeleAntiFraud** — processed metadata at `data/processed/audio/teleantifraud/metadata.csv`. The normalization pipeline keeps explicitly labeled fraud examples separate from scene-only examples; scene-only examples are not automatically converted into fraud labels.

**ASVspoof 2021 DF** — a compact benchmark selection (2,000 trials: 1,000 spoof / 1,000 bonafide, 90 speakers, 9 codecs, 3 sources). Processed metadata at `data/processed/audio/asvspoof2021_df/metadata.csv`.

**Important distinction:** ASVspoof is a speech-spoof/deepfake detection benchmark. It is **not** treated as SentinelPay's fraud ground truth. This distinction is kept explicit to avoid an unsupported claim that speech spoofing and payment fraud are the same label.

---

## 14. API

**Health**
```
GET /health
```
```json
{
  "status": "ok",
  "service": "sentinelpay-backend",
  "version": "0.2.0"
}
```

**Transaction Risk Analysis**
```
POST /api/v1/analyze
Authorization: Bearer <SUPABASE_ACCESS_TOKEN>
```

Request:
```json
{
  "amount": 5000,
  "hour": 23,
  "day_of_week": 5,
  "customer_prior_count": 12,
  "customer_prior_mean": 500,
  "customer_prior_std": 150,
  "customer_time_since_previous_sec": 30,
  "terminal_prior_count": 20,
  "customer_terminal_prior_count": 5,
  "TX_TIME_SECONDS": 3600,
  "TX_TIME_DAYS": 30,
  "is_new_recipient": true
}
```

Response contains: `risk_score`, `risk_level`, `decision`, `signals`, `factors`, `model_version`, `calibrated`, `latency_ms`, `event_id`, `session_id`.

**Razorpay Test Mode Order**
```
POST /api/v1/razorpay/orders
```
```json
{
  "amount": 100,
  "currency": "INR",
  "receipt": "sentinelpay-test-001"
}
```
Response:
```json
{
  "order_id": "order_XXXXXXXX",
  "amount": 10000,
  "currency": "INR",
  "status": "created",
  "key_id": "rzp_test_XXXXXXXX"
}
```
The backend converts the INR amount into paise before sending the order request to Razorpay.

---

## 15. Authentication

Protected endpoints require a valid Supabase access token. The backend validates the bearer token before allowing risk-analysis or payment operations. Unauthenticated calls are rejected. Server-side secrets are kept out of the browser entirely.

---

## 16. Supabase Persistence

```
merchants
    │
    ▼
sessions
    │
    ▼
risk_events
```

Risk event schema: `id`, `session_id`, `risk_score`, `risk_level`, `decision`, `model_version`, `created_at`.

Every analysis creates a session linked to a merchant and records the resulting risk decision against that session — a basic audit trail for every model decision.

---

## 17. Razorpay Test Mode

SentinelPay integrates with Razorpay **Test Mode** exclusively, so the demonstration never involves real-money transactions. Test orders are created via the Razorpay Python SDK using `rzp_test_` credentials.

---

## 18. Security Model

Sensitive credentials belong exclusively on the server. Never expose `SUPABASE_SECRET_KEY`, `RAZORPAY_KEY_SECRET`, or `RAZORPAY_WEBHOOK_SECRET` to the frontend. Never commit `.env`, access tokens, JWTs, or private API keys. The frontend receives only explicitly safe/public configuration.

---

## 19. Frontend

Built with Next.js, TypeScript, Tailwind CSS, and the App Router.

Primary product flow:
```
Sign In → Dashboard → Transaction Test / Live Protection
   → Risk Analysis → Risk Score → ALLOW / REVIEW / BLOCK
   → Evidence / Factors → Persisted Risk Event → Razorpay Test Mode
```

The dashboard is designed to make the system understandable within a short demonstration, without requiring an evaluator to inspect backend code directly.

---

## 20. Demo Scenario

A representative high-risk transaction:
```json
{
  "amount": 5000,
  "hour": 23,
  "day_of_week": 5,
  "customer_prior_count": 12,
  "customer_prior_mean": 500,
  "customer_prior_std": 150,
  "customer_time_since_previous_sec": 30,
  "terminal_prior_count": 20,
  "customer_terminal_prior_count": 5,
  "TX_TIME_SECONDS": 3600,
  "TX_TIME_DAYS": 30,
  "is_new_recipient": true
}
```
produces a very high risk score under the current model. The important part of the demonstration is not the exact number — it's the complete chain:

```
Transaction → Prediction → Risk level → Decision → Evidence → Persistence
```

---

## 21. Local Setup

**Backend**
```bash
cd backend
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```
API docs: `http://127.0.0.1:8000/docs`
Health: `http://127.0.0.1:8000/health`

**Frontend**
```bash
cd frontend
npm install
npm run dev
```
Frontend: `http://localhost:3000`

---

## 22. Environment Variables

Create a local `.env` using `.env.example` as the template:
```
SUPABASE_URL=
SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=

RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=

ALLOWED_ORIGINS=http://localhost:3000
```
Never commit the real `.env`.

---

## 23. Reproducibility

Key scripts:
```
scripts/build_training_dataset.py
scripts/train_risk_model.py
scripts/evaluate_risk_model.py
scripts/normalize_teleantifraud.py
scripts/normalize_asvspoof.py
scripts/extract_asvspoof_selected.py
scripts/validate_dataset.py
```

Key generated artifacts:
```
models/sentinelpay_risk_v1.pkl
models/manifests/sentinelpay-v1.json
evaluation/metrics/risk_model_metrics.json
evaluation/reports/risk_model_report.md
evaluation/plots/confusion_matrix.png
```

---

## 24. Limitations

SentinelPay is intentionally presented as a prototype. Current limitations:

- The primary trained model is transaction-focused; recall at the selected operating threshold is 30.5% on the held-out test set — a deliberate precision-leaning trade-off under the stated cost assumptions, not a claim of comprehensive fraud coverage.
- Speech datasets are prepared as auxiliary foundations, not presented as a validated multimodal fraud detector.
- The explanation layer uses structured, model-derived risk factors rather than an LLM-generated explanation.
- The merchant/session path is simplified for demonstration purposes.
- Razorpay integration is in Test Mode only.
- Production-grade webhook orchestration, distributed infrastructure, and large-scale drift monitoring are outside the current scope.

These limitations are stated explicitly rather than hidden, in keeping with the project's own principle of auditable, honest reporting.

---

## 25. Why This Architecture?

SentinelPay separates **prediction** from **policy** from **persistence**:

- **Model** — "What is the estimated risk?"
- **Policy** — "What should we do about it?"
- **Persistence** — "Can we prove what decision was made and when?"

This separation makes the prototype easier to test, explain, and extend independently at each layer.

---

## 26. Future Work

- Validated multimodal transaction + speech fusion
- Calibrated probabilities
- Richer investigation workflows
- Feedback-driven threshold optimization
- Production webhook processing
- Drift monitoring
- Model version management
- Merchant-specific personalization
- Explainability tooling
- Real-time streaming risk analysis

These are intentionally future extensions, not claims about the current implementation.

---

## 27. Tools & Approach

The risk model, feature engineering, evaluation methodology, and decision policy were designed and implemented by me. The frontend was scaffolded with **Devin** (an AI coding agent), via reviewed pull requests against this repository, to let engineering time focus on the risk model and its evaluation rather than UI boilerplate. AI coding assistance was also used to support implementation of parts of the backend, under my design decisions and review.

This is disclosed deliberately: the project's own principle is that decisions should be explainable and auditable, and that includes how it was built.

---

## 28. One-Line Pitch

SentinelPay is a defense-oriented payment risk engine that turns transaction behavior into an explainable ALLOW, REVIEW, or BLOCK decision, persists the decision for auditability, and connects the risk loop to a real Razorpay Test Mode payment flow.
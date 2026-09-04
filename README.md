# SentinelPay

**Transaction fraud-risk detection and payment defense.**

SentinelPay is a defense-oriented prototype that evaluates structured payment and historical context with a trained machine-learning model, converts the resulting risk score into an explicit **ALLOW / REVIEW / BLOCK** decision, persists the assessment in Supabase, and connects the decision to Razorpay Test Mode order creation.

> **Scope note:** the current live transaction path is a tabular transaction-risk system. It does **not** accept microphone audio or conversation text. Speech datasets prepared in the project are auxiliary research material for a future multimodal extension and are not used as the current payment-fraud ground truth.

## 1. Problem statement

A payment can be technically valid while still being risky. A useful fraud-defense system therefore needs to estimate transaction risk before payment creation, make the result inspectable, apply a proportionate operational action, and retain an audit trail.

SentinelPay solves this as:

```text
Transaction + customer/terminal context
                |
                v
       Feature engineering
                |
                v
     HistGradientBoostingClassifier
                |
                v
          Risk probability
                |
                v
          Decision policy
        /       |        \
     ALLOW    REVIEW     BLOCK
        |        |          |
        v        v          v
   payment    review     stop payment
   path       required     creation
                |
                v
          Supabase audit
```

The important architectural distinction is **prediction versus policy**. The model estimates risk; the policy determines what the system should do with that estimate.

## 2. Current technology stack

| Layer | Technology | Current role |
|---|---|---|
| Frontend | Next.js, TypeScript, Tailwind CSS | Analyst/demo console |
| Backend | FastAPI, Python, Pydantic | Risk and payment APIs |
| ML | scikit-learn `HistGradientBoostingClassifier` | Transaction-risk prediction |
| Model artifact | `models/sentinelpay_risk_v1.pkl` | Versioned deployed model |
| Database | Supabase PostgreSQL | Sessions and risk-event persistence |
| Payments | Razorpay Test Mode | Test order creation only |
| Backend hosting | Render | FastAPI deployment |
| Frontend hosting | Vercel | Next.js deployment |

## 3. What the model uses

The current model is trained on the Fraud Detection Handbook transaction dataset. The live feature builder uses:

- `amount`
- `hour`
- `day_of_week`
- cyclical hour features: `hour_sin`, `hour_cos`
- customer history: prior count, historical mean, historical standard deviation
- time since the customer's previous transaction
- amount relative to customer history and amount z-score
- terminal prior count
- customer-terminal prior count
- dataset-relative transaction time in seconds and days

The request also accepts `is_new_recipient`; this is used for explanatory risk-factor output and is not presented as a standalone proof of fraud.

The training pipeline excludes `TX_FRAUD_SCENARIO` from model features to avoid an unrealistic shortcut/target leakage.

## 4. Data and evaluation

The primary transaction dataset contains **1,754,155 rows**:

| Split | Rows |
|---|---:|
| Train | 1,227,908 |
| Validation | 263,122 |
| Test | 263,125 |

The split is chronological, with timestamp-boundary checks and no overlap between partitions. The held-out test set was not used to choose the operating threshold.

### Validation at the selected 0.25 intervention threshold

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

### Held-out test

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
| Expected cost | **₹95,502.72** |

The stated cost function assumes ₹50 per false positive and uses the amount of a missed fraudulent transaction as false-negative exposure. These are evaluation assumptions, not measured merchant economics.

## 5. Decision policy

```text
risk score < 0.25       -> LOW    -> ALLOW
0.25 <= score < 0.60    -> MEDIUM -> REVIEW
risk score >= 0.60      -> HIGH   -> BLOCK
```

The 0.25 intervention point was selected using validation data and the explicit cost function. The 0.60 block point is a conservative operational choice rather than a claim of statistical optimality.

## 6. Database and audit trail

The current persisted flow uses Supabase PostgreSQL with the implemented `merchants`, `sessions`, and `risk_events` tables.

A transaction analysis creates a session linked to the demo merchant, runs the model, and records the resulting risk event. The risk event stores the decision, risk score, risk level, model version, session ID, and creation time.

The browser receives the resulting event/session identifiers so the demonstration can connect the model result to the persisted record.

## 7. Payment defense

Razorpay is used in **Test Mode only**. The intended control path is:

```text
Payment request
      |
      v
Risk analysis
      |
      +---- LOW / ALLOW ----> eligible for test order creation
      |
      +---- MEDIUM / REVIEW -> do not automatically proceed
      |
      +---- HIGH / BLOCK ---> do not create payment order
```

No real-money payment is part of the demonstration. Checkout and payment verification are outside the current prototype scope.

## 8. Speech research boundary

TeleAntiFraud and ASVspoof 2021 DF were processed as auxiliary datasets during the broader research work.

They are **not** the current transaction model's fraud labels:

- TeleAntiFraud contains explicitly labeled examples alongside scene-only/unlabeled material; scene-only records are not automatically converted into fraud labels.
- ASVspoof 2021 DF is a speech spoof/deepfake benchmark, not payment-fraud ground truth.

The current transaction endpoint does not accept audio, speech features, speaker samples, or conversation transcripts. The live UI therefore does not present acoustic, prosody, speaker, or conversation scores as active detectors.

## 9. API

### Health

```http
GET /health
```

### Transaction analysis

```http
POST /api/v1/analyze
```

Example body:

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

The response contains the risk score, risk level, decision, explanatory factors, model version, latency, event ID, and session ID.

### Razorpay Test Mode order

```http
POST /api/v1/razorpay/orders
```

The backend converts INR rupees to paise and calls Razorpay with server-side Test Mode credentials. Sensitive credentials never belong in the frontend.

## 10. Repository structure

```text
SentinelPay/
├── backend/       # FastAPI application
├── frontend/      # Next.js application
├── data/          # processed metadata and local datasets
├── models/        # model artifact and manifests
├── experiments/   # research experiments
├── evaluation/    # metrics, reports, plots
├── docs/          # architecture, methodology, release notes
├── tests/         # tests and smoke checks
├── scripts/       # utility/reproducibility scripts
├── README.md
├── LICENSE
├── .gitignore
└── .env.example
```

Large raw audio/parquet files and local secrets are intentionally excluded from the public repository.

## 11. Local development

### Backend

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload
```

The API runs at `http://127.0.0.1:8000` by default.

### Frontend

```powershell
cd frontend
npm ci
npm run dev
```

For local frontend-to-backend communication, `.env.local` should contain the public API URL:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

Supabase public variables are optional for the anonymous demonstration path; server-side Supabase and Razorpay secrets must remain in the backend environment.

## 12. Security boundary

Never commit or expose:

- Supabase secret/service-role credentials
- Razorpay key secrets
- webhook secrets
- access tokens or JWTs
- `.env` / `.env.local`
- raw/private datasets

The browser receives only public configuration. Server-side secrets stay in the FastAPI environment.

## 13. Limitations

This is a prototype, not a production payment-fraud service. The model's held-out recall is about 30%, so many fraudulent transactions remain undetected at the selected operating point. The cost function uses an explicit assumed false-positive cost. The current model is transaction/tabular only; the speech datasets are not live model inputs. Razorpay integration is Test Mode only, and production payment verification is not implemented.

## 14. Demo flow

```text
Open SentinelPay
      ↓
Anonymous demonstration session
      ↓
Enter/select transaction scenario
      ↓
Run transaction-risk analysis
      ↓
Risk score + evidence + ALLOW / REVIEW / BLOCK
      ↓
Persist session + risk event in Supabase
      ↓
ALLOW → eligible for Razorpay Test Mode order
REVIEW/BLOCK → payment creation prevented
```

The purpose of the demo is to show the complete defensive decision loop, not to imply certainty of fraud.

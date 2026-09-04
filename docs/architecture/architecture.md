# SentinelPay Architecture

## Current deployed architecture

```text
┌──────────────────────────┐
│      Next.js frontend    │
│  Dashboard / Test Lab    │
└────────────┬─────────────┘
             │ HTTPS JSON
             ▼
┌──────────────────────────┐
│       FastAPI backend    │
│ /api/v1/analyze          │
│ /api/v1/razorpay/orders  │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│ Transaction Risk Analyzer│
│ HistGradientBoosting     │
│ Classifier               │
└────────────┬─────────────┘
             │ risk probability
             ▼
┌──────────────────────────┐
│       Risk Policy        │
│ < .25  ALLOW             │
│ .25-.60 REVIEW           │
│ >= .60 BLOCK             │
└───────┬───────────┬──────┘
        │           │
        │           └──────────────┐
        ▼                          ▼
┌──────────────────┐      ┌──────────────────┐
│ Supabase Postgres│      │ Razorpay Test    │
│ merchants        │      │ Mode             │
│ sessions         │      │ test orders      │
│ risk_events      │      └──────────────────┘
└──────────────────┘
```

## What is actually live

The current `/api/v1/analyze` path is a structured transaction-risk pipeline. It receives numeric and contextual transaction features, builds the model feature vector, runs `HistGradientBoostingClassifier`, applies the risk policy, creates a persisted session and risk event, and returns the decision identifiers to the frontend.

It does **not** receive microphone audio, speech recordings, speaker embeddings, prosody, or conversation transcripts.

## Model features

The deployed feature builder uses transaction amount, time-of-day/day-of-week, customer history, transaction timing, customer-relative amount statistics, terminal activity, customer-terminal activity, and dataset-relative transaction time. `is_new_recipient` is used for explanatory risk-factor output.

## Prediction versus decision

```text
Features
   ↓
ML model
   ↓
Risk probability
   ↓
Policy thresholds
   ↓
ALLOW / REVIEW / BLOCK
```

This separation is deliberate. A probability is an estimate; the policy is the operational control.

## Persistence

Every analysis creates a session linked to the demonstration merchant and records the resulting risk event in Supabase. The event/session IDs returned by the API provide a traceable link between the UI result and the persisted assessment.

## Payment boundary

Razorpay is downstream of risk analysis. The payment path must not be treated as a second fraud detector. Its purpose is to enforce the risk decision before a test order is created.

```text
Risk = ALLOW   → payment order may be created
Risk = REVIEW  → payment should stop for review
Risk = BLOCK   → payment order must not be created
```

## Research-only speech layer

```text
TeleAntiFraud ──┐
                ├── auxiliary research / future multimodal work
ASVspoof DF ────┘

                 X
                 │ not connected to current transaction score
                 ▼
Current live transaction model
```

TeleAntiFraud and ASVspoof 2021 DF are therefore documented as research foundations rather than live fraud evidence. ASVspoof in particular measures speech spoof/deepfake behavior, not payment fraud.

## Security boundary

```text
Browser
  │
  ├── public frontend configuration only
  │
  ▼
FastAPI
  │
  ├── Supabase server credentials
  └── Razorpay secret credentials
```

Server-side secrets must never be shipped to the browser or committed to Git.

## Deployment

- Frontend: Vercel, root directory `frontend`.
- Backend: Render, root directory `backend`.
- Backend start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
- Razorpay remains Test Mode for the demonstration.

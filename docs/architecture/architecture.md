# SentinelPay Architecture

## Logical Architecture

```text
                         ┌─────────────────────┐
                         │   Next.js Frontend   │
                         │ Dashboard / Test Lab │
                         └──────────┬──────────┘
                                    │
                         Authenticated API calls
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │      FastAPI        │
                         │     API Layer       │
                         └───────┬───────┬─────┘
                                 │       │
                    risk analysis │       │ Razorpay order
                                 │       │
                                 ▼       ▼
                      ┌──────────────┐  ┌──────────────┐
                      │ Risk Analyzer│  │  Razorpay    │
                      │  ML Model    │  │  Test Mode   │
                      └──────┬───────┘  └──────────────┘
                             │
                             ▼
                      ┌──────────────┐
                      │ Risk Policy  │
                      │              │
                      │ ALLOW        │
                      │ REVIEW       │
                      │ BLOCK        │
                      └──────┬───────┘
                             │
                             ▼
                      ┌──────────────┐
                      │   Supabase   │
                      │              │
                      │ merchants    │
                      │ sessions     │
                      │ risk_events  │
                      │ auth         │
                      └──────────────┘
```

## ML/Data Architecture

```text
Fraud Detection Handbook
        |
        v
Chronological split
        |
        +-----------> train
        |
        +-----------> validation ----> threshold selection
        |
        +-----------> test -----------> final held-out metrics
                                       |
                                       v
                               cost-aware evaluation

TeleAntiFraud ---------------------> auxiliary speech foundation
ASVspoof 2021 DF -------------------> auxiliary spoof foundation
```

## Security Boundary

```text
Browser
  |
  | public/safe configuration only
  v
FastAPI
  |
  | server-side secrets
  +----> Supabase secret key
  |
  +----> Razorpay key secret
```

Secrets must never be shipped to the browser.

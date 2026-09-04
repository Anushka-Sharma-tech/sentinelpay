# API Release Notes

## Current API contract

### `GET /health`
Returns backend availability and API version.

### `POST /api/v1/analyze`
Accepts structured transaction and historical context and returns:

- risk score
- LOW / MEDIUM / HIGH risk level
- ALLOW / REVIEW / BLOCK decision
- explanatory factors
- model version
- inference latency
- persisted event ID
- persisted session ID

The current demonstration path is anonymous; authentication remains available as a future hardening layer rather than a requirement for the demo flow.

### `POST /api/v1/razorpay/orders`
Creates a Razorpay Test Mode order only when the payment-defense checks permit it. The endpoint never receives Razorpay secret credentials from the browser.

## Request fields

The analysis request contains amount, time-of-day/day-of-week, customer history, time since previous transaction, terminal history, dataset-relative transaction time, and recipient novelty.

## Important scope boundary

The current analysis endpoint does not accept audio, speech, speaker samples, or conversation text. Any speech-related modules/datasets in the repository are auxiliary research work and are not represented as live risk signals by the current frontend.

## Security

Server-side Supabase and Razorpay secrets stay in the FastAPI environment. Frontend variables must contain public configuration only.

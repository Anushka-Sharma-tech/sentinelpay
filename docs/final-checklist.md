# SentinelPay Final Completion Checklist

## A. Repository hygiene

- [ ] `git status` is clean except intentionally pending work.
- [ ] `frontend/node_modules` is ignored.
- [ ] Python virtual environments are ignored.
- [ ] `.env` files with secrets are ignored.
- [ ] Raw datasets are not committed.
- [ ] Large generated parquet/audio/model files are checked for GitHub size limits.
- [ ] `.env.example` contains placeholders only.
- [ ] `.vscode/` is either intentionally committed or ignored.

## B. Backend

- [x] FastAPI starts.
- [x] `/health` works.
- [x] `/api/v1/analyze` requires authentication.
- [x] ML risk prediction works.
- [x] Risk policy works.
- [x] Supabase session creation works.
- [x] Supabase risk-event persistence works.
- [x] Razorpay Test Mode order creation works.
- [ ] Optional: remove/resolve the sklearn feature-name warning.
- [ ] Optional: add a small backend smoke test.

## C. Frontend

- [ ] Devin PR reviewed.
- [ ] No backend files changed in Devin PR.
- [ ] Authenticated API calls use the current Supabase session.
- [ ] Dashboard calls the real `/api/v1/analyze`.
- [ ] Risk score and decision are shown clearly.
- [ ] Risk factors/signals are shown.
- [ ] Event/session IDs are displayed or linked where useful.
- [ ] Razorpay Test Mode is clearly labeled.
- [ ] Loading/error/empty states work.
- [ ] Mobile layout works.
- [ ] Frontend build passes.

## D. Evaluation

- [ ] Exact test precision inserted.
- [ ] Exact test recall inserted.
- [ ] Exact test F1 inserted.
- [ ] Exact ROC-AUC inserted.
- [ ] Exact PR-AUC inserted if present.
- [ ] False-positive count confirmed.
- [ ] False-negative count confirmed.
- [ ] Expected cost confirmed.
- [ ] Confusion matrix checked.
- [ ] No test-set threshold tuning was performed.

## E. Public repo

- [ ] README tells the full story.
- [ ] Architecture diagram included.
- [ ] Setup steps work.
- [ ] API examples work.
- [ ] Evaluation results are visible.
- [ ] Limitations are honestly stated.
- [ ] No secrets or credentials are present.
- [ ] No access tokens are present.
- [ ] Raw/private data is not exposed.

## F. Deployment

- [ ] Backend deployed.
- [ ] `/health` reachable.
- [ ] Frontend deployed.
- [ ] Production CORS configured.
- [ ] Production-safe environment variables configured.
- [ ] Supabase production/project configuration checked.
- [ ] Razorpay remains in Test Mode for demo.
- [ ] Full frontend → backend → Supabase flow tested remotely.

## G. Final demo

- [ ] Sign in.
- [ ] Dashboard.
- [ ] Risk analysis.
- [ ] Show HIGH/BLOCK case.
- [ ] Show evidence.
- [ ] Show persisted event.
- [ ] Show Razorpay Test order.
- [ ] Show metrics.
- [ ] Show architecture.
- [ ] Show GitHub.
- [ ] Record video last.

## H. Final submission

Razorpay's current buildathon page asks for:
- [ ] Public repository
- [ ] 5-minute pitch video
- [ ] Architecture

The AI Risk Manager track specifically emphasizes:
- [ ] Working detector/verifier/auto-responder for one loss class
- [ ] Held-out precision and recall
- [ ] Honest false-positive cost
- [ ] Defense-only behavior

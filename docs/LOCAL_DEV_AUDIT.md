# Local Development Audit (May 2026)

This document records fixes applied to make the Carbon MRV Platform runnable locally without changing architecture, folder layout, or deployment topology.

## Fixes applied

### Backend

| Issue | Root cause | Fix |
|-------|------------|-----|
| Razorpay mock mode not active locally | `your_key_id` / `your_key_secret` are truthy strings, so `PaymentService` treated them as real credentials | Detect placeholder values in `payment_service.py` and enable mock auto-verify |
| Purchases did not update wallet balance | `verify_purchase_payment` updated `CreditOwnership` but skipped `Wallet.carbon_balance` | Increment wallet balances in the same DB transaction |
| Sentinel imagery search stale | Hard-coded `2025-01-01/2025-12-31` STAC filter | `satellite_utils.sentinel_search_datetime_range()` (rolling 18 months) |
| Biomass prediction failed without ML artifact | `carbon_model.pkl` not in repo | NDVI heuristic fallback when model file is missing; train via `python ml/train_model.py` |
| Blockchain metadata endpoints could crash | `get_token_name` / `get_token_symbol` called RPC without fallback | Return default names when blockchain is in simulated mode |
| Legacy purchase API paths | Frontend called `/initiate` and `/verify` | Added backward-compatible aliases; frontend now uses `/create-order` and `/verify-payment` |

### Frontend

| Issue | Root cause | Fix |
|-------|------------|-----|
| Marketplace purchase failed | `purchaseService.ts` called wrong API paths and expected `amount` instead of `amount_inr` | Align with backend routes and response mapping |
| Dashboard sidebar dead links | All items used `href="#"` | Map menu labels to real routes per role |
| Missing env template | No `frontend/.env.example` | Added with `NEXT_PUBLIC_API_URL` |

## Verified architecture (unchanged)

- FastAPI backend with Supabase/PostgreSQL
- Next.js frontend
- Optional Hardhat blockchain package
- Celery eager mode when `REDIS_URL` is empty
- Docker Compose for full stack (Postgres, Redis, backend, worker, frontend)

## Local startup

See [LOCAL_SETUP.md](../LOCAL_SETUP.md). Minimum path:

```bash
# Backend
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

Optional: train biomass model for richer satellite verification:

```bash
cd backend
python ml/train_model.py
```

## Mock / simulated services (local)

| Service | Behavior |
|---------|----------|
| Redis / Celery | Eager (in-process) when broker URL empty |
| Razorpay | Mock orders; signatures auto-approved |
| Blockchain | Simulated tx hashes when Hardhat placeholder address is configured |
| Satellite / ML | Planetary Computer when available; heuristic fallback otherwise |

## Remaining concerns (not blocking local demo)

- **Disk space on dev machine**: Shell commands may fail with `ENOSPC` / `SQLITE_FULL`; free disk before running installs or Docker builds.
- **Supabase dependency**: Default `.env` points at remote Supabase; local Postgres via root `docker-compose.yml` requires updating `DATABASE_URL`.
- **Admin UI**: Some admin pages still use static placeholders; APIs under `/api/admin` are mounted and functional.
- **Wallet signature flow**: Backend `/api/wallet/verify` stores address only; full nonce/signature verification can be extended for production.
- **On-chain retirement**: Retire/transfer use backend deployer key (custodial); document for production or require user-signed txs.
- **Certificate persistence**: PDFs generate on disk; `Certificate` ORM rows are not always created.
- **Production secrets**: Never commit real keys; use `.env.example` templates and secret managers in cloud deploy.

## Deployment considerations

- Set real `RAZORPAY_*`, `DATABASE_URL`, `REDIS_URL`, and blockchain contract addresses in production.
- Run Celery worker + Redis for async tasks (see root `docker-compose.yml`).
- Use `backend/Dockerfile` trimmed requirements (`requirements.docker.txt` pattern) for smaller images.
- Frontend `output: 'standalone'` supports container deployment; set `NEXT_PUBLIC_API_URL` to the public API origin at build time.
- Run `alembic upgrade head` on deploy (included in `backend/start.sh`).

## Documentation updates

- [FIXES_CHANGELOG.md](./FIXES_CHANGELOG.md) — prior frontend TypeScript/ESLint fixes
- [errors_and_issues.md](./errors_and_issues.md) — historical issue list (some items superseded by this audit)
- [project_status.md](./project_status.md) — high-level readiness (update after verification)

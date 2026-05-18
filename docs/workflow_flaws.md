# Workflow Flaws

## Summary

The main workflow problem is that product flows cross backend, frontend, Celery, blockchain, and database layers, but those layers are not consistently connected. Some flows are implemented as UI only, some as backend only, and some depend on services that can fail at import time.

## Architecture Weaknesses

### Feature Modules Are Not Fully Wired

The codebase has files for admin, auditor, wallet, purchase, certificate, and blockchain workflows, but several are not connected through `backend/app/main.py` or frontend navigation.

Recommendation: maintain a feature matrix showing UI route, frontend service, backend route, model, task, and test coverage for every workflow.

### Business Logic Is Spread Across Routes and Tasks

Project approval, verification, minting, and certificate generation are split between API routes and Celery tasks. There is no shared service layer that owns the project lifecycle.

Impact:

- Different routes can set different statuses.
- Approval behavior is hard to reason about.
- Retrying tasks may duplicate side effects.

Recommendation: create a clear project lifecycle service and keep route handlers thin.

### Synchronous Startup Depends On External Services

Blockchain configuration and RPC connectivity are checked during module import. This makes application boot depend on optional external systems.

Recommendation: initialize external clients lazily, validate them in health checks, and degrade gracefully when feature flags are disabled.

## Backend and Frontend Pipeline Gaps

### Frontend Services Do Not Match Mounted Backend APIs

Frontend calls:

- `/api/wallet/*`
- `/api/purchases/*`

Those routers exist but are not mounted in the FastAPI app.

Recommendation: add automated contract tests or route inventory checks.

### Backend Response Shapes Are Not Stable Contracts

Many backend endpoints return raw SQLAlchemy models or plain dictionaries without response models.

Impact:

- Frontend types can drift from backend responses.
- Sensitive fields could be accidentally exposed if models expand later.

Recommendation: define Pydantic response schemas for public API endpoints.

### Dashboard Navigation Is Not Route-Driven

Sidebar labels are plain strings with `href="#"`.

Impact:

- Users cannot navigate dashboard sections from the sidebar.
- It is hard to know which pages are complete.

Recommendation: define route metadata per role and render sidebar from that metadata.

## Data Flow Issues

### Project Lifecycle Is Ambiguous

Current project statuses include:

- `draft`
- `active`
- `marketplace`
- `retired`

Audit statuses include:

- `pending`
- `approved`
- `rejected`
- `flagged` in task code

Satellite statuses include:

- `pending`
- `verified`
- `rejected`

Problems:

- Satellite verification can set audit approval.
- Auditor route can set active status.
- Project route can set marketplace status.
- Marketplace requires approved, tokenized, and active/marketplace.

Recommendation: document and enforce a single state machine.

### Purchase Flow Does Not Preserve Ownership

Current purchase flow reduces available credits but does not:

- write purchase records
- transfer tokens to buyer
- create escrow/payment records
- issue retirement certificates
- update buyer portfolio

Recommendation: use a transactional purchase service with ledger entries.

### Certificate Flow Is Split

Project certificate download is separate from retirement certificate APIs. The certificate table is not used by either flow in a complete way.

Recommendation: decide whether certificates represent project verification, credit purchase, credit retirement, or all three as separate certificate types.

### Wallet State Is Duplicated

Wallet address data appears in both:

- `users.wallet_address`
- `wallets.crypto_wallet_address`

Recommendation: choose one source of truth or enforce synchronization through service logic and constraints.

## Security Concerns

### Hardcoded Docker Database Password

`backend/docker-compose.yml` uses a hardcoded Postgres password.

Recommendation: move all credentials into environment variables or secret management.

### JWT Storage Uses Local Storage

Frontend stores the access token in `localStorage`.

Risk:

- Tokens are exposed to XSS.

Recommendation: consider httpOnly secure cookies or strict XSS controls.

### Long Token Lifetime

`ACCESS_TOKEN_EXPIRE_MINUTES` defaults to 10080 minutes, about 7 days.

Recommendation: use shorter access tokens with refresh tokens for production.

### Role Authorization Is Inconsistent

Some frontend pages are not guarded. Backend has role checks in several places, but admin/auditor routers are not mounted.

Recommendation: enforce authorization on backend for every protected endpoint and use frontend guards only as UX support.

### Wallet Verification Nonce Has No Expiry

Wallet nonce is stored on the user but no expiry time is tracked.

Recommendation: add nonce expiry and one-time use enforcement.

### Public Marketplace Endpoint Has No Rate Limiting

Marketplace listings are public and have no throttling.

Recommendation: add rate limiting at API gateway or app middleware.

## Scalability Problems

### Raster Satellite Processing Is Heavy For Workers

Satellite verification downloads and masks raster bands for each project. This can be slow and memory-intensive.

Recommendation: add queue limits, timeouts, caching, and observability around satellite tasks.

### Large Runtime Dependency Set

The backend dependency set includes many heavy geospatial, notebook, plotting, and ML packages.

Recommendation: split dependencies and keep production image small.

### No Pagination

Several endpoints return all records:

- projects
- admin users
- marketplace projects

Recommendation: add pagination, filtering, sorting, and indexes.

### No Background Task Status API

Satellite verification and approval return Celery task IDs, but there is no endpoint for task status.

Recommendation: expose task status and failure reasons to the frontend.

### No Observability Plan

Logging exists, but there is no structured logging, metrics, trace IDs, or task monitoring integration in app code.

Recommendation: add request IDs, structured logs, health checks for dependencies, and Celery task metrics.

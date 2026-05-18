# Unlinked and Untracked Components

## Summary

The repository contains several files and modules that are present but not connected to the active application path. Some are useful foundations, but others are currently dead code, missing links, or incomplete pipelines.

## Unmounted Backend Routers

These API modules exist but are not included in `backend/app/main.py`:

- `backend/app/api/admin.py`
- `backend/app/api/auditor.py`
- `backend/app/api/wallet.py`
- `backend/app/api/purchases.py`

Impact:

- Their endpoints are not available when the backend starts.
- Frontend pages that depend on wallet and purchase APIs will fail.

Recommendation: either mount these routers or mark the related frontend pages as inactive until connected.

## Frontend Calls With Missing or Unavailable Backend Support

### Wallet APIs

Frontend file:

- `frontend/services/walletService.ts`

Expected backend:

- `/api/wallet/connect`
- `/api/wallet/me`
- `/api/wallet/nonce`
- `/api/wallet/verify`

Backend module exists but is not mounted.

### Purchase History

Frontend file:

- `frontend/services/purchaseService.ts`

Expected backend:

- `/api/purchases/history`

Backend endpoint does not exist.

### Admin User Management

Frontend file:

- `frontend/app/dashboard/admin/users/page.tsx`

Backend admin users endpoint exists in `backend/app/api/admin.py`, but the frontend page uses hardcoded users and the backend router is not mounted.

### Auditor APIs

Backend auditor endpoints exist in `backend/app/api/auditor.py`, but frontend auditor project management uses `/api/projects/*` instead.

Recommendation: choose one auditor API surface and remove or connect the other.

## Orphan or Underused Models

### Payment

`backend/app/models/payment.py` exists, but no complete payment API is present.

### EscrowTransaction

`backend/app/models/escrow.py` exists, but no escrow route or service completes escrow hold/release/refund.

### Certificate

`backend/app/models/certificate.py` exists, but certificate APIs generate response dictionaries and PDFs without persisting certificate rows.

### Purchase

`backend/app/models/purchase.py` exists, but purchase endpoint does not create records.

Recommendation: connect these models to real services or remove them from the active product scope until needed.

## Missing Model Files Referenced By Alembic

`backend/alembic/env.py` references:

- `app.models.transaction`
- `app.models.marketplace`

These files are missing.

Recommendation: fix Alembic metadata imports before using migrations.

## Incomplete Pipelines

### Verification Pipeline

Current intended flow:

1. User creates project.
2. Admin/auditor starts satellite verification.
3. Celery task computes satellite and biomass metrics.
4. Auditor approves project.
5. Certificate task runs.
6. Blockchain mint task runs.
7. Project appears in marketplace.

Current gaps:

- Satellite task can approve audit status automatically.
- Biomass fields are not returned from the verification service.
- Certificate task calls the service with missing owner argument.
- Blockchain minting requires owner wallet verification and environment/artifacts.
- Task status is not exposed to frontend.

### Purchase Pipeline

Current intended flow:

1. Company buys credits.
2. Payment/escrow is created.
3. Credits transfer to buyer.
4. Purchase appears in buyer portfolio.
5. Buyer can retire credits and receive certificate.

Current gaps:

- No payment creation.
- No escrow release.
- No purchase row.
- No blockchain transfer.
- No buyer portfolio persistence.
- No retirement certificate persistence.

### Certificate Pipeline

Current intended flow is unclear because there are project verification certificates and retirement certificates.

Current gaps:

- Certificates are not saved to the `certificates` table.
- Certificate IDs are generated dynamically on each request.
- Download path differs between certificate services.
- One generator stores under `storage/certificates`; another stores under `certificates`.

Recommendation: define certificate types and storage policy.

## Dead or Placeholder UI Areas

Likely placeholder/static areas:

- `frontend/app/dashboard/transactions/page.tsx`
- `frontend/app/dashboard/admin/users/page.tsx`
- role dashboard overview cards
- admin pricing/escrow/audits pages, based on visible static layout patterns

Recommendation: label unfinished views internally and connect them to APIs before presenting them as live data.

## Missing Documentation

Missing or insufficient docs:

- Backend environment variables.
- Frontend environment variables.
- Local development setup across backend/frontend/blockchain.
- Database migration process.
- Celery worker and beat operation.
- Satellite and ML model setup.
- Blockchain artifact/address setup.
- Deployment process.
- API contract reference.
- Project lifecycle state machine.
- Purchase/payment/escrow lifecycle.
- Certificate lifecycle.

## Git and Repository Tracking Notes

The root repository shows many untracked backend and docs files and modified backend files. The `frontend` directory is also its own Git repository or nested Git working tree.

Attempting to inspect nested frontend Git status failed because the sandbox user is not marked as a safe owner for that repository.

Recommendation: decide whether `frontend` should be a submodule/nested repository or a normal folder. Then clean up tracking rules so status is reliable.

# Errors and Issues

## Summary

The biggest risks are backend startup/migration failures, unreachable frontend integrations, missing persistence in payment/purchase/certificate flows, and placeholder AI/blockchain behavior. These issues can prevent normal platform workflows from completing end to end.

## Critical Issues

### Alembic Environment Imports Missing Models

`backend/alembic/env.py` imports:

- `app.models.transaction`
- `app.models.marketplace`

Those model files are not present. This can break `alembic upgrade head`, including the Docker startup script.

Recommendation: update Alembic imports to match existing models only, then validate all migrations on a clean database.

### Some Backend Routers Are Not Mounted

`backend/app/main.py` does not include these routers:

- `backend/app/api/admin.py`
- `backend/app/api/auditor.py`
- `backend/app/api/wallet.py`
- `backend/app/api/purchases.py`

Impact:

- `/api/wallet/*` frontend calls fail.
- `/api/purchases/*` frontend calls fail.
- Admin backend APIs are unreachable.
- Auditor backend APIs are unreachable.

Recommendation: mount all intended routers and add a route inventory test.

### Blockchain Service Can Break Backend Import

`backend/app/services/blockchain_service.py` raises exceptions at import time if these are missing:

- `BLOCKCHAIN_RPC_URL`
- `PRIVATE_KEY`
- `CARBON_TOKEN_CONTRACT_ADDRESS`
- compiled contract artifact JSON
- live RPC connectivity

Because `backend/app/api/blockchain.py` imports this service, the backend can fail during startup instead of failing only when blockchain endpoints are used.

Recommendation: delay blockchain connection setup until endpoint/task execution, or make blockchain optional behind feature flags.

### Certificate Task Calls Generator With Wrong Arguments

`backend/app/tasks/certificate_tasks.py` calls `generate_project_certificate(project=project)`, but `backend/app/services/certificate_service.py` requires both `project` and `owner`.

Impact:

- Certificate Celery task will fail after approval.

Recommendation: fetch the project owner inside the task and pass it to the certificate service.

### Purchase API Does Not Persist Purchases

`backend/app/api/purchases.py` reduces `project.total_credits_generated` but does not create a `Purchase` row, `Payment` row, escrow row, certificate row, or blockchain transfer.

Impact:

- Purchase history cannot work.
- Buyer ownership is not tracked.
- Credits are reduced without a durable accounting trail.

Recommendation: wrap purchases in a transaction and persist purchase/payment/ledger records.

## Backend Bugs and Inconsistencies

### Purchase History Endpoint Missing

Frontend calls:

- `GET /api/purchases/history`

Backend only implements:

- `POST /api/purchases/{project_id}`

Recommendation: add a purchase history endpoint or remove frontend references until implemented.

### Project Approval Flow Has Conflicting Status Rules

There are two approval implementations:

- `backend/app/api/projects.py` sets approved projects to `status = "marketplace"`.
- `backend/app/api/auditor.py` sets approved projects to `status = "active"`.

Impact:

- Marketplace filtering and business rules can diverge depending on which route is used.

Recommendation: define one lifecycle state machine and use it everywhere.

### Satellite Verification Auto-Approves Audit Status

`verify_project_task` sets `audit_status = "approved"` when satellite verification passes. Later, `/api/projects/{project_id}/approve` refuses already approved projects.

Impact:

- The intended human audit step can be skipped or blocked.

Recommendation: use separate statuses such as `satellite_status = verified` and `audit_status = pending_review`.

### Project Verification Returns Missing Biomass Fields

`verify_project_with_planetary_computer` calls `predict_project_biomass` but returns only `estimated_credits`, not `agb_per_hectare`, `total_biomass`, `carbon_stock`, or `co2e`.

`project_tasks.py` tries to read those fields with `.get(...)`, so biomass fields are saved as zero.

Recommendation: include all biomass result fields in the verification response.

### Biomass Model File Missing

`backend/app/services/biomass_model_service.py` expects:

- `backend/app/ml/models/carbon_model.pkl` based on current `BASE_DIR`

The repository does not contain this model file. The settings default path is also different:

- `ml/models/carbon_model.pkl`

Impact:

- Live biomass prediction fails unless the model is manually added in the expected location.

Recommendation: align paths, document the model artifact, and provide a fallback strategy.

### Planetary Computer Search Uses Fixed 2025 Date Range

Satellite services search Sentinel imagery for `2025-01-01/2025-12-31`.

Impact:

- The system can become stale and may fail for projects needing current verification.

Recommendation: make the imagery date range configurable and based on current verification policy.

### Project Polygon Validation Is Basic

Project creation parses polygon JSON and builds a polygon, but it does not enforce:

- minimum number of points
- closed ring
- valid coordinate ranges
- maximum polygon size
- country/region bounds
- overlap checks

Recommendation: add stricter geospatial validation before verification.

### Certificate APIs Are Inconsistent

There are two certificate flows:

- `/api/projects/{project_id}/certificate` generates a project certificate for approved project visibility.
- `/api/certificates/*` expects projects with `status == "retired"`.

Impact:

- Users may see certificates in one part of the app but not another.
- Certificate records are not persisted.

Recommendation: define one certificate lifecycle for issuance, ownership, download, and retirement.

### Encoding Problems in Frontend Text

Several frontend files display corrupted text such as:

- `â‚¹`
- `âœ”`
- `COâ‚‚e`
- `â€”`

Impact:

- UI looks broken and unprofessional.

Recommendation: normalize file encoding to UTF-8 and replace corrupted strings.

## Frontend Issues

### Dashboard Sidebar Links Are Placeholders

`frontend/components/dashboard/DashboardSidebar.tsx` renders every menu item with `href="#"`.

Impact:

- Dashboard navigation does not work.

Recommendation: map each sidebar item to a real route.

### Several Dashboards Use Static Data

Examples:

- `frontend/app/dashboard/admin/users/page.tsx`
- `frontend/app/dashboard/transactions/page.tsx`
- several role dashboard overview cards

Impact:

- UI can show false platform state.

Recommendation: connect pages to backend APIs or clearly hide unfinished views.

### Auth Guard Is Not Applied Consistently

Only some pages use `useAuthGuard`. Many dashboard pages render without role checks at the frontend layer.

Impact:

- Users can access pages visually even if backend APIs block data.

Recommendation: add consistent route-level guards for dashboard sections.

### Frontend Expects More Data Than Backend Returns

Examples:

- Purchase response type expects `price_per_credit` and `total_price`, but backend purchase response does not return them.
- Marketplace UI expects `project_type`, but project creation never sets it.
- Certificate dashboard expects blockchain/certificate state that is not persisted.

Recommendation: align API response schemas with frontend types.

## Blockchain Issues

### No Blockchain Tests

The blockchain package `test` script always exits with an error.

Recommendation: add Hardhat tests for minting, minter permissions, retirement, transfer, and retirement history.

### Backend Uses Deployer Key For User Actions

`retire_credits` and `transfer_credits` sign with the backend private key, not the user's wallet.

Impact:

- On-chain retirement and transfer may happen from the backend owner account instead of the authenticated user.

Recommendation: require user-signed transactions or clearly implement custodial wallet accounting.

### Contract Deployment Is Localhost-Only

Hardhat config only defines a local network. No testnet/mainnet deployment configuration is documented.

Recommendation: add deployment profiles and document artifact/address publishing to the backend.

## Dependency and Configuration Issues

### Requirements File Is Very Large

`backend/requirements.txt` includes many notebook, GIS, plotting, and optional packages.

Impact:

- Slow installs.
- Higher image size.
- Higher chance of dependency conflicts.

Recommendation: split runtime, dev, ML, and notebook dependencies.

### Docker Compose Has Hardcoded Database Password

`backend/docker-compose.yml` includes `POSTGRES_PASSWORD: strongpassword`.

Recommendation: move credentials to environment variables or secrets.

### No Example Environment File

The backend requires many env vars but no `.env.example` is present.

Recommendation: document required and optional env vars before deployment.

# Future Improvements

## Summary

The highest priority is to make the existing workflows reliable before adding new features. Focus first on backend wiring, migrations, environment setup, purchase persistence, task reliability, and API/frontend contract alignment.

## High-Priority Fixes

1. Mount all intended backend routers in `backend/app/main.py`.
2. Fix Alembic imports and validate migrations on a fresh database.
3. Make blockchain service initialization lazy and feature-flag aware.
4. Add `.env.example` files for backend, frontend, and blockchain.
5. Fix certificate task argument mismatch.
6. Add missing `/api/purchases/history` or remove frontend dependency on it.
7. Persist purchase records when credits are bought.
8. Define one project lifecycle state machine.
9. Align frontend TypeScript types with backend response schemas.
10. Replace hardcoded dashboard data with API data or mark views as unfinished.

## Feature Recommendations

### Project Lifecycle

- Add explicit states for submitted, satellite_verified, audit_pending, approved, tokenized, marketplace, sold, retired, rejected, and flagged.
- Store lifecycle events in an audit log.
- Expose task status for verification, certificate generation, and blockchain minting.

### Marketplace and Purchase Flow

- Add purchase records with buyer, project, credit amount, price, status, and timestamps.
- Add available credits separate from total generated credits.
- Add payment status and escrow release logic.
- Add buyer portfolio APIs.
- Add refund/failure handling.

### Certificates

- Separate project verification certificates from retirement certificates.
- Persist certificate records.
- Store stable certificate IDs.
- Add public certificate verification by certificate ID.
- Store generated PDFs in one configured storage path.

### Wallet and Blockchain

- Add wallet nonce expiry.
- Add chain ID validation.
- Add user-facing unsupported network errors.
- Add read-only blockchain health endpoint.
- Store contract address and deployment network in a documented config.
- Decide whether transfers/retirements are custodial or user-signed.

### Admin and Auditor

- Connect admin user management to backend APIs.
- Add user verification/KYC controls.
- Add project audit queue with task status and audit notes.
- Add fraud review page for flagged projects.
- Add moderation controls for marketplace listings.

## Technical Debt Reduction

### Backend

- Add Pydantic response models for all public endpoints.
- Move business rules from route handlers into services.
- Add database transactions around multi-step operations.
- Add pagination to list endpoints.
- Add consistent error response format.
- Add route inventory tests.
- Split requirements into runtime, dev, ML, and notebook files.

### Frontend

- Use a shared API client with consistent error handling.
- Add route guards to all protected dashboard pages.
- Replace `href="#"` sidebar links with real route metadata.
- Remove corrupted text encoding artifacts.
- Add loading, empty, and error states consistently.
- Add frontend tests for critical flows.

### Blockchain

- Add contract tests.
- Add deployment scripts for testnet/mainnet.
- Add artifact publishing instructions for backend usage.
- Add event indexing or backend sync for mint/transfer/retire events.

## AI and Model Improvements

- Add the required biomass model artifact or a documented download/build process.
- Version the model and store metadata such as training date, features, and evaluation metrics.
- Add confidence intervals for biomass and credit estimates.
- Avoid fixed satellite date ranges; use configurable and current imagery windows.
- Add cloud masking and imagery quality checks.
- Validate polygons against real land-cover data.
- Add fraud detection signals such as duplicate polygons, overlap, impossible area, and sudden vegetation changes.
- Cache satellite features for repeated verification.

## Deployment Improvements

- Add deployment documentation for local, staging, and production.
- Add health checks for database, Redis, Celery, blockchain RPC, and satellite service dependencies.
- Add Docker secrets or environment-based credentials.
- Add CI checks for backend import, migrations, frontend type checking, linting, and smart contract tests.
- Add structured logs and request IDs.
- Add backup and restore procedures for Postgres and certificate files.
- Add object storage for certificates instead of local-only files.

## Optimization Opportunities

- Cache marketplace listings.
- Paginate project and user tables.
- Add indexes for project status, audit status, owner ID, tokenized flag, and purchase buyer ID.
- Limit satellite task concurrency.
- Add timeouts around external raster reads and blockchain calls.
- Reduce frontend bundle size by lazy-loading heavy map components.
- Use separate production backend image dependencies to avoid notebook and plotting packages.

## Suggested Execution Order

1. Stabilize startup: migrations, env files, router mounting, optional blockchain init.
2. Stabilize core flows: auth, project creation, verification, approval, certificate generation.
3. Stabilize marketplace: tokenization, available credits, purchase records, buyer portfolio.
4. Stabilize dashboard UX: navigation, guards, real data, empty/error states.
5. Add automated tests and CI.
6. Prepare deployment with secrets, observability, and documented operations.

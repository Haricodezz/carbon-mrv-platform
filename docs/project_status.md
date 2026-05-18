# Project Status

## Summary

The project is a multi-part Carbon MRV platform with a FastAPI backend, a Next.js frontend, and a Hardhat smart contract package. The core product idea is present: users can register, create land projects, draw project polygons, run satellite verification, approve projects, mint carbon credits, show marketplace listings, connect wallets, and generate certificates.

The codebase is not deployment-ready yet. Several important modules are only partially wired, some routes are unreachable from the running backend, migrations appear broken, and production startup can fail if blockchain environment variables or contract artifacts are missing.

## Completed or Mostly Implemented Modules

### Backend

- Authentication API exists in `backend/app/api/auth.py`.
- Project CRUD and project approval flow exist in `backend/app/api/projects.py`.
- Project polygon processing is implemented with Shapely and PyProj.
- Wallet connection and signature verification exist in `backend/app/api/wallet.py`.
- Marketplace listing API exists in `backend/app/api/marketplace.py`.
- Certificate APIs and PDF generation services exist.
- Blockchain API and Web3 service exist.
- Celery task modules exist for project verification, certificate generation, blockchain minting, and periodic re-verification.
- SQLAlchemy models exist for users, projects, wallets, purchases, payments, escrow, and certificates.

### Frontend

- Public pages exist for landing, about, blog, contact, compliance, marketplace, calculator, certificates, privacy, and terms.
- Authentication pages exist for login and registration.
- Dashboard pages exist for farmer, NGO, company, auditor, and admin roles.
- Project creation flow includes polygon drawing through Leaflet.
- Project list/detail pages call backend project APIs.
- Wallet page can request MetaMask accounts, generate a backend nonce, sign a verification message, and verify the wallet.
- Marketplace page fetches marketplace projects and calls the purchase API.
- Certificate dashboard can download project certificates.

### Blockchain

- ERC20 carbon credit token contract exists in `blockchain/contracts/CarbonCreditToken.sol`.
- Contract supports owner/minter-based minting, transfers through ERC20, credit retirement, and retirement history.
- Hardhat config and local deployment script exist.

## Working Features in Current Shape

- User registration for `farmer`, `ngo`, and `company`.
- User login with OAuth2 password form and JWT token response.
- Current user profile lookup through `/api/auth/me`.
- Project creation for farmer, NGO, and admin roles.
- Polygon centroid and land-area calculation during project creation.
- Project listing based on role.
- Project detail access control based on owner or company marketplace visibility.
- Project certificate download through `/api/projects/{project_id}/certificate`.
- Marketplace project listing if projects are approved, tokenized, and active/marketplace.
- Wallet connection/nonce/signature verification at backend code level.
- Smart contract supports minting and retirement at contract level.

## Incomplete Sections

- `backend/app/main.py` mounts only auth, projects, marketplace, blockchain, and certificates. It does not mount admin, auditor, wallet, or purchases routers.
- Frontend calls `/api/wallet/*` and `/api/purchases/*`, but those routers are not included in the FastAPI app.
- Admin frontend pages are mostly static and do not call `/api/admin/*`.
- Auditor-specific backend routes exist but are not mounted, and frontend auditor pages mostly use project routes instead.
- Purchase history is requested by the frontend but no `/api/purchases/history` backend endpoint exists.
- Purchase records are modeled but not created by the purchase endpoint.
- Payment, escrow, Razorpay, and payout workflows have models/settings but no complete API flow.
- Certificate model is mostly unused. Certificate APIs generate temporary IDs instead of persistent certificate records.
- AI verification depends on a biomass model file that is not present in the repository.
- Blockchain service can fail on import if env vars, RPC, contract address, or contract artifacts are missing.
- Frontend dashboard navigation uses `href="#"`, so sidebar menu entries are not connected to real pages.
- Some dashboard pages use hardcoded placeholder data.

## Deployment Readiness

Current readiness: **not production-ready**.

Main blockers:

- Alembic environment imports missing modules: `app.models.transaction` and `app.models.marketplace`.
- Migrations appear inconsistent and may fail on a clean database.
- Backend startup can fail if blockchain service imports are triggered without required environment variables and artifacts.
- Required production environment variables are not documented in a sample env file.
- Some required routers are not included in `backend/app/main.py`.
- No automated test suite is visible for backend, frontend, or blockchain.
- No production frontend deployment config is documented beyond default Next.js setup.
- Docker Compose contains hardcoded database credentials.
- Celery tasks require Redis and worker processes, but operational setup and failure handling are not fully documented.

## Practical Recommendation

Treat the project as an advanced prototype. Before deployment, fix routing, migrations, startup behavior, environment documentation, purchase persistence, blockchain artifact handling, and tests.

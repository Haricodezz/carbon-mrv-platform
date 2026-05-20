# Technical Architecture

## 1. Full Backend Architecture
- **Framework:** FastAPI (Python 3.10+)
- **Architecture Pattern:** Modular Monolith (Routers, Services, Models, Schemas, Core).
- **Concurrency:** Async/Await HTTP handling, with synchronous SQLAlchemy execution mapped correctly.
- **Background Processing:** Celery + Redis for asynchronous tasks (e.g., satellite verification, heavy ML computation).

## 2. Frontend Architecture
- **Framework:** Next.js 14 (App Router) + React 18.
- **Styling:** Tailwind CSS.
- **State Management:** React Hooks + Zustand (if extended), localized Context.
- **API Communication:** Axios with centralized interceptors for JWT injection and error parsing.
- **Web3 Integration:** Configured for viem/wagmi and RainbowKit for wallet connections.

## 3. Database Design
- **Engine:** PostgreSQL 15.
- **ORM:** SQLAlchemy 2.0 with Alembic for migrations.
- **Core Entities:**
  - `User`: RBAC (Admin, Auditor, Company, Farmer, NGO).
  - `Project`: Stores geospatial data, verification metrics, and lifecycle state.
  - `Wallet`: Balances (Fiat, Carbon) linked to Web3 addresses.
  - `CreditOwnership`: Ledger tracking specific fractional ownership per project.
  - `Purchase` & `Transaction`: Financial and credit movement histories.
  - `AuditLog`: Immutable governance actions.

## 4. ML & Verification Pipeline
- **Satellites:** Integration placeholders for Microsoft Planetary Computer (Sentinel-2 data).
- **Models:** Random Forest Regressor to predict Above Ground Biomass (AGB) and Carbon Stock based on NDVI, NDWI, and geographical features.
- **Fraud Detection:** Evaluates anomalies in land area vs. claimed credits to generate a risk score.

## 5. Blockchain System
- **Network:** Designed for EVM-compatible chains (Polygon/Ethereum).
- **Smart Contracts:** ERC-20 (CMRV Token) with minting, transfer, and burn (retirement) functionalities.
- **Interaction:** Web3.py on the backend for administrative minting; viem on the frontend for wallet signatures.

## 6. Payment System
- **Gateway:** Razorpay INR integration.
- **Workflow:** Two-step verification (Initiate Order -> Verify Signature -> Mint/Transfer Credits -> Deduct Inventory).

## 7. Security Systems
- **Auth:** JWT with bcrypt password hashing.
- **API Protection:** Custom in-memory rate limiting, Security Headers (HSTS, X-XSS-Protection).
- **Governance:** Role-based route guards on both FastAPI and Next.js layers.

## 8. Deployment Architecture
- **Containerization:** Docker Compose mapping Postgres, Redis, FastAPI, Celery, and Next.js.
- **Proxy:** Configurable behind Nginx/Traefik in a production cloud environment (AWS/GCP).

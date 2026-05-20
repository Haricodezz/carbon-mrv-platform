# Carbon MRV Platform - Project Audit & LLM Context

## 1. Project Overview
The **Carbon MRV Platform** is a system for **Measuring, Reporting, and Verifying (MRV)** carbon sequestration projects. It allows project owners (farmers, NGOs) to list land-based carbon projects, auditors to verify them using satellite data, and companies to purchase verified carbon credits (CMRV tokens) for ESG compliance.

## 2. Technical Stack
- **Backend:** Python (FastAPI), SQLAlchemy (ORM), PostgreSQL (Database), Celery (Task Queue), Redis (Broker), Web3.py (Blockchain interface).
- **Frontend:** Next.js 16 (App Router), TypeScript, Tailwind CSS, Shadcn UI, RainbowKit/Wagmi (Web3 connection).
- **Blockchain:** Solidity (ERC-20), Hardhat (Development framework).
- **GIS/Satellite:** Planetary Computer (STAC API), Sentinel-2 Imagery, Shapely, Pyproj.

## 3. Core Workflows & Current State

### A. Project Lifecycle
1. **Creation:** Farmers/NGOs define projects with GeoJSON/Polygon coordinates (`POST /api/projects/`).
2. **Satellite Verification:** Automated Celery task fetches Sentinel-2 imagery via Planetary Computer. Calculates NDVI, EVI, and NDMI. Heuristic/ML model estimates biomass and carbon stock.
3. **Approval:** Auditor/Admin approves the project. This triggers:
   - On-chain **minting** of CMRV tokens to the farmer's wallet address.
   - Generation of a PDF certificate.
   - Listing in the marketplace.

### B. Commercial Workflow (CRITICAL BUGS)
1. **Purchase:** Companies buy credits via Razorpay (`POST /api/purchases/create-order` and `verify-payment`).
2. **Issue:** Credits are deducted from the project and added to the buyer's balance **only in the database**.
3. **Blockchain Disconnect:** No on-chain `transfer` of tokens occurs from the farmer to the company during purchase. The farmer retains all minted tokens.
4. **Mock Fallback:** The frontend (`purchaseService.ts`) currently uses **mock payment IDs and signatures**, bypassing real payment validation.

## 4. Key Identified Bugs & Risks

### 🔒 Security
- **Mock Payment Bypass:** Frontend uses hardcoded `mock_payment_id` and `mock_signature`. The backend `payment_service` likely allows these (to be verified).
- **In-Memory Rate Limiting:** `main.py` uses a simple dictionary for rate limiting, which fails in multi-worker production environments. Needs Redis/Slowapi.
- **JWT Invalidation:** No mechanism to blacklist tokens upon user suspension or logout.

### ⚙️ Functional / Synchronization
- **On-Chain/Off-Chain Desync:** Purchases are not reflected on the blockchain. Companies have "paper" credits in the DB but no "on-chain" tokens.
- **Mock Blockchain Fallback:** `blockchain_service.py` silently falls back to simulated receipts if blockchain credentials are missing/invalid. This can hide configuration errors in production.
- **Simulated Satellite Fallback:** `planetary_computer_service.py` falls back to a crude heuristic if API calls fail or imagery is missing.

### 🏗️ Technical Debt
- **Unused Dependencies:** Massive `requirements.txt` with heavy ML libraries (XGBoost, Scikit-learn, Torch) that are largely unused or purely for future heuristics.
- **Logic Duplication:** Commercial logic is split/duplicated between `api/purchases.py` and `services/purchase_service.py`.
- **Incomplete Documentation:** Internal docs (e.g., `ALL_IN_ONE_DOCUMENTATION.md`) claim some APIs don't exist when they actually do, indicating development has outpaced documentation.

## 5. Critical Files for Reference
- `backend/app/api/projects.py`: Main project lifecycle endpoints.
- `backend/app/api/purchases.py`: Flawed purchase logic.
- `backend/app/services/blockchain_service.py`: Web3 interaction & mock logic.
- `backend/app/services/planetary_computer_service.py`: Satellite imagery processing.
- `blockchain/contracts/CarbonCreditToken.sol`: The ERC-20 contract logic.
- `frontend/services/purchaseService.ts`: Contains the mock payment bypass.

## 6. Recommended Next Steps
1. **Fix Purchase Sync:** Implement on-chain `transfer` or `transferFrom` in `verify_purchase_payment`.
2. **Secure Payments:** Remove mock payment fallbacks from frontend and backend.
3. **Production Rate Limiting:** Migrate to Redis-based rate limiting.
4. **Prune Dependencies:** Remove unused libraries from `requirements.txt` to reduce image size and startup time.
5. **Reconcile Documentation:** Update technical docs to reflect actual API availability.

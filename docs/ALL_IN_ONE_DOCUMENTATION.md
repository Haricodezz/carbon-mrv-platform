# Carbon MRV Platform — Complete Technical Documentation (All-in-One)

**Version:** 1.0  
**Last updated:** May 18, 2026  
**Repository:** carbon-mrv-platform  
**Format:** Single-file edition — platform overview, architecture, database, API, deployment, and security in one document.

---

## Master Table of Contents

| Part | Sections |
|------|----------|
| **I — Overview** | [§1 Project](#1-full-project-overview) · [§2 Tech Stack](#2-tech-stack-documentation) · [§3 Structure](#3-folder--file-structure) |
| **II — Architecture** | [§4 Architecture](#part-ii--architecture) |
| **III — Database** | [§5 Database](#part-iii--database-schema) |
| **IV — API** | [§6 API Reference](#part-iv--api-reference) |
| **V — Operations** | [§7 Modules](#7-core-functional-modules) · [§8 Deploy](#8-deployment-documentation) · [§9 Security](#9-security-overview) · [§10 Improvements](#10-improvements-section) |
| **Appendices** | [Routes](#appendix-a-frontend-route-catalog) · [Startup](#appendix-b-startup-sequence) · [Glossary](#appendix-c-glossary) |

---

# Part I — Platform Overview

## 1. Full Project Overview

### 1.1 Project Purpose

The **Carbon MRV Platform** is an end-to-end software system for **Measuring, Reporting, and Verifying (MRV)** carbon sequestration projects—primarily agricultural land and NGO forestry initiatives—and converting verified outcomes into **tradeable digital carbon credits** represented as ERC-20 tokens (**CMRV — Carbon MRV Credit**).

The platform connects:

- **Supply side** (farmers, NGOs) who register land-based projects
- **Verification side** (auditors, satellite/GIS checks) who validate claims
- **Demand side** (companies) who purchase and retire credits for ESG compliance
- **Platform operators** (admins) who oversee users, minting, and marketplace health

### 1.2 Main Features

| Feature | Status | Description |
|---------|--------|-------------|
| Multi-role user registration | ✅ Active | Farmer, NGO, company self-register; admin/auditor seeded |
| JWT authentication | ✅ Active | Email/password login with Bearer tokens |
| Web3 wallet linking | ✅ Active | MetaMask connect + EIP-191 signature verification |
| Project listing & audit | ⚠️ Partial | Review/approve APIs exist; **no project creation API** |
| Satellite/GIS verification | ⚠️ Simulated | NDVI, vegetation health, fraud scores (random MVP logic) |
| Carbon credit tokenization | ✅ Active | ERC-20 mint on Hardhat/local EVM via backend |
| Public marketplace | ✅ Active | Browse tokenized, approved projects |
| Credit purchases | ⚠️ Partial | Off-chain inventory decrement only |
| Retirement certificates (PDF) | ✅ Active | ReportLab PDF for retired projects |
| Admin dashboard | ✅ Active | User/project/payment/certificate counts |
| Escrow & Razorpay payments | ❌ Schema only | Models and env vars exist; no handlers |
| Real ML / Earth Engine | ❌ Planned | Dependencies present; not integrated |

### 1.3 Business / Use-Case Objective

1. **Digitize** carbon project registration with geospatial and audit metadata.
2. **Increase trust** via verifier workflows and (planned) satellite-backed evidence.
3. **Tokenize** verified credits on-chain for transparent issuance tracking.
4. **Enable trading** through a marketplace where companies acquire offsets.
5. **Support compliance** with downloadable retirement certificates tied to blockchain transaction hashes.

### 1.4 End-to-End System Goals

```mermaid
flowchart LR
    A[Register Project] --> B[Satellite Verify]
    B --> C[Auditor Approve]
    C --> D[Mint CMRV Tokens]
    D --> E[Marketplace Listing]
    E --> F[Company Purchase]
    F --> G[Retire Credits]
    G --> H[Issue Certificate]
```

**Target state:** Each stage is auditable, persisted, and linked to on-chain events.  
**Current MVP:** Stages A (create) and G (retire on-chain) are incomplete or simplified; see [§10 Improvements](#10-improvements-section).

---

## 2. Tech Stack Documentation

### 2.1 Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.2.6 | App Router, SSR/SSG, routing |
| **React** | 19.2.4 | UI components |
| **TypeScript** | ^5 | Type safety |
| **Tailwind CSS** | ^4 | Utility-first styling |
| **shadcn/ui** | ^4.7.0 | Component primitives (`components/ui/`) |
| **Framer Motion** | ^12.38.0 | Landing page animations |
| **RainbowKit + Wagmi + Viem** | 2.x | Web3 wallet provider (Polygon/Mumbai) |
| **TanStack Query** | ^5.100.10 | Query client inside WalletProvider |

**Declared but unused:** `axios`, `zustand`, `leaflet`, `react-leaflet`, `mapbox-gl`

### 2.2 Backend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Python** | 3.x | Runtime |
| **FastAPI** | 0.136.1 | REST API framework |
| **Uvicorn** | 0.46.0 | ASGI server |
| **SQLAlchemy** | 2.0.49 | ORM |
| **Alembic** | 1.18.4 | Schema migrations |
| **Pydantic Settings** | 2.14.1 | Environment configuration |
| **python-jose** | 3.5.0 | JWT encode/decode |
| **passlib + bcrypt** | — | Password hashing |
| **Web3.py** | 7.16.0 | Blockchain RPC client |
| **eth-account** | 0.13.7 | Transaction signing |
| **ReportLab** | 4.5.1 | PDF certificate generation |
| **psycopg2-binary** | 2.9.12 | PostgreSQL driver |

### 2.3 Database(s)

| Database | Role |
|----------|------|
| **PostgreSQL** | Primary application datastore (`DATABASE_URL`) |

**Configured but unused:** Supabase (PostgREST client initialized in `db/supabase.py`)

### 2.4 APIs Used

| API | Direction | Usage |
|-----|-----------|-------|
| **Internal REST API** | Frontend → Backend | All business operations |
| **EVM JSON-RPC** | Backend → Blockchain node | `eth_sendRawTransaction`, `eth_call` |
| **FastAPI OpenAPI** | Browser → Backend | Auto docs at `/docs` |

### 2.5 Authentication Systems

| Mechanism | Scope |
|-----------|-------|
| **JWT (Bearer)** | Primary API authentication |
| **OAuth2 password flow** | Login endpoint (`username` = email) |
| **EIP-191 personal_sign** | Wallet ownership verification |
| **Role-based access control** | Per-route role checks |

No OAuth social login, API keys, or session cookies.

### 2.6 Deployment Platforms

| Tier | Current state |
|------|---------------|
| **Frontend** | Local `next dev` / `next build`; README mentions Vercel (not configured) |
| **Backend** | Local Uvicorn; no Dockerfile or CI in repo |
| **Blockchain** | Local Hardhat node (`localhost:8545`) |
| **Database** | Local/remote PostgreSQL via connection string |

**No CI/CD pipelines** (GitHub Actions, etc.) are present in the repository.

### 2.7 Cloud Services

| Service | Status |
|---------|--------|
| Supabase | Configured, unused |
| Google Earth Engine | Dependency only (`earthengine-api`) |
| Polygon RPC | Configured for legacy payment stack; CMRV uses `BLOCKCHAIN_RPC_URL` |
| Vercel (frontend) | Mentioned in default Next.js README only |

### 2.8 ML / AI Services

| Component | Status |
|-----------|--------|
| `MODEL_PATH` env var | Required in config; **never read in code** |
| `xgboost`, `scikit-learn`, `joblib` | In `requirements.txt`; **no imports** |
| `real_satellite_service.py` | Random simulation, not ML |
| LangChain, Chroma, transformers, torch | In requirements; **unrelated to carbon MRV routes** |
| `backend/ml/` directory | **Empty** |

### 2.9 Third-Party Integrations

| Integration | Package / Config | Active |
|-------------|------------------|--------|
| OpenZeppelin ERC-20 | `@openzeppelin/contracts` | ✅ |
| Razorpay | `razorpay`, `RAZORPAY_*` env | ❌ |
| WalletConnect | RainbowKit `projectId` | ⚠️ Provider only |
| ReportLab | `reportlab` | ✅ PDF certs |

---

## 3. Folder & File Structure

### 3.1 Repository Tree (source files only)

Excludes `node_modules`, `.next`, `venv`, `.venv`, `__pycache__`, and build caches.

```
carbon-mrv-platform/
├── README.md                          # Minimal project title only
├── .gitignore
│
├── docs/                              # Technical documentation (this folder)
│   ├── PROJECT_DOCUMENTATION.md
│   ├── ARCHITECTURE.md
│   ├── API_REFERENCE.md
│   └── DATABASE_SCHEMA.md
│
├── frontend/                          # Next.js 16 application
│   ├── app/                           # App Router pages (34 routes)
│   │   ├── layout.tsx                 # Root layout: Navbar, Footer, providers
│   │   ├── page.tsx                   # Landing page
│   │   ├── auth/login|register/       # Authentication UI
│   │   ├── dashboard/                 # Role-based dashboards
│   │   ├── marketplace/               # Public marketplace
│   │   ├── wallet/                    # MetaMask verification flow
│   │   └── about|blog|calculator|...  # Marketing & legal pages
│   ├── components/
│   │   ├── layout/                    # Navbar, Footer
│   │   ├── landing/                   # Hero, Features, Trust, CTA
│   │   ├── dashboard/                 # Shell, Sidebar, Header
│   │   ├── providers/                 # WalletProvider, ClientProviders
│   │   ├── ui/                        # shadcn primitives
│   │   └── wallet/                    # WalletButton (unused)
│   ├── services/                      # API client modules (fetch-based)
│   ├── lib/                           # api.ts, ethereum.ts, utils
│   ├── hooks/                         # useAuthGuard, use-mobile
│   ├── types/                         # user.ts, ethereum.d.ts
│   ├── public/images/                 # Marketing assets
│   ├── package.json
│   ├── next.config.ts                 # Empty config
│   ├── tsconfig.json
│   ├── components.json                # shadcn config
│   └── eslint.config.mjs
│
├── backend/                           # FastAPI application
│   ├── app/
│   │   ├── main.py                    # App entry, routers, startup hooks
│   │   ├── api/                       # REST route handlers (9 modules)
│   │   ├── core/                      # config, security, dependencies
│   │   ├── db/                        # session, init_db, seed scripts
│   │   ├── models/                    # SQLAlchemy ORM (7 models)
│   │   ├── schemas/                   # Pydantic request/response models
│   │   └── services/                  # blockchain, satellite, PDF
│   ├── alembic/                       # Database migrations
│   │   └── versions/                  # 4 revision files
│   ├── ml/                            # Empty (placeholder)
│   ├── requirements.txt               # Python dependencies (large)
│   ├── alembic.ini                    # Alembic configuration
│   └── .env                           # Secrets (gitignored) — no .env.example
│
└── blockchain/                        # Hardhat 3 + Solidity
    ├── contracts/
    │   └── CarbonCreditToken.sol      # ERC-20 CMRV token
    ├── scripts/
    │   └── deploy.ts                  # Local deployment script
    ├── hardhat.config.ts
    ├── package.json
    └── tsconfig.json
```

### 3.2 Major Folder Purposes

| Folder | Purpose |
|--------|---------|
| `frontend/app/` | Next.js routes; each folder = URL segment |
| `frontend/services/` | Thin API clients mapping to backend REST |
| `frontend/components/` | Reusable UI; domain-grouped |
| `backend/app/api/` | HTTP layer; one file per domain |
| `backend/app/models/` | Database table definitions |
| `backend/app/services/` | Business logic isolated from HTTP |
| `backend/alembic/` | Versioned schema changes |
| `blockchain/contracts/` | On-chain token logic |

### 3.3 Key Configuration Files

| File | Purpose |
|------|---------|
| `backend/.env` | All backend secrets and URLs (see [§8.2](#82-environment-variables)) |
| `backend/alembic.ini` | Alembic DB URL (may duplicate `DATABASE_URL`) |
| `backend/requirements.txt` | Python packages |
| `frontend/package.json` | Node scripts and dependencies |
| `frontend/next.config.ts` | Next.js build/runtime config (currently empty) |
| `blockchain/hardhat.config.ts` | Solidity 0.8.24, localhost network |
| `blockchain/package.json` | Hardhat/ethers dependencies |
| `.gitignore` | Excludes `.env`, `node_modules`, `venv`, `artifacts/` |

---



---

# Part II — Architecture

This document describes system architecture, communication flows, design patterns, and integration boundaries for the Carbon MRV Platform.

---

### System Context

The Carbon MRV Platform is a **multi-tier web application** for measuring, reporting, and verifying (MRV) carbon credits, tokenizing them on an EVM-compatible chain, and supporting marketplace trading and retirement certificates.

**Primary actors:**

| Actor | Goal |
|-------|------|
| **Farmer / NGO** | Register land projects, receive verified credits |
| **Company** | Purchase and retire credits for ESG compliance |
| **Auditor** | Review and approve/reject projects |
| **Admin** | Platform oversight, user management, manual mint |
| **Public visitor** | Browse marketplace, marketing content |

---

### High-Level Architecture

```mermaid
flowchart TB
    subgraph clients [Client Tier]
        Browser[Next.js 16 Browser App]
    end

    subgraph api [Application Tier]
        FastAPI[FastAPI Backend :8000]
        Services[Domain Services]
    end

    subgraph data [Data Tier]
        PG[(PostgreSQL)]
        FS[Local PDF Storage]
    end

    subgraph chain [Blockchain Tier]
        Hardhat[Hardhat Local Node :8545]
        Contract[CarbonCreditToken CMRV]
    end

    subgraph planned [Planned / Configured - Not Active]
        Supabase[Supabase]
        Razorpay[Razorpay]
        GEE[Google Earth Engine]
        ML[ML Models]
    end

    Browser -->|REST JSON + JWT| FastAPI
    FastAPI --> Services
    Services --> PG
    Services --> FS
    Services -->|Web3.py| Contract
    Contract --> Hardhat
    FastAPI -.->|configured| Supabase
    FastAPI -.->|configured| Razorpay
    Services -.->|deps only| GEE
    Services -.->|simulated| ML
```

### Repository layout (logical tiers)

```
carbon-mrv-platform/
├── frontend/     # Next.js App Router UI
├── backend/      # FastAPI + SQLAlchemy
├── blockchain/   # Solidity + Hardhat
└── docs/         # Technical documentation
```

---

### Architectural Patterns

| Pattern | Where applied |
|---------|---------------|
| **Monorepo (multi-package)** | `frontend`, `backend`, `blockchain` in one repository |
| **Layered architecture** | API routers → services → models/DB |
| **Router modularization** | One FastAPI `APIRouter` per domain (`auth`, `projects`, …) |
| **Dependency injection** | FastAPI `Depends(get_db)`, `Depends(get_current_user)` |
| **Repository-like queries** | SQLAlchemy queries inline in route handlers (no separate repository layer) |
| **Service layer** | `blockchain_service`, `real_satellite_service`, `certificate_generator` |
| **JWT stateless auth** | Bearer tokens; no server sessions |
| **Custodial blockchain signing** | Backend holds `PRIVATE_KEY` and submits all on-chain txs |
| **Server-mediated Web3** | Frontend never calls chain directly for mint/retire/transfer |

---

### Frontend → Backend → Database Flow

```mermaid
sequenceDiagram
    participant U as User Browser
    participant F as Next.js Page/Service
    participant A as FastAPI Router
    participant S as Service Layer
    participant D as PostgreSQL

    U->>F: User action (click/submit)
    F->>F: Read JWT from localStorage
    F->>A: fetch(API_URL + path, Bearer token)
    A->>A: get_current_user / require_role
    A->>D: SQLAlchemy query / commit
    opt Blockchain or PDF
        A->>S: mint_credits / generate_pdf
        S-->>A: tx receipt / file path
    end
    A-->>F: JSON response
    F-->>U: Update UI state
```

### API client pattern (frontend)

- **No centralized HTTP client** — each file in `frontend/services/` uses native `fetch`.
- **Base URL:** `process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000'`
- **Auth header:** `Authorization: Bearer ${localStorage.access_token}`

### CORS

Backend allows all origins (`allow_origins=["*"]`) — suitable for development only.

```30:36:backend/app/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with production frontend URL later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

### Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant FE as /auth/login
    participant API as /api/auth/login
    participant DB as PostgreSQL

    U->>FE: email + password
    FE->>API: POST form-urlencoded (username=email)
    API->>DB: SELECT user BY email
    API->>API: verify_password (bcrypt)
    API->>API: create_access_token(sub, role)
    API-->>FE: { access_token }
    FE->>FE: localStorage.setItem('access_token')
    FE->>API: GET /api/auth/me
    API-->>FE: user profile
    FE->>FE: role-based router.push(dashboard)
```

### Registration flow

1. `POST /api/auth/register` with role ∈ `{farmer, ngo, company}`
2. Creates `User` + `Wallet` rows
3. Returns JWT immediately (auto-login)

### Authorization enforcement

| Layer | Mechanism |
|-------|-----------|
| API | `get_current_user`, `require_role([...])`, inline `role not in [...]` |
| Frontend | `useAuthGuard` on **farmer dashboard only**; most routes unprotected at UI level |

---

### Wallet Verification Flow

Two Web3 UX paths exist in the frontend; only the **MetaMask + backend nonce** path is wired in the Navbar.

```mermaid
sequenceDiagram
    participant U as User
    participant FE as /wallet page
    participant MM as MetaMask
    participant API as /api/wallet

    U->>FE: Connect (requires JWT)
    FE->>MM: eth_requestAccounts
    MM-->>FE: wallet address
    FE->>API: POST /connect { wallet_address }
    FE->>API: GET /nonce
    API-->>FE: { nonce }
    FE->>FE: Build message with nonce prefix
    FE->>MM: personal_sign(message)
    MM-->>FE: signature
    FE->>API: POST /verify { message, signature }
    API->>API: recover_message (EIP-191)
    API-->>FE: wallet_verified: true
```

**RainbowKit/Wagmi** (`WalletProvider`) wraps the app for Polygon/Mumbai but `ConnectButton` is not used in navigation.

---

### Project MRV Lifecycle

The platform has **two overlapping approval paths** — auditors should use the projects API path for full tokenization.

```mermaid
stateDiagram-v2
    [*] --> draft: Project created (no API yet)
    draft --> pending_audit: Submitted
    pending_audit --> active: /api/auditor/.../approve
    pending_audit --> draft: /api/auditor/.../reject

    pending_audit --> satellite_pending: Awaiting verify
    satellite_pending --> verified: POST .../satellite-verify
    satellite_pending --> rejected_sat: satellite-verify fail

    verified --> marketplace: POST .../projects/.../approve
    marketplace --> retired: Retire flow (future)
```

### Full verification path (recommended)

| Step | Endpoint | Effect |
|------|----------|--------|
| 1 | `POST /api/projects/{id}/satellite-verify` | NDVI, fraud score, `estimated_credits` |
| 2 | `POST /api/projects/{id}/approve` | `status=marketplace`, optional on-chain mint |
| 3 | Public `GET /api/marketplace/` | Listing |
| 4 | `POST /api/purchases/{id}?amount=` | Decrement available credits |

### Simplified auditor path (no mint)

| Step | Endpoint | Effect |
|------|----------|--------|
| 1 | `POST /api/auditor/projects/{id}/approve` | `status=active` only |

---

### Blockchain Integration

```mermaid
flowchart LR
    subgraph backend [FastAPI]
        API["/api/blockchain"]
        BS[blockchain_service.py]
    end

    subgraph artifacts [Compiled Artifacts]
        ABI[CarbonCreditToken.json]
    end

    subgraph node [EVM Node]
        RPC[RPC :8545]
        SC[CarbonCreditToken]
    end

    API --> BS
    BS --> ABI
    BS -->|HTTPProvider| RPC
    BS -->|sign PRIVATE_KEY| SC
```

### Smart contract: `CarbonCreditToken`

- **Standard:** ERC-20 (`CMRV`)
- **Extensions:** Owner-controlled minters, `mintCredits`, `retireCredits` (burn + history), `getRetirementHistory`

### Server signing model

All write operations use the **deployer account** from `PRIVATE_KEY`:

```50:66:backend/app/services/blockchain_service.py
def build_transaction(tx):
    nonce = w3.eth.get_transaction_count(
        deployer_account.address
    )
    gas_estimate = tx.estimate_gas(
        {"from": deployer_account.address}
    )
    return tx.build_transaction(
        {
            "from": deployer_account.address,
            "nonce": nonce,
            "gas": gas_estimate,
            "gasPrice": w3.eth.gas_price,
        }
    )
```

**Implication:** `retireCredits` on-chain burns from the **deployer** balance, not the end-user wallet, unless tokens were previously transferred to the deployer. Product design should move to user-signed transactions or a relayer pattern for production.

### Auto-mint on project approval

```190:211:backend/app/api/projects.py
    if (
        owner.wallet_verified
        and owner.wallet_address
        and project.estimated_credits > 0
    ):
        try:
            blockchain_result = mint_credits(
                recipient_wallet=owner.wallet_address,
                amount=project.estimated_credits,
                project_id=str(project.id),
            )
            project.blockchain_tx_hash = (
                blockchain_result["tx_hash"]
            )
            project.tokenized = True
```

### Deployment

1. `npx hardhat node` (localhost:8545)
2. `npx hardhat compile`
3. `npx hardhat run scripts/deploy.ts --network localhost`
4. Set `CARBON_TOKEN_CONTRACT_ADDRESS` in `backend/.env`

---

### Satellite / GIS Pipeline

**Current state:** MVP simulation in `real_satellite_service.py`.

```mermaid
flowchart TD
    A[POST satellite-verify] --> B[verify_project_with_real_satellite]
    B --> C[Random NDVI 0.65-0.95]
    B --> D[Random fraud risk 0-10]
    B --> E[Credit formula: acres × NDVI × 1.2 × 100]
    C --> F{NDVI >= 0.7 AND fraud <= 8?}
    F -->|yes| G[satellite_status=verified]
    F -->|no| H[satellite_status=rejected]
```

**Planned (comments in code):** GeoJSON validation, Earth Engine rasters, fraud ML (`MODEL_PATH`, xgboost/sklearn in requirements — unused).

**Dependencies present but unused in services:** `earthengine-api`, `geemap`, `opencv-python`.

---

### Certificate Generation

```mermaid
flowchart LR
    A[GET certificates/download] --> B{project.status == retired?}
    B -->|yes| C[certificate_generator.py]
    C --> D[ReportLab PDF]
    D --> E[FileResponse to client]
```

PDFs written to `./certificates/` (not `CERTIFICATE_STORAGE_PATH` from config).

---

### External Service Integrations

| Service | Config variables | Code status |
|---------|------------------|-------------|
| **PostgreSQL** | `DATABASE_URL` | Active |
| **Local Hardhat** | `BLOCKCHAIN_RPC_URL`, `CARBON_TOKEN_CONTRACT_ADDRESS`, `PRIVATE_KEY` | Active |
| **Supabase** | `SUPABASE_URL`, `SUPABASE_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Client in `db/supabase.py`; **unused** |
| **Razorpay** | `RAZORPAY_*` | Config only; **no API calls** |
| **Polygon payments** | `POLYGON_RPC_URL`, `USDT/USDC`, `MASTER_WALLET_*` | Config only; separate from CMRV token |
| **SMTP email** | `SMTP_*` | Optional config; **unused** |
| **Google Earth Engine** | — | Dependency only |
| **WalletConnect** | Hardcoded `projectId` in `WalletProvider.tsx` | RainbowKit provider |

---

### Component Interaction Diagram

```mermaid
flowchart TB
    subgraph fe [Frontend Components]
        Navbar
        Pages[App Router Pages]
        Svc[services/*.ts]
        WP[WalletProvider]
    end

    subgraph be [Backend Modules]
        Main[main.py]
        Routers[api/*.py]
        Core[core/config security dependencies]
        Models[models/*.py]
        DBServices[services/*.py]
    end

    Navbar --> Svc
    Pages --> Svc
    Pages --> WP
    Svc --> Routers
    Main --> Routers
    Routers --> Core
    Routers --> Models
    Routers --> DBServices
    Models --> PG[(PostgreSQL)]
    DBServices --> Chain[EVM Contract]
```

---

### Scalability & Maintainability

### Strengths

- Clear domain-separated API routers
- Typed Pydantic request/response schemas for auth/wallet
- UUID primary keys suitable for distributed systems
- Service extraction for blockchain and PDF generation

### Risks / bottlenecks

| Area | Issue | Recommendation |
|------|-------|----------------|
| **DB bootstrap** | `create_all()` on every startup | Use Alembic-only in production |
| **Auth** | CORS `*`, no rate limits | Lock down origins; add throttling |
| **Blockchain** | Single hot wallet key on server | HSM/KMS, minter role separation |
| **Queries** | `GET /projects/` returns all rows | Pagination, owner-scoped filters |
| **State** | Duplicate approval paths | Unify auditor + projects workflows |
| **Frontend auth** | Inconsistent route guards | Middleware or layout-level `useAuthGuard` |
| **Dependencies** | Heavy `requirements.txt` (ML, streamlit, etc.) | Split dev/prod requirements |
| **Testing** | No test suites in repo | Add pytest + Hardhat tests + Playwright |

### Horizontal scaling notes

- FastAPI workers: run multiple Uvicorn workers behind a load balancer
- PostgreSQL: connection pooling (PgBouncer)
- Blockchain: dedicated RPC endpoint (Alchemy/Infura) for non-local networks
- Frontend: static export or Vercel/Node SSR for Next.js

---

# Part III — Database Schema

This document describes the PostgreSQL data layer for the Carbon MRV Platform, including ORM models, relationships, migrations, and known implementation gaps.

---

### Overview

| Property | Value |
|----------|-------|
| **Database** | PostgreSQL |
| **ORM** | SQLAlchemy 2.x |
| **Migrations** | Alembic |
| **Connection** | `DATABASE_URL` environment variable |
| **Bootstrap** | `init_db()` runs `Base.metadata.create_all()` on every API startup |
| **Primary key type** | UUID (`UUID(as_uuid=True)`) on all tables |

**Important:** The application uses both Alembic migrations and `create_all()` at startup. In production, prefer a single source of truth (Alembic only) to avoid schema drift.

---

### Entity Relationship Diagram

```mermaid
erDiagram
    users ||--o{ projects : owns
    users ||--o| wallets : has
    users ||--o{ payments : makes
    users ||--o{ certificates : receives
    users ||--o{ purchases : buys
    users ||--o{ escrow_transactions : "buyer/seller"
    projects ||--o{ certificates : certifies
    projects ||--o{ purchases : sold_via
    projects ||--o{ escrow_transactions : linked
    payments ||--o{ escrow_transactions : funds

    users {
        uuid id PK
        string email UK
        string role
        string wallet_address UK
        boolean wallet_verified
    }

    projects {
        uuid id PK
        uuid owner_id FK
        string status
        string audit_status
        boolean tokenized
        string blockchain_tx_hash
    }

    wallets {
        uuid id PK
        uuid user_id FK
        float fiat_balance
        float escrow_balance
    }

    payments {
        uuid id PK
        uuid user_id FK
        string status
    }

    certificates {
        uuid id PK
        uuid buyer_id FK
        uuid project_id FK
        string certificate_id UK
    }

    purchases {
        uuid id PK
        uuid buyer_id FK
        uuid project_id FK
    }

    escrow_transactions {
        uuid id PK
        uuid buyer_id FK
        uuid seller_id FK
        uuid payment_id FK
        uuid project_id FK
    }
```

---

### Tables Reference

### `users`

Platform accounts for all roles.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | UUID | NO | `uuid4()` | Primary key |
| `full_name` | VARCHAR | NO | — | Display name |
| `email` | VARCHAR | NO | — | Unique, indexed |
| `password_hash` | VARCHAR | NO | — | bcrypt via passlib |
| `role` | VARCHAR | NO | — | Indexed; see [Roles](#enumerated-values) |
| `is_verified` | BOOLEAN | YES | `false` | KYC/email flag |
| `is_active` | BOOLEAN | YES | `true` | Account status |
| `kyc_completed` | BOOLEAN | YES | `false` | Compliance flag |
| `phone` | VARCHAR | YES | — | Optional |
| `country` | VARCHAR | YES | — | Optional |
| `organization_name` | VARCHAR | YES | — | NGO/company name |
| `created_at` | TIMESTAMPTZ | YES | `now()` | Server default |
| `updated_at` | TIMESTAMPTZ | YES | `now()` | On update |
| `wallet_address` | VARCHAR | YES | — | Unique; lowercase normalized in API |
| `wallet_verified` | BOOLEAN | YES | `false` | EIP-191 signature verified |
| `wallet_type` | VARCHAR | YES | — | e.g. `metamask` |
| `wallet_nonce` | VARCHAR | YES | — | One-time verification nonce |

**Source:** `backend/app/models/user.py`

---

### `projects`

Carbon offset / MRV projects submitted by farmers or NGOs.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | UUID | NO | `uuid4()` | Primary key |
| `owner_id` | UUID | NO | — | FK → `users.id` ON DELETE CASCADE |
| `project_name` | VARCHAR | NO | — | |
| `project_type` | VARCHAR | NO | — | `farmer` \| `ngo` |
| `location` | VARCHAR | NO | — | Human-readable location |
| `country` | VARCHAR | NO | — | |
| `land_area_acres` | FLOAT | NO | — | Used in credit estimation |
| `satellite_status` | VARCHAR | YES | `pending` | `pending` \| `verified` \| `rejected` |
| `audit_status` | VARCHAR | YES | `pending` | `pending` \| `approved` \| `rejected` |
| `ndvi_score` | FLOAT | YES | `0.0` | GIS metric (simulated in MVP) |
| `vegetation_health` | FLOAT | YES | `0.0` | Derived from NDVI |
| `fraud_risk_score` | FLOAT | YES | `0.0` | Risk score (simulated) |
| `verification_notes` | TEXT | YES | — | Auditor/satellite notes |
| `estimated_annual_credits` | FLOAT | YES | `0.0` | User-submitted estimate |
| `first_issuance_credits` | FLOAT | YES | `0.0` | |
| `estimated_credits` | INTEGER | YES | `0` | Post-verification estimate |
| `total_credits_generated` | FLOAT | YES | `0.0` | Minted / available pool |
| `status` | VARCHAR | YES | `draft` | Lifecycle status |
| `description` | TEXT | YES | — | |
| `tokenized` | BOOLEAN | YES | `false` | On-chain mint completed |
| `blockchain_tx_hash` | VARCHAR | YES | — | Mint transaction hash |
| `created_at` | TIMESTAMPTZ | YES | `now()` | |
| `updated_at` | TIMESTAMPTZ | YES | `now()` | |

**Source:** `backend/app/models/project.py`

---

### `wallets`

Internal fiat/escrow balances per user (separate from on-chain `users.wallet_address`).

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | UUID | NO | `uuid4()` | Primary key |
| `user_id` | UUID | NO | — | FK → `users.id` ON DELETE CASCADE |
| `fiat_balance` | FLOAT | YES | `0.0` | INR balance (unused in APIs) |
| `escrow_balance` | FLOAT | YES | `0.0` | Escrow hold (unused in APIs) |
| `crypto_wallet_address` | VARCHAR | YES | — | Synced from user connect |
| `crypto_network` | VARCHAR | YES | — | `polygon` \| `ethereum` \| `solana` |
| `created_at` | TIMESTAMPTZ | YES | `now()` | |
| `updated_at` | TIMESTAMPTZ | YES | `now()` | |

**Source:** `backend/app/models/wallet.py`

---

### `payments`

Payment records for Razorpay/crypto flows (schema present; **no active API handlers**).

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | UUID | NO | `uuid4()` | Primary key |
| `user_id` | UUID | NO | — | FK → `users.id` |
| `payment_type` | VARCHAR | NO | — | `deposit` \| `withdrawal` \| `purchase` \| `escrow` |
| `payment_method` | VARCHAR | NO | — | `razorpay` \| `crypto` |
| `provider_order_id` | VARCHAR | YES | — | Razorpay order ID |
| `provider_payment_id` | VARCHAR | YES | — | Razorpay payment ID |
| `tx_hash` | VARCHAR | YES | — | On-chain payment hash |
| `currency` | VARCHAR | NO | `INR` | |
| `amount` | FLOAT | NO | — | |
| `status` | VARCHAR | YES | `pending` | `pending` \| `completed` \| `failed` \| `escrowed` |
| `verification_status` | VARCHAR | YES | `pending` | |
| `created_at` | TIMESTAMPTZ | YES | `now()` | |
| `updated_at` | TIMESTAMPTZ | YES | `now()` | |

**Source:** `backend/app/models/payment.py`

---

### `certificates`

Retirement certificate records (schema present; **API uses in-memory generation** instead of persisting rows).

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | UUID | NO | `uuid4()` | Primary key |
| `certificate_id` | VARCHAR | NO | — | Unique business ID |
| `buyer_id` | UUID | NO | — | FK → `users.id` |
| `project_id` | UUID | NO | — | FK → `projects.id` |
| `retired_credits` | FLOAT | NO | — | |
| `retirement_reason` | VARCHAR | YES | — | |
| `verification_status` | VARCHAR | YES | `verified` | |
| `pdf_url` | VARCHAR | YES | — | Storage path (unused) |
| `issued_at` | TIMESTAMPTZ | YES | `now()` | |
| `created_at` | TIMESTAMPTZ | YES | `now()` | |

**Source:** `backend/app/models/certificate.py`

---

### `purchases`

Marketplace purchase ledger (table exists; **purchase API does not insert rows**).

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | UUID | NO | `uuid4()` | Primary key |
| `buyer_id` | UUID | NO | — | FK → `users.id` |
| `project_id` | UUID | NO | — | FK → `projects.id` |
| `credits_purchased` | FLOAT | NO | — | |
| `price_per_credit` | FLOAT | NO | — | |
| `total_price` | FLOAT | NO | — | |
| `blockchain_tx_hash` | VARCHAR | YES | — | Not populated by API |
| `status` | VARCHAR | YES | `completed` | |
| `created_at` | TIMESTAMPTZ | YES | `now()` | |

**Source:** `backend/app/models/purchase.py`

---

### `escrow_transactions`

Escrow settlement records (schema present; **no API handlers**).

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | UUID | NO | `uuid4()` | Primary key |
| `buyer_id` | UUID | NO | — | FK → `users.id` |
| `seller_id` | UUID | NO | — | FK → `users.id` |
| `payment_id` | UUID | NO | — | FK → `payments.id` |
| `project_id` | UUID | NO | — | FK → `projects.id` |
| `total_amount` | FLOAT | NO | — | |
| `platform_fee` | FLOAT | YES | `0.0` | |
| `escrow_fee` | FLOAT | YES | `0.0` | |
| `seller_payout` | FLOAT | YES | `0.0` | |
| `release_status` | VARCHAR | YES | `held` | `held` \| `released` \| `refunded` |
| `audit_status` | VARCHAR | YES | `pending` | |
| `created_at` | TIMESTAMPTZ | YES | `now()` | |
| `updated_at` | TIMESTAMPTZ | YES | `now()` | |

**Source:** `backend/app/models/escrow.py`

---

### ORM Models

All models inherit from `Base` defined in `backend/app/db/session.py`.

| Model class | Table | File |
|-------------|-------|------|
| `User` | `users` | `app/models/user.py` |
| `Project` | `projects` | `app/models/project.py` |
| `Wallet` | `wallets` | `app/models/wallet.py` |
| `Payment` | `payments` | `app/models/payment.py` |
| `Certificate` | `certificates` | `app/models/certificate.py` |
| `Purchase` | `purchases` | `app/models/purchase.py` |
| `EscrowTransaction` | `escrow_transactions` | `app/models/escrow.py` |

**Note:** No SQLAlchemy `relationship()` declarations exist. Joins are performed explicitly in query code.

---

### Relationships & Foreign Keys

| Child Table | Column | Parent | ON DELETE |
|-------------|--------|--------|-----------|
| `projects` | `owner_id` | `users.id` | CASCADE |
| `wallets` | `user_id` | `users.id` | CASCADE |
| `payments` | `user_id` | `users.id` | CASCADE |
| `certificates` | `buyer_id` | `users.id` | CASCADE |
| `certificates` | `project_id` | `projects.id` | CASCADE |
| `purchases` | `buyer_id` | `users.id` | CASCADE |
| `purchases` | `project_id` | `projects.id` | CASCADE |
| `escrow_transactions` | `buyer_id` | `users.id` | CASCADE |
| `escrow_transactions` | `seller_id` | `users.id` | CASCADE |
| `escrow_transactions` | `payment_id` | `payments.id` | CASCADE |
| `escrow_transactions` | `project_id` | `projects.id` | CASCADE |

---

### Enumerated Values

### User roles

| Value | Registration | Seeded at startup |
|-------|--------------|-------------------|
| `admin` | No | Yes (`DEFAULT_ADMIN_*`) |
| `auditor` | No | Yes (`DEFAULT_AUDITOR_*`) |
| `farmer` | Yes | No |
| `ngo` | Yes | No |
| `company` | Yes | No |

### Project lifecycle (`status`)

```
draft → active → marketplace → retired
```

| Status | Meaning |
|--------|---------|
| `draft` | Rejected or initial state |
| `active` | Auditor-approved (simple path) |
| `marketplace` | Satellite-verified + approved + listed |
| `retired` | Credits retired; certificate eligible |

### Verification states

| Field | Values |
|-------|--------|
| `satellite_status` | `pending`, `verified`, `rejected` |
| `audit_status` | `pending`, `approved`, `rejected` |

---

### Alembic Migrations

**Config:** `backend/alembic.ini`  
**Environment:** `backend/alembic/env.py` (imports `User`, `Project`, `Wallet` only — incomplete model set)

### Revision chain

```
461e06a4cc21  (base)
    ↓
d3162a5b0462
    ↓
3ae26b7d4622  (empty migration)
    ↓
bd6ae18deda1  (head)
```

| Revision | File | Changes |
|----------|------|---------|
| `461e06a4cc21` | `add_blockchain_fields_to_projects.py` | FK on certificates/escrow → projects; project columns: `tokenized`, `blockchain_tx_hash`, `estimated_credits`, `verification_notes`; user wallet columns TEXT→VARCHAR |
| `d3162a5b0462` | `add_purchases_table_properly.py` | Create `purchases` table + indexes |
| `3ae26b7d4622` | `add_ai_verification_fields_to_projects.py` | **No-op** (`pass` in upgrade/downgrade) |
| `bd6ae18deda1` | `add_gis_analytics_fields_to_projects.py` | Add `ndvi_score`, `vegetation_health`, `fraud_risk_score` |

### Running migrations

```bash
cd backend
alembic upgrade head
```

---

### Schema vs API Usage Gaps

| Table / Model | Schema exists | Used by API |
|---------------|---------------|-------------|
| `users` | Yes | Yes |
| `projects` | Yes | Yes |
| `wallets` | Yes | Partial (connect sync only) |
| `payments` | Yes | Admin count only |
| `certificates` | Yes | Admin count only; API generates ephemeral certs |
| `purchases` | Yes | **No** — purchases decrement project credits only |
| `escrow_transactions` | Yes | **No** |

These gaps are documented in §15 Improvements below.

---

# Part IV — API Reference

**Base URL (development):** `http://127.0.0.1:8000`  
**OpenAPI / Swagger:** `http://127.0.0.1:8000/docs` (auto-generated by FastAPI)  
**Alternative docs:** `http://127.0.0.1:8000/redoc`

---

### Authentication

### JWT Bearer tokens

Most endpoints require:

```http
Authorization: Bearer <access_token>
```

Tokens are issued by `/api/auth/register` and `/api/auth/login`.

| Claim | Description |
|-------|-------------|
| `sub` | User UUID string |
| `role` | User role (`admin`, `auditor`, `farmer`, `ngo`, `company`) |
| `exp` | Expiration (UTC), from `ACCESS_TOKEN_EXPIRE_MINUTES` |

**Token URL for OAuth2 scheme:** `/api/auth/login` (form body, not JSON)

### Role-based access

Implemented via `require_role(["admin"])` or inline checks in route handlers.

| Role | Typical access |
|------|----------------|
| `admin` | Full platform management |
| `auditor` | Project review, satellite verify, mint (with verified wallet) |
| `farmer` / `ngo` | Own projects, wallet, purchases |
| `company` | Marketplace buyer, wallet, certificates |

---

### Error Handling

FastAPI returns standard HTTP status codes with JSON body:

```json
{
  "detail": "Human-readable error message"
}
```

Validation errors (422) return an array in `detail`:

```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

| Status | Common causes |
|--------|---------------|
| `400` | Business rule violation, invalid wallet signature |
| `401` | Missing/invalid/expired JWT |
| `403` | Wrong role, invalid registration role |
| `404` | Resource not found |
| `422` | Pydantic validation failure |
| `500` | Blockchain mint failure, unhandled server error |

Frontend error parsing: `frontend/lib/api.ts` → `parseApiError()`.

---

### Rate Limits

**None configured** in the current codebase. Production deployments should add rate limiting (e.g. reverse proxy, FastAPI middleware, or API gateway).

---

### App Endpoints

### `GET /`

| | |
|---|---|
| **Auth** | None |
| **Response** | `{ "message": "<APP_NAME> API is running successfully." }` |

### `GET /health`

| | |
|---|---|
| **Auth** | None |
| **Response** | `{ "status": "healthy", "app": "...", "environment": "..." }` |

---

### Auth API (`/api/auth`)

### `POST /api/auth/register`

Register a new user and receive a JWT immediately.

| | |
|---|---|
| **Auth** | None |
| **Content-Type** | `application/json` |

**Request body**

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `full_name` | string | Yes | |
| `email` | string | Yes | Valid email |
| `password` | string | Yes | 8–64 characters |
| `role` | string | Yes | `farmer`, `ngo`, or `company` only |
| `phone` | string | No | |
| `country` | string | No | |
| `organization_name` | string | No | |

**Response** `200`

```json
{
  "access_token": "<jwt>",
  "token_type": "bearer"
}
```

**Side effects:** Creates `users` row and associated `wallets` row.

**Errors:** `400` email exists; `403` invalid role.

---

### `POST /api/auth/login`

| | |
|---|---|
| **Auth** | None |
| **Content-Type** | `application/x-www-form-urlencoded` |

**Form fields (OAuth2 password flow)**

| Field | Maps to |
|-------|---------|
| `username` | User email |
| `password` | Plain password |

**Response** `200` — same as register (`TokenResponse`).

**Errors:** `401` invalid credentials.

---

### `GET /api/auth/me`

| | |
|---|---|
| **Auth** | Bearer JWT |

**Response** `200`

```json
{
  "id": "uuid",
  "full_name": "string",
  "email": "string",
  "role": "string",
  "country": "string | null",
  "organization_name": "string | null",
  "is_verified": false,
  "wallet_address": "string | null",
  "wallet_type": "string | null",
  "wallet_verified": false,
  "created_at": "datetime"
}
```

---

### Admin API (`/api/admin`)

All endpoints require role `admin`.

### `GET /api/admin/dashboard`

**Response** `200`

```json
{
  "admin": "admin@example.com",
  "total_users": 0,
  "total_projects": 0,
  "total_payments": 0,
  "total_certificates": 0
}
```

### `GET /api/admin/users`

**Response** `200` — array of user summaries (no password hash).

```json
[
  {
    "id": "uuid",
    "full_name": "string",
    "email": "string",
    "role": "string",
    "is_verified": false,
    "is_active": true
  }
]
```

---

### Auditor API (`/api/auditor`)

Requires role `auditor` or `admin`.

### `GET /api/auditor/projects/pending`

**Response** `200` — array of pending projects (summary fields).

### `POST /api/auditor/projects/{project_id}/approve`

**Path params:** `project_id` (UUID string)

**Behavior:** Sets `audit_status=approved`, `status=active`. Does **not** run satellite verification or blockchain mint.

**Response** `200`

```json
{ "message": "Project <name> approved successfully." }
```

### `POST /api/auditor/projects/{project_id}/reject`

Sets `audit_status=rejected`, `status=draft`.

---

### Projects API (`/api/projects`)

All endpoints require Bearer JWT unless noted.

### `GET /api/projects/`

**Response** `200` — array of full `Project` ORM objects (all projects, no owner filter).

### `GET /api/projects/{project_id}`

**Response** `200` — single project OR `404`.

### `POST /api/projects/{project_id}/satellite-verify`

| | |
|---|---|
| **Roles** | `admin`, `auditor` |

Runs simulated GIS verification via `real_satellite_service`.

**Response** `200`

```json
{
  "message": "Real satellite GIS verification completed.",
  "project_id": "uuid",
  "project_name": "string",
  "ndvi_score": 0.85,
  "vegetation_health": 85.0,
  "fraud_risk": 3.2,
  "estimated_credits": 1200,
  "verification_status": "verified",
  "verification_notes": "string",
  "audit_status": "approved"
}
```

### `POST /api/projects/{project_id}/approve`

| | |
|---|---|
| **Roles** | `admin`, `auditor` |
| **Preconditions** | `satellite_status == "verified"` |

**Behavior:**

1. Sets `audit_status=approved`, `status=marketplace`
2. If owner has verified wallet and `estimated_credits > 0`, mints CMRV tokens on-chain
3. Sets `tokenized=true`, `blockchain_tx_hash`, `total_credits_generated`

**Response** `200` — approval summary including GIS fields and blockchain hash.

**Errors:** `400` already approved or satellite not verified; `500` blockchain mint failure.

### `POST /api/projects/{project_id}/reject`

Sets `audit_status=rejected`, `status=draft`.

### `DELETE /api/projects/{project_id}`

| | |
|---|---|
| **Roles** | `admin` only |

---

### Missing endpoint (documented gap)

`ProjectCreateRequest` schema exists (`POST` body with `project_name`, `location`, etc.) but **no `POST /api/projects` route** is implemented. Project creation must be done via direct DB seeding or future implementation.

---

### Wallet API (`/api/wallet`)

### `POST /api/wallet/connect`

**Request body**

| Field | Type | Required |
|-------|------|----------|
| `wallet_address` | string | Yes |
| `wallet_type` | string | Yes |

**Response** `200`

```json
{
  "message": "Wallet connected successfully. Verification pending.",
  "wallet_address": "0x...",
  "wallet_type": "metamask",
  "wallet_verified": false
}
```

**Errors:** `400` wallet already linked to another account.

### `GET /api/wallet/me`

Returns connected wallet fields for current user.

### `GET /api/wallet/nonce`

**Response** `200`

```json
{ "nonce": "<hex>" }
```

Client must sign message:

```
Verify your Carbon MRV wallet ownership. Nonce: <nonce>
```

### `POST /api/wallet/verify`

**Request body**

| Field | Type | Required |
|-------|------|----------|
| `wallet_address` | string | Yes |
| `message` | string | Yes | Must match expected nonce message |
| `signature` | string | Yes | EIP-191 personal sign |
| `wallet_type` | string | Yes |

**Response** `200` — `wallet_verified: true`

---

### Blockchain API (`/api/blockchain`)

On-chain operations are signed server-side using `PRIVATE_KEY` (deployer account). See Part II below.

### `POST /api/blockchain/mint`

| | |
|---|---|
| **Roles** | `admin`, `auditor` |
| **Requires** | `wallet_verified == true` |

**Request body**

```json
{
  "recipient_wallet": "0x...",
  "amount": 100,
  "project_id": "uuid-string"
}
```

**Response** `200`

```json
{
  "tx_hash": "0x...",
  "block_number": 1,
  "status": 1
}
```

### `POST /api/blockchain/retire`

| | |
|---|---|
| **Requires** | Verified wallet |

**Request body**

```json
{
  "amount": 10,
  "reason": "Corporate offset 2026"
}
```

**Caveat:** Transaction is signed by server deployer wallet, not the user's wallet. See architecture notes.

### `POST /api/blockchain/transfer`

**Request body**

```json
{
  "recipient_wallet": "0x...",
  "amount": 50
}
```

### `GET /api/blockchain/balance`

Uses `current_user.wallet_address` for `balanceOf` query.

**Response** `200`

```json
{
  "wallet_address": "0x...",
  "balance": 1000,
  "token_symbol": "CMRV"
}
```

### `GET /api/blockchain/supply`

| | |
|---|---|
| **Auth** | None (public) |

**Response** `200`

```json
{
  "total_supply": 5000,
  "token_symbol": "CMRV"
}
```

---

### Certificates API (`/api/certificates`)

Certificates are derived from **retired** projects owned by the current user. IDs are generated per request (not persisted to `certificates` table).

### `GET /api/certificates/`

**Response** `200` — array of certificate summaries.

### `GET /api/certificates/{project_id}`

**Precondition:** Project `status == "retired"` and owned by user.

### `GET /api/certificates/{project_id}/download`

**Response:** PDF file (`application/pdf`) generated by ReportLab.

---

### Marketplace API (`/api/marketplace`)

### `GET /api/marketplace/`

| | |
|---|---|
| **Auth** | **None** (public) |

**Filters:** `audit_status=approved`, `tokenized=true`, `status` in `marketplace` or `active`.

**Response** `200` — array:

```json
[
  {
    "id": "uuid",
    "project_name": "string",
    "project_type": "farmer",
    "country": "IN",
    "location": "string",
    "estimated_credits": 1000,
    "price_per_credit": 25,
    "tokenized": true,
    "description": "string"
  }
]
```

**Note:** `price_per_credit` is hardcoded to `25` (not from database).

---

### Purchases API (`/api/purchases`)

### `POST /api/purchases/{project_id}?amount={float}`

| | |
|---|---|
| **Auth** | Bearer JWT |
| **Query** | `amount` — credits to purchase |

**Preconditions:**

- Project `tokenized=true`, `status=marketplace`
- Sufficient `total_credits_generated`
- User has `wallet_address` set

**Behavior:** Decrements `project.total_credits_generated` only. Does **not** create `purchases` row or on-chain transfer.

**Response** `200`

```json
{
  "message": "Carbon credits purchased successfully.",
  "project_id": "uuid",
  "buyer_wallet": "0x...",
  "credits_purchased": 10.0,
  "remaining_credits": 990.0,
  "status": "success"
}
```

### Missing endpoint

`purchaseService.getPurchaseHistory()` in the frontend calls a history endpoint that **does not exist** on the backend.

---

### Frontend Service Mapping

| Service module | Backend prefix |
|----------------|----------------|
| `authService.ts` | `/api/auth` |
| `walletService.ts` | `/api/wallet` |
| `blockchainService.ts` | `/api/blockchain` |
| `projectService.ts` | `/api/projects` |
| `marketplaceService.ts` | `/api/marketplace` |
| `certificateService.ts` | `/api/certificates` |
| `purchaseService.ts` | `/api/purchases` |

**API base URL:** `NEXT_PUBLIC_API_URL` (default `http://127.0.0.1:8000`).

---

# Part V — Operations

## 7. Core Functional Modules

### 7.1 Backend Modules

#### `app/core/config.py`

Loads all settings from `backend/.env` via Pydantic `BaseSettings`. Cached with `@lru_cache`.

#### `app/core/security.py`

| Function | Purpose |
|----------|---------|
| `hash_password` | bcrypt hash (password truncated to 72 chars) |
| `verify_password` | bcrypt verify |
| `create_access_token` | JWT with `exp` claim |
| `verify_access_token` | JWT decode; returns `None` on failure |

#### `app/core/dependencies.py`

| Dependency | Purpose |
|------------|---------|
| `get_current_user` | Validates Bearer token, loads `User` from DB |
| `require_role(roles)` | Factory for role-gated endpoints |

#### `app/api/*` — HTTP handlers

| Module | Responsibility |
|--------|----------------|
| `auth.py` | Register, login, profile |
| `admin.py` | Dashboard stats, user list |
| `auditor.py` | Pending projects, simple approve/reject |
| `projects.py` | CRUD-ish, satellite verify, full approve with mint |
| `wallet.py` | Connect, nonce, EIP-191 verify |
| `blockchain.py` | Mint, retire, transfer, balance, supply |
| `certificates.py` | List, detail, PDF download |
| `marketplace.py` | Public listings |
| `purchases.py` | Credit purchase (inventory only) |

#### `app/services/blockchain_service.py`

- Connects to RPC at import time (**fails fast** if env missing)
- Loads ABI from `../blockchain/artifacts/.../CarbonCreditToken.json`
- Signs all transactions with `PRIVATE_KEY`

#### `app/services/real_satellite_service.py`

Simulated GIS verification; updates project analytics fields.

#### `app/services/certificate_generator.py`

Generates PDF certificates via ReportLab into `./certificates/`.

#### `app/db/init_db.py` + seed scripts

On startup (`main.py`):

```50:54:backend/app/main.py
@app.on_event("startup")
def startup():
    init_db()
    create_default_admin()
    create_default_auditor()
```

### 7.2 Frontend Modules

#### `services/authService.ts`

Token lifecycle in `localStorage` key `access_token`; `getCurrentUser()` calls `/api/auth/me`.

#### `services/projectService.ts`

Project list, detail, satellite-verify, approve, reject, delete.

#### `services/blockchainService.ts`

Mint, retire, transfer, balance, supply — all via backend proxy.

#### `hooks/useAuthGuard.ts`

Client-side redirect if unauthenticated or wrong role. **Only used on farmer dashboard.**

#### `components/providers/WalletProvider.tsx`

RainbowKit on Polygon + Mumbai testnet; SSR disabled.

### 7.3 Blockchain Module

#### `CarbonCreditToken.sol`

ERC-20 token **"Carbon MRV Credit" (CMRV)** with:

- `mintCredits(recipient, amount, projectId)` — minter-gated
- `retireCredits(amount, reason)` — burns from caller
- `getRetirementHistory(account)` — audit trail

#### `scripts/deploy.ts`

Deploys to `http://127.0.0.1:8545` with first account as `initialOwner`.

### 7.4 Module Dependency Graph

```mermaid
flowchart TD
    main[main.py] --> api[api routers]
    api --> deps[dependencies]
    api --> models[models]
    api --> svc[services]
    deps --> security[security]
    deps --> config[config]
    svc --> blockchain_svc[blockchain_service]
    svc --> satellite[real_satellite_service]
    svc --> pdf[certificate_generator]
    blockchain_svc --> artifacts[Hardhat ABI]
    models --> session[db/session]
```

---

## 8. Deployment Documentation

### 8.1 Local Setup Steps

#### Prerequisites

- Node.js 18+ and npm
- Python 3.10+
- PostgreSQL 14+
- Git

#### 1. Database

```bash
createdb carbon_mrv
# Set DATABASE_URL in backend/.env
# Example: postgresql://user:password@localhost:5432/carbon_mrv
```

#### 2. Backend

```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt

# Configure backend/.env (see §8.2)
alembic upgrade head

uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

#### 3. Blockchain (local)

```bash
cd blockchain
npm install
npx hardhat compile
npx hardhat node          # Terminal 1 — keeps running
npx hardhat run scripts/deploy.ts --network localhost  # Terminal 2
# Copy deployed address to backend/.env → CARBON_TOKEN_CONTRACT_ADDRESS
```

#### 4. Frontend

```bash
cd frontend
npm install

# Optional: create frontend/.env.local
# NEXT_PUBLIC_API_URL=http://127.0.0.1:8000

npm run dev
# Open http://localhost:3000
```

### 8.2 Environment Variables

**No `.env.example` is committed.** Required variables from `backend/app/core/config.py`:

| Variable | Required | Description |
|----------|----------|-------------|
| `APP_NAME` | Yes | Application display name |
| `APP_ENV` | Yes | e.g. `development`, `production` |
| `DEBUG` | Yes | `true` / `false` |
| `SECRET_KEY` | Yes | JWT signing secret |
| `ALGORITHM` | Yes | e.g. `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Yes | JWT TTL |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_KEY` | Yes | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Service role key |
| `RAZORPAY_KEY_ID` | Yes | Payment gateway |
| `RAZORPAY_KEY_SECRET` | Yes | Payment gateway |
| `RAZORPAY_WEBHOOK_SECRET` | Yes | Webhook verification |
| `CRYPTO_ENABLED` | Yes | Legacy flag |
| `POLYGON_RPC_URL` | Yes | Legacy Polygon RPC |
| `USDT_CONTRACT_ADDRESS` | Yes | Legacy |
| `USDC_CONTRACT_ADDRESS` | Yes | Legacy |
| `MASTER_WALLET_PRIVATE_KEY` | Yes | Legacy |
| `MASTER_WALLET_ADDRESS` | Yes | Legacy |
| `MIN_CONFIRMATIONS` | Yes | Legacy |
| `BLOCKCHAIN_RPC_URL` | For chain ops | e.g. `http://127.0.0.1:8545` |
| `CARBON_TOKEN_CONTRACT_ADDRESS` | For chain ops | Deployed CMRV address |
| `PRIVATE_KEY` | For chain ops | Deployer/minter private key |
| `MODEL_PATH` | Yes | ML model path (unused) |
| `CERTIFICATE_STORAGE_PATH` | Yes | PDF storage (unused; uses `./certificates/`) |
| `DEFAULT_ADMIN_EMAIL` | Yes | Bootstrap admin |
| `DEFAULT_ADMIN_PASSWORD` | Yes | Bootstrap admin password |
| `DEFAULT_AUDITOR_EMAIL` | Yes | Bootstrap auditor |
| `DEFAULT_AUDITOR_PASSWORD` | Yes | Bootstrap auditor password |
| `SMTP_HOST` | No | Email |
| `SMTP_PORT` | No | Email |
| `SMTP_USER` | No | Email |
| `SMTP_PASS` | No | Email |

**Frontend:**

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://127.0.0.1:8000` | Backend base URL |

### 8.3 Build Process

| Package | Command | Output |
|---------|---------|--------|
| Frontend | `npm run build` | `.next/` production build |
| Frontend | `npm start` | Serve production build |
| Backend | — | Run Uvicorn directly (no build step) |
| Blockchain | `npx hardhat compile` | `artifacts/`, `cache/` |

### 8.4 Production Hosting (recommended)

| Tier | Suggested platform |
|------|-------------------|
| Frontend | Vercel, AWS Amplify, or static CDN + Node |
| Backend | AWS ECS, Railway, Fly.io, or VM + systemd |
| Database | Managed PostgreSQL (RDS, Supabase DB, Neon) |
| Blockchain | Polygon mainnet/testnet via Alchemy/Infura RPC |

### 8.5 CI/CD

**Not present.** Recommended pipeline:

1. Lint (ESLint, Ruff)
2. Test (pytest, Hardhat tests)
3. Build frontend
4. Run Alembic migrations
5. Deploy backend + frontend artifacts

---

## 9. Security Overview

### 9.1 Authentication

- Passwords hashed with **bcrypt** (72-character truncation).
- **JWT** stored in `localStorage` on frontend (XSS exposure risk — consider `httpOnly` cookies for production).
- Registration restricted to non-privileged roles.

### 9.2 Authorization

- Role checks on sensitive routes (`admin`, `auditor`).
- **Gap:** Many frontend dashboard routes lack `useAuthGuard`.
- **Gap:** `GET /api/projects/` returns all projects to any authenticated user.

### 9.3 Sensitive Data Handling

| Data | Handling |
|------|----------|
| Passwords | bcrypt hash only |
| `PRIVATE_KEY` | Server `.env`; signs all chain txs |
| JWT `SECRET_KEY` | Server `.env` |
| User PII | Stored in PostgreSQL (email, phone, country) |

### 9.4 API Protection

| Control | Status |
|---------|--------|
| HTTPS | Deployment responsibility |
| CORS | `allow_origins=["*"]` — **insecure for production** |
| Rate limiting | **None** |
| Input validation | Pydantic on register/wallet; partial elsewhere |
| SQL injection | ORM parameterized queries |

### 9.5 Secrets Management

- `.env` files gitignored.
- **Risk:** `alembic.ini` may contain hardcoded DB credentials — use env-based URL in production.
- **Risk:** WalletConnect `projectId` hardcoded in `WalletProvider.tsx`.
- **Risk:** Default admin/auditor passwords in `.env` if not rotated after first deploy.

### 9.6 Vulnerability Observations

| Issue | Severity | Notes |
|-------|----------|-------|
| Custodial `PRIVATE_KEY` on server | High | Single key compromise = full mint control |
| Retire/transfer signed as deployer | High | Does not match user wallet semantics |
| CORS wildcard | Medium | CSRF less relevant for Bearer tokens, but browser policy weak |
| No rate limiting | Medium | Brute-force login possible |
| JWT in localStorage | Medium | XSS can steal tokens |
| Missing project create authorization | Medium | Once API added, must scope by owner |
| `create_all()` + Alembic dual schema | Low | Drift risk |
| Bloated requirements.txt | Low | Larger attack surface for supply-chain issues |

---

## 10. Improvements Section

### 10.1 Missing Documentation (addressed by this pass)

- Root `README.md` was essentially empty.
- No `.env.example` for onboarding.
- No API/architecture docs (now in `docs/`).

### 10.2 Code Quality Issues

| Issue | Location |
|-------|----------|
| Duplicate approval workflows | `auditor.py` vs `projects.py` |
| Unused ORM tables | `purchases`, `payments`, `escrow` |
| Unused npm/pip dependencies | frontend `axios`, `zustand`; backend ML stack |
| `LoginRequest` schema unused | `schemas/auth.py` |
| `require_role` imported but inconsistent | Some routes use inline checks |
| Frontend `purchaseService.getPurchaseHistory` | No backend endpoint |
| NGO login redirect missing | `auth/login/page.tsx` |
| Sidebar links are `#` placeholders | `DashboardSidebar.tsx` |

### 10.3 Scalability Concerns

- Unpaginated `GET /api/projects/` and `/api/admin/users`
- Synchronous blockchain `wait_for_transaction_receipt` blocks request thread
- Single deployer wallet bottleneck
- No caching layer for marketplace listings
- Heavy Python environment from unrelated packages

### 10.4 Recommended Optimizations

1. Add `POST /api/projects` with owner-scoped authorization.
2. Persist purchases to `purchases` table; integrate on-chain `transfer` on buy.
3. Replace simulated satellite service with Earth Engine or pre-computed rasters.
4. Split `requirements.txt` into `requirements-base.txt` + `requirements-ml.txt`.
5. Add Next.js middleware for JWT validation on `/dashboard/*`.
6. Commit `backend/.env.example` without secrets.
7. Add Hardhat tests for `CarbonCreditToken` and pytest for API routes.
8. Use user-signed transactions or meta-transactions for retire/transfer.
9. Call `approveMinter()` for a dedicated backend minter address.
10. Remove `init_db()` `create_all()` in production; rely on Alembic only.

### 10.5 Refactoring Suggestions

- Extract repository layer from route handlers.
- Unify `roleRedirect.ts` with login page routing.
- Centralize `fetch` wrapper with auth + error handling.
- Move blockchain env validation to FastAPI startup event (not import time).
- Add SQLAlchemy `relationship()` for readable joins.

---

## 11. Visual Documentation

### 11.1 System Component Map

```mermaid
C4Context
    title Carbon MRV Platform - System Context

    Person(farmer, "Farmer/NGO", "Registers projects")
    Person(company, "Company", "Buys credits")
    Person(auditor, "Auditor", "Verifies projects")
    Person(admin, "Admin", "Manages platform")

    System(platform, "Carbon MRV Platform", "Web app + API + token")

    System_Ext(chain, "EVM Blockchain", "CMRV ERC-20")
    System_Ext(db, "PostgreSQL", "Application data")

    Rel(farmer, platform, "Uses")
    Rel(company, platform, "Uses")
    Rel(auditor, platform, "Uses")
    Rel(admin, platform, "Uses")
    Rel(platform, db, "Reads/Writes")
    Rel(platform, chain, "Mints/Queries")
```

### 11.2 Role-Based Dashboard Map

| Role | Dashboard URL | Key pages |
|------|---------------|-----------|
| Farmer | `/dashboard/farmer` | projects |
| NGO | `/dashboard/ngo` | overview (static) |
| Company | `/dashboard/company` | wallet, certificates |
| Auditor | `/dashboard/auditor` | projects, audits |
| Admin | `/dashboard/admin` | users, projects, mint, escrow, pricing |

### 11.3 Token Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Unminted: Project approved
    Unminted --> Minted: mintCredits()
    Minted --> Listed: marketplace status
    Listed --> Sold: purchase API
    Sold --> Retired: retireCredits()
    Retired --> Certified: PDF certificate
```

Additional diagrams: [ARCHITECTURE.md](./ARCHITECTURE.md), [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)

---

## 12. README Enhancement

The root `README.md` currently contains only the project title. Recommended structure:

### Suggested README outline

```markdown
# Carbon MRV Platform

Measuring, reporting, and verifying carbon credits with blockchain tokenization.

## Features
- Multi-role dashboards (farmer, NGO, company, auditor, admin)
- Satellite/GIS verification pipeline (MVP simulated)
- ERC-20 carbon credits (CMRV) on EVM
- Marketplace and PDF retirement certificates

## Architecture
Monorepo: Next.js frontend + FastAPI backend + Hardhat smart contracts.

See [docs/PROJECT_DOCUMENTATION.md](docs/PROJECT_DOCUMENTATION.md) for full technical docs.

## Quick Start
### Prerequisites
PostgreSQL, Node 18+, Python 3.10+

### 1. Clone and configure
cp backend/.env.example backend/.env   # (to be added)
# Edit DATABASE_URL, SECRET_KEY, blockchain vars

### 2. Start database migrations
cd backend && alembic upgrade head

### 3. Start blockchain (local)
cd blockchain && npx hardhat node
npx hardhat run scripts/deploy.ts --network localhost

### 4. Start API
uvicorn app.main:app --reload

### 5. Start frontend
cd frontend && npm run dev

## Default accounts
Admin and auditor are seeded from DEFAULT_* env vars on first startup.

## Documentation
| Doc | Description |
|-----|-------------|
| docs/PROJECT_DOCUMENTATION.md | Full platform guide |
| docs/API_REFERENCE.md | REST API |
| docs/ARCHITECTURE.md | Flows and diagrams |
| docs/DATABASE_SCHEMA.md | PostgreSQL schema |

## License
TBD
```

### Missing setup instructions (to add to README)

1. PostgreSQL database creation command
2. Copy `.env.example` → `.env` (file should be created)
3. Hardhat compile before starting backend (ABI required)
4. `NEXT_PUBLIC_API_URL` for frontend
5. Default login credentials reference (admin/auditor emails from env)
6. Known MVP limitations (simulated satellite, no project POST)

### Better onboarding process

1. **Day 1:** Read this doc §1–3, run local stack, log in as admin.
2. **Day 2:** Review [ARCHITECTURE.md](./ARCHITECTURE.md) and approve/mint flow.
3. **Day 3:** Review [API_REFERENCE.md](./API_REFERENCE.md) and extend missing endpoints.
4. **Day 4:** Review [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) and wire `purchases` table.

---

## Appendix A: Frontend Route Catalog

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/auth/login`, `/auth/register` | Authentication |
| `/marketplace` | Public credit marketplace |
| `/wallet` | MetaMask verification |
| `/calculator` | Client-side credit estimator |
| `/dashboard/farmer` | Farmer overview (auth guard) |
| `/dashboard/farmer/projects` | Farmer projects |
| `/dashboard/ngo` | NGO overview |
| `/dashboard/company` | Company overview |
| `/dashboard/company/wallet` | Blockchain wallet ops |
| `/dashboard/company/certificates` | Company certificates |
| `/dashboard/auditor` | Auditor overview |
| `/dashboard/auditor/projects` | Audit queue |
| `/dashboard/auditor/audits` | Audit history |
| `/dashboard/admin` | Admin overview |
| `/dashboard/admin/users` | User management |
| `/dashboard/admin/projects` | Project management |
| `/dashboard/admin/mint` | Manual mint UI |
| `/dashboard/admin/escrow` | Escrow UI (placeholder) |
| `/dashboard/admin/pricing` | Pricing UI (placeholder) |
| `/dashboard/admin/marketplace` | Admin marketplace view |
| `/dashboard/purchases` | Purchase history UI |
| `/dashboard/certificates` | User certificates |
| `/dashboard/portfolio` | Token balance/supply |
| `/dashboard/analytics` | Aggregated stats |
| `/dashboard/transactions` | Mock transaction list |
| `/about`, `/blog`, `/contact`, `/compliance` | Marketing |
| `/terms`, `/privacy-policy` | Legal |

---

## Appendix B: Startup Sequence

```mermaid
sequenceDiagram
    participant U as Uvicorn
    participant M as main.py
    participant DB as init_db
    participant A as create_admin
    participant AU as create_auditor

    U->>M: Import app
  Note over M: blockchain_service may raise if env missing
    U->>M: startup event
    M->>DB: create_all tables
    M->>A: seed admin if missing
    M->>AU: seed auditor if missing
    M-->>U: Ready to serve
```

---

## Appendix C: Glossary

| Term | Definition |
|------|------------|
| **MRV** | Measure, Report, Verify — carbon accounting framework |
| **CMRV** | Carbon MRV Credit — ERC-20 token symbol |
| **NDVI** | Normalized Difference Vegetation Index — vegetation health proxy |
| **Retirement** | Permanent removal of credits from circulation (burn) |
| **Tokenization** | On-chain mint linking project to CMRV supply |

---

*This documentation was generated from source code analysis. No application code was modified during its creation.*

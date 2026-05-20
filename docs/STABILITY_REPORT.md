# Carbon MRV Platform — Stability Report (May 2026)

## Executive summary

The platform backend boots cleanly, Alembic is at head (`f5bab4071718`), and the Next.js frontend **production build succeeds** (`npm run build -- --webpack`). Critical auth, API alignment, and routing fixes were applied without changing architecture or UI design.

---

## Backend

| Area | Status | Notes |
|------|--------|-------|
| App import / startup | **OK** | All routers mounted in `app/main.py` |
| Alembic | **OK** | Model imports match existing ORM files |
| JWT auth | **OK** | Register, login, `/me` |
| Password hashing | **Fixed** | Replaced passlib+bcrypt 4.2 (Python 3.13 breakage) with direct `bcrypt` |
| Razorpay | **OK** | Mock mode for placeholder keys |
| Purchases | **OK** | Create-order, verify-payment, history; wallet balance updated on verify |
| Marketplace | **OK** | Public listing at `GET /api/marketplace/` |
| Wallet | **OK** | Balance, credits, transactions |
| Blockchain | **OK** | Simulated mode when Hardhat placeholder contract configured |
| Auditor | **OK** | Pending queue; approval sets `status=marketplace` |
| Admin | **OK** | Dashboard metrics, users, fraud reports |
| Certificates | **OK** | List, project metadata, PDF download |
| Celery / Redis | **OK** | Eager mode when `REDIS_URL` empty |

### Smoke tests

```bash
cd backend
python -m pytest tests/test_smoke.py -v
```

Covers: health, auth register/login/me, marketplace, protected routes, admin/auditor defaults, wallet auth, blockchain supply.

---

## Frontend

| Area | Status | Notes |
|------|--------|-------|
| Production build | **OK** | Use `npm run build -- --webpack` (Next 16 + custom webpack) |
| API client | **OK** | Bearer token interceptor in `lib/api.ts` |
| Auth redirects | **Fixed** | Login/register use `getDashboardRoute`; NGO/NCO → NGO dashboard |
| Dashboard index | **Added** | `/dashboard` redirects by role |
| Marketplace (dashboard) | **Fixed** | Uses `fetchMarketplaceProjects()` |
| Company wallet | **Fixed** | Uses wallet service APIs |
| Certificate service | **Fixed** | Aligned with `GET /api/certificates/` and download routes |
| Missing routes | **Fixed** | `/dashboard/admin/manage` → projects; `/dashboard/ngo/projects` → projects |
| Admin overview | **Fixed** | Live metrics from `/api/admin/dashboard` |
| NCO sidebar | **Added** | Same navigation as NGO |

### Remaining (non-blocking for demo)

- Some admin/auditor sub-pages still use static placeholders (users, pricing, escrow shells).
- MetaMask SDK warns about `@react-native-async-storage` during webpack build (warnings only).
- Wallet signature verification is address-only on backend (documented for production hardening).

---

## Local development

```bash
# Backend
cd backend
.\.venv\Scripts\uvicorn.exe app.main:app --reload --host 127.0.0.1 --port 8000

# Frontend
cd frontend
npm run dev
```

Ensure `backend/.env` has `DATABASE_URL`, `DEBUG=True`, `FRONTEND_URL=http://localhost:3000`, and `frontend/.env.local` has `NEXT_PUBLIC_API_URL=http://127.0.0.1:8000`.

Default accounts (auto-seeded on startup):

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@carbonmrv.com | StrongAdminPassword123 |
| Auditor | auditor@carbonmrv.com | StrongAuditorPassword123 |

---

## Deployment

- **Render / Docker**: `backend/Dockerfile`, `docker-compose.yml`, `start.sh` with `alembic upgrade head`
- **Vercel**: Set `NEXT_PUBLIC_API_URL` at build time; `output: 'standalone'` enabled
- **CORS**: `FRONTEND_URL` + localhost when `DEBUG=True`
- **Production**: Set real `RAZORPAY_*`, `REDIS_URL`, blockchain contract + RPC; run Celery worker

---

## Files changed in this stabilization pass

- `backend/app/core/security.py` — bcrypt direct (auth stability)
- `backend/tests/test_smoke.py` — endpoint smoke tests
- `backend/requirements.txt` — pytest, httpx
- `frontend/services/certificateService.ts` — API alignment
- `frontend/lib/roleRedirect.ts` — NCO + safer default
- `frontend/app/auth/login/page.tsx`, `register/page.tsx` — redirects
- `frontend/app/dashboard/page.tsx` — role router
- `frontend/app/dashboard/marketplace/page.tsx` — marketplace API
- `frontend/app/dashboard/company/wallet/page.tsx` — wallet API
- `frontend/app/dashboard/admin/page.tsx` — live admin metrics
- `frontend/app/dashboard/admin/manage/page.tsx`, `ngo/projects/page.tsx` — redirects
- `frontend/next.config.ts` — `turbopack: {}` for Next 16
- `frontend/components/dashboard/DashboardSidebar.tsx` — NCO menu

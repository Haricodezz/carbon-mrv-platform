# Local Development Setup

Step-by-step guide to run the Carbon MRV Platform locally.

## Prerequisites

- **Python 3.11+** (backend)
- **Node.js 18+** and **npm** (frontend)
- **Git**

> **Note:** Redis and PostgreSQL are NOT required locally. The backend uses the remote Supabase PostgreSQL database and runs Celery tasks synchronously in eager mode.

---

## 1. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Environment configuration
# The .env file is already configured for local development.
# If starting fresh, copy the template:
# cp .env.example .env

# Run database migrations
alembic upgrade head

# Optional: train biomass ML model (improves satellite verification)
python ml/train_model.py

# Start the backend server
uvicorn app.main:app --reload

The backend will be available at **http://127.0.0.1:8000**

- **Swagger UI:** http://127.0.0.1:8000/docs
- **Health Check:** http://127.0.0.1:8000/health

### Default Accounts (auto-created on first startup)

| Role    | Email                  | Password               |
|---------|------------------------|-------------------------|
| Admin   | admin@carbonmrv.com    | StrongAdminPassword123  |
| Auditor | auditor@carbonmrv.com  | StrongAuditorPassword123|

---

## 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Environment configuration
cp .env.example .env.local   # or ensure NEXT_PUBLIC_API_URL is set

# Start the dev server
npm run dev

The frontend will be available at **http://localhost:3000**

---

## 3. Blockchain (Optional)

Only needed if you want to test smart contracts locally:

```bash
cd blockchain
npm install
npx hardhat node                                    # Start local blockchain
npx hardhat run scripts/deploy.ts --network localhost  # Deploy contracts
```

Then update `backend/.env` with the deployed contract address and local RPC URL.

---

## Architecture Notes

### Services Running in Mock/Simulated Mode

| Service            | Local Behavior                              |
|--------------------|---------------------------------------------|
| **Redis/Celery**   | Tasks run synchronously (eager mode)        |
| **Blockchain**     | Returns simulated receipts with hash        |
| **Razorpay**       | Auto-approves payments in mock mode         |
| **Satellite/AI**   | Falls back to model-based estimates         |

### Key Environment Variables

| Variable        | Purpose                                      |
|-----------------|----------------------------------------------|
| `DEBUG`         | Enables Swagger, CORS for localhost, verbose logs |
| `APP_ENV`       | `development` or `production`                |
| `DATABASE_URL`  | PostgreSQL connection string                 |
| `REDIS_URL`     | Leave empty for local dev (eager Celery)     |
| `FRONTEND_URL`  | CORS allowlist entry                         |

---

## Troubleshooting

### Backend won't start
- Check Python version: `python --version` (need 3.11+)
- Ensure `.env` exists in `backend/` directory
- Check database connectivity: the Supabase URL must be reachable

### Frontend build errors
- Delete `node_modules` and `npm install` again
- Ensure `.env.local` exists in `frontend/` directory
- Check Node version: `node --version` (need 18+)

### CORS errors in browser
- Ensure backend is running on port 8000
- Ensure `FRONTEND_URL=http://localhost:3000` in backend `.env`
- Ensure `DEBUG=True` in backend `.env`

### Marketplace purchase fails
- Log in as a **company** user (only companies can purchase)
- Ensure Razorpay keys are placeholders (mock mode) or real test keys
- See [docs/LOCAL_DEV_AUDIT.md](docs/LOCAL_DEV_AUDIT.md) for recent integration fixes

### Full audit / fix log
See [docs/LOCAL_DEV_AUDIT.md](docs/LOCAL_DEV_AUDIT.md)

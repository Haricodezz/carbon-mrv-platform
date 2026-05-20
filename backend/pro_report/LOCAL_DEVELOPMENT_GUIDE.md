# Local Development Guide: Carbon MRV Platform

Follow these steps to set up and run the entire ecosystem locally on your development machine.

---

## 1. Backend Setup & Run

### 1.1 Python Virtual Environment
Navigate to the `backend/` directory, create a virtual environment, and install dependencies:
```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

### 1.2 Database Provisioning (Alembic Migrations)
Configure your `.env` connection strings, then apply database migrations:
```powershell
alembic upgrade head
```

### 1.3 Running Celery & Redis
1. Start a local Redis server instance (usually listening on `redis://127.0.0.1:6379`).
2. Start the Celery worker process inside your active virtual environment:
   ```powershell
   celery -A celery_worker.celery worker --loglevel=info
   ```

### 1.4 Launching the Uvicorn Gateway
Start the FastAPI server:
```powershell
uvicorn app.main:app --reload --port 8000
```
API docs will be available at `http://127.0.0.1:8000/docs`.

---

## 2. Local Blockchain Node Setup (Hardhat)

1. Navigate to the `blockchain/` directory and install npm packages:
   ```bash
   cd blockchain
   npm install
   ```
2. Start the local Hardhat EVM node:
   ```bash
   npx hardhat node
   ```
   This will spin up a local network at `http://127.0.0.1:8545` and list 20 pre-funded test accounts.
3. Deploy the token contract to the local node:
   ```bash
   npx hardhat run scripts/deploy.js --network localhost
   ```
4. Update the `CARBON_TOKEN_CONTRACT_ADDRESS` in `backend/.env` with the output address.

---

## 3. Frontend Setup & Run

1. Navigate to the `frontend/` directory and install npm packages:
   ```bash
   cd frontend
   npm install
   ```
2. Run the Next.js development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your web browser.

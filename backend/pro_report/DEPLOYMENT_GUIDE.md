# Deployment Guide: Carbon MRV Platform

This playbook provides exact deployment steps for the frontend, backend database, storage, and smart contracts.

---

## 1. Database & Storage Deployment (Supabase)

### 1.1 Supabase PostgreSQL
1. Create a new project in the [Supabase Dashboard](https://supabase.com).
2. Go to **Project Settings -> Database** and copy the **Connection String** (transaction mode or session mode).
3. Update the `DATABASE_URL` env variable on the backend to point to this connection string.
4. Run migrations using Alembic from the backend directory:
   ```bash
   pip install -r requirements.txt
   alembic upgrade head
   ```

### 1.2 Supabase Storage Configuration
1. Go to **Storage** in the Supabase Sidebar.
2. Create the following buckets:
   - `kyc-documents` (Set to **Private**)
   - `land-documents` (Set to **Private**)
   - `certificates` (Set to **Public**)
   - `reports` (Set to **Public**)
   - `project-media` (Set to **Public**)
3. Set the CORS policies on the buckets to allow read/write operations from your domain:
   ```json
   [
     {
       "allowedOrigins": ["*"],
       "allowedHeaders": ["*"],
       "allowedMethods": ["GET", "POST", "PUT", "DELETE"],
       "maxAgeSeconds": 3600
     }
   ]
   ```

---

## 2. Smart Contract Deployment (Polygon Amoy Testnet)

1. Set up a deployer wallet and fund it with Amoy Testnet MATIC (use the faucet at `https://faucet.polygon.technology/`).
2. Update the `hardhat.config.js` with network settings:
   ```javascript
   require("@nomicfoundation/hardhat-toolbox");
   module.exports = {
     solidity: "0.8.24",
     networks: {
       amoy: {
         url: process.env.POLYGON_RPC_URL || "https://rpc-amoy.polygon.technology",
         accounts: [process.env.PRIVATE_KEY]
       }
     }
   };
   ```
3. Run the deployment script from the `blockchain/` folder:
   ```bash
   npx hardhat run scripts/deploy.js --network amoy
   ```
4. Copy the deployed contract address and set it as `CARBON_TOKEN_CONTRACT_ADDRESS` on the backend.

---

## 3. Backend Deployment (Render)

### 3.1 Setup Render Web Service
1. Link your GitHub repository to Render.
2. Create a new **Web Service** with the following parameters:
   - **Environment**: `Python`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port 8000`
   - **Plan**: Starter or higher (minimum 1GB RAM recommended due to Rasterio spatial operations).
3. Set the environment variables in the Render console (see `ENVIRONMENT_VARIABLES_REFERENCE.md`).

### 3.2 Setup Render Celery Worker
1. Create a new **Background Worker** on Render.
2. Use the same build command and repository.
3. **Start Command**: `celery -A celery_worker.celery worker --loglevel=info`

---

## 4. Frontend Deployment (Vercel)

1. Import your repository into the [Vercel Dashboard](https://vercel.com).
2. Set the framework preset to **Next.js**.
3. Configure the env variables:
   - `NEXT_PUBLIC_API_URL`: Set to your Render Web Service URL (e.g. `https://carbon-mrv-backend.onrender.com`).
4. Click **Deploy**.

---

## 5. Rollback Procedures

### 5.1 Database Rollback
If a database migration causes errors, roll back to the previous migration immediately using Alembic:
```bash
alembic downgrade -1
```

### 5.2 Frontend/Backend Rollback
- **Vercel**: Select the previous deployment and click **Redeploy -> Promote to Production**.
- **Render**: Click **Deploy -> Rollback to previous deploy** inside the Web Service panel.

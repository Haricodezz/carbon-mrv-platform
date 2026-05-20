# Environment Variables Reference: Carbon MRV Platform

## 1. Backend Environment Variables (`backend/.env`)

These environment variables configure the FastAPI server, database connections, Supabase storage, blockchain nodes, and model directories.

| Variable Name | Type | Description | Production Example |
| :--- | :--- | :--- | :--- |
| **DATABASE_URL** | String | PostgreSQL database connection string. | `postgresql://postgres:pw@db.supabase.co:5432/postgres` |
| **SECRET_KEY** | String | JWT signing secret key. | `supersecretrandomstringgeneratorhere` |
| **ALGORITHM** | String | Hash algorithm for JWT generation. | `HS256` |
| **ACCESS_TOKEN_EXPIRE_MINUTES** | Integer| JWT expiration duration. | `60` |
| **REDIS_URL** | String | Redis message broker URL for Celery. | `redis://default:pw@redis.render.com:6379` |
| **SUPABASE_URL** | String | Base URL of the Supabase project. | `https://yourproject.supabase.co` |
| **SUPABASE_KEY** | String | Service role key (service_role) for storage access.| `your-supabase-service-role-key` |
| **ENABLE_BLOCKCHAIN** | Boolean| Enables or disables blockchain execution. | `True` |
| **BLOCKCHAIN_RPC_URL** | String | JSON-RPC provider endpoint. | `https://rpc-amoy.polygon.technology` |
| **PRIVATE_KEY** | String | Master treasury private key for gas and minting. | `0x59c6995e998f97a5a0044966f0945389d4f840b2a230b912c42041cc22ba040b` |
| **CARBON_TOKEN_CONTRACT_ADDRESS**| String | Address of deployed `CarbonCreditToken.sol`.| `0x7a2083057e937d2f9547d2f5e3e23055ff0226c1` |
| **FRONTEND_URL** | String | Allowed CORS origin (comma-separated if multiple).| `https://carbonmrv-frontend.vercel.app` |

---

## 2. Frontend Environment Variables (`frontend/.env`)

These environment variables configure the Next.js frontend to target the correct backend API.

| Variable Name | Type | Description | Production Example |
| :--- | :--- | :--- | :--- |
| **NEXT_PUBLIC_API_URL** | String | Base HTTP URL of the FastAPI gateway. | `https://carbon-mrv-backend.onrender.com` |
| **NEXT_PUBLIC_WS_URL** | String | Base WebSockets URL of the FastAPI gateway. | `wss://carbon-mrv-backend.onrender.com/ws` |

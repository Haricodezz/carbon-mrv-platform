# Production Migration Guide: Carbon MRV Platform

This guide outlines the operational steps required to migrate the platform from development/staging environments to a production-grade infrastructure.

---

## 1. Database Migration & Provisioning
- **Action**: Do not use local database instances. Provision an enterprise database instance using Supabase or AWS RDS (PostgreSQL).
- **Execution**:
  1. Set the production database URL in your environment settings (`DATABASE_URL`).
  2. Run the migration script to apply the schema:
     ```bash
     alembic upgrade head
     ```
  3. Verify table indexes and check connection pool limits (set `pool_size=20` and `max_overflow=10` in `backend/app/db/session.py` to handle concurrent traffic).

---

## 2. On-Chain Smart Contract Verification
- **Action**: Deploy `CarbonCreditToken.sol` to a production Ethereum Layer-2 network (such as Polygon PoS Mainnet or Arbitrum One).
- **Steps**:
  1. Compile and deploy using Hardhat:
     ```bash
     npx hardhat run scripts/deploy.js --network polygon
     ```
  2. Verify the contract source code on Etherscan/Polygonscan to make it publicly readable:
     ```bash
     npx hardhat verify --network polygon <DEPLOYED_CONTRACT_ADDRESS> <INITIAL_OWNER_ADDRESS>
     ```
  3. Transfer ownership of the contract to a multi-signature wallet (e.g. Safe multisig) rather than a single administrator key.

---

## 3. Storage Bucket Lockdown Policies
- **Action**: Restrict CORS and API keys on Supabase Storage.
- **Policies**:
  1. Revoke public access to `kyc-documents` and `land-documents` buckets.
  2. Configure RLS (Row Level Security) rules on Supabase to ensure that only the service role key can write files.
  3. Restrict CORS origins on all buckets to allow requests only from your production domain (e.g., `https://carbonmrv.com`).

---

## 4. API Gateway Security & SSL Configuration
- **Action**: Protect endpoints using rate-limiting and firewalls.
- **Setup**:
  1. Enable Cloudflare DNS proxying to protect against DDoS attacks.
  2. Configure CORS middleware in FastAPI to allow requests only from your production frontend domain.
  3. Set up API rate-limiting on FastAPI routers using dependencies such as `slowapi` to prevent brute force attacks on authentication and upload endpoints.
  4. Ensure all communication is encrypted over HTTPS (TLS 1.3).

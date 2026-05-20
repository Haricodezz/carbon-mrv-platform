# Current Bugs, Technical Debt, and Operational Risks

This document provides a detailed list of known technical issues, mock states, and operational risks inside the Carbon MRV Platform.

---

## 1. Mocked & Simulated Features

### 1.1 Web2 Payment Gateway (Razorpay Simulation)
- **Status**: Simulated.
- **Detail**: Payment checkout, payment verify, and order creation API endpoints verify parameters but do not connect to live Razorpay servers. They simulate successful payment responses to enable immediate testing.
- **Risk**: Moving to production requires updating keys and replacing mock callbacks with live webhooks.

### 1.2 Blockchain Fallback (Mock Receipts)
- **Status**: Conditional Fallback.
- **Detail**: If `settings.ENABLE_BLOCKCHAIN` is false or the RPC node is down, `blockchain_service.py` falls back to generating deterministic mock hashes using md5 string values.
- **Risk**: In production, an RPC failure must fail the minting request rather than silently fall back to mock hashes.

---

## 2. Unstable Areas & Known Issues

### 2.1 STAC Catalog Performance and Timeouts
- **Status**: Critical Risk.
- **Detail**: Queries to Microsoft Planetary Computer can be slow (sometimes taking 8–15 seconds) or fail during high traffic.
- **Mitigation**: We implemented a deterministic coordinates-based geographic fallback that estimates metrics rather than failing, but this bypasses the real satellite analysis.

### 2.2 Celery Worker Memory Consumption
- **Status**: Technical Debt.
- **Detail**: Rasterio and Geopandas are compiled C-extension libraries. When Celery workers process large TIFF files, they can consume large amounts of RAM (often exceeding 500MB per task).
- **Risk**: Deploying on Render's free tier (limit 512MB RAM) can trigger Out Of Memory (OOM) crashes.

---

## 3. Security Concerns & Vulnerabilities

### 3.1 Master Wallet Private Key Leakage
- **Status**: High Risk.
- **Detail**: The backend signs mint and transfer transactions using the `MASTER_WALLET_PRIVATE_KEY` stored in `.env`.
- **Mitigation**: This key must be rotated regularly and locked down. A hardware security module (HSM) or secret manager (e.g., AWS Secrets Manager or HashiCorp Vault) should be implemented.

### 3.2 Polygon Bounding Box / Polygon Validation
- **Status**: Partial Validation.
- **Detail**: The backend parses GeoJSON polygons but does not fully validate if coordinates cross over international borders or overlap with existing project boundaries in adjacent areas.
- **Risk**: Potential duplicate land claims.

---

## 4. Immediate Development TODOs
- [ ] Implement Razorpay webhook validation in production.
- [ ] Migrate `MASTER_WALLET_PRIVATE_KEY` to AWS Secrets Manager.
- [ ] Add spatial index queries in PostgreSQL to prevent project polygon intersections.
- [ ] Configure automatic worker recycling in Celery (`worker_max_tasks_per_child = 5`) to prevent memory leaks from Rasterio.
- [ ] Integrate real S3-compatible cloud storage buckets for backups.

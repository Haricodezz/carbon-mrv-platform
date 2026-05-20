# Safe Deployment Checklist: Carbon MRV Platform

Follow this checklist before pushing updates or configuration changes to staging or production.

---

## 1. Secrets & Credentials Checklist
- [ ] **No Hardcoded Secrets**: Ensure no API keys, private keys, or credentials exist in git-committed files.
- [ ] **Secret Manager Integration**: Verify `MASTER_WALLET_PRIVATE_KEY` and `SECRET_KEY` are injected via environment settings, not `.env` files inside codebases.
- [ ] **Minimal Permissions**: Check that the Supabase API keys have appropriate row-level security (RLS) enabled.

---

## 2. Network & CORS Checklist
- [ ] **CORS Origins Allowed**: Verify `FRONTEND_URL` is set to the actual production front-end URL (no wildcard `*` allowed in production).
- [ ] **HTTPS Enforced**: Ensure all traffic goes through SSL/TLS.
- [ ] **RPC Node Health**: Confirm the blockchain RPC node URL (`BLOCKCHAIN_RPC_URL`) responds to latency queries within 200ms.

---

## 3. Storage & Bucket Provisioning
- [ ] **Storage Buckets Exist**: Verify all 5 buckets exist on Supabase Storage:
  - `kyc-documents` (Private)
  - `land-documents` (Private)
  - `certificates` (Public)
  - `reports` (Public)
  - `project-media` (Public)
- [ ] **Bucket Policies Verified**: Confirm that anonymous users cannot read files in `kyc-documents` or `land-documents`.

---

## 4. Machine Learning & Model Parity
- [ ] **Model Files Deployed**: Ensure `carbon_model.pkl` and `fraud_model.pkl` are located at `ml/models/`.
- [ ] **Model Integrity Check**: Verify joblib can load both pickle files on startup without compiler errors.
- [ ] **IPCC Calculations Match**: Run unit tests (`test_ml_geospatial.py`) to confirm output math alignment.

---

## 5. Deployment Run-through
- [ ] **Run Pre-Flight Tests**: Execute all backend tests successfully:
  ```bash
  pytest
  ```
- [ ] **Run DB Migrations**: Verify database migrations are complete (`alembic upgrade head`).
- [ ] **Check Worker Status**: Verify Celery has successfully registered with Redis and is listening for events.

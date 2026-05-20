# Error Recovery & System Troubleshooting Guide

This playbook outlines recovery procedures for various infrastructure failures.

---

## 1. Blockchain RPC Outages (Network Timeout)
- **Symptom**: On-chain requests return `Failed to connect to blockchain RPC` or HTTP timeouts.
- **Root Cause**: Alchemy/Infura node rate-limiting, or Polygon testnet congestion.
- **Recovery Steps**:
  1. Check node status on provider dashboard.
  2. If down, acquire a fallback RPC URL from [Chainlist](https://chainlist.org).
  3. Edit `.env` or Render Web Service environment variables:
     ```env
     BLOCKCHAIN_RPC_URL="https://alternative-amoy-rpc.com"
     ```
  4. Restart the backend and Celery workers to pick up the new connection.

---

## 2. Database Migration Failures (Alembic Locks)
- **Symptom**: `alembic upgrade head` throws `Table already exists` or schema locks.
- **Recovery Steps**:
  1. Check current database revision status:
     ```bash
     alembic current
     ```
  2. If the schema matches but Alembic thinks it is behind, stamp the database to the current head without running SQL changes:
     ```bash
     alembic stamp head
     ```
  3. If migrations failed halfway, run target downgrades manually or restore the DB from a Supabase snapshot.

---

## 3. Celery Out of Memory (OOM) Crashes
- **Symptom**: Celery worker dies silently. Render logs display `Exit code 137` (OOM).
- **Root Cause**: Rasterio loading large geoTIFFs into memory.
- **Recovery Steps**:
  1. Limit Celery memory leak footprint: configure workers to automatically recycle child processes after completing a set number of tasks.
  2. Set environment variables on the Celery worker:
     ```env
     CELERYD_MAX_TASKS_PER_CHILD=5
     ```
  3. Restart the background worker service.

---

## 4. Wallet Balance De-synchronization
- **Symptom**: Farmer's database wallet balance does not match their on-chain balance.
- **Recovery Steps**:
  1. Verify the transaction status on Polygonscan.
  2. If the transaction was successful on-chain but failed to register in the database, run the ledger reconciliation script to synchronize the balances:
     ```bash
     python scripts/sync_ledger.py --wallet <wallet-address>
     ```
  3. Review the backend log files to check for failed Celery tasks.

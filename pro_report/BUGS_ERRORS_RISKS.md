# Bugs, Errors, and Risks Audit

## Brutally Honest Risk Assessment

### 1. Known Bugs & Code Limitations
- **In-Memory Rate Limiting:** The current rate limiter in `main.py` is an in-memory dictionary. In a multi-worker production environment (e.g., Uvicorn with multiple workers or Gunicorn), this will not work correctly. It must be migrated to a Redis-based rate limiter (like `slowapi`).
- **Mock Fallbacks:** In `payment_service.py` and `blockchain_service.py`, if credentials are not found, the system gracefully falls back to generating mock IDs. While great for local demos, if a `.env` variable is accidentally omitted in production, the system will process "fake" financial transactions.

### 2. Potential Hidden Bugs (Race Conditions)
- **Inventory Deduction:** In `purchase_service.py`, multiple simultaneous purchases of the exact same project's credits could theoretically cause a race condition, allowing overselling. `with_for_update()` is implemented, but transaction isolation levels in Postgres must be rigorously tested.

### 3. Security Concerns
- **Token Invalidation:** JWTs are stateless. If an admin suspends a user, the user can still use their existing token until it expires. A Redis token blacklist is required.
- **Blockchain Keys:** Private keys used for administrative minting must be handled via AWS KMS or HashiCorp Vault, not flat `.env` files.

### 4. Machine Learning & Satellite Reliability
- **ML Hallucinations:** The random forest model requires massive localized datasets to accurately predict biomass. Currently, it assumes linear relationships that may not hold true in diverse geographic regions.
- **Satellite API Rate Limits:** Planetary Computer/Sentinel APIs have strict rate limits and intermittent downtimes. The Celery worker must have robust exponential backoff and retry mechanisms.

### 5. Payment Edge Cases
- **Drop-offs:** If a user pays via Razorpay but closes the browser before `/api/purchases/verify` is called, their money is deducted but credits are not assigned. A Razorpay Webhook integration is absolutely critical to reconcile these edge cases.

### 6. Technical Debt
- High reliance on sequential database commits in complex workflows (like purchases).
- Lack of E2E testing framework (Cypress/Playwright).

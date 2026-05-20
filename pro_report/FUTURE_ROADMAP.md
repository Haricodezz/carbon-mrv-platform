# Future Roadmap & Strategic Scaling

## Phase 1: Immediate Fixes (Next 30 Days)
- **Unit & Integration Testing:** Implement Pytest for the FastAPI backend and Jest/React Testing Library for the frontend. Minimum 70% coverage.
- **Cloud Storage:** Migrate certificate and image storage to AWS S3.
- **Payment Webhooks:** Implement server-to-server Razorpay webhooks to guarantee transaction finality regardless of frontend disconnects.
- **Redis Rate Limiting:** Replace the in-memory rate limiter with a Redis-backed solution.

## Phase 2: Short-Term Enhancements (1-3 Months)
- **Multi-Sig Wallets:** Implement Gnosis Safe (or similar) for the Admin wallet that mints tokens, requiring multiple approvals.
- **Enhanced ML Pipeline:** Integrate historical satellite data (time-series analysis) to track deforestation or growth over years, rather than a single point in time.
- **KYC/AML:** Integrate a provider like Onfido for corporate buyers and farmers to meet regulatory standards.

## Phase 3: Medium-Term Expansion (3-6 Months)
- **Standard Integrations:** Build APIs to pull/push data to established registries (Verra, Gold Standard).
- **Secondary Market:** Allow users to resell carbon credits on the platform (trading features, order books).
- **Mobile Application:** Develop a React Native or Flutter app specifically for farmers to capture ground-truth data (photos, soil samples) to supplement satellite verification.

## Phase 4: Long-Term Vision (1+ Years)
- **IoT Integration:** Direct integration with soil carbon sensors and drone-based LIDAR scanning for pinpoint MRV accuracy.
- **Cross-Chain Bridging:** Allow CMRV tokens to be bridged between Polygon, Ethereum, and Celo.
- **Decentralized Autonomous Organization (DAO):** Transition the auditing and governance of the platform to a token-holder voting system, fully decentralizing the approval process.

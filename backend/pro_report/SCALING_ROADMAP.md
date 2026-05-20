# Enterprise Scaling & Post-MVP Roadmap

This document outlines the architectural pathway to transform the Carbon MRV Platform into a global-scale climate-tech product.

---

## 1. Geospatial Processing Performance (Raster Caching)
- **Problem**: Processing large multispectral files from the STAC catalog on every verification request is resource-intensive and slow.
- **Solution**:
  - Implement a caching layer in Redis for computed spectral grids (NDVI/EVI/NDMI).
  - Pre-tile polygon boundaries to request only relevant sub-raster blocks, reducing download size by up to 80%.

---

## 2. Decentralized Task Queues
- **Problem**: Runaway memory usage from Rasterio and Shapely can block standard database updates if run on a single Celery worker.
- **Solution**:
  - Split Celery worker tasks into distinct queues:
    - `satellite-mrv-queue`: Dedicated memory-optimized nodes (minimum 2GB RAM).
    - `blockchain-treasury-queue`: CPU-optimized nodes with high network throughput.
    - `report-generator-queue`: Storage-optimized nodes.

---

## 3. High-Security Custody & Key Management (HSM)
- **Problem**: Holding the master wallet private key in plain text env vars presents a single point of failure.
- **Solution**:
  - Integrate with institutional custody providers (e.g. Fireblocks, AWS KMS, or HashiCorp Vault) to sign transactions.
  - Implement multi-signature controls on the `CarbonCreditToken` smart contract, requiring 2 out of 3 admin wallets to approve mint operations over 10,000 credits.

---

## 4. Layer 2 & zkEVM Migration
- **Problem**: Gas costs on Polygon POS can fluctuate during peak usage, impacting transaction margins.
- **Solution**:
  - Migrate the token registry to **Polygon zkEVM** or an Arbitrum Orbit L3 chain, offering lower, predictable gas fees.
  - Integrate Chainlink Oracles to write verified CO2e numbers directly to smart contracts.

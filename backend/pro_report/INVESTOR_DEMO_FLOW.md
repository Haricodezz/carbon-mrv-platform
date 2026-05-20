# Investor Demonstration Flow: Carbon MRV Platform

Use this step-by-step walkthrough to demonstrate the platform to investors, customers, or evaluators.

---

## Step 1: Farmer Onboarding & Land Submission
- **Visual Action**: Log in as a Farmer (`hari.farmer@example.com`). Open the **Submit Project** page.
- **Narrative**:
  > "Our platform onboarding begins with the project developer or farmer. Here, they map their land boundaries by entering GeoJSON polygon coordinates. This registers their acreage and location directly into our database."
- **Execution**: Enter coordinates and area, then submit.
- **Next Step**: Upload a mock land deed and passport on the project documents page. This files documents into the private Supabase buckets.

---

## Step 2: Automated Satellite & ML Analysis
- **Visual Action**: An auditor opens the project review panel. The system displays a loading indicator showing automated satellite processing.
- **Narrative**:
  > "Immediately upon submission, the platform triggers a background task that queries the Planetary Computer STAC catalog, pulls real Sentinel-2 satellite imagery, and clips the raster to the farmer's land boundary. It extracts red, NIR, and SWIR bands to calculate NDVI, EVI, and NDMI indices, which are then analyzed by our trained XGBoost Regressor model to estimate biomass. Simultaneously, our XGBoost Classifier evaluates the land for duplicate polygon boundaries, excessive water coverage, or urban development, generating a fraud risk score."
- **Result**: Show the computed metrics (NDVI, biomass, and fraud risk score) appearing on the dashboard.

---

## Step 3: Auditor Verification & Governance
- **Visual Action**: Log in as the Auditor. Click **Approve**.
- **Narrative**:
  > "The auditor reviews the uploaded land ownership documents via secure, temporary signed URLs and cross-checks the ML metrics. If everything aligns and the fraud risk is below 65%, the auditor approves the project. This updates its status to `approved_pending_credit_issue`."

---

## Step 4: Admin Treasury Tokenization (Minting)
- **Visual Action**: Log in as Admin. Open the **Minting Control Center**, find the approved project, and click **Mint Credits**.
- **Narrative**:
  > "The platform admin executes tokenization. The backend signs a transaction using the master treasury key, calling the `mintCredits` function on our smart contract. This mints ERC-20 `CMRV` tokens directly to the farmer's wallet address. The transaction is recorded on the blockchain, and the tokens become available in the farmer's account."
- **Result**: Show the blockchain transaction hash linking to Polygonscan.

---

## Step 5: Marketplace Purchase & Corporate Offsetting
- **Visual Action**: Log in as a Company representative. Open the **Marketplace**. Find the farmer's project, enter a credit amount, and complete the checkout.
- **Narrative**:
  > "Corporate buyers can purchase these verified credits directly from the marketplace. Once a purchase is confirmed, the platform treasury executes an `adminTransfer` to move tokens from the farmer's wallet to the company's wallet on their behalf."

---

## Step 6: On-Chain Retirement & ESG Certificate
- **Visual Action**: Open the Company portfolio, select the credits, and click **Retire**. Enter a offset reason (e.g. "Net Zero FY2026").
- **Narrative**:
  > "To claim the offsets, the company retires them. The contract burns the tokens, permanently removing them from circulation to prevent double-counting. The system automatically generates a premium, institutional-grade retirement PDF certificate, uploads it to Supabase Storage, and prints a verification QR code linked to Polygonscan."
- **Result**: Open the generated PDF certificate to display the QR verification code.

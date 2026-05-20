# API Reference Summary: Carbon MRV Platform

## 1. Authentication & Onboarding
- **`POST /api/auth/register`**
  - **Payload**: `{ "email": "str", "password": "str", "full_name": "str", "role": "str" }`
  - **Response**: User object with ID.
- **`POST /api/auth/login`**
  - **Payload**: `{ "username": "str", "password": "str" }` (OAuth2 password form)
  - **Response**: `{ "access_token": "str", "token_type": "bearer" }`

---

## 2. Project Management
- **`POST /api/projects/`**
  - **Payload**: `{ "project_name": "str", "project_type": "str", "location": "str", "country": "str", "polygon_coordinates": "str", "description": "str" }`
  - **Response**: Created project metadata.
- **`GET /api/projects/`**
  - **Headers**: `Authorization: Bearer <token>`
  - **Response**: Array of projects owned by caller (or all projects if Admin/Auditor).
- **`POST /api/projects/{project_id}/verify`**
  - **Privilege**: Auditor/Admin.
  - **Action**: Triggers live satellite retrieval task synchronous pipeline and computes ML scores.

---

## 3. Land Documents & KYC Uploads
- **`POST /api/land-verification/{project_id}/upload`**
  - **Payload**: Multipart file upload.
  - **Response**: `{ "status": "success", "file_path": "str" }`
- **`POST /api/kyc/upload`**
  - **Payload**: Multipart file upload.
  - **Response**: `{ "status": "success", "file_path": "str" }`

---

## 4. Auditor Operations
- **`GET /api/auditor/projects/pending`**
  - **Response**: List of projects pending document/satellite audits.
- **`POST /api/auditor/projects/{project_id}/verify`**
  - **Payload**: `{ "status": "approved|rejected", "notes": "str", "risk_score": 0.0 }`
  - **Response**: Verification result status.
- **`GET /api/auditor/document/serve?file_path=str`**
  - **Response**: HTTP 307 Redirect to secure signed Supabase URL.

---

## 5. Tokenization & Blockchain Operations
- **`POST /api/blockchain/mint`**
  - **Privilege**: Admin.
  - **Payload**: `{ "project_id": "str", "amount": 0, "recipient_wallet": "str" }`
  - **Response**: Transaction receipt with tx hash.
- **`POST /api/blockchain/retire`**
  - **Payload**: `{ "amount": 0, "reason": "str" }`
  - **Response**: Transaction receipt with tx hash.

---

## 6. ESG Marketplace
- **`GET /api/marketplace/`**
  - **Response**: Array of active tokenized projects with pricing and credit inventory.
- **`POST /api/marketplace/purchase`**
  - **Payload**: `{ "project_id": "str", "credits": 0 }`
  - **Response**: Created order receipt.

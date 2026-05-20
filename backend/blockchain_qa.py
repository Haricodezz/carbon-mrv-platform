import requests
import time
import os

BASE_URL = "http://127.0.0.1:8000"

# Hardhat Account #1
FARMER_ADDRESS = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"

def register_and_login(email, role, full_name):
    payload = {
        'email': email,
        'password': 'SecurePass123',
        'role': role,
        'full_name': full_name
    }
    requests.post(f"{BASE_URL}/api/auth/register", json=payload)
    res = requests.post(f"{BASE_URL}/api/auth/login", data={'username': email, 'password': 'SecurePass123'})
    if res.status_code != 200:
         print(f"Login failed for {email}: {res.text}")
    return res.json()['access_token']

print("--- PART 3: ISSUANCE TEST ---")
print("1. Registering Farmer...")
farmer_token = register_and_login(f'farmer_qa@example.com', 'farmer', 'Blockchain Farmer')
farmer_headers = {"Authorization": f"Bearer {farmer_token}"}

print("2. Linking Blockchain Wallet...")
res_wallet = requests.post(f"{BASE_URL}/api/wallet/verify", json={"wallet_address": FARMER_ADDRESS}, headers=farmer_headers)
print("Wallet Link:", res_wallet.status_code, res_wallet.json())

print("3. Creating Project...")
# We need to make sure NDVI/Biomass results in estimated credits > 0
# The satellite-verify endpoint usually calculates this.
payload_project = {
    "project_name": "Testnet Rice Farm",
    "project_type": "Agriculture",
    "location": "Testnet, Web3",
    "country": "India",
    "polygon_coordinates": '{"type": "Polygon", "coordinates": [[[85.3131, 25.5941], [85.3131, 25.5942], [85.3132, 25.5942], [85.3132, 25.5941], [85.3131, 25.5941]]]}'
}
res_proj = requests.post(f"{BASE_URL}/api/projects/", json=payload_project, headers=farmer_headers)
project_id = res_proj.json()["project_id"]

print("4. Uploading Land Deed...")
files = {'file': ('dummy.pdf', b'%PDF-1.4 dummy', 'application/pdf')}
res_upload = requests.post(f"{BASE_URL}/api/land-verification/{project_id}/upload", headers=farmer_headers, files=files, data={"document_type": "land_deed"})
land_record_id = res_upload.json()["land_verification_id"]

print("5. Auditor Approves Land & Satellite...")
def auditor_login():
    res = requests.post(f"{BASE_URL}/api/auth/login", data={'username': 'auditor@carbonmrv.com', 'password': 'StrongAuditorPassword123'})
    return res.json()['access_token']

auditor_token = auditor_login()
auditor_headers = {"Authorization": f"Bearer {auditor_token}"}

requests.post(f"{BASE_URL}/api/land-verification/{land_record_id}/approve", headers=auditor_headers)
# Triggering satellite-verify will compute estimated_credits based on model
res_sat = requests.post(f"{BASE_URL}/api/projects/{project_id}/satellite-verify", headers=auditor_headers)
print("Satellite Verify:", res_sat.status_code, res_sat.json())

requests.post(f"{BASE_URL}/api/projects/{project_id}/approve", headers=auditor_headers)

print("6. Admin Issues Credits (Blockchain Interaction)...")
def admin_login():
    res = requests.post(f"{BASE_URL}/api/auth/login", data={'username': 'admin@carbonmrv.com', 'password': 'StrongAdminPassword123'})
    return res.json()['access_token']

admin_token = admin_login()
admin_headers = {"Authorization": f"Bearer {admin_token}"}

res_issue = requests.post(f"{BASE_URL}/api/projects/{project_id}/issue-credits", headers=admin_headers)
print("Issuance Response:", res_issue.status_code, res_issue.json())

print("\n--- PART 4: VERIFYING BALANCES ---")
print("Blockchain Total Supply...")
res_supply = requests.get(f"{BASE_URL}/api/blockchain/supply", headers=admin_headers)
print("Supply:", res_supply.json())

print("Blockchain Balance for Farmer...")
res_bal = requests.get(f"{BASE_URL}/api/blockchain/balance?wallet_address={FARMER_ADDRESS}", headers=admin_headers)
print("Farmer Blockchain Balance:", res_bal.json())

print("Internal DB Balance for Farmer...")
res_db_bal = requests.get(f"{BASE_URL}/api/wallet/balance", headers=farmer_headers)
print("Farmer DB Balance:", res_db_bal.json())

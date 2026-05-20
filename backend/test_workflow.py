import requests

farmer_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NWU5N2RmYS01OTk1LTRlOGEtYTliYi00ZmNiNjVkYmRmODYiLCJyb2xlIjoiZmFybWVyIiwiZXhwIjoxNzc5ODA5ODA5LCJpYXQiOjE3NzkyMDUwMDksInR5cGUiOiJhY2Nlc3MifQ.1MVF1YbmbMwaF3VqcmHRX0lsT9rG44LDgJJagRenHNQ"
nco_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMjBlYzBkMy03YmRkLTQ2NDAtOTJmMS1hZjhlMGIyMzYyZWUiLCJyb2xlIjoibmdvIiwiZXhwIjoxNzc5ODA5ODEyLCJpYXQiOjE3NzkyMDUwMTIsInR5cGUiOiJhY2Nlc3MifQ.7YiAdAuKwQFnYU7Old8-Y1qW85K7zNXtpG_bTRIjAXc"

project_id = "ad3cc2a7-363a-48c8-a615-3c379dca8cbc"

print("1. Uploading land ownership document (Farmer)...")
farmer_headers = {"Authorization": f"Bearer {farmer_token}"}
# Create dummy pdf file in memory
files = {'file': ('dummy.pdf', b'%PDF-1.4 dummy content', 'application/pdf')}
data = {'document_type': 'land_deed'}
res = requests.post(f"http://127.0.0.1:8000/api/land-verification/{project_id}/upload", headers=farmer_headers, files=files, data=data)
print(res.status_code, res.text)
if res.status_code == 200:
    land_record_id = res.json().get("land_record_id")
    print("Land Record ID:", land_record_id)
    
    print("\n2. Approving land document (NCO)...")
    nco_headers = {"Authorization": f"Bearer {nco_token}"}
    res2 = requests.post(f"http://127.0.0.1:8000/api/land-verification/{land_record_id}/approve", headers=nco_headers)
    print(res2.status_code, res2.text)

    print("\n3. Triggering Satellite Verification (System/Farmer)...")
    res3 = requests.post(f"http://127.0.0.1:8000/api/projects/{project_id}/satellite-verify", headers=farmer_headers)
    print(res3.status_code, res3.text)

    # Let's get auditor token to approve
    print("\n4. Approving Project (Auditor)...")
    # Using default auditor from LOCAL_SETUP.md: auditor@carbonmrv.com / StrongAuditorPassword123
    data = {"username": "auditor@carbonmrv.com", "password": "StrongAuditorPassword123"}
    res_login = requests.post("http://127.0.0.1:8000/api/auth/login", data=data)
    auditor_token = res_login.json()["access_token"]
    auditor_headers = {"Authorization": f"Bearer {auditor_token}"}
    
    res4 = requests.post(f"http://127.0.0.1:8000/api/projects/{project_id}/approve", headers=auditor_headers)
    print(res4.status_code, res4.text)

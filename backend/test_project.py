import requests

farmer_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NWU5N2RmYS01OTk1LTRlOGEtYTliYi00ZmNiNjVkYmRmODYiLCJyb2xlIjoiZmFybWVyIiwiZXhwIjoxNzc5ODA5ODA5LCJpYXQiOjE3NzkyMDUwMDksInR5cGUiOiJhY2Nlc3MifQ.1MVF1YbmbMwaF3VqcmHRX0lsT9rG44LDgJJagRenHNQ"

payload_project = {
    "project_name": "Hari's Rice Farm",
    "project_type": "Agriculture",
    "location": "Bihar, India",
    "country": "India",
    "polygon_coordinates": '{"type": "Polygon", "coordinates": [[[85.3131, 25.5941], [85.3131, 25.5942], [85.3132, 25.5942], [85.3132, 25.5941], [85.3131, 25.5941]]]}',
    "description": "5 acres of rice farm"
}

headers = {"Authorization": f"Bearer {farmer_token}"}
res = requests.post("http://127.0.0.1:8000/api/projects/", json=payload_project, headers=headers)
print("Create Project:", res.status_code, res.text)

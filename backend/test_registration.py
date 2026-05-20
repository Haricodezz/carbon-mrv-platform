import requests

payload_farmer = {
    'email': 'hari.farmer@example.com',
    'password': 'SecurePass123',
    'role': 'farmer',
    'full_name': 'Hari',
    'phone': '9876543210',
    'location': 'Bihar, India',
    'farm_size': 5,
    'crop_type': 'Rice'
}

print('Registering Farmer:')
res = requests.post('http://127.0.0.1:8000/api/auth/register', json=payload_farmer)
print(res.status_code, res.text)

payload_nco = {
    'email': 'gkc.nco@example.com',
    'password': 'SecurePass123',
    'role': 'ngo',
    'full_name': 'GKC',
    'phone': '9123456780',
    'organization': 'Green Krishi Collective',
    'location': 'Jharkhand, India'
}

print('\nRegistering NCO/NGO:')
res2 = requests.post('http://127.0.0.1:8000/api/auth/register', json=payload_nco)
print(res2.status_code, res2.text)

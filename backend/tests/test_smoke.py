"""
Lightweight smoke tests for Carbon MRV Platform critical API flows.
Run: pytest tests/test_smoke.py -v
Requires backend DB configured in .env (same as local dev).
"""
import os
import uuid

import pytest
from fastapi.testclient import TestClient

# Ensure app loads with test-friendly env
os.environ.setdefault("DEBUG", "True")

from app.main import app  # noqa: E402

client = TestClient(app)


@pytest.fixture
def unique_email():
    return f"smoke_{uuid.uuid4().hex[:12]}@example.com"


def test_root_and_health():
    r = client.get("/")
    assert r.status_code == 200
    assert r.json().get("status") == "running"

    r = client.get("/health")
    assert r.status_code == 200
    assert r.json().get("status") == "healthy"


def test_register_login_me(unique_email):
    reg = client.post(
        "/api/auth/register",
        json={
            "full_name": "Smoke Tester",
            "email": unique_email,
            "password": "SmokeTest123!",
            "role": "farmer",
        },
    )
    assert reg.status_code == 200, reg.text
    token = reg.json()["access_token"]
    assert token

    login = client.post(
        "/api/auth/login",
        data={"username": unique_email, "password": "SmokeTest123!"},
    )
    assert login.status_code == 200
    assert login.json().get("access_token")

    me = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert me.status_code == 200
    assert me.json()["email"] == unique_email.lower()
    assert me.json()["role"] == "farmer"


def test_marketplace_public_list():
    r = client.get("/api/marketplace/")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_projects_require_auth():
    r = client.get("/api/projects/")
    assert r.status_code == 401


def test_admin_login_default():
    login = client.post(
        "/api/auth/login",
        data={
            "username": os.getenv("DEFAULT_ADMIN_EMAIL", "admin@carbonmrv.com"),
            "password": os.getenv("DEFAULT_ADMIN_PASSWORD", "StrongAdminPassword123"),
        },
    )
    if login.status_code != 200:
        pytest.skip("Default admin not available in this database")
    token = login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    dashboard = client.get("/api/admin/dashboard", headers=headers)
    assert dashboard.status_code == 200, dashboard.text

    users = client.get("/api/admin/users", headers=headers)
    assert users.status_code == 200, users.text


def test_auditor_login_default():
    login = client.post(
        "/api/auth/login",
        data={
            "username": os.getenv("DEFAULT_AUDITOR_EMAIL", "auditor@carbonmrv.com"),
            "password": os.getenv(
                "DEFAULT_AUDITOR_PASSWORD", "StrongAuditorPassword123"
            ),
        },
    )
    if login.status_code != 200:
        pytest.skip("Default auditor not available in this database")
    token = login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    pending = client.get("/api/auditor/projects/pending", headers=headers)
    assert pending.status_code == 200, pending.text


def test_wallet_requires_auth():
    r = client.get("/api/wallet/balance")
    assert r.status_code == 401


def test_blockchain_metadata():
    r = client.get("/api/blockchain/supply")
    assert r.status_code == 200, r.text
    data = r.json()
    assert "total_supply" in data or "token_symbol" in data

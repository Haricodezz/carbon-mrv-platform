"""
test_supabase_storage.py
========================
E2E Audit and Live Testing Suite for the Supabase Storage Integration.

Key tests:
1. Bucket verification (ensure buckets are present)
2. File validation & mime checks (allowed: pdf, png, jpg, jpeg; max size limit)
3. Secure filename masking (uuid generation)
4. KYC upload pipeline (private bucket, database path format)
5. Land document upload pipeline (private bucket, database path format)
6. Secure serving and URL signing (RedirectResponse authentication)
7. On-demand generated PDF reports/certificates upload and local cleanup
"""

import sys
import os
import mimetypes
import traceback
from datetime import datetime
from uuid import UUID, uuid4

# Ensure app package is importable
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.db.session import SessionLocal
from app.models.user import User
from app.models.project import Project
from app.models.kyc_verification import KYCVerification
from app.models.land_verification import LandVerification
from app.core.security import hash_password
from app.services.storage_service import (
    validate_file,
    secure_filename,
    upload_kyc_document,
    upload_land_document,
    generate_signed_url,
    upload_certificate
)
from app.services.certificate_service import generate_project_certificate
from app.services.certificate_generator import generate_certificate_pdf

# Setup mock FastAPI request context/client
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

# Load test user tokens/authentication if needed, or mock get_current_user/require_role
# To test the secure serve endpoint, we can bypass the dependency or create a real user and authenticate.
# Let's create clean test data

def log_test(name: str, status: str, details: str = "", error: str = None):
    border = "=" * 60
    print(f"\n{border}")
    print(f" TEST: {name}")
    print(f" STATUS: {status}")
    if details:
        print(f" DETAILS: {details}")
    if error:
        print(f" ERROR: {error}")
    print(border)


def run_storage_tests():
    db = SessionLocal()
    
    # Setup clean database environment for storage testing
    db.query(KYCVerification).delete()
    db.query(LandVerification).delete()
    db.query(Project).filter(Project.project_name.like("Storage Test Project%")).delete()
    db.query(User).filter(User.email.in_([
        "storage.farmer@example.com",
        "storage.auditor@example.com",
        "storage.admin@example.com"
    ])).delete()
    db.commit()

    print("[INFO] DB Cleaned. Starting Supabase Storage Tests...")

    # 1. Bucket Verification & Connection test
    try:
        from app.services.storage_service import supabase_client
        buckets = supabase_client.storage.list_buckets()
        bucket_names = [b.name for b in buckets]
        expected_buckets = ["kyc-documents", "land-documents", "certificates", "reports", "project-media"]
        missing = [b for b in expected_buckets if b not in bucket_names]
        
        assert len(missing) == 0, f"Missing buckets: {missing}"
        log_test("Supabase Connection & Bucket Provisioning", "PASSED", f"Buckets present: {bucket_names}")
    except Exception as e:
        log_test("Supabase Connection & Bucket Provisioning", "FAILED", error=str(e))
        traceback.print_exc()
        return

    # 2. File Validation and MIME checks
    try:
        # Check invalid format
        valid, msg = validate_file(b"dummy content", "test.exe", "application/x-msdownload")
        assert not valid, "Exe file should have been rejected."
        
        # Check valid PDF
        valid, msg = validate_file(b"dummy pdf content", "test.pdf", "application/pdf")
        assert valid, f"PDF file should be accepted, error: {msg}"
        
        # Check valid JPEG
        valid, msg = validate_file(b"dummy jpg content", "test.jpg", "image/jpeg")
        assert valid, f"JPEG file should be accepted, error: {msg}"
        
        # Check size limit
        huge_content = b"x" * (30 * 1024 * 1024) # 30MB
        valid, msg = validate_file(huge_content, "large.pdf", "application/pdf")
        assert not valid, "File exceeding size limit should be rejected."
        
        log_test("File Upload Security (MIME & Size Validation)", "PASSED", "Validation rejected bad formats/sizes and accepted correct ones.")
    except Exception as e:
        log_test("File Upload Security (MIME & Size Validation)", "FAILED", error=str(e))
        traceback.print_exc()
        return

    # 3. Secure Filename Masking
    try:
        name1 = secure_filename("passport.pdf")
        assert name1.endswith(".pdf"), "Should preserve extension"
        assert name1 != "passport.pdf", "Should mask name"
        
        name2 = secure_filename("avatar.PNG")
        assert name2.endswith(".png"), "Should normalize extension lowercase"
        assert name2 != "avatar.PNG"
        
        log_test("Secure Filename Masking", "PASSED", f"Passport -> {name1}; Avatar -> {name2}")
    except Exception as e:
        log_test("Secure Filename Masking", "FAILED", error=str(e))
        traceback.print_exc()
        return

    # Create dummy users for testing pipelines
    try:
        farmer = User(
            full_name="Storage Farmer",
            email="storage.farmer@example.com",
            password_hash=hash_password("Pass123!"),
            role="farmer",
            is_verified=True,
            is_active=True,
            kyc_completed=False
        )
        db.add(farmer)
        
        auditor = User(
            full_name="Storage Auditor",
            email="storage.auditor@example.com",
            password_hash=hash_password("Pass123!"),
            role="auditor",
            is_verified=True,
            is_active=True
        )
        db.add(auditor)
        
        db.commit()
        db.refresh(farmer)
        db.refresh(auditor)
    except Exception as e:
        log_test("Test Database Seeding", "FAILED", error=str(e))
        return

    # 4. KYC Upload Pipeline
    try:
        # Mock KYC Upload Request
        # Authenticate farmer client
        login_res = client.post("/api/auth/login", data={"username": farmer.email, "password": "Pass123!"})
        assert login_res.status_code == 200, "Farmer login failed."
        token = login_res.json()["access_token"]
        
        # Perform upload
        dummy_pdf = b"%PDF-1.4 mock pdf content"
        upload_res = client.post(
            "/api/kyc/upload",
            headers={"Authorization": f"Bearer {token}"},
            data={"document_type": "govt_id"},
            files={"file": ("id_proof.pdf", dummy_pdf, "application/pdf")}
        )
        
        assert upload_res.status_code == 200, f"Upload KYC failed: {upload_res.json()}"
        kyc_id = upload_res.json()["kyc_id"]
        
        # Verify database record
        kyc_record = db.query(KYCVerification).filter(KYCVerification.id == UUID(kyc_id)).first()
        assert kyc_record is not None, "KYC DB record not created."
        assert kyc_record.file_url.startswith("kyc-documents/"), f"Wrong path structure in DB: {kyc_record.file_url}"
        
        log_test("KYC Document Upload Pipeline", "PASSED", f"Uploaded document successfully. Path stored: {kyc_record.file_url}")
    except Exception as e:
        log_test("KYC Document Upload Pipeline", "FAILED", error=str(e))
        traceback.print_exc()
        return

    # 5. Land Verification Document Pipeline
    try:
        # Create a project first under farmer
        project = Project(
            owner_id=farmer.id,
            project_name="Storage Test Project Land",
            location="Karnataka",
            land_area_acres=15.5,
            lifecycle_status="submitted"
        )
        db.add(project)
        db.commit()
        db.refresh(project)
        
        # Perform land document upload
        dummy_img = b"PNG mock image bytes"
        upload_res = client.post(
            f"/api/land-verification/{project.id}/upload",
            headers={"Authorization": f"Bearer {token}"},
            data={"document_type": "land_deed"},
            files={"file": ("deed.png", dummy_img, "image/png")}
        )
        
        assert upload_res.status_code == 200, f"Upload land deed failed: {upload_res.json()}"
        land_doc_id = upload_res.json()["land_verification_id"]
        
        # Verify database record
        land_record = db.query(LandVerification).filter(LandVerification.id == UUID(land_doc_id)).first()
        assert land_record is not None, "Land verification DB record not created."
        assert land_record.document_url.startswith("land-documents/"), f"Wrong path structure in DB: {land_record.document_url}"
        
        log_test("Land Verification Document Pipeline", "PASSED", f"Uploaded successfully. Path stored: {land_record.document_url}")
    except Exception as e:
        log_test("Land Verification Document Pipeline", "FAILED", error=str(e))
        traceback.print_exc()
        return

    # 6. Secure Serving & URL Signing (RedirectResponse authentication)
    try:
        # Login auditor
        login_aud = client.post("/api/auth/login", data={"username": auditor.email, "password": "Pass123!"})
        assert login_aud.status_code == 200, "Auditor login failed."
        aud_token = login_aud.json()["access_token"]
        
        # Attempt to serve document
        serve_res = client.get(
            f"/api/auditor/document/serve?path={kyc_record.file_url}",
            headers={"Authorization": f"Bearer {aud_token}"},
            follow_redirects=False # We want to inspect redirect status
        )
        
        assert serve_res.status_code in [302, 307], f"Expected redirect, got: {serve_res.status_code}"
        redirect_url = serve_res.headers["location"]
        assert "supabase.co" in redirect_url, f"Expected supabase URL redirect, got: {redirect_url}"
        assert "token=" in redirect_url or "signature=" in redirect_url or "sign" in redirect_url, "Should contain secure signature/token parameters."
        
        log_test("Secure Document Serving & Redirects", "PASSED", f"Auditor request redirected successfully to: {redirect_url}")
    except Exception as e:
        log_test("Secure Document Serving & Redirects", "FAILED", error=str(e))
        traceback.print_exc()
        return

    # 7. Certificate & Report Generation Upload & Cleanup
    try:
        # Part A: Project certificate
        proj_cert_url = generate_project_certificate(project, farmer)
        assert proj_cert_url.startswith("http"), f"Expected Supabase public URL, got: {proj_cert_url}"
        
        # Verify local file is cleaned up
        local_expected_file = os.path.join("storage", "certificates", f"{project.id}_certificate.pdf")
        assert not os.path.exists(local_expected_file), "Local project certificate temp file was NOT cleaned up."
        
        # Part B: Retirement certificate
        cert_data = {
            "certificate_id": f"TEST-{str(uuid4())[:8]}",
            "project_name": project.project_name,
            "credits_retired": 120.5,
            "issued_to": farmer.full_name,
            "blockchain_tx_hash": "0xabc1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcd",
            "issued_at": datetime.utcnow().strftime("%Y-%m-%d UTC")
        }
        retire_cert_url = generate_certificate_pdf(cert_data)
        assert retire_cert_url.startswith("http"), f"Expected Supabase public URL for retirement, got: {retire_cert_url}"
        
        local_retire_file = os.path.join("certificates", f"{cert_data['certificate_id']}.pdf")
        assert not os.path.exists(local_retire_file), "Local retirement certificate temp file was NOT cleaned up."
        
        # Part C: Reports
        # Let's test the actual HTTP endpoint for reports
        report_res = client.get(
            f"/api/reports/project/{project.id}/satellite_verification",
            headers={"Authorization": f"Bearer {token}"},
            follow_redirects=False
        )
        assert report_res.status_code in [302, 307], f"Expected report redirect, got {report_res.status_code}"
        report_redirect_url = report_res.headers["location"]
        assert "supabase.co" in report_redirect_url, f"Expected supabase redirect: {report_redirect_url}"
        
        # Check local report cleanup
        local_report_file = os.path.join("storage", "certificates", "reports", f"{project.id}_satellite_verification.pdf")
        assert not os.path.exists(local_report_file), "Local report temp file was NOT cleaned up."
        
        log_test("Certificate & Report Upload & Cleanup", "PASSED", 
                 f"Project Certificate: {proj_cert_url}\nRetirement Certificate: {retire_cert_url}\nSatellite Report Redirect: {report_redirect_url}")
    except Exception as e:
        log_test("Certificate & Report Upload & Cleanup", "FAILED", error=str(e))
        traceback.print_exc()
        return

    print("\n[SUCCESS] All Supabase Storage E2E integration tests passed successfully!")
    db.close()


if __name__ == "__main__":
    run_storage_tests()

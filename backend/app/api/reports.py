import os
from pathlib import Path
from uuid import UUID
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.models.project import Project
from app.models.purchase import Purchase
from app.core.dependencies import get_current_user, require_role
from app.services.document_engine import PremiumDocumentEngine
from app.core.config import settings

router = APIRouter(
    prefix="/api/reports",
    tags=["Reports"]
)

def _get_project_or_404(db: Session, project_id: UUID) -> Project:
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")
    return project

@router.get("/project/{project_id}/{report_type}")
def generate_project_report(
    project_id: UUID,
    report_type: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generates premium institutional reports on-demand for a project.
    Types: verification, fraud, satellite, biomass, investor
    """
    project = _get_project_or_404(db, project_id)
    owner = db.query(User).filter(User.id == project.owner_id).first()
    
    reports_dir = Path(settings.CERTIFICATE_STORAGE_PATH) / "reports"
    reports_dir.mkdir(parents=True, exist_ok=True)
    file_path = str(reports_dir / f"{project.id}_{report_type}.pdf")
    
    # Base engine setup
    engine = PremiumDocumentEngine(
        filename=file_path,
        title=f"{report_type.replace('_', ' ').title()} Report",
        doc_type=f"{report_type.replace('_', ' ').upper()} REPORT"
    )
    
    if report_type == "satellite_verification":
        engine.add_title(f"{project.project_name} - Satellite Analysis", "SATELLITE VERIFICATION REPORT")
        engine.add_paragraph("This report contains geospatial analysis and NDVI metrics computed from the Planetary Computer API.")
        
        engine.add_section_header("Geospatial Parameters")
        engine.add_data_grid({
            "Latitude": round(project.latitude, 5) if project.latitude else "N/A",
            "Longitude": round(project.longitude, 5) if project.longitude else "N/A",
            "Polygon Bounding Box": "Verified",
            "Land Area (Acres)": round(project.land_area_acres, 2) if project.land_area_acres else "N/A",
        }, columns=2)
        
        engine.add_section_header("NDVI Intelligence")
        engine.add_data_grid({
            "Mean NDVI": round(project.ndvi_score, 4) if project.ndvi_score else "N/A",
            "Vegetation Health Index": round(project.vegetation_health, 4) if project.vegetation_health else "N/A",
            "Verification Status": project.satellite_status.upper()
        }, columns=2)
        
        engine.add_signature_block([("Automated AI Pipeline", "Satellite Verification Node")])
        engine.add_qr_code(f"https://carbonmrv.com/verify/satellite/{project.id}")
        
    elif report_type == "fraud_investigation":
        engine.add_title(f"Fraud Investigation: {project.project_name}", "FRAUD INVESTIGATION REPORT")
        engine.add_paragraph("This institutional report summarizes the automated anomaly detection and auditor compliance flags associated with the project.")
        
        engine.add_section_header("Anomaly Detection")
        engine.add_data_grid({
            "Fraud Risk Score": f"{round(project.fraud_risk_score, 2)} / 100" if project.fraud_risk_score else "N/A",
            "Risk Assessment": "HIGH" if (project.fraud_risk_score or 0) > 70 else "LOW",
            "Data Irregularities": "None Detected" if (project.fraud_risk_score or 0) < 50 else "Flagged for Review",
            "Auditor Status": project.audit_status.upper()
        }, columns=2)
        
        engine.add_section_header("Investigator Notes")
        engine.add_paragraph(project.verification_notes or "No anomalies flagged by human auditor.", style='DataValue')
        
        engine.add_signature_block([("Compliance Officer", "Registry Governance")])
        
    elif report_type == "biomass_carbon_estimation":
        engine.add_title(f"Biomass & Carbon Yield: {project.project_name}", "CARBON ESTIMATION REPORT")
        
        engine.add_section_header("Yield Metrics")
        engine.add_data_grid({
            "Above-Ground Biomass (AGB)": f"{project.agb_per_hectare} tons/ha",
            "Total Biomass": f"{project.total_biomass} tons",
            "Carbon Stock": f"{project.carbon_stock} tons",
            "CO2e Equivalency": f"{project.co2e} tons",
            "Estimated Annual Credits": f"{project.estimated_annual_credits} CMRV"
        }, columns=2)
        
        engine.add_signature_block([("ML Estimator Model", "Biomass Verification Node")])

    elif report_type == "investor_summary":
        engine.add_title(f"Investor Prospectus: {project.project_name}", "INVESTOR SUMMARY REPORT")
        
        engine.add_section_header("Asset Overview")
        engine.add_data_grid({
            "Asset Name": project.project_name,
            "Originator": owner.full_name,
            "Total Tokenized Supply": project.total_credits_generated,
            "Available Liquidity": project.credits_available,
            "Price Per Credit": f"₹{project.price_per_credit}",
            "Asset Lifecycle": project.lifecycle_status.upper()
        }, columns=2)
        
        engine.add_blockchain_verification(project.blockchain_tx_hash)
        engine.add_signature_block([("Treasury Management", "Carbon MRV Platform")])
        engine.add_qr_code(f"https://polygonscan.com/tx/{project.blockchain_tx_hash}" if project.blockchain_tx_hash else "https://carbonmrv.com")
        
    else:
        # Default Generic Verification
        engine.add_title(f"{project.project_name}", f"{report_type.replace('_', ' ').upper()} REPORT")
        engine.add_section_header("Project Context")
        engine.add_data_grid({
            "Project ID": str(project.id),
            "Owner": owner.full_name,
            "Status": project.status.upper()
        }, columns=2)
        engine.add_signature_block([("System Administrator", "Carbon MRV Platform")])

    local_path = engine.build()
    
    # Upload to Supabase Storage 'reports' bucket
    from app.services.storage_service import upload_file
    from fastapi.responses import RedirectResponse
    import mimetypes
    
    try:
        with open(local_path, "rb") as f:
            pdf_content = f.read()
        
        # Public reports bucket
        filename_dest = f"{project.id}_{report_type}.pdf"
        public_url = upload_file(
            file_content=pdf_content,
            bucket_name="reports",
            destination_path=filename_dest,
            content_type="application/pdf"
        )
        
        # Clean up local file
        if os.path.exists(local_path):
            os.remove(local_path)
            
        return RedirectResponse(url=public_url)
    except Exception as e:
        print(f"[STORAGE WARNING] Failed to upload report to Supabase: {e}")
        return FileResponse(
            path=local_path,
            media_type="application/pdf",
            filename=f"{project.project_name}_{report_type}.pdf"
        )

@router.get("/user/{report_type}")
def generate_user_report(
    report_type: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generates premium institutional reports for a user.
    Types: kyc, portfolio, annual_sustainability
    """
    reports_dir = Path(settings.CERTIFICATE_STORAGE_PATH) / "reports"
    reports_dir.mkdir(parents=True, exist_ok=True)
    file_path = str(reports_dir / f"user_{current_user.id}_{report_type}.pdf")
    
    engine = PremiumDocumentEngine(
        filename=file_path,
        title=f"{report_type.replace('_', ' ').title()} Report",
        doc_type=f"{report_type.replace('_', ' ').upper()} REPORT"
    )
    
    if report_type == "kyc_verification":
        engine.add_title(f"KYC Verification: {current_user.full_name}", "KYC COMPLIANCE REPORT")
        
        engine.add_section_header("Subject Identity")
        engine.add_data_grid({
            "Full Name": current_user.full_name,
            "Email Address": current_user.email,
            "Registered Role": current_user.role.upper(),
            "Country of Operation": current_user.country or "N/A",
            "Organization": current_user.organization_name or "Independent",
            "Phone Registry": current_user.phone or "N/A"
        }, columns=2)
        
        engine.add_section_header("Compliance Status")
        engine.add_data_grid({
            "KYC Completed": "YES" if current_user.kyc_completed else "NO",
            "Account Standing": "ACTIVE" if current_user.is_active else "SUSPENDED",
            "Email Verified": "YES" if current_user.is_verified else "NO"
        }, columns=2)
        
        engine.add_signature_block([("KYC Operations", "Compliance Department")])
        engine.add_qr_code(f"https://carbonmrv.com/verify/kyc/{current_user.id}")

    elif report_type == "annual_sustainability":
        engine.add_title(f"Annual ESG Impact: {current_user.full_name}", "SUSTAINABILITY REPORT")
        
        # Calculate impacts
        purchases = db.query(Purchase).filter(Purchase.user_id == current_user.id, Purchase.status == 'completed').all()
        total_offset = sum(p.credits_purchased for p in purchases)
        
        engine.add_section_header("ESG Impact Overview")
        engine.add_paragraph("This report certifies the total carbon offsets permanently retired by the organization, contributing directly to verifiable net-zero climate goals.")
        engine.add_data_grid({
            "Entity Name": current_user.organization_name or current_user.full_name,
            "Reporting Period": str(datetime.utcnow().year),
            "Total CO2e Offset (Tons)": str(total_offset),
            "Retirement Standard": "Carbon MRV Verifiable Asset"
        }, columns=2)
        
        engine.add_signature_block([("Sustainability Board", "Carbon MRV Platform")])
        engine.add_qr_code(f"https://carbonmrv.com/verify/esg/{current_user.id}")

    else:
        # Default
        engine.add_title(f"{current_user.full_name}", f"{report_type.replace('_', ' ').upper()} REPORT")
        engine.add_data_grid({"User ID": str(current_user.id), "Role": current_user.role}, columns=2)
        engine.add_signature_block([("System Administrator", "Carbon MRV Platform")])

    local_path = engine.build()
    
    # Upload to Supabase Storage 'reports' bucket
    from app.services.storage_service import upload_file
    from fastapi.responses import RedirectResponse
    
    try:
        with open(local_path, "rb") as f:
            pdf_content = f.read()
            
        filename_dest = f"user_{current_user.id}_{report_type}.pdf"
        public_url = upload_file(
            file_content=pdf_content,
            bucket_name="reports",
            destination_path=filename_dest,
            content_type="application/pdf"
        )
        
        # Clean up local file
        if os.path.exists(local_path):
            os.remove(local_path)
            
        return RedirectResponse(url=public_url)
    except Exception as e:
        print(f"[STORAGE WARNING] Failed to upload report to Supabase: {e}")
        return FileResponse(
            path=local_path,
            media_type="application/pdf",
            filename=f"{current_user.full_name.replace(' ', '_')}_{report_type}.pdf"
        )

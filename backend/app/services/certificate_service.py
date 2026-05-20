import os
from pathlib import Path
from app.core.config import settings
from app.services.document_engine import PremiumDocumentEngine

def generate_project_certificate(project, owner):
    """
    Generates an institutional-grade project verification certificate.
    """
    storage_path = Path(settings.CERTIFICATE_STORAGE_PATH)
    storage_path.mkdir(parents=True, exist_ok=True)
    file_path = str(storage_path / f"{project.id}_certificate.pdf")
    
    engine = PremiumDocumentEngine(
        filename=file_path,
        title="Project Verification Certificate",
        doc_type="VERIFICATION CERTIFICATE"
    )
    
    engine.add_title(f"{project.project_name}", "VERIFIED CARBON PROJECT")
    
    engine.add_section_header("Project Details")
    engine.add_data_grid({
        "Project ID": str(project.id),
        "Owner": owner.full_name,
        "Country": project.country,
        "Location": project.location,
        "Latitude": round(project.latitude, 5) if project.latitude else "N/A",
        "Longitude": round(project.longitude, 5) if project.longitude else "N/A",
        "Land Area (Acres)": round(project.land_area_acres, 2) if project.land_area_acres else "N/A",
        "Audit Status": project.audit_status.upper()
    }, columns=2)
    
    engine.add_section_header("Environmental Analytics")
    engine.add_data_grid({
        "NDVI Score": round(project.ndvi_score, 4) if project.ndvi_score else "N/A",
        "Vegetation Health": f"{round(project.vegetation_health, 2)}%" if project.vegetation_health else "N/A",
        "Fraud Risk Score": f"{round(project.fraud_risk_score, 2)}%" if project.fraud_risk_score is not None else "N/A",
        "Carbon Stock (Tons)": f"{round(project.carbon_stock, 2)} tons" if project.carbon_stock else "N/A",
        "CO2e Equivalency": f"{round(project.co2e, 2)} tons CO2e" if project.co2e else "N/A",
        "Verified Credits": f"{project.estimated_credits} CMRV",
        "Methodology": "IPCC Tier 1 Forestry & XGBoost ML",
        "Satellite Engine": "Sentinel-2 Multispectral Indexing"
    }, columns=2)
    
    engine.add_blockchain_verification(project.blockchain_tx_hash)
    
    engine.add_signature_block([
        ("Carbon MRV Authority", "Chief Verifier"),
        ("Independent Auditor", "Registry Compliance")
    ])
    
    engine.add_disclaimer(
        "This institutional certificate confirms that the listed project has passed "
        "rigorous satellite-based NDVI evaluation, AI biomass prediction, and auditor compliance checks."
    )
    
    # Add QR code pointing to polygonscan or a registry URL
    verify_url = f"https://polygonscan.com/tx/{project.blockchain_tx_hash}" if project.blockchain_tx_hash else f"https://carbonmrv.com/verify/{project.id}"
    engine.add_qr_code(verify_url)
    
    local_path = engine.build()
    
    # Upload to Supabase Storage
    from app.services.storage_service import upload_certificate
    try:
        with open(local_path, "rb") as f:
            pdf_content = f.read()
        public_url = upload_certificate(pdf_content, f"{project.id}_certificate.pdf")
        
        # Clean up local file
        if os.path.exists(local_path):
            os.remove(local_path)
            
        return public_url
    except Exception as e:
        # Fallback to local path if upload fails
        print(f"[STORAGE WARNING] Failed to upload certificate to Supabase: {e}")
        return local_path

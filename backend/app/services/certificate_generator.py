import os
from app.services.document_engine import PremiumDocumentEngine

def generate_certificate_pdf(certificate_data: dict):
    """
    Generates a retirement certificate PDF.
    """
    certificates_dir = "certificates"
    os.makedirs(certificates_dir, exist_ok=True)
    
    certificate_id = certificate_data.get("certificate_id", "certificate")
    file_path = os.path.join(certificates_dir, f"{certificate_id}.pdf")
    
    engine = PremiumDocumentEngine(
        filename=file_path,
        title="Carbon Offset Retirement",
        doc_type="RETIREMENT CERTIFICATE"
    )
    
    engine.add_title("Carbon Offset Retirement", "RETIREMENT CERTIFICATE")
    engine.add_paragraph(
        "This document certifies that the following carbon credits have been permanently retired "
        "on the blockchain, permanently removing them from circulation to offset carbon emissions."
    )
    
    engine.add_section_header("Retirement Details")
    engine.add_data_grid({
        "Certificate ID": certificate_id,
        "Project Name": certificate_data.get("project_name", "N/A"),
        "Credits Retired (Tons CO2e)": certificate_data.get("credits_retired", "N/A"),
        "Issued To (Beneficiary)": certificate_data.get("issued_to", "N/A"),
        "Retirement Date": certificate_data.get("issued_at", "N/A")
    }, columns=2)
    
    tx_hash = certificate_data.get("blockchain_tx_hash")
    engine.add_blockchain_verification(tx_hash)
    
    engine.add_signature_block([
        ("Registry Operations", "Carbon MRV Platform")
    ])
    
    engine.add_disclaimer(
        "Retirement of these credits represents a permanent and verifiable reduction in greenhouse gas emissions. "
        "This action is irreversible and recorded on the public ledger."
    )
    
    verify_url = f"https://polygonscan.com/tx/{tx_hash}" if tx_hash else f"https://carbonmrv.com/verify-retirement/{certificate_id}"
    engine.add_qr_code(verify_url)
    
    local_path = engine.build()
    
    # Upload to Supabase Storage
    from app.services.storage_service import upload_certificate
    try:
        with open(local_path, "rb") as f:
            pdf_content = f.read()
        public_url = upload_certificate(pdf_content, f"{certificate_id}.pdf")
        
        # Clean up local file
        if os.path.exists(local_path):
            os.remove(local_path)
            
        return public_url
    except Exception as e:
        print(f"[STORAGE WARNING] Failed to upload retirement certificate to Supabase: {e}")
        return local_path

def generate_project_certificate(project, owner):
    """Legacy alias, route to the main service"""
    from app.services.certificate_service import generate_project_certificate as main_gen
    return main_gen(project, owner)

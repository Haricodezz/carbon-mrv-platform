from pathlib import Path
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas

from app.core.config import settings


def generate_project_certificate(project, owner):
    storage_path = Path(settings.CERTIFICATE_STORAGE_PATH)
    storage_path.mkdir(parents=True, exist_ok=True)

    file_path = storage_path / f"{project.id}_certificate.pdf"

    c = canvas.Canvas(str(file_path), pagesize=A4)
    width, height = A4

    c.setFont("Helvetica-Bold", 20)
    c.drawCentredString(width / 2, height - 100, "Carbon Credit Verification Certificate")

    c.setFont("Helvetica", 12)
    c.drawString(100, height - 180, f"Project Name: {project.project_name}")
    c.drawString(100, height - 210, f"Owner: {owner.full_name}")
    c.drawString(100, height - 240, f"Country: {project.country}")
    c.drawString(100, height - 270, f"Location: {project.location}")
    c.drawString(100, height - 300, f"Estimated Credits: {project.estimated_credits}")
    c.drawString(100, height - 330, f"Carbon Stock: {project.carbon_stock}")
    c.drawString(100, height - 360, f"CO2e: {project.co2e}")
    c.drawString(100, height - 390, f"Verification Status: {project.audit_status}")

    c.setFont("Helvetica-Oblique", 10)
    c.drawString(
        100,
        height - 450,
        "This certificate confirms blockchain-backed carbon project verification."
    )

    c.save()

    return str(file_path)
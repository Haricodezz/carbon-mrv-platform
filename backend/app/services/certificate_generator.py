import os
from datetime import datetime

from reportlab.lib.pagesizes import A4
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    PageBreak,
)
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import inch


def generate_certificate_pdf(
    certificate_data: dict,
):
    """
    Generates a retirement certificate PDF from certificate data.
    Returns generated file path.
    """

    certificates_dir = (
        "certificates"
    )

    os.makedirs(
        certificates_dir,
        exist_ok=True,
    )

    certificate_id = certificate_data.get(
        "certificate_id",
        "certificate",
    )

    file_path = os.path.join(
        certificates_dir,
        f"{certificate_id}.pdf",
    )

    doc = SimpleDocTemplate(
        file_path,
        pagesize=A4,
    )

    styles = getSampleStyleSheet()

    story = [
        Paragraph(
            "Carbon MRV Platform",
            styles["Title"],
        ),
        Spacer(
            1,
            0.2 * inch,
        ),
        Paragraph(
            "Carbon Credit Retirement Certificate",
            styles["Heading2"],
        ),
        Spacer(
            1,
            0.3 * inch,
        ),
    ]

    for label, key in [
        ("Certificate ID", "certificate_id"),
        ("Project Name", "project_name"),
        ("Credits Retired", "credits_retired"),
        ("Issued To", "issued_to"),
        ("Blockchain Transaction", "blockchain_tx_hash"),
    ]:
        story.append(
            Paragraph(
                f"<b>{label}:</b> {certificate_data.get(key, 'N/A')}",
                styles["BodyText"],
            )
        )

    story.append(
        Spacer(
            1,
            0.4 * inch,
        )
    )

    story.append(
        Paragraph(
            "This certificate confirms carbon credit retirement under the Carbon MRV Platform.",
            styles["Italic"],
        )
    )

    doc.build(
        story
    )

    return file_path


def generate_project_certificate(
    project,
    owner,
):
    """
    Generates institutional-grade carbon verification certificate PDF.
    Returns generated file path.
    """

    certificates_dir = (
        "certificates"
    )

    os.makedirs(
        certificates_dir,
        exist_ok=True,
    )

    file_path = os.path.join(
        certificates_dir,
        f"project_{project.id}_certificate.pdf",
    )

    doc = SimpleDocTemplate(
        file_path,
        pagesize=A4,
    )

    styles = (
        getSampleStyleSheet()
    )

    story = []

    # =========================
    # HEADER
    # =========================

    story.append(
        Paragraph(
            "Carbon MRV Platform",
            styles["Title"],
        )
    )

    story.append(
        Spacer(
            1,
            0.2 * inch,
        )
    )

    story.append(
        Paragraph(
            "Institutional Carbon Credit Verification Certificate",
            styles[
                "Heading2"
            ],
        )
    )

    story.append(
        Spacer(
            1,
            0.3 * inch,
        )
    )

    # =========================
    # PROJECT DETAILS
    # =========================

    project_details = [
        f"<b>Project Name:</b> {project.project_name}",
        f"<b>Project Owner:</b> {owner.full_name}",
        f"<b>Owner Role:</b> {owner.role}",
        f"<b>Country:</b> {project.country}",
        f"<b>Location:</b> {project.location}",
        f"<b>Latitude:</b> {project.latitude}",
        f"<b>Longitude:</b> {project.longitude}",
        f"<b>Land Area:</b> {project.land_area_acres} acres",
        f"<b>Project Status:</b> {project.status}",
        f"<b>Satellite Status:</b> {project.satellite_status}",
        f"<b>Audit Status:</b> {project.audit_status}",
    ]

    for detail in project_details:
        story.append(
            Paragraph(
                detail,
                styles[
                    "BodyText"
                ],
            )
        )

    story.append(
        Spacer(
            1,
            0.3 * inch,
        )
    )

    # =========================
    # VERIFICATION METRICS
    # =========================

    story.append(
        Paragraph(
            "AI Verification Metrics",
            styles[
                "Heading3"
            ],
        )
    )

    verification_metrics = [
        f"<b>NDVI Score:</b> {project.ndvi_score}",
        f"<b>Vegetation Health:</b> {project.vegetation_health}",
        f"<b>Fraud Risk Score:</b> {project.fraud_risk_score}",
    ]

    for metric in verification_metrics:
        story.append(
            Paragraph(
                metric,
                styles[
                    "BodyText"
                ],
            )
        )

    story.append(
        Spacer(
            1,
            0.3 * inch,
        )
    )

    # =========================
    # BIOMASS ANALYTICS
    # =========================

    story.append(
        Paragraph(
            "Biomass & Carbon Analytics",
            styles[
                "Heading3"
            ],
        )
    )

    biomass_metrics = [
        f"<b>Above-Ground Biomass (AGB/ha):</b> {project.agb_per_hectare} tons/ha",
        f"<b>Total Biomass:</b> {project.total_biomass} tons",
        f"<b>Carbon Stock:</b> {project.carbon_stock} tons",
        f"<b>CO₂e:</b> {project.co2e} tons",
    ]

    for metric in biomass_metrics:
        story.append(
            Paragraph(
                metric,
                styles[
                    "BodyText"
                ],
            )
        )

    story.append(
        Spacer(
            1,
            0.3 * inch,
        )
    )

    # =========================
    # CREDIT METRICS
    # =========================

    story.append(
        Paragraph(
            "Carbon Credit Issuance",
            styles[
                "Heading3"
            ],
        )
    )

    credit_metrics = [
        f"<b>Estimated Credits:</b> {project.estimated_credits}",
        f"<b>Annual Credits:</b> {project.estimated_annual_credits}",
        f"<b>First Issuance Credits:</b> {project.first_issuance_credits}",
        f"<b>Total Credits Generated:</b> {project.total_credits_generated}",
    ]

    for metric in credit_metrics:
        story.append(
            Paragraph(
                metric,
                styles[
                    "BodyText"
                ],
            )
        )

    story.append(
        Spacer(
            1,
            0.3 * inch,
        )
    )

    # =========================
    # BLOCKCHAIN
    # =========================

    story.append(
        Paragraph(
            "Blockchain Verification",
            styles[
                "Heading3"
            ],
        )
    )

    blockchain_metrics = [
        f"<b>Tokenized:</b> {'Yes' if project.tokenized else 'No'}",
        f"<b>Transaction Hash:</b> {project.blockchain_tx_hash or 'N/A'}",
    ]

    for metric in blockchain_metrics:
        story.append(
            Paragraph(
                metric,
                styles[
                    "BodyText"
                ],
            )
        )

    story.append(
        Spacer(
            1,
            0.3 * inch,
        )
    )

    # =========================
    # NOTES
    # =========================

    story.append(
        Paragraph(
            "Verification Notes",
            styles[
                "Heading3"
            ],
        )
    )

    story.append(
        Paragraph(
            project.verification_notes
            or "No additional notes.",
            styles[
                "BodyText"
            ],
        )
    )

    story.append(
        Spacer(
            1,
            0.5 * inch,
        )
    )

    # =========================
    # FOOTER
    # =========================

    generated_date = (
        datetime.utcnow().strftime(
            "%Y-%m-%d %H:%M:%S UTC"
        )
    )

    footer_lines = [
        f"<b>Certificate Generated:</b> {generated_date}",
        "<b>Platform:</b> Carbon MRV Platform",
        "<b>Compliance Level:</b> AI + Satellite + Blockchain Verified",
    ]

    for line in footer_lines:
        story.append(
            Paragraph(
                line,
                styles[
                    "BodyText"
                ],
            )
        )

    story.append(
        Spacer(
            1,
            0.3 * inch,
        )
    )

    story.append(
        Paragraph(
            "This certificate validates that the above project has undergone advanced satellite verification, biomass prediction, carbon intelligence analysis, and blockchain-backed credit issuance under the Carbon MRV Platform.",
            styles[
                "Italic"
            ],
        )
    )

    # =========================
    # BUILD PDF
    # =========================

    doc.build(
        story
    )

    return file_path

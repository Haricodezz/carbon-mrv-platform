import random


def verify_project_satellite(project):
    """
    Simulated AI satellite verification
    Replace later with:
    - NDVI analysis
    - Satellite imagery
    - GIS validation
    - ML fraud detection
    """

    vegetation_score = random.uniform(70, 100)
    fraud_risk = random.uniform(0, 20)

    approved = (
        vegetation_score >= 75
        and fraud_risk <= 15
    )

    estimated_credits = round(
        project.land_area_acres *
        vegetation_score *
        0.8,
        2
    )

    return {
        "vegetation_score": vegetation_score,
        "fraud_risk": fraud_risk,
        "estimated_credits": estimated_credits,
        "verification_status": (
            "verified"
            if approved
            else "rejected"
        ),
        "verification_notes": (
            "Satellite AI verification successful."
            if approved
            else "Satellite verification risk detected."
        ),
    }
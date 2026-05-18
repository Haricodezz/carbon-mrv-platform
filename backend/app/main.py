import os
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings

# API Routers
from app.api.auth import router as auth_router
from app.api.projects import router as projects_router
from app.api.marketplace import router as marketplace_router
from app.api.blockchain import router as blockchain_router
from app.api.certificates import router as certificates_router
from app.api.admin import router as admin_router
from app.api.auditor import router as auditor_router
from app.api.purchases import router as purchases_router


# =========================
# LOGGING CONFIG
# =========================
logging.basicConfig(
    level=getattr(
        logging,
        settings.LOG_LEVEL.upper(),
        logging.INFO,
    ),
    format="%(asctime)s - %(levelname)s - %(name)s - %(message)s",
)

logger = logging.getLogger(
    __name__
)

logger.info(
    f"Starting {settings.APP_NAME} in {settings.APP_ENV} mode..."
)

# =========================
# CERTIFICATE STORAGE SETUP
# =========================
os.makedirs(
    settings.CERTIFICATE_STORAGE_PATH,
    exist_ok=True,
)

logger.info(
    f"Certificate storage path ready: {settings.CERTIFICATE_STORAGE_PATH}"
)

# =========================
# FASTAPI APP
# =========================
app = FastAPI(
    title=settings.APP_NAME,
    debug=settings.DEBUG,
)

# =========================
# CORS
# =========================
allowed_origins = []

if settings.FRONTEND_URL:
    allowed_origins.append(
        settings.FRONTEND_URL
    )

# Local development fallback
if settings.DEBUG:
    allowed_origins.extend(
        [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
        ]
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logger.info(
    f"CORS configured for: {allowed_origins}"
)

# =========================
# ROUTERS
# =========================
app.include_router(
    auth_router
)

app.include_router(
    projects_router
)

app.include_router(
    marketplace_router
)

app.include_router(
    purchases_router
)

app.include_router(
    blockchain_router
)

app.include_router(
    certificates_router
)

app.include_router(
    admin_router
)

app.include_router(
    auditor_router
)

# =========================
# ROOT ENDPOINT
# =========================
@app.get("/")
def root():
    return {
        "app_name": settings.APP_NAME,
        "environment": settings.APP_ENV,
        "status": "running",
        "blockchain_enabled": settings.ENABLE_BLOCKCHAIN,
        "satellite_verification_enabled": settings.ENABLE_SATELLITE_VERIFICATION,
        "marketplace_enabled": settings.ENABLE_MARKETPLACE,
        "certificates_enabled": settings.ENABLE_CERTIFICATES,
    }


# =========================
# HEALTH CHECK
# =========================
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "environment": settings.APP_ENV,
        "database": "configured",
        "redis": bool(
            settings.REDIS_URL
        ),
        "planetary_computer": bool(
            settings.PLANETARY_COMPUTER_API_KEY
        ),
        "blockchain": settings.ENABLE_BLOCKCHAIN,
    }


# =========================
# STARTUP EVENT
# =========================
@app.on_event("startup")
async def startup_event():
    logger.info(
        f"{settings.APP_NAME} startup complete."
    )


# =========================
# SHUTDOWN EVENT
# =========================
@app.on_event("shutdown")
async def shutdown_event():
    logger.info(
        f"{settings.APP_NAME} shutdown complete."
    )

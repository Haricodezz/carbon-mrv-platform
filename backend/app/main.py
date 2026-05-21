import os
import logging

from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
import time

from app.core.config import settings

# ... (API Routers remain unchanged)
from app.api.auth import router as auth_router
from app.api.projects import router as projects_router
from app.api.marketplace import router as marketplace_router
from app.api.blockchain import router as blockchain_router
from app.api.certificates import router as certificates_router
from app.api.admin import router as admin_router
from app.api.auditor import router as auditor_router
from app.api.purchases import router as purchases_router
from app.api.wallet import router as wallet_router
from app.api.blog import router as blog_router
from app.api.notifications import router as notifications_router
from app.api.kyc import router as kyc_router
from app.api.land_verification import router as land_verification_router

# =========================
# LOGGING CONFIG
# =========================
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
    format="%(asctime)s - %(levelname)s - %(name)s - %(message)s",
)

logger = logging.getLogger(__name__)

logger.info(f"Starting {settings.APP_NAME} in {settings.APP_ENV} mode...")

# =========================
# CERTIFICATE STORAGE SETUP
# =========================
os.makedirs(settings.CERTIFICATE_STORAGE_PATH, exist_ok=True)
logger.info(f"Certificate storage path ready: {settings.CERTIFICATE_STORAGE_PATH}")

# =========================
# FASTAPI APP
# =========================
# Show Swagger UI if DEBUG is True OR if we are not in explicit production mode
show_docs = settings.DEBUG or settings.APP_ENV.lower() != "production"

app = FastAPI(
    title=settings.APP_NAME,
    debug=settings.DEBUG,
    docs_url="/docs" if show_docs else None,
    redoc_url="/redoc" if show_docs else None,
)

# =========================
# SECURITY HEADERS MIDDLEWARE
# =========================

RATE_LIMIT_WINDOW = 60  # seconds
MAX_REQUESTS_PER_WINDOW = 100
ip_request_counts = {}

class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        client_ip = request.client.host if request.client else "unknown"
        current_time = time.time()

        if client_ip not in ip_request_counts:
            ip_request_counts[client_ip] = []

        # Filter out old requests
        ip_request_counts[client_ip] = [
            req_time for req_time in ip_request_counts[client_ip] 
            if current_time - req_time < RATE_LIMIT_WINDOW
        ]

        if len(ip_request_counts[client_ip]) >= MAX_REQUESTS_PER_WINDOW:
            from fastapi.responses import JSONResponse
            return JSONResponse(status_code=429, content={"detail": "Too Many Requests"})

        ip_request_counts[client_ip].append(current_time)
        return await call_next(request)

# RateLimitMiddleware is registered AFTER CORSMiddleware below
# so that CORS (outermost layer) handles OPTIONS preflights first.

# =========================
# SECURITY HEADERS MIDDLEWARE
# =========================
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        return response

app.add_middleware(SecurityHeadersMiddleware)

# =========================
# CORS  (must be added FIRST so OPTIONS preflights are handled
# before RateLimit / SecurityHeaders middleware can reject them)
# =========================
allowed_origins = [
    # Always allow localhost for development / healthchecks
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

if settings.FRONTEND_URL:
    origin = settings.FRONTEND_URL.strip().rstrip("/")
    # Normalise: ensure a scheme is present so the browser Origin header matches
    if origin and not origin.startswith(("http://", "https://")):
        origin = f"https://{origin}"
    if origin and origin not in allowed_origins:
        allowed_origins.append(origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Register RateLimit AFTER CORS so CORS is the outermost middleware
# and handles OPTIONS preflights before rate-limiting kicks in.
if not settings.DEBUG:
    app.add_middleware(RateLimitMiddleware)

logger.info(
    f"CORS configured for: {allowed_origins}"
)

from app.api.reports import router as reports_router

# =========================
# ROUTERS
# =========================
app.include_router(reports_router)
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
    wallet_router
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

app.include_router(
    blog_router
)

app.include_router(
    notifications_router
)

app.include_router(
    kyc_router
)

app.include_router(
    land_verification_router
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
    # Auto-create default admin and auditor on first boot
    try:
        from app.db.create_admin import create_default_admin
        from app.db.create_auditor import create_default_auditor

        create_default_admin()
        create_default_auditor()
        logger.info("Default admin and auditor accounts ensured.")
    except Exception as e:
        logger.warning(f"Seed data creation skipped: {e}")

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

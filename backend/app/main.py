from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.init_db import init_db
from app.db.create_admin import create_default_admin
from app.db.create_auditor import create_default_auditor

from app.api.auth import router as auth_router
from app.api.admin import router as admin_router
from app.api.auditor import router as auditor_router
from app.api.projects import router as projects_router
from app.api.wallet import router as wallet_router


app = FastAPI(
    title=settings.APP_NAME,
    debug=settings.DEBUG
)

# CORS Middleware for frontend-backend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routes
app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(auditor_router)
app.include_router(projects_router)
app.include_router(wallet_router)


@app.on_event("startup")
def startup():
    init_db()
    create_default_admin()
    create_default_auditor()


@app.get("/")
def root():
    return {
        "message": f"{settings.APP_NAME} API is running successfully."
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }
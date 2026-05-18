from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # =========================
    # APP CONFIGURATION
    # =========================
    APP_NAME: str = "Carbon MRV Platform"
    APP_ENV: str = "production"
    ENVIRONMENT: str = "production"
    DEBUG: bool = False

    # =========================
    # SECURITY
    # =========================
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080

    # =========================
    # DATABASE
    # =========================
    DATABASE_URL: str

    # =========================
    # FRONTEND / CORS
    # =========================
    FRONTEND_URL: str = ""

    # =========================
    # SUPABASE
    # =========================
    SUPABASE_URL: str
    SUPABASE_KEY: str
    SUPABASE_SERVICE_ROLE_KEY: str

    # =========================
    # REDIS / CELERY
    # =========================
    REDIS_URL: str | None = None
    CELERY_BROKER_URL: str | None = None
    CELERY_RESULT_BACKEND: str | None = None

    # =========================
    # SATELLITE / GIS APIs
    # =========================
    PLANETARY_COMPUTER_API_KEY: str | None = None
    SENTINEL_HUB_CLIENT_ID: str | None = None
    SENTINEL_HUB_CLIENT_SECRET: str | None = None
    NASA_GEDI_DATA_SOURCE: str = "enabled"

    # =========================
    # RAZORPAY
    # =========================
    RAZORPAY_KEY_ID: str | None = None
    RAZORPAY_KEY_SECRET: str | None = None
    RAZORPAY_WEBHOOK_SECRET: str | None = None

    # =========================
    # CRYPTO / WEB3
    # =========================
    CRYPTO_ENABLED: bool = True
    ENABLE_BLOCKCHAIN: bool = True

    POLYGON_RPC_URL: str | None = None
    BLOCKCHAIN_RPC_URL: str | None = None

    USDT_CONTRACT_ADDRESS: str | None = None
    USDC_CONTRACT_ADDRESS: str | None = None

    MASTER_WALLET_PRIVATE_KEY: str | None = None
    MASTER_WALLET_ADDRESS: str | None = None

    PRIVATE_KEY: str | None = None

    MIN_CONFIRMATIONS: int = 12

    CARBON_TOKEN_CONTRACT_ADDRESS: str | None = None
    BLOCKCHAIN_CONTRACT_ADDRESS: str | None = None
    BLOCKCHAIN_CHAIN_ID: int = 137

    # =========================
    # MACHINE LEARNING
    # =========================
    MODEL_PATH: str = "ml/models/carbon_model.pkl"
    ENABLE_ADVANCED_BIOMASS: bool = True
    FRAUD_RISK_THRESHOLD: int = 65

    # =========================
    # CERTIFICATES
    # =========================
    CERTIFICATE_STORAGE_PATH: str = "storage/certificates/"
    ENABLE_CERTIFICATES: bool = True

    # =========================
    # MARKETPLACE
    # =========================
    ENABLE_MARKETPLACE: bool = True
    DEFAULT_CREDIT_PRICE_INR: int = 1000

    # =========================
    # ADMIN
    # =========================
    DEFAULT_ADMIN_EMAIL: str
    DEFAULT_ADMIN_PASSWORD: str

    # =========================
    # AUDITOR
    # =========================
    DEFAULT_AUDITOR_EMAIL: str
    DEFAULT_AUDITOR_PASSWORD: str

    # =========================
    # EMAIL / OTP
    # =========================
    SMTP_HOST: str | None = None
    SMTP_PORT: str | None = None
    SMTP_USER: str | None = None
    SMTP_PASS: str | None = None
    EMAIL_FROM: str | None = None

    # =========================
    # LOGGING
    # =========================
    LOG_LEVEL: str = "INFO"

    # =========================
    # FILE SECURITY
    # =========================
    MAX_UPLOAD_SIZE_MB: int = 25

    # =========================
    # FEATURE FLAGS
    # =========================
    ENABLE_SATELLITE_VERIFICATION: bool = True
    ENABLE_POLYGON_VALIDATION: bool = True
    ENABLE_AUDIT_LOGGING: bool = True
    ENABLE_FRAUD_ANALYTICS: bool = True

    # =========================
    # MODEL CONFIG
    # =========================
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
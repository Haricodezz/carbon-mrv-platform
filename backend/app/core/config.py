from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # App
    APP_NAME: str
    APP_ENV: str
    DEBUG: bool

    # Security
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int

    # Database
    DATABASE_URL: str

    # Supabase
    SUPABASE_URL: str
    SUPABASE_KEY: str
    SUPABASE_SERVICE_ROLE_KEY: str

    # Razorpay
    RAZORPAY_KEY_ID: str
    RAZORPAY_KEY_SECRET: str
    RAZORPAY_WEBHOOK_SECRET: str

    # Crypto
    CRYPTO_ENABLED: bool
    POLYGON_RPC_URL: str
    USDT_CONTRACT_ADDRESS: str
    USDC_CONTRACT_ADDRESS: str
    MASTER_WALLET_PRIVATE_KEY: str
    MASTER_WALLET_ADDRESS: str
    MIN_CONFIRMATIONS: int

    # ML
    MODEL_PATH: str

    # Certificates
    CERTIFICATE_STORAGE_PATH: str

    # Admin
    DEFAULT_ADMIN_EMAIL: str
    DEFAULT_ADMIN_PASSWORD: str
    # Auditor
    DEFAULT_AUDITOR_EMAIL: str
    DEFAULT_AUDITOR_PASSWORD: str
    # Email
    SMTP_HOST: str | None = None
    SMTP_PORT: str | None = None
    SMTP_USER: str | None = None
    SMTP_PASS: str | None = None

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache
def get_settings():
    return Settings()


settings = get_settings()


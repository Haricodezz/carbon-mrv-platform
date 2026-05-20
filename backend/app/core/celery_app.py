from celery import Celery
from app.core.config import settings


# =========================
# DETECT BROKER AVAILABILITY
# =========================
def _broker_is_configured() -> bool:
    """Return True only when a real Redis/broker URL is provided."""
    url = settings.CELERY_BROKER_URL or ""
    if not url or url.startswith("redis://default:your_") or "your_redis" in url:
        return False
    return True


_broker_available = _broker_is_configured()

# =========================
# CELERY INSTANCE
# =========================
celery_app = Celery(
    "carbon_mrv_platform",
    broker=settings.CELERY_BROKER_URL if _broker_available else None,
    backend=settings.CELERY_RESULT_BACKEND if _broker_available else None,
)

# =========================
# CELERY CONFIGURATION
# =========================
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Kolkata",
    enable_utc=True,

    # Worker settings
    worker_prefetch_multiplier=1,
    task_acks_late=True,
    task_reject_on_worker_lost=True,

    # Retry behavior
    broker_connection_retry_on_startup=True,

    # Task tracking
    task_track_started=True,

    # Result expiration
    result_expires=3600,

    # Beat scheduler
    beat_schedule={
        "daily-project-reverification": {
            "task": "app.tasks.project_tasks.reverify_marketplace_projects",
            "schedule": 86400.0,  # Every 24 hours
        },
    },
)

# =========================
# EAGER MODE (LOCAL DEV)
# =========================
# When no broker is configured, run tasks synchronously
# in-process so the backend works without Redis.
if not _broker_available or settings.DEBUG:
    celery_app.conf.update(
        task_always_eager=True,
        task_eager_propagates=True,
    )

# =========================
# TASK DISCOVERY
# =========================
celery_app.autodiscover_tasks(
    [
        "app.tasks.project_tasks",
        "app.tasks.blockchain_tasks",
        "app.tasks.certificate_tasks",
    ]
)
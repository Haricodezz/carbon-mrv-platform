from celery import Celery
from app.core.config import settings


# =========================
# CELERY INSTANCE
# =========================
celery_app = Celery(
    "carbon_mrv_platform",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
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
# TASK DISCOVERY
# =========================
celery_app.autodiscover_tasks(
    [
        "app.tasks.project_tasks",
        "app.tasks.blockchain_tasks",
        "app.tasks.certificate_tasks",
    ]
)

# =========================
# OPTIONAL DEBUG
# =========================
if settings.DEBUG:
    celery_app.conf.update(
        task_always_eager=False,
    )
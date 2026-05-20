from datetime import datetime, timedelta, timezone


def sentinel_search_datetime_range(months_back: int = 18) -> str:
    """Return a STAC datetime filter covering recent Sentinel-2 scenes."""
    end = datetime.now(timezone.utc).date()
    start = end - timedelta(days=30 * months_back)
    return f"{start.isoformat()}/{end.isoformat()}"

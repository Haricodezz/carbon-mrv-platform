from app.db.session import engine
from sqlalchemy import text

with engine.connect() as conn:
    tables = conn.execute(text(
        "SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename"
    )).fetchall()
    print("Tables:", [t[0] for t in tables])

    cols = conn.execute(text(
        "SELECT column_name FROM information_schema.columns WHERE table_name='projects' AND column_name IN ('lifecycle_status','credits_issued','issued_by')"
    )).fetchall()
    print("New project cols:", [c[0] for c in cols])

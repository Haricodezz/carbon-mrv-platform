from app.db.session import engine, Base

# Import all models
from app.models import *


def init_db():
    Base.metadata.create_all(bind=engine)
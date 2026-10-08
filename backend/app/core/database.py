import logging
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.core.config import settings

logger = logging.getLogger("driva.database")


def create_app_engine():
    db_url = settings.DATABASE_URL
    if db_url.startswith("sqlite"):
        return create_engine(
            db_url,
            connect_args={"check_same_thread": False},
        )

    # Try PostgreSQL first
    try:
        eng = create_engine(
            db_url,
            pool_pre_ping=True,
            pool_size=10,
            max_overflow=20,
        )
        with eng.connect() as conn:
            pass
        return eng
    except Exception as e:
        db_path = Path(__file__).parent.parent.parent / "driva.db"
        sqlite_fallback = f"sqlite:///{db_path}"
        print(f"[DRIVA DB] Note: PostgreSQL at {db_url} unavailable ({e}). Using local SQLite: {sqlite_fallback}")
        return create_engine(
            sqlite_fallback,
            connect_args={"check_same_thread": False},
        )


engine = create_app_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


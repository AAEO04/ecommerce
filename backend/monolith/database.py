import os
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from utils import constants


# === 1️⃣ Load environment variables (works in both local and Docker) ===
# If running locally, look for the .env file in project root: C:\Users\allio\Desktop\madrush\.env
BASE_DIR = Path(__file__).resolve().parent.parent  # -> .../madrush
ENV_PATH = BASE_DIR / ".env"

if ENV_PATH.exists():
    load_dotenv(dotenv_path=ENV_PATH, override=True)
    print(f"✅ Loaded environment variables from: {ENV_PATH}")
else:
    print(f"⚠️  .env file not found at {ENV_PATH}, relying on system environment variables.")


# === 2️⃣ Build or read database connection URL ===
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    DATABASE_USER = os.getenv("DATABASE_USER")
    DATABASE_PASSWORD = os.getenv("DATABASE_PASSWORD")
    DATABASE_HOST = os.getenv("DATABASE_HOST", "localhost")
    DATABASE_PORT = os.getenv("DATABASE_PORT", "5432")
    DATABASE_NAME = os.getenv("DATABASE_NAME")

    # Debug info (can be toggled off)
    print(f"DEBUG: DATABASE_USER = {DATABASE_USER}")
    print(f"DEBUG: DATABASE_NAME = {DATABASE_NAME}")
    print(f"DEBUG: DATABASE_HOST = {DATABASE_HOST}")

    # Validation
    if not all([DATABASE_USER, DATABASE_PASSWORD, DATABASE_HOST, DATABASE_PORT, DATABASE_NAME]):
        raise ValueError(
            "FATAL: DATABASE_URL not set, and one or more individual database environment variables are missing."
        )

    DATABASE_URL = f"postgresql://{DATABASE_USER}:{DATABASE_PASSWORD}@{DATABASE_HOST}:{DATABASE_PORT}/{DATABASE_NAME}"

print(f"📦 Using database URL: {DATABASE_URL}")


# === 3️⃣ Create SQLAlchemy engine & session ===
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_size=getattr(constants, "DB_POOL_SIZE", 5),
    max_overflow=getattr(constants, "DB_MAX_OVERFLOW", 10),
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# === 4️⃣ Database session dependency for FastAPI ===
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# === 5️⃣ Optional sanity check ===
if __name__ == "__main__":
    try:
        with engine.connect() as conn:
            print("✅ Database connection successful!")
    except Exception as e:
        print(f"❌ Database connection failed: {e}")

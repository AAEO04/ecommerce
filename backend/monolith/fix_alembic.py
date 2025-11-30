import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get database URL
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    # Fallback to constructing it if URL not directly set
    user = os.getenv("POSTGRES_USER", "madrush_user")
    password = os.getenv("POSTGRES_PASSWORD", "madrush_password")
    host = os.getenv("DATABASE_HOST", "localhost")
    port = os.getenv("DATABASE_PORT", "5432")
    db = os.getenv("POSTGRES_DB", "madrush_db")
    DATABASE_URL = f"postgresql://{user}:{password}@{host}:{port}/{db}"

print(f"Connecting to: {DATABASE_URL}")

try:
    engine = create_engine(DATABASE_URL)
    with engine.connect() as connection:
        # Check current version
        result = connection.execute(text("SELECT version_num FROM alembic_version"))
        current_version = result.scalar()
        print(f"Current version: {current_version}")

        # Update version
        print("Updating version to '1b8e80f66db3'...")
        connection.execute(text("UPDATE alembic_version SET version_num = '1b8e80f66db3'"))
        connection.commit()
        
        # Verify update
        result = connection.execute(text("SELECT version_num FROM alembic_version"))
        new_version = result.scalar()
        print(f"New version: {new_version}")
        print("Success!")

except Exception as e:
    print(f"Error: {e}")

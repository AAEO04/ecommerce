import sys
import os
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Add the parent directory to the sys.path to allow imports from the monolith directory
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__))))

from utils.auth import get_password_hash
from models import AdminUser, Base
from config import settings

# Setup database connection
DATABASE_URL = settings.DATABASE_URL
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def create_initial_admin(db: Session, username: str, password: str):
    # Check if admin user already exists
    existing_admin = db.query(AdminUser).filter(AdminUser.username == username).first()
    if existing_admin:
        print(f"Admin user '{username}' already exists.")
        return

    hashed_password = get_password_hash(password)
    admin_user = AdminUser(username=username, hashed_password=hashed_password, role="admin")
    db.add(admin_user)
    db.commit()
    db.refresh(admin_user)
    print(f"Admin user '{username}' created successfully!")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python create_admin.py <username> <password>")
        sys.exit(1)

    username = sys.argv[1]
    password = sys.argv[2]

    # Ensure tables are created if running in dev mode
    if os.getenv("DEV_MODE") == "true":
        Base.metadata.create_all(bind=engine)
        print("DEV MODE: Database tables created/verified for admin user creation.")

    db = SessionLocal()
    try:
        create_initial_admin(db, username, password)
    except Exception as e:
        print(f"An error occurred: {e}")
        db.rollback()
    finally:
        db.close()

import sys
import getpass
from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import AdminUser, Base
from utils.constants import ADMIN_ROLE
from utils.auth import get_password_hash


def create_initial_admin(db: Session, username: str, password: str):
    # ... (rest of the file)


def main():
    Base.metadata.create_all(bind=engine)

    if len(sys.argv) != 2:
        print("Usage: python create_admin.py <username>")
        sys.exit(1)

    username = sys.argv[1]
    password = getpass.getpass("Enter admin password: ")

    db = SessionLocal()
    try:
        create_initial_admin(db, username, password)
    finally:
        db.close()
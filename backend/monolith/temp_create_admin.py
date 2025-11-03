from database import SessionLocal
from models import AdminUser
from utils.auth import get_password_hash

db = SessionLocal()

username = "admin@madrush.com"
password = "admin123"

hashed_password = get_password_hash(password)

new_admin = AdminUser(
    username=username,
    hashed_password=hashed_password,
    role="admin",
    is_active=True
)

db.add(new_admin)
db.commit()
db.close()

print(f"Admin user '{username}' created successfully.")
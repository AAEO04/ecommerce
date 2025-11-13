"""
Database Seeding Script
Seeds initial data for development and testing
"""
import sys
from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import (
    AdminUser, Category, Product, ProductVariant, 
    ProductImage, Customer, Order, OrderItem, Payment
)
from utils.auth import get_password_hash
from decimal import Decimal
from datetime import datetime, timezone
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def seed_admin_users(db: Session):
    """Seed admin users"""
    logger.info("Seeding admin users...")
    
    # Check if admin exists
    existing = db.query(AdminUser).filter(AdminUser.email == "admin@madrush.com").first()
    if existing:
        logger.info("Admin user already exists, skipping...")
        return
    
    admin = AdminUser(
        email="admin@madrush.com",
        hashed_password=get_password_hash("admin123"),
        role="super_admin",
        is_active=True,
        created_at=datetime.now(timezone.utc)
    )
    db.add(admin)
    
    # Add more test admins
    test_admin = AdminUser(
        email="test@madrush.com",
        hashed_password=get_password_hash("test123"),
        role="admin",
        is_active=True,
        created_at=datetime.utcnow()
    )
    db.add(test_admin)
    
    db.commit()
    logger.info("✅ Admin users seeded")


def seed_categories(db: Session):
    """Seed product categories"""
    logger.info("Seeding categories...")
    
    categories = [
        {"name": "Tank Top", "slug": "tank-top", "description": "Sleeveless athletic and casual tank tops"},
        {"name": "Crop Top", "slug": "crop-top", "description": "Trendy cropped tops for all occasions"},
        {"name": "Tees", "slug": "tees", "description": "Classic and comfortable t-shirts"},
        {"name": "Beanies", "slug": "beanies", "description": "Warm and stylish beanies"},
        {"name": "Cap", "slug": "cap", "description": "Fashionable caps and baseball hats"},
        {"name": "Hoodies", "slug": "hoodies", "description": "Cozy fleece hoodies"},

    ]
    
    for cat_data in categories:
        existing = db.query(Category).filter(Category.slug == cat_data["slug"]).first()
        if not existing:
            category = Category(**cat_data, is_active=True)
            db.add(category)
    
    db.commit()
    logger.info("✅ Categories seeded")


def seed_products(db: Session):
    """Seed products with variants and images"""
    logger.info("Seeding products...")
    
    products_data = [
        {
            "name": "Classic White T-Shirt",
            "description": "Premium cotton t-shirt with a classic fit. Perfect for everyday wear.",
            "category": "tees",
            "variants": [
                {"size": "S", "color": "White", "price": 5000, "stock": 50, "sku": "TS-WHT-S"},
                {"size": "M", "color": "White", "price": 5000, "stock": 100, "sku": "TS-WHT-M"},
                {"size": "L", "color": "White", "price": 5000, "stock": 75, "sku": "TS-WHT-L"},
                {"size": "XL", "color": "White", "price": 5500, "stock": 30, "sku": "TS-WHT-XL"},
            ],
            "images": [
                {"url": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab", "alt": "White T-Shirt Front", "is_primary": True},
            ]
        },
        {
            "name": "Black Hoodie",
            "description": "Cozy fleece hoodie with kangaroo pocket. Stay warm in style.",
            "category": "hoodies",
            "variants": [
                {"size": "M", "color": "Black", "price": 15000, "stock": 40, "sku": "HD-BLK-M"},
                {"size": "L", "color": "Black", "price": 15000, "stock": 60, "sku": "HD-BLK-L"},
                {"size": "XL", "color": "Black", "price": 16000, "stock": 25, "sku": "HD-BLK-XL"},
            ],
            "images": [
                {"url": "https://images.unsplash.com/photo-1556821840-3a63f95609a7", "alt": "Black Hoodie", "is_primary": True},
            ]
        },
    ]
    
    for prod_data in products_data:
        # Check if product exists
        existing = db.query(Product).filter(Product.name == prod_data["name"]).first()
        if existing:
            logger.info(f"Product '{prod_data['name']}' already exists, skipping...")
            continue
        
        # Create product
        product = Product(
            name=prod_data["name"],
            description=prod_data["description"],
            category=prod_data["category"],
            is_active=True,
            created_at=datetime.utcnow()
        )
        db.add(product)
        db.flush()  # Get product ID
        
        # Add variants
        for var_data in prod_data["variants"]:
            variant = ProductVariant(
                product_id=product.id,
                size=var_data["size"],
                color=var_data["color"],
                price=Decimal(var_data["price"]),
                stock_quantity=var_data["stock"],
                sku=var_data["sku"],
                is_active=True
            )
            db.add(variant)
        
        # Add images
        for idx, img_data in enumerate(prod_data["images"]):
            image = ProductImage(
                product_id=product.id,
                image_url=img_data["url"],
                alt_text=img_data["alt"],
                is_primary=img_data.get("is_primary", False),
                display_order=idx
            )
            db.add(image)
    
    db.commit()
    logger.info("✅ Products seeded")


def seed_customers(db: Session):
    """Seed test customers"""
    logger.info("Seeding customers...")
    
    customers_data = [
        {
            "email": "customer1@test.com",
            "phone": "08012345678",
            "first_name": "John",
            "last_name": "Doe"
        },
        {
            "email": "customer2@test.com",
            "phone": "08087654321",
            "first_name": "Jane",
            "last_name": "Smith"
        },
    ]
    
    for cust_data in customers_data:
        existing = db.query(Customer).filter(Customer.email == cust_data["email"]).first()
        if not existing:
            customer = Customer(**cust_data, created_at=datetime.utcnow())
            db.add(customer)
    
    db.commit()
    logger.info("✅ Customers seeded")


def clear_all_data(db: Session):
    """Clear all data from database (for testing)"""
    logger.warning("⚠️  Clearing all data from database...")
    
    try:
        # Delete in correct order (respecting foreign keys)
        db.query(Payment).delete()
        db.query(OrderItem).delete()
        db.query(Order).delete()
        db.query(Customer).delete()
        db.query(ProductImage).delete()
        db.query(ProductVariant).delete()
        db.query(Product).delete()
        db.query(Category).delete()
        db.query(AdminUser).delete()
        
        db.commit()
        logger.info("✅ All data cleared")
    except Exception as e:
        db.rollback()
        logger.error(f"❌ Error clearing data: {e}")
        raise


def seed_all(clear_first=False):
    """Seed all data"""
    db = SessionLocal()
    
    try:
        if clear_first:
            clear_all_data(db)
        
        logger.info("🌱 Starting database seeding...")
        
        seed_admin_users(db)
        seed_categories(db)
        seed_products(db)
        seed_customers(db)
        
        logger.info("✅ Database seeding completed successfully!")
        
    except Exception as e:
        logger.error(f"❌ Error during seeding: {e}")
        db.rollback()
        raise
    finally:
        db.close()


def create_production_admin(email: str, password: str):
    """Create a production admin user with custom credentials"""
    db = SessionLocal()
    
    try:
        # Validate password strength
        if len(password) < 8:
            raise ValueError("Password must be at least 8 characters long")
        
        # Check if admin exists
        existing = db.query(AdminUser).filter(AdminUser.email == email).first()
        if existing:
            logger.error(f"Admin user '{email}' already exists!")
            return False
        
        # Create admin
        admin = AdminUser(
            email=email,
            hashed_password=get_password_hash(password),
            role="super_admin",
            is_active=True,
            created_at=datetime.utcnow()
        )
        
        db.add(admin)
        db.commit()
        
        logger.info(f"✅ Production admin created: {email}")
        return True
        
    except Exception as e:
        logger.error(f"Error creating production admin: {e}")
        db.rollback()
        return False
    finally:
        db.close()


if __name__ == "__main__":
    import argparse
    import getpass
    
    parser = argparse.ArgumentParser(description="Database seeding and admin management")
    parser.add_argument("--clear", action="store_true", help="Clear all data before seeding")
    parser.add_argument("--create-admin", action="store_true", help="Create a production admin user")
    parser.add_argument("--email", type=str, help="Admin email")
    parser.add_argument("--password", type=str, help="Admin password (not recommended, use interactive)")
    args = parser.parse_args()
    
    if args.create_admin:
        # Create production admin
        email = args.email or input("Enter admin email: ").strip()
        
        if args.password:
            logger.warning("⚠️  Passing password as argument is insecure!")
            password = args.password
        else:
            password = getpass.getpass("Enter admin password (min 8 chars): ")
            password_confirm = getpass.getpass("Confirm password: ")
            
            if password != password_confirm:
                logger.error("Passwords do not match!")
                exit(1)
        
        create_production_admin(email, password)
    else:
        # Seed database
        seed_all(clear_first=args.clear)

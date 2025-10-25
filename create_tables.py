#!/usr/bin/env python3
"""
Script to manually create all database tables
Run this after fixing PostgreSQL permissions
"""

from database import engine
import models

def create_tables():
    try:
        # Create all tables defined in models.py
        models.Base.metadata.create_all(bind=engine)
        print("✅ All tables created successfully!")

        # List all created tables
        print("\nCreated tables:")
        for table_name in models.Base.metadata.tables.keys():
            print(f"  - {table_name}")

    except Exception as e:
        print(f"ERROR: Error creating tables: {e}")
        print("Make sure PostgreSQL permissions are correct")

if __name__ == "__main__":
    create_tables()

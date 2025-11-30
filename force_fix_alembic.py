from sqlalchemy import create_engine, text

# URL taken directly from user logs
DATABASE_URL = "postgresql://madrush_user:madrush_password@localhost:5432/madrush_db"

print(f"Connecting to: {DATABASE_URL}")

try:
    engine = create_engine(DATABASE_URL)
    with engine.connect() as connection:
        # Check current version
        result = connection.execute(text("SELECT version_num FROM alembic_version"))
        current_version = result.scalar()
        print(f"Current version in DB: {current_version}")

        # Delete all rows first to handle multiple versions/duplicates
        print("Clearing alembic_version table...")
        connection.execute(text("DELETE FROM alembic_version"))
        
        # Insert correct version
        target_version = '1b8e80f66db3'
        print(f"Inserting version '{target_version}'...")
        connection.execute(text(f"INSERT INTO alembic_version (version_num) VALUES ('{target_version}')"))
        connection.commit()
        
        # Verify update
        result = connection.execute(text("SELECT version_num FROM alembic_version"))
        rows = result.fetchall()
        print(f"Versions in DB: {[row[0] for row in rows]}")
        
        if len(rows) == 1 and rows[0][0] == target_version:
            print("SUCCESS: Database version fixed.")
        else:
            print("FAILURE: Database version incorrect.")

except Exception as e:
    print(f"ERROR: {e}")

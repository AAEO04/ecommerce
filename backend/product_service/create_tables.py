import psycopg2

# --- Database Connection Details ---
DB_NAME = "yourbrand_db"
DB_USER = "youruser"
DB_PASSWORD = "yourpassword"
DB_HOST = "localhost"
DB_PORT = "5432"

# --- SQL Commands to Create All Tables ---
CREATE_TABLES_SQL = """
CREATE TABLE IF NOT EXISTS Products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ProductVariants (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES Products(id) ON DELETE CASCADE,
    size VARCHAR(50) NOT NULL,
    color VARCHAR(50),
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    price NUMERIC(10, 2) NOT NULL,
    UNIQUE (product_id, size, color)
);

CREATE TABLE IF NOT EXISTS Orders (
    id SERIAL PRIMARY KEY,
    status VARCHAR(50) NOT NULL DEFAULT 'paid',
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    shipping_address TEXT NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS OrderItems (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES Orders(id),
    variant_id INTEGER NOT NULL REFERENCES ProductVariants(id),
    quantity INTEGER NOT NULL,
    price NUMERIC(10, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS ProductImages (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES Products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    display_order INTEGER DEFAULT 0
);
"""

def create_db_tables():
    conn = None
    try:
        conn = psycopg2.connect(
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST,
            port=DB_PORT
        )
        cur = conn.cursor()
        cur.execute(CREATE_TABLES_SQL)
        conn.commit()
        print("All tables created or already exist successfully!")
        cur.close()
    except (Exception, psycopg2.DatabaseError) as error:
        print(f"Error while creating tables: {error}")
    finally:
        if conn is not None:
            conn.close()

if __name__ == '__main__':
    create_db_tables()
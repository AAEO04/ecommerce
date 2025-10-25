# MAD RUSH E-commerce - Monolithic Backend

## Quick Start

### 1. Install Dependencies
```bash
cd ecommerce/backend/monolith
python -m venv venv

# Windows
.\venv\Scripts\Activate.ps1

# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt
```

### 2. Configure Environment
Set the `DATABASE_URL` environment variable:

**Windows PowerShell:**
```powershell
$env:DATABASE_URL="postgresql://madrush_user:madrush_password@localhost:5432/madrush_db"
```

**Linux/Mac:**
```bash
export DATABASE_URL="postgresql://madrush_user:madrush_password@localhost:5432/madrush_db"
```

Or create a `.env` file with your configuration (see `.env.example` in the root directory).

### 3. Start the Server
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 4. Access the API
- **API**: http://localhost:8000
- **Docs**: http://localhost:8000/docs
- **Health**: http://localhost:8000/health

### 5. Start Frontend Applications
Both frontend applications are already configured to use port 8000:

**Customer Store:**
```bash
cd ../../frontend/customer_store
npm run dev
# Visit: http://localhost:3000
```

**Admin Panel:**
```bash
cd ../../frontend/admin_panel
npm run dev
# Visit: http://localhost:3001
```

## API Endpoints

### Products
- `GET /api/products/` - List products
- `GET /api/products/{id}` - Get product details

### Admin
- `GET /api/admin/dashboard/stats` - Dashboard data
- `GET /api/admin/products` - Manage products
- `GET /api/admin/orders` - Manage orders

### Orders
- `POST /api/orders/checkout` - Process checkout
- `GET /api/orders/{id}` - Get order details

## Notes

- **Database**: Requires PostgreSQL (ensure it's running)
- **Redis**: Optional for caching (works without it)
- **Paystack**: Configure keys for payment processing
- **Email**: Configure SMTP for order notifications

See `MONOLITHIC_MIGRATION_COMPLETE.md` in the root for full documentation.


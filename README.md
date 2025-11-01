# MAD RUSH E-commerce Platform

A comprehensive e-commerce platform built with a Python FastAPI monolithic backend and React/Next.js frontends. Perfect for streetwear and urban fashion brands.

## 🚀 Features

### Backend Services
- **Monolithic FastAPI Application**: A single, unified FastAPI application serving all backend logic, including:
    - Product Management: Full CRUD for products, variants, and categories.
    - Order Processing: Guest checkout, order tracking, and status management.
    - Admin Dashboard: Endpoints for statistics and store management.
    - Payment Integration: Support for Paystack.
    - Notifications: Email notifications for orders.

### Frontend Applications
- **Customer Store**: Modern Next.js storefront with MAD RUSH branding
- **Admin Panel**: Next.js-based admin interface for product and order management

### Key Features
- ✅ Monolithic architecture with Docker for simplified deployment
- ✅ PostgreSQL database with comprehensive models
- ✅ Redis caching for performance
- ✅ RabbitMQ message queuing
- ✅ Payment processing (Paystack integration)
- ✅ Email and SMS notifications
- ✅ Responsive design with Tailwind CSS
- ✅ Rate limiting and security headers
- ✅ Health checks and monitoring
- ✅ Scalable and production-ready

## 🏗️ Current Architecture

The platform is built around a monolithic FastAPI backend, serving both the customer-facing store and the admin panel. Nginx acts as a reverse proxy, routing requests to the appropriate frontend or directly to the backend API.

```
┌─────────────────┐       ┌─────────────────┐
│   Customer      │       │   Admin Panel   │
│   Store         │       │                 │
│   (Next.js)     │       │   (Next.js)     │
└─────────┬───────┘       └─────────┬───────┘
          │                         │
          │     ┌─────────────────┐ │
          └────►│   Nginx         ├─┘
                │   (Reverse Proxy) │
                └─────────┬───────┘
                          │
                          ▼
                ┌─────────────────┐
                │   Monolithic    │
                │   FastAPI       │
                │   Backend       │
                └─────────┬───────┘
                          │
                          ▼
                ┌─────────────────┐
                │   PostgreSQL    │
                │   Redis         │
                │   RabbitMQ      │
                └─────────────────┘
```

## 🛠️ Tech Stack

### Backend
- **RabbitMQ**: Message queuing (for background tasks)

### Frontend
- **Tailwind CSS**: Utility-first CSS framework (used in both frontends)

### Infrastructure
- **Docker & Docker Compose**: Containerization
- **Nginx**: Reverse proxy and load balancer
- **Health Checks**: Service monitoring

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)

### 1. Clone and Setup
```bash
git clone https://github.com/AAEO04/ecommerce.git
cd madrush
cp env.example .env
```

### 2. Configure Environment
Edit `.env` file with your configuration:
```bash
# Update database credentials
DATABASE_USER=your_db_user
DATABASE_PASSWORD=your_db_password

# Add payment keys (optional for development)
PAYSTACK_SECRET_KEY=sk_test_your_key
PAYSTACK_PUBLIC_KEY=pk_test_your_key

# Add email configuration (optional)
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password
```

### 3. Launch the Platform

For production or a quick start, use:
```bash
docker-compose up --build
```

For local development with live-reloading, use the override file:
```bash
docker-compose -f docker-compose.yml -f docker-compose.override.yml up --build
```

### 4. Access the Applications
- **Customer Store**: http://localhost:3000
- **Admin Panel**: http://localhost:3001
- **API Gateway**: http://localhost:8000
- **Database**: localhost:5432
- **Redis**: localhost:6379
- **RabbitMQ Management**: http://localhost:15672

## 📱 Applications

### Customer Store (http://localhost:3000)
Modern e-commerce storefront featuring:
- Hero section with MAD RUSH branding
- Product catalog with filtering and search
- Shopping cart functionality
- Responsive design
- SEO optimization

### Admin Panel (http://localhost:3001)
Complete admin interface for:
- Product management (CRUD operations)
- Order management
- Category management
- Inventory tracking
- Customer management

## 🔧 API Endpoints

### Monolithic API (Port 8000)
- `GET /products/` - List products with filtering
- `GET /products/{id}` - Get product details
- `GET /categories/` - List categories
- `POST /admin/products/` - Create product
- `PUT /admin/products/{id}` - Update product
- `DELETE /admin/products/{id}` - Delete product
- `GET /admin/orders/` - List orders
- `POST /checkout/` - Process checkout
- `GET /orders/{id}` - Get order details
- `PUT /orders/{id}/status` - Update order status
- `POST /notifications/order/{id}` - Send order notification
- `POST /notifications/test-email` - Test email
- `POST /notifications/test-sms` - Test SMS

## 🗄️ Database Schema

### Core Tables
- **products**: Product information
- **productvariants**: Size, color, price, stock
- **productimages**: Product images
- **orders**: Order details
- **orderitems**: Order line items
- **categories**: Product categories
- **customers**: Customer information

## 🔐 Security Features

- Rate limiting on API endpoints
- CORS configuration
- Security headers
- Input validation with Pydantic
- SQL injection prevention
- XSS protection

## 📊 Monitoring

All services include health check endpoints:
- `/health` - Service health status
- Database connectivity checks
- Redis connectivity checks
- External service status

## 🚀 Deployment

### Production Deployment
1. Update environment variables for production
2. Configure SSL certificates
3. Set up domain names
4. Configure email and SMS services
5. Set up monitoring and logging

### Scaling
- Horizontal scaling with Docker Swarm or Kubernetes
- Database read replicas
- Redis clustering
- Load balancing with Nginx

## 🛠️ Development

### Local Development Setup
```bash
# Backend development
cd backend/monolith
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Frontend development
cd frontend/customer_store
npm install
npm run dev
```

#### Using `docker-compose.override.yml` for Development

The `docker-compose.override.yml` file is designed to enhance your local development experience by enabling live-reloading for the `backend`, `customer_store`, and `admin_panel` services. When used with `docker-compose -f docker-compose.yml -f docker-compose.override.yml up --build`, it mounts your local code into the containers, allowing changes to be reflected instantly without rebuilding the images.

To leverage live-reloading, you might need to uncomment the `command` lines in `docker-compose.override.yml` for the services you are actively developing, and ensure your local development servers (e.g., `uvicorn` for backend, `npm run dev` for frontends) are configured for hot-reloading.


### Adding New Features
1. Implement feature in `backend/monolith`
2. Update relevant frontend (customer_store or admin_panel)
3. Add tests if applicable

## 📝 Environment Variables

See `env.example` for all available configuration options.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Email: hello@madrush.com
- Documentation: [Link to docs]
- Issues: [GitHub Issues]

---

**MAD RUSH** - NO CHILLS, Just Style 🚀

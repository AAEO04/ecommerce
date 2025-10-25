# MAD RUSH E-commerce Platform - Integration Guide

This guide explains how to use all the integrated services in your MAD RUSH e-commerce platform.

## 🚀 Quick Start

1. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your actual credentials
   ```

2. **Install dependencies**:
   ```bash
   cd backend/monolith
   pip install -r requirements.txt
   ```

3. **Start services** (using Docker Compose):
   ```bash
   docker-compose up -d
   ```

4. **Run database migrations**:
   ```bash
   alembic upgrade head
   ```

5. **Start the application**:
   ```bash
   uvicorn main:app --reload
   ```

6. **Test integrations**:
   ```bash
   python test_integrations.py
   ```

## 📋 Service Integrations

### 1. Redis Caching

**Purpose**: High-performance caching for frequently accessed data.

**Usage**:
```python
from utils.cache import get_from_cache, set_cache, invalidate_cache

# Set cache
set_cache("products", {"data": "products_list"}, expire=3600)

# Get cache
products = get_from_cache("products")

# Invalidate cache
invalidate_cache(product_id=123)
```

**Configuration**:
```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0
```

### 2. RabbitMQ Message Queuing

**Purpose**: Asynchronous processing of orders, notifications, and payments.

**Queues**:
- `order_processing`: Order creation and processing
- `notifications`: Email and SMS notifications
- `payment_processing`: Payment verification and processing

**Usage**:
```python
from utils.rabbitmq import publish_order_message, publish_notification_message

# Publish order for processing
order_data = {"order_number": "ORD001", "amount": 100.00}
publish_order_message(order_data)

# Publish notification
notification = {"email": "user@example.com", "type": "order_confirmation"}
publish_notification_message(notification)
```

**Configuration**:
```env
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USER=madrush
RABBITMQ_PASSWORD=madrush_password
```

### 3. Paystack Payment Integration

**Purpose**: Secure payment processing for Nigerian customers.

**Features**:
- Payment initialization
- Payment verification
- Bank transfer support
- Transfer recipient management

**Usage**:
```python
from utils.payment import process_payment, verify_payment
from decimal import Decimal

# Process payment
result = process_payment(
    amount=Decimal('100.00'),
    email='customer@example.com',
    reference='PAY_REF_001',
    callback_url='https://yourapp.com/callback'
)

if result['status'] == 'success':
    # Redirect to Paystack
    authorization_url = result['authorization_url']

# Verify payment
verification = verify_payment('PAY_REF_001')
if verification['verified']:
    print("Payment confirmed!")
```

**Configuration**:
```env
PAYSTACK_SECRET_KEY=sk_test_your_secret_key
PAYSTACK_PUBLIC_KEY=pk_test_your_public_key
```

### 4. Email Notifications (SMTP)

**Purpose**: Send order confirmations and marketing emails.

**Features**:
- HTML and text email support
- Beautiful email templates
- Order confirmation emails

**Usage**:
```python
from utils.notifications import send_email

send_email(
    to_email='customer@example.com',
    subject='Order Confirmation',
    html_content='<h1>Order Confirmed!</h1>',
    text_content='Your order has been confirmed.'
)
```

**Configuration**:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SENDER_EMAIL=noreply@madrush.com
```

### 5. SMS Notifications (Twilio)

**Purpose**: Send order updates and marketing SMS.

**Usage**:
```python
from utils.notifications import send_sms

send_sms(
    to_phone='+2348012345678',
    message='Your MAD RUSH order has been confirmed!'
)
```

**Configuration**:
```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

### 6. Database (PostgreSQL)

**Purpose**: Persistent data storage for products, orders, customers.

**Features**:
- Product catalog with variants
- Order management
- Customer profiles
- Categories and inventory

**Setup**:
```bash
# Run migrations
alembic upgrade head

# Create initial data
python -c "from database import SessionLocal; from models import Category; db = SessionLocal(); cat = Category(name='Electronics', slug='electronics'); db.add(cat); db.commit(); db.close()"
```

## 🔧 Configuration

### Environment Variables (.env)

```env
# Database
DATABASE_URL=postgresql://madrush_user:madrush_password@localhost:5432/madrush_db

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0

# RabbitMQ
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USER=madrush
RABBITMQ_PASSWORD=madrush_password

# Paystack
PAYSTACK_SECRET_KEY=sk_test_your_secret_key
PAYSTACK_PUBLIC_KEY=pk_test_your_public_key

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SENDER_EMAIL=noreply@madrush.com

# SMS
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Security
JWT_SECRET_KEY=your_secure_jwt_secret
ENCRYPTION_KEY=your_encryption_key

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
VITE_ADMIN_API_URL=http://localhost:8000/api/admin
VITE_PRODUCT_API_URL=http://localhost:8000/api
```

## 🧪 Testing

Run comprehensive integration tests:

```bash
cd backend/monolith
python test_integrations.py
```

This will test:
- ✅ Redis caching
- ✅ Database connectivity
- ✅ RabbitMQ message queuing
- ✅ Paystack payment integration
- ✅ Email notifications
- ✅ SMS notifications
- ✅ Complete order processing workflow

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Admin Panel   │
│  (Next.js)      │    │   (React/Vite)  │
└─────────┬───────┘    └─────────┬───────┘
          │                     │
└─────────┼─────────────────────┼─────────┘
          │                     │
┌─────────▼─────────────────────▼─────────┐
│          FastAPI Backend                 │
│         (Monolithic)                     │
├─────────────────┬───────────────────────┤
│   Redis Cache   │   RabbitMQ Queue      │
├─────────────────┼───────────────────────┤
│ PostgreSQL DB   │   Paystack API        │
├─────────────────┼───────────────────────┤
│ Email (SMTP)    │   Twilio SMS          │
└─────────────────┴───────────────────────┘
```

## 🔒 Security Considerations

1. **Environment Variables**: Never commit `.env` file to version control
2. **API Keys**: Rotate regularly and use different keys for development/production
3. **Database**: Use strong passwords and SSL in production
4. **HTTPS**: Always use HTTPS in production
5. **CORS**: Configure allowed origins properly

## 🚀 Production Deployment

1. **Environment Setup**:
   - Use production database (AWS RDS, Google Cloud SQL)
   - Set up Redis cluster (ElastiCache, Memorystore)
   - Configure RabbitMQ cluster
   - Set up proper SMTP service (SendGrid, SES)
   - Configure Twilio for SMS

2. **Security**:
   - Enable HTTPS with proper certificates
   - Set secure headers
   - Configure rate limiting
   - Enable database backups
   - Set up monitoring and logging

3. **Performance**:
   - Use connection pooling
   - Enable caching
   - Set up CDN for static assets
   - Configure load balancer
   - Monitor resource usage

## 📞 Support

For issues with integrations:

1. **Check service status**: Ensure PostgreSQL, Redis, RabbitMQ are running
2. **Verify credentials**: Check API keys and connection strings
3. **Run tests**: Use `python test_integrations.py` to diagnose issues
4. **Check logs**: Monitor application and service logs
5. **Network connectivity**: Ensure services can communicate

## 🔄 Message Flow

### Order Processing:
1. Customer places order → Order created in database
2. Order message published to RabbitMQ → Payment processing triggered
3. Payment verified via Paystack → Order status updated
4. Confirmation email/SMS sent → Customer notified

### Product Updates:
1. Product updated → Cache invalidated via Redis
2. Update message published → Inventory synchronized
3. Admin notified → Dashboard updated

This integration setup provides a robust, scalable foundation for your e-commerce platform with proper separation of concerns and reliable message processing.

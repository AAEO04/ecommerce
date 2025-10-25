# MAD RUSH E-commerce AI Development Guide

This document provides essential context for AI agents working in this codebase.

## Architecture Overview

This is a modern e-commerce platform with three main components:

1. **Backend (FastAPI Monolith)**
   - `/backend/monolith/`: Python-based API service
   - Uses PostgreSQL, Redis (caching), and RabbitMQ (messaging)
   - Key modules: products, orders, admin, notifications

2. **Admin Panel (Next.js)**
   - `/frontend/admin_panel/`: Management interface
   - Built with Next.js 14 (App Router), TypeScript, shadcn/ui
   - Focuses on product/order management and admin features

3. **Customer Store (Next.js)**
   - `/frontend/customer_store/`: Customer-facing storefront
   - Similar tech stack to admin panel
   - Uses React Context for cart state management

## Development Workflow

### Backend Setup
```bash
cd backend/monolith
python -m venv venv
# Activate venv (Windows: .\venv\Scripts\Activate.ps1, Unix: source venv/bin/activate)
pip install -r requirements.txt
```

Required Environment:
```
DATABASE_URL="postgresql://madrush_user:madrush_password@localhost:5432/madrush_db"
```

### Starting the Stack
1. Start infrastructure (required): `docker-compose up -d`
2. Start backend: `uvicorn main:app --host 0.0.0.0 --port 8000 --reload`
3. Start frontends (separate terminals):
   - Admin: `cd frontend/admin_panel && npm run dev` (port 3000)
   - Store: `cd frontend/customer_store && npm run dev` (port 3001)

## Key Integration Points

1. **API Communication**
   - All frontend-backend communication goes through `/api/*` endpoints
   - See `backend/monolith/main.py` for route structure
   - Both frontends expect backend on port 8000

2. **State Management**
   - Admin: Server-side rendering with Next.js App Router
   - Store: Client-side cart state using React Context (`src/stores/cartStore.ts`)

3. **Messaging**
   - RabbitMQ handles async operations (notifications, order processing)
   - See `backend/monolith/utils/rabbitmq.py` for message patterns

## Project Conventions

1. **Component Organization**
   - UI components: `components/ui/` (shared shadcn/ui components)
   - Feature components: `components/features/` (business logic)
   - Layout components: `components/layout/` (page structure)

2. **API Structure**
   - All routes are versioned and prefixed with `/api`
   - Each domain has its own router (products, orders, etc.)
   - Authentication handled through admin router

## Common Operations

1. **Adding New API Endpoints**
   - Create route in appropriate router file (`backend/monolith/routers/`)
   - Add models if needed (`models.py`)
   - Add schema validation (`schemas.py`)

2. **Frontend Feature Development**
   - Add page in appropriate `/app` directory
   - Create components in feature-specific directory
   - Update API client if needed (`lib/admin/api.ts` or `lib/api.ts`)

## Testing and Validation

- Backend tests: `pytest` in `backend/monolith/`
- Integration tests in `test_integrations.py`
- Frontend testing through Next.js testing patterns
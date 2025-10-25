# Customer Store (minimal scaffold)

This is a minimal scaffold of the customer-facing storefront for the MAD RUSH e-commerce platform. It restores core functionality (product browsing, cart, guest checkout) and connects to the backend API at `NEXT_PUBLIC_API_URL`.

Run locally:

```bash
cd frontend/customer_store
npm ci
npm run dev
```

Notes:
- The backend API is expected at http://localhost:8000 by default.
- The checkout POST is sent to `/api/orders/checkout` matching the backend `orders.py` router.

Next steps: install dependencies, run dev, and iterate on UI polish.

# MAD RUSH Admin Panel (Next.js)

Production-ready admin panel for managing products, orders, and settings.

## Scripts

```bash
npm run dev     # Start dev server
npm run build   # Build (standalone)
npm run start   # Start production server
```

## Environment

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_ADMIN_API_URL=http://localhost:8000/api/admin
NEXT_PUBLIC_PRODUCT_API_URL=http://localhost:8000/api
```

## Docker

```bash
docker build -t admin-panel ./frontend/admin_panel
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://host.docker.internal:8000 \
  -e NEXT_PUBLIC_ADMIN_API_URL=http://host.docker.internal:8000/api/admin \
  -e NEXT_PUBLIC_PRODUCT_API_URL=http://host.docker.internal:8000/api \
  admin-panel
```

## Notes
- Uses Tailwind CSS and shadcn-style components
- Auth uses HttpOnly cookie from backend (`/api/auth/login`)

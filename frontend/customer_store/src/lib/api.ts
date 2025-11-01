import { CONFIG } from '@/lib/config'
export const API_BASE = CONFIG.API_BASE;

export async function fetchProducts() {
  const res = await fetch(`${API_BASE}/api/products`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}

export async function fetchProduct(id: number) {
  const res = await fetch(`${API_BASE}/api/products/${id}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch product');
  return res.json();
}

export async function checkout(payload: any) {
  const res = await fetch(`${API_BASE}/api/orders/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

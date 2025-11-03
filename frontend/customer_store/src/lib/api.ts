export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  images: { image_url: string }[];
}

import { CONFIG } from '@/lib/config';
import { fetchWithRetry } from '@/lib/fetchWithRetry';

export const API_BASE = CONFIG.API_BASE;

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  images: { image_url: string }[];
}

export async function fetchProducts(): Promise<Product[]> {
  return fetchWithRetry(`${API_BASE}/api/products`, {
    next: { revalidate: 60 }, // Add revalidation
  });
}

export async function fetchProduct(id: number): Promise<Product> {
  return fetchWithRetry(`${API_BASE}/api/products/${id}`, {
    next: { revalidate: 60 }, // Add revalidation
  });
}

export interface CheckoutPayload {
  cart: { variant_id: number; quantity: number }[];
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  payment_method: string;
}

export async function checkout(payload: CheckoutPayload) {
  return fetchWithRetry(`${API_BASE}/api/orders/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

import { CONFIG } from '@/lib/config';
import { fetchWithRetry } from '@/lib/fetchWithRetry';

const API_BASE = CONFIG.API_BASE;

export interface ProductVariant {
  id: number;
  size: string;
  color?: string;
  price: number;
  stock_quantity: number;
  sku?: string;
  is_active: boolean;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number; // Kept for backward compatibility - represents base/first variant price
  images: Array<{
    image_url: string;
    alt_text?: string;
    display_order?: number;
    is_primary?: boolean;
  }>;
  category?: string;
  colorLabel?: string;
  variants: ProductVariant[];
}

export interface BestSellerProduct {
  product: Product;
  unitsSold: number;
  revenue: number;
}

export async function fetchProducts(): Promise<Product[]> {
  return fetchWithRetry(`${API_BASE}/api/products`, {
    next: { revalidate: 60 }, // Add revalidation
  });
}

export async function fetchBestSellers(range: '7d' | '30d' | '90d' = '30d'): Promise<BestSellerProduct[]> {
  return fetchWithRetry(`${API_BASE}/api/products/best-sellers?range=${range}`, {
    next: { revalidate: 120 },
  });
}

export async function fetchProduct(id: number): Promise<Product> {
  return fetchWithRetry(`${API_BASE}/api/products/${id}`, {
    next: { revalidate: 60 }, // Add revalidation
  });
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  is_active: boolean;
}

export async function fetchCategories(): Promise<Category[]> {
  return fetchWithRetry(`${API_BASE}/api/products/categories`, {
    next: { revalidate: 300 }, // Cache for 5 minutes
  });
}

export interface CheckoutPayload {
  cart: { variant_id: number; quantity: number }[];
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  payment_method: string;
  idempotency_key: string;
}

export interface CheckoutResponse {
  message: string;
  payment_reference: string;
  authorization_url?: string;
  access_code?: string;
  total_amount: number;
  payment_completed?: boolean;
  order_id?: number;
  order_number?: string;
}

}

export async function validateCart(cart: { variant_id: number; quantity: number }[]) {
  return fetchWithRetry(`${API_BASE}/api/orders/validate-cart`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cart }),
  });
}

export async function checkout(payload: CheckoutPayload): Promise<CheckoutResponse> {
  return fetchWithRetry(`${API_BASE}/api/orders/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function verifyPayment(reference: string) {
  return fetchWithRetry(`${API_BASE}/api/payment/verify/${reference}`, {
    method: 'GET',
  });
}

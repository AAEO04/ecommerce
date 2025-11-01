export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  images: { image_url: string }[];
}

import { CONFIG } from '@/lib/config'
export const API_BASE = CONFIG.API_BASE;

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function fetchProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${API_BASE}/api/products`, {
      cache: 'no-store',
      next: { revalidate: 60 } // Add revalidation
    });

    if (!res.ok) {
      throw new ApiError(res.status, `Failed to fetch products: ${res.statusText}`);
    }

    return res.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof Error) {
        throw new Error(`Failed to fetch products: ${error.message}`);
    }
    throw new Error('An unknown error occurred while fetching products');
  }
}

export async function fetchProduct(id: number): Promise<Product> {
  try {
    const res = await fetch(`${API_BASE}/api/products/${id}`, {
      cache: 'no-store',
      next: { revalidate: 60 } // Add revalidation
    });

    if (!res.ok) {
      throw new ApiError(res.status, `Failed to fetch product: ${res.statusText}`);
    }

    return res.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof Error) {
        throw new Error(`Failed to fetch product: ${error.message}`);
    }
    throw new Error('An unknown error occurred while fetching product');
  }
}

export async function checkout(payload: any) {
  try {
    const res = await fetch(`${API_BASE}/api/orders/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new ApiError(res.status, `Failed to checkout: ${res.statusText}`);
    }

    return res.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof Error) {
        throw new Error(`Failed to checkout: ${error.message}`);
    }
    throw new Error('An unknown error occurred during checkout');
  }
}

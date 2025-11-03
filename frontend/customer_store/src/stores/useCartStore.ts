'use client'

import { create } from 'zustand'
import { persist, StateStorage } from 'zustand/middleware'
import { Product } from '@/lib/api'
import AES from 'crypto-js/aes';
import Utf8 from 'crypto-js/enc-utf8';

// IMPORTANT: Move this key to an environment variable
const SECRET_KEY = process.env.NEXT_PUBLIC_CART_ENCRYPTION_KEY || 'your-super-secret-key';

const encryptedStorage: StateStorage = {
  getItem: (name: string): string | null => {
    const str = localStorage.getItem(name);
    if (!str) return null;

    try {
      const bytes = AES.decrypt(str, SECRET_KEY);
      return bytes.toString(Utf8);
    } catch (error) {
      console.error("Failed to decrypt cart data:", error);
      return null;
    }
  },
  setItem: (name: string, value: string): void => {
    const encrypted = AES.encrypt(value, SECRET_KEY).toString();
    localStorage.setItem(name, encrypted);
  },
  removeItem: (name: string): void => {
    localStorage.removeItem(name);
  },
};

export type CartItem = {
  id: string
  productId?: number
  variant_id?: number
  name?: string
  price?: number
  quantity: number
}

type CartState = {
  items: CartItem[]
  addItem: (product: Product) => void
  removeItem: (id: string) => void
  clear: () => void
  getTotalCount: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) => {
        set((state) => {
          const existing = state.items.find((i) => i.productId === product.id)
          
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === existing.id
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            }
          }
          
          // Only create new item if it doesn't exist
          const newItem: CartItem = {
            id: `product-${product.id}`,
            productId: product.id,
            variant_id: product.id, // Assuming product.id for now
            name: product.name,
            price: product.price,
            quantity: 1,
          }
          
          return { items: [...state.items, newItem] }
        })
      },
      removeItem: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      clear: () => set({ items: [] }),
      getTotalCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: 'cart-storage',
      storage: encryptedStorage,
      partialize: (state) => ({ items: state.items }),
    }
  )
)

export default useCartStore

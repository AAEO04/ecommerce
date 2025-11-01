'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Product } from '@/lib/api'

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
        const id = `${product.id}-${Date.now()}`
        const cartItem: Omit<CartItem, 'id'> = {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
        }
        set((s) => {
          const existing = s.items.find((i) => i.productId === product.id)
          if (existing) {
            return { items: s.items.map((i) => i.id === existing.id ? { ...i, quantity: i.quantity + 1 } : i) }
          }
          return { items: [...s.items, { ...cartItem, id }] }
        })
      },
      removeItem: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      clear: () => set({ items: [] }),
      getTotalCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: 'cart-storage', // localStorage key
      partialize: (state) => ({ items: state.items }), // Only persist items
    }
  )
)

export default useCartStore

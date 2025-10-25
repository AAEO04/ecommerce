'use client'

import { create } from 'zustand'

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
  addItem: (item: Omit<CartItem, 'id'>) => void
  removeItem: (id: string) => void
  clear: () => void
  getTotalCount: () => number
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addItem: (item) => {
    const id = `${item.productId || 'p'}-${item.variant_id || 'v'}-${Date.now()}`
    set((s) => {
      const existing = s.items.find((i) => i.variant_id && item.variant_id && i.variant_id === item.variant_id)
      if (existing) {
        return { items: s.items.map((i) => i.id === existing.id ? { ...i, quantity: i.quantity + item.quantity } : i) }
      }
      return { items: [...s.items, { ...item, id }] }
    })
  },
  removeItem: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
  clear: () => set({ items: [] }),
  getTotalCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
}))

export default useCartStore

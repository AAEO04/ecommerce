'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Product } from '@/lib/api'

export type RecentlyViewedItem = {
  id: number
  name: string
  price: number
  image: string
  viewedAt: number
}

type RecentlyViewedState = {
  items: RecentlyViewedItem[]
  addItem: (product: Product) => void
  clear: () => void
}

const MAX_ITEMS = 10

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) => {
        const existing = get().items.find((i) => i.id === product.id)
        
        // Remove if already exists to update timestamp
        const filtered = get().items.filter((i) => i.id !== product.id)
        
        const newItem: RecentlyViewedItem = {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.images?.[0]?.image_url || '',
          viewedAt: Date.now(),
        }

        // Add to beginning and limit to MAX_ITEMS
        const newItems = [newItem, ...filtered].slice(0, MAX_ITEMS)
        
        set({ items: newItems })
      },
      clear: () => set({ items: [] }),
    }),
    {
      name: 'recently-viewed-storage',
    }
  )
)

export default useRecentlyViewedStore

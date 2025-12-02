'use client'

import { create } from 'zustand'
import { persist, StateStorage } from 'zustand/middleware'
import { Product } from '@/lib/api'
import AES from 'crypto-js/aes'
import Utf8 from 'crypto-js/enc-utf8'

// IMPORTANT: This key MUST be set in environment variables
const SECRET_KEY = process.env.NEXT_PUBLIC_CART_ENCRYPTION_KEY;

if (!SECRET_KEY) {
  console.error('FATAL: NEXT_PUBLIC_CART_ENCRYPTION_KEY environment variable is not set');
  console.error('Wishlist encryption will not work. Please set this in your .env.local file');
}


const encryptedStorage: StateStorage = {
  getItem: (name: string): string | null => {
    const str = localStorage.getItem(name)
    if (!str) return null

    try {
      const bytes = AES.decrypt(str, SECRET_KEY)
      return bytes.toString(Utf8)
    } catch (error) {
      console.error('Failed to decrypt wishlist data:', error)
      return null
    }
  },
  setItem: (name: string, value: string): void => {
    const encrypted = AES.encrypt(value, SECRET_KEY).toString()
    localStorage.setItem(name, encrypted)
  },
  removeItem: (name: string): void => {
    localStorage.removeItem(name)
  },
}

export type WishlistItem = {
  id: number
  name: string
  price: number
  image: string
  addedAt: number
}

type WishlistState = {
  items: WishlistItem[]
  addItem: (product: Product) => void
  removeItem: (id: number) => void
  isInWishlist: (id: number) => boolean
  clear: () => void
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) => {
        const existing = get().items.find((i) => i.id === product.id)
        if (existing) return

        // Get price from product or first variant
        const price = product.price || product.variants?.[0]?.price || 0

        const newItem: WishlistItem = {
          id: product.id,
          name: product.name,
          price: price,
          image: product.images?.[0]?.image_url || '',
          addedAt: Date.now(),
        }

        set((state) => ({ items: [...state.items, newItem] }))
      },
      removeItem: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      isInWishlist: (id) => get().items.some((i) => i.id === id),
      clear: () => set({ items: [] }),
    }),
    {
      name: 'wishlist-storage',
      storage: encryptedStorage as any,
    }
  )
)

export default useWishlistStore

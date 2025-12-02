'use client'

import { create } from 'zustand'
import { persist, StateStorage, StorageValue, PersistStorage } from 'zustand/middleware'
import { Product } from '@/lib/api'
import AES from 'crypto-js/aes';
import Utf8 from 'crypto-js/enc-utf8';

// IMPORTANT: This key MUST be set in environment variables
const SECRET_KEY = process.env.NEXT_PUBLIC_CART_ENCRYPTION_KEY;

if (!SECRET_KEY) {
  console.error('FATAL: NEXT_PUBLIC_CART_ENCRYPTION_KEY environment variable is not set');
  console.error('Cart encryption will not work. Please set this in your .env.local file');
  // Don't throw in production to avoid breaking the app, but log prominently
}

// Maximum size for encrypted storage (500KB)
const MAX_STORAGE_SIZE = 500 * 1024; // 500KB

const encryptedStorage: PersistStorage<CartState> = {
  getItem: (name: string): StorageValue<CartState> | null => {
    const str = localStorage.getItem(name);
    if (!str) return null;

    try {
      const bytes = AES.decrypt(str, SECRET_KEY);
      const decrypted = bytes.toString(Utf8);
      return JSON.parse(decrypted);
    } catch (error) {
      console.error("Failed to decrypt cart data:", error);
      // Clear corrupted data
      localStorage.removeItem(name);
      return null;
    }
  },
  setItem: (name: string, value: StorageValue<CartState>): void => {
    try {
      const stringified = JSON.stringify(value);

      // Check size before encryption
      if (stringified.length > MAX_STORAGE_SIZE) {
        console.warn('Cart data too large, trimming undo stack');
        // Trim undo stack if data is too large
        const trimmedValue = {
          ...value,
          state: {
            ...value.state,
            undoStack: []
          }
        };
        const trimmedStringified = JSON.stringify(trimmedValue);
        const encrypted = AES.encrypt(trimmedStringified, SECRET_KEY).toString();
        localStorage.setItem(name, encrypted);
        return;
      }

      const encrypted = AES.encrypt(stringified, SECRET_KEY).toString();
      localStorage.setItem(name, encrypted);
    } catch (error) {
      console.error("Failed to encrypt cart data:", error);
      // Fallback: clear the cart to prevent further errors
      localStorage.removeItem(name);
    }
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
  price: number
  quantity: number
  image?: string
  size?: string
  color?: string
  savedForLater?: boolean
}

type UndoAction = {
  type: 'remove' | 'quantity'
  item: CartItem
  previousQuantity?: number
}

type CartState = {
  items: CartItem[]
  savedForLater: CartItem[]
  undoStack: UndoAction[]
  addItem: (product: Product, variantId: number) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  moveToSaved: (id: string) => void
  moveToCart: (id: string) => void
  undo: () => void
  clear: () => void
  getTotalCount: () => number
  getTotal: () => number
}

// Migration function to handle existing cart items with undefined prices
const migrateCartData = (state: any) => {
  if (!state) return { items: [], savedForLater: [], undoStack: [] }

  const migrateItems = (items: any[]): CartItem[] =>
    items.map(item => ({
      ...item,
      price: item.price ?? 0, // Ensure price is never undefined
      size: item.size ?? undefined,
      color: item.color ?? undefined,
    }))

  return {
    items: migrateItems(state.items || []),
    savedForLater: migrateItems(state.savedForLater || []),
    undoStack: state.undoStack || [],
  }
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      savedForLater: [],
      undoStack: [],
      addItem: (product, variantId) => {
        set((state) => {
          // Find the variant details
          const variant = product.variants.find(v => v.id === variantId)
          if (!variant) {
            console.error(`Variant ${variantId} not found for product ${product.id}`)
            return state
          }

          // Create unique ID based on product and variant
          const itemId = `product-${product.id}-variant-${variantId}`
          const existing = state.items.find((i) => i.id === itemId)

          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === itemId
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            }
          }

          // Create new cart item with variant details
          const newItem: CartItem = {
            id: itemId,
            productId: product.id,
            variant_id: variantId,
            name: product.name,
            price: variant.price,
            quantity: 1,
            image: product.images?.[0]?.image_url,
            size: variant.size,
            color: variant.color,
            savedForLater: false,
          }

          return { items: [...state.items, newItem] }
        })
      },
      removeItem: (id) => {
        const item = get().items.find((i) => i.id === id)
        if (item) {
          set((state) => ({
            items: state.items.filter((i) => i.id !== id),
            undoStack: [...state.undoStack, { type: 'remove', item }],
          }))
        }
      },
      updateQuantity: (id, quantity) => {
        if (quantity < 1) return
        const item = get().items.find((i) => i.id === id)
        if (item) {
          set((state) => ({
            items: state.items.map((i) =>
              i.id === id ? { ...i, quantity } : i
            ),
            undoStack: [...state.undoStack, { type: 'quantity', item, previousQuantity: item.quantity }],
          }))
        }
      },
      moveToSaved: (id) => {
        const item = get().items.find((i) => i.id === id)
        if (item) {
          set((state) => ({
            items: state.items.filter((i) => i.id !== id),
            savedForLater: [...state.savedForLater, { ...item, savedForLater: true }],
          }))
        }
      },
      moveToCart: (id) => {
        const item = get().savedForLater.find((i) => i.id === id)
        if (item) {
          set((state) => ({
            savedForLater: state.savedForLater.filter((i) => i.id !== id),
            items: [...state.items, { ...item, savedForLater: false }],
          }))
        }
      },
      undo: () => {
        const undoAction = get().undoStack[get().undoStack.length - 1]
        if (!undoAction) return

        set((state) => {
          const newUndoStack = state.undoStack.slice(0, -1)

          if (undoAction.type === 'remove') {
            return {
              items: [...state.items, undoAction.item],
              undoStack: newUndoStack,
            }
          } else if (undoAction.type === 'quantity' && undoAction.previousQuantity) {
            return {
              items: state.items.map((i) =>
                i.id === undoAction.item.id
                  ? { ...i, quantity: undoAction.previousQuantity! }
                  : i
              ),
              undoStack: newUndoStack,
            }
          }

          return state
        })
      },
      clear: () => set({ items: [], savedForLater: [], undoStack: [] }),
      getTotalCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      getTotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    {
      name: 'cart-storage',
      storage: encryptedStorage,
      migrate: (persistedState: any, version: number) => {
        return migrateCartData(persistedState)
      },
      partialize: (state) => ({
        items: state.items,
        savedForLater: state.savedForLater,
        undoStack: state.undoStack,
      }),
    }
  )
)

export default useCartStore

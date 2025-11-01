'use client'

import { useCartStore } from '@/stores/useCartStore'
import Link from 'next/link'
import { formatNGN } from '@/utils/currency'
import { ShoppingCart } from 'lucide-react'

export default function CartPage() {
  const items = useCartStore((s) => s.items)
  const removeItem = useCartStore((s) => s.removeItem)
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Your Cart</h1>
import { ShoppingCart } from 'lucide-react'

// ... (imports)

// ... (component body)

      {items.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingCart className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">
            Looks like you haven't added anything yet
          </p>
          <Link href="/products" className="btn btn-primary bg-accentPurple text-white px-4 py-2 rounded-lg">
            Start Shopping
          </Link>
        </div>
      ) : (

// ... (rest of the component)
        <div className="space-y-3">
          {items.map((it) => (
            <div key={it.variant_id} className="flex items-center justify-between border p-3 rounded bg-white">
              <div>
                <div className="font-semibold">{it.name}</div>
                <div className="text-sm text-muted-foreground">Qty: {it.quantity}</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="font-bold">{formatNGN((it.price || 0) * it.quantity)}</div>
                <button onClick={() => removeItem(it.id)} className="text-sm text-red-500">Remove</button>
              </div>
            </div>
          ))}
          <div className="mt-4">
            <Link href="/checkout" className="px-4 py-2 bg-accentGreen text-white rounded">Checkout</Link>
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import { useCartStore } from '@/stores/useCartStore'
import Link from 'next/link'

export default function CartPage() {
  const items = useCartStore((s) => s.items)
  const removeItem = useCartStore((s) => s.removeItem)
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Your Cart</h1>
      {items.length === 0 ? (
        <div>
          <p>Your cart is empty.</p>
          <Link href="/products" className="text-accentPurple">Browse products</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((it) => (
            <div key={it.variant_id} className="flex items-center justify-between border p-3 rounded bg-white">
              <div>
                <div className="font-semibold">{it.name}</div>
                <div className="text-sm text-muted-foreground">Qty: {it.quantity}</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="font-bold">${(it.price || 0) * it.quantity}</div>
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

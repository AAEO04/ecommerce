'use client'

import { useCartStore } from '@/stores/useCartStore'
import Link from 'next/link'
import { formatNGN } from '@/utils/currency'
import { ShoppingCart } from 'lucide-react'

export default function CartPage() {
  const items = useCartStore((s) => s.items)
  const removeItem = useCartStore((s) => s.removeItem)
  const total = items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">Your Cart</h1>
      
      {items.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingCart className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">
            Looks like you haven&apos;t added anything yet
          </p>
          <Link 
            href="/products" 
            className="inline-block px-6 py-3 bg-accent-green text-white rounded-lg hover:bg-accent-green-700 transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {items.map((item) => (
              <div 
                key={item.id} 
                className="flex items-center justify-between border border-neutral-800 p-4 rounded-lg bg-neutral-900"
              >
                <div>
                  <div className="font-semibold text-white">{item.name}</div>
                  <div className="text-sm text-neutral-400">Quantity: {item.quantity}</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="font-bold text-white">
                    {formatNGN((item.price || 0) * item.quantity)}
                  </div>
                  <button 
                    onClick={() => removeItem(item.id)} 
                    className="text-sm text-red-500 hover:text-red-400 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 flex justify-between items-center p-4 bg-neutral-900 rounded-lg">
            <span className="text-lg font-semibold">Total:</span>
            <span className="text-2xl font-bold text-accent-green">{formatNGN(total)}</span>
          </div>
          
          <div className="mt-6">
            <Link 
              href="/checkout" 
              className="w-full block text-center px-6 py-3 bg-accent-green text-white rounded-lg font-semibold hover:bg-accent-green-700 transition-colors"
            >
              Proceed to Checkout
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
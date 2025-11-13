'use client'

import { useCartStore } from '@/stores/useCartStore'
import Link from 'next/link'
import { formatNGN } from '@/utils/currency'
import { ShoppingCart, Minus, Plus, Trash2, Archive, Undo2 } from 'lucide-react'
import Image from 'next/image'
import toast from 'react-hot-toast'

export default function CartPage() {
  const items = useCartStore((s) => s.items)
  const savedForLater = useCartStore((s) => s.savedForLater)
  const removeItem = useCartStore((s) => s.removeItem)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const moveToSaved = useCartStore((s) => s.moveToSaved)
  const moveToCart = useCartStore((s) => s.moveToCart)
  const undo = useCartStore((s) => s.undo)
  const undoStack = useCartStore((s) => s.undoStack)
  const getTotal = useCartStore((s) => s.getTotal)
  
  const total = getTotal()

  const handleRemove = (id: string, name?: string) => {
    removeItem(id)
    toast.success(
      <div className="flex items-center gap-2">
        <span>{name || 'Item'} removed</span>
        <button
          onClick={() => {
            undo()
            toast.dismiss()
          }}
          className="text-accent-green underline font-semibold"
        >
          Undo
        </button>
      </div>,
      { duration: 5000 }
    )
  }

  const handleMoveToSaved = (id: string, name?: string) => {
    moveToSaved(id)
    toast.success(`${name || 'Item'} moved to saved for later`)
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <h1 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">Your Cart</h1>
      <p className="text-base text-gray-600 mb-10">Review your items and proceed to checkout</p>
      
      {items.length === 0 ? (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gray-100 mb-6">
            <ShoppingCart className="h-12 w-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Your cart is empty</h2>
          <p className="text-base text-gray-600 mb-8">
            Looks like you haven&apos;t added anything yet
          </p>
          <Link 
            href="/products" 
            className="inline-block px-8 py-4 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-all shadow-lg hover:shadow-xl"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <>
          {/* Undo button */}
          {undoStack.length > 0 && (
            <button
              onClick={() => {
                undo()
                toast.success('Action undone')
              }}
              className="mb-6 flex items-center gap-2 px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all shadow-md font-medium"
            >
              <Undo2 className="h-5 w-5" />
              Undo Last Action
            </button>
          )}

          {/* Cart items */}
          <div className="space-y-6">
            {items.map((item) => (
              <div 
                key={item.id} 
                className="flex gap-6 border border-gray-200 p-6 rounded-xl bg-white hover:border-purple-200 transition-all hover:shadow-md"
              >
                {/* Product image */}
                {item.image && (
                  <div className="relative w-32 h-32 rounded-xl overflow-hidden flex-shrink-0 bg-gray-50">
                    <Image
                      src={item.image}
                      alt={item.name || 'Product'}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                {/* Product details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 text-xl">{item.name}</h3>
                    <p className="text-purple-600 font-bold text-lg mt-2">
                      {formatNGN(item.price || 0)}
                    </p>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-6 mt-4">
                    <div className="flex items-center gap-3 border-2 border-gray-300 rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="p-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-l-lg"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-5 w-5 text-gray-700" />
                      </button>
                      <span className="px-6 text-gray-900 font-bold text-lg min-w-[3ch] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-3 hover:bg-gray-100 transition-colors rounded-r-lg"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-5 w-5 text-gray-700" />
                      </button>
                    </div>

                    <div className="text-gray-900 font-bold text-xl">
                      {formatNGN((item.price || 0) * item.quantity)}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-4 mt-4">
                    <button
                      onClick={() => handleMoveToSaved(item.id, item.name)}
                      className="flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors"
                    >
                      <Archive className="h-4 w-4" />
                      Save for later
                    </button>
                    <button
                      onClick={() => handleRemove(item.id, item.name)}
                      className="flex items-center gap-2 text-sm font-medium text-red-500 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 flex justify-between items-center p-6 bg-gray-50 rounded-xl border-2 border-gray-200">
            <span className="text-xl font-bold text-gray-700">Total:</span>
            <span className="text-3xl font-bold text-green-600">{formatNGN(total)}</span>
          </div>
          
          <div className="mt-8">
            <Link 
              href="/checkout" 
              className="w-full block text-center px-8 py-5 bg-green-500 text-white rounded-xl font-bold text-lg hover:bg-green-600 transition-all shadow-lg hover:shadow-xl"
            >
              Proceed to Checkout
            </Link>
          </div>

          {/* Saved for later */}
          {savedForLater.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Saved for Later</h2>
              <div className="space-y-4">
                {savedForLater.map((item) => (
                  <div 
                    key={item.id} 
                    className="flex gap-4 border border-neutral-800 p-4 rounded-lg bg-neutral-900"
                  >
                    {item.image && (
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name || 'Product'}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}

                    <div className="flex-1 flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-white">{item.name}</div>
                        <div className="text-accent-green font-bold mt-1">
                          {formatNGN(item.price || 0)}
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            moveToCart(item.id)
                            toast.success(`${item.name} moved to cart`)
                          }}
                          className="px-4 py-2 bg-accent-green hover:bg-accent-green-700 text-white rounded-lg transition-colors"
                        >
                          Move to Cart
                        </button>
                        <button
                          onClick={() => {
                            useCartStore.getState().savedForLater = savedForLater.filter(i => i.id !== item.id)
                            toast.success(`${item.name} removed`)
                          }}
                          className="p-2 text-red-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
"use client"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "./Sheet"
import { Button } from "./button"
import { useCartStore } from "@/stores/useCartStore"
import { ShoppingCart, Trash2, Plus, Minus } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { formatNGN } from "@/utils/currency"
import toast from "react-hot-toast"

export function Cart() {
  const items = useCartStore((s) => s.items)
  const removeItem = useCartStore((s) => s.removeItem)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const getTotalCount = useCartStore((s) => s.getTotalCount)
  const getTotal = useCartStore((s) => s.getTotal)
  
  const totalCount = getTotalCount()
  const total = getTotal()

  const handleRemove = (id: string, name?: string) => {
    removeItem(id)
    toast.success(`${name || 'Item'} removed from cart`)
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative hover:bg-purple-50 transition-colors">
          <ShoppingCart className="h-5 w-5 text-gray-700" />
          {totalCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold shadow-lg">
              {totalCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="text-2xl font-bold">Shopping Cart</SheetTitle>
          {totalCount > 0 && (
            <p className="text-sm text-gray-500">{totalCount} {totalCount === 1 ? 'item' : 'items'}</p>
          )}
        </SheetHeader>
        <div className="flex-1 overflow-y-auto py-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <ShoppingCart className="h-10 w-10 text-gray-400" />
              </div>
              <p className="text-lg font-semibold text-gray-900 mb-2">Your cart is empty</p>
              <p className="text-sm text-gray-500 mb-6">Add items to get started</p>
              <Link href="/products">
                <Button className="bg-green-500 hover:bg-green-600">Start Shopping</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 rounded-lg border border-gray-200 hover:border-purple-200 transition-colors">
                  {/* Product Image */}
                  {item.image && (
                    <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-50">
                      <Image
                        src={item.image}
                        alt={item.name ?? "Product"}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  {/* Product Details */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">{item.name}</h3>
                      <p className="text-base font-bold text-purple-600 mt-1">
                        {formatNGN(item.price ?? 0)}
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2 border border-gray-300 rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="p-1.5 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-l-lg"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3 w-3 text-gray-600" />
                        </button>
                        <span className="px-3 text-sm font-semibold text-gray-900 min-w-[2ch] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1.5 hover:bg-gray-100 transition-colors rounded-r-lg"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3 w-3 text-gray-600" />
                        </button>
                      </div>

                      <button
                        onClick={() => handleRemove(item.id, item.name)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {items.length > 0 && (
          <SheetFooter className="border-t pt-6">
            <div className="w-full space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-base font-semibold text-gray-700">Subtotal</span>
                <span className="text-2xl font-bold text-gray-900">{formatNGN(total)}</span>
              </div>
              <p className="text-sm text-gray-500">
                Shipping and taxes calculated at checkout
              </p>
              <div className="space-y-3">
                <Link href="/checkout" className="block">
                  <Button className="w-full bg-green-500 hover:bg-green-600 text-white py-6 text-base font-semibold shadow-lg">
                    Proceed to Checkout
                  </Button>
                </Link>
                <Link href="/cart" className="block">
                  <Button variant="outline" className="w-full py-6 text-base font-medium">
                    View Full Cart
                  </Button>
                </Link>
              </div>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}
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
import { useState, useEffect } from "react"

export function Cart() {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const items = useCartStore((s) => s.items)
  const removeItem = useCartStore((s) => s.removeItem)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const getTotalCount = useCartStore((s) => s.getTotalCount)
  const getTotal = useCartStore((s) => s.getTotal)

  const totalCount = getTotalCount()
  const total = getTotal()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleRemove = (id: string, name?: string) => {
    removeItem(id)
    toast.success(`${name || 'Item'} removed from cart`)
  }

  const handleCheckoutClick = () => {
    setIsOpen(false)
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-11 w-11 rounded-full border border-white/20 bg-white/5 text-white hover:border-electric-volt-green hover:bg-electric-volt-green/10"
        >
          <ShoppingCart className="h-5 w-5" />
          {mounted && totalCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full border border-black bg-electric-volt-green text-[10px] font-black text-black">
              {totalCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full border-l border-white/10 bg-black/95 text-white sm:max-w-md">
        <SheetHeader className="border-b border-white/10 pb-4">
          <p className="text-xs uppercase tracking-[0.4em] text-white/60">Mission cargo</p>
          <SheetTitle className="text-2xl font-black">Rapid cart</SheetTitle>
          {totalCount > 0 && (
            <p className="text-sm text-white/60">{totalCount} {totalCount === 1 ? 'item' : 'items'} staged</p>
          )}
        </SheetHeader>
        <div className="flex-1 overflow-y-auto py-6">
          {items.length === 0 ? (
            <div className="relative flex h-full flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-white/20 bg-white/5 py-12 text-center">
              <div className="absolute inset-0 hero-grid opacity-10" aria-hidden />
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-electric-volt-green/40">
                <ShoppingCart className="h-10 w-10 text-electric-volt-green" />
              </div>
              <div className="relative space-y-1">
                <p className="text-xs uppercase tracking-[0.5em] text-white/50">No payloads</p>
                <p className="text-lg font-semibold text-white">Cart is idle</p>
                <p className="text-sm text-white/60">Pulse through products to lock a drop.</p>
              </div>
              <Link
                href="/products"
                className="relative inline-flex items-center gap-2 rounded-full border border-electric-volt-green bg-electric-volt-green/90 px-6 py-2 text-xs font-black uppercase tracking-[0.3em] text-black transition hover:-translate-y-1"
              >
                Browse drops
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 rounded-3xl border border-white/10 bg-white/5 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
                >
                  {item.image && (
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl bg-black/40">
                      <Image src={item.image} alt={item.name ?? 'Product'} fill className="object-cover" />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col justify-between gap-3">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.4em] text-white/40">Drop #{item.productId}</p>
                      <p className="line-clamp-2 text-sm font-semibold">{item.name}</p>
                      {(item.size || item.color) && (
                        <p className="mt-1 text-xs text-white/60">
                          {item.size && <span>Size: {item.size}</span>}
                          {item.size && item.color && <span className="mx-2">•</span>}
                          {item.color && <span>Color: {item.color}</span>}
                        </p>
                      )}
                      <p className="text-lg font-black text-electric-volt-green">{formatNGN(item.price)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-2 py-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="rounded-full p-1 text-white/60 transition hover:bg-white/10 disabled:opacity-40"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="min-w-[2ch] text-center text-sm font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="rounded-full p-1 text-white transition hover:bg-white/10"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <span className="text-sm font-semibold text-white/70">{formatNGN(item.price * item.quantity)}</span>
                      <button
                        onClick={() => handleRemove(item.id, item.name)}
                        className="ml-auto flex items-center gap-1 rounded-full border border-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-hot-pink transition hover:border-hot-pink"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {items.length > 0 && (
          <SheetFooter className="border-t border-white/10 pt-6">
            <div className="w-full space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.4em] text-white/60">Live subtotal</span>
                <span className="text-2xl font-black text-electric-volt-green">{formatNGN(total)}</span>
              </div>
              <p className="text-xs text-white/50">Shipping + taxes finalize in checkout.</p>
              <div className="space-y-3">
                <Link href="/checkout" className="block" onClick={handleCheckoutClick}>
                  <Button className="w-full rounded-full border border-electric-volt-green bg-electric-volt-green px-6 py-4 text-sm font-black uppercase tracking-[0.4em] text-black transition hover:-translate-y-1">
                    Launch checkout
                  </Button>
                </Link>
                <Link href="/cart" className="block" onClick={handleCheckoutClick}>
                  <Button variant="ghost" className="w-full rounded-full border border-white/20 px-6 py-4 text-sm font-semibold uppercase tracking-[0.3em] text-white/80 hover:border-white/50">
                    View full manifest
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
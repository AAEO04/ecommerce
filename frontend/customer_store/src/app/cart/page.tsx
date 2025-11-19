'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Minus, Plus, Trash2, Archive, Undo2, Sparkles, ShoppingCart } from 'lucide-react'
import toast from 'react-hot-toast'
import { useCartStore } from '@/stores/useCartStore'
import { formatNGN } from '@/utils/currency'

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
      <div className="flex items-center gap-2 text-sm">
        <span>{name || 'Item'} removed</span>
        <button
          onClick={() => {
            undo()
            toast.dismiss()
          }}
          className="text-electric-volt-green underline"
        >
          Undo
        </button>
      </div>,
      { duration: 5000 }
    )
  }

  const handleMoveToSaved = (id: string, name?: string) => {
    moveToSaved(id)
    toast.success(`${name || 'Item'} rerouted to saved stack`)
  }

  const EmptyState = () => (
    <div className="relative mx-auto max-w-2xl overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-black via-neutral-950 to-black px-8 py-16 text-center">
      <div className="absolute inset-0 hero-grid opacity-10" aria-hidden />
      <div className="absolute inset-0 hero-noise opacity-20" aria-hidden />
      <div className="relative space-y-6">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border-2 border-dashed border-white/30">
          <ShoppingCart className="h-10 w-10 text-electric-volt-green" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.5em] text-white/50">Signal waiting</p>
          <h2 className="mt-2 text-3xl font-black uppercase tracking-[0.2em] text-white">No payloads yet</h2>
          <p className="mt-3 text-white/60">
            Lock in your arsenal before the next drop dissipates.
          </p>
        </div>
        <Link
          href="/products"
          className="inline-flex items-center justify-center gap-3 rounded-full border border-electric-volt-green bg-electric-volt-green/90 px-10 py-4 text-sm font-black uppercase tracking-[0.3em] text-black transition hover:-translate-y-1"
        >
          <Sparkles className="h-4 w-4" />
          Browse drops
        </Link>
      </div>
    </div>
  )

  return (
    <div className="relative overflow-hidden bg-black text-white">
      <div className="absolute inset-0 hero-grid opacity-10" aria-hidden />
      <div className="absolute inset-0 hero-noise opacity-20" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-4 py-14 space-y-10">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.4em] text-white/60">Cart · Mission staging</p>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl font-black uppercase tracking-[0.2em]">Ready to deploy</h1>
              <p className="text-white/60">{items.length} items tuned to the MAD RUSH frequency.</p>
            </div>
            {undoStack.length > 0 && (
              <button
                onClick={() => {
                  undo()
                  toast.success('Action undone')
                }}
                className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:border-electric-volt-green"
              >
                <Undo2 className="h-4 w-4 text-electric-volt-green" />
                Undo last action
              </button>
            )}
          </div>
        </header>

        {items.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1.8fr_1fr]">
            <div className="space-y-6">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="relative flex flex-col gap-4 rounded-[24px] border border-white/10 bg-white/5 p-5 shadow-[0_15px_40px_rgba(0,0,0,0.35)] md:flex-row"
                >
                  {item.image && (
                    <div className="relative h-36 w-full overflow-hidden rounded-2xl bg-black/30 md:h-32 md:w-32">
                      <Image src={item.image} alt={item.name || 'Product'} fill className="object-cover" />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-xs uppercase tracking-[0.4em] text-white/50">Drop #{item.productId}</p>
                      <h3 className="text-xl font-semibold">{item.name}</h3>
                      <p className="text-2xl font-black text-electric-volt-green">{formatNGN(item.price)}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-3 rounded-full border border-white/20 bg-black/40 px-3 py-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="rounded-full p-2 transition hover:bg-white/10 disabled:opacity-40"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="min-w-[3ch] text-center text-lg font-black">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="rounded-full p-2 transition hover:bg-white/10"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="text-lg font-semibold text-white/80">
                        {formatNGN(item.price * item.quantity)}
                      </div>
                      <div className="ml-auto flex flex-wrap gap-4">
                        <button
                          onClick={() => handleMoveToSaved(item.id, item.name)}
                          className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/70 transition hover:text-electric-volt-green"
                        >
                          <Archive className="h-4 w-4" />
                          Save
                        </button>
                        <button
                          onClick={() => handleRemove(item.id, item.name)}
                          className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-hot-pink transition hover:text-white"
                        >
                          <Trash2 className="h-4 w-4" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {savedForLater.length > 0 && (
                <section className="rounded-[28px] border border-white/10 bg-black/40 p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold uppercase tracking-[0.3em] text-white/70">Saved for later</h2>
                    <span className="text-xs text-white/40">{savedForLater.length} signals</span>
                  </div>
                  <div className="space-y-4">
                    {savedForLater.map((item) => (
                      <div key={item.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                        {item.image && (
                          <div className="relative h-16 w-16 overflow-hidden rounded-xl">
                            <Image src={item.image} alt={item.name || 'Product'} fill className="object-cover" />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-semibold">{item.name}</p>
                          <p className="text-electric-volt-green font-black">{formatNGN(item.price)}</p>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => {
                              moveToCart(item.id)
                              toast.success(`${item.name} moved to cart`)
                            }}
                            className="rounded-full border border-electric-volt-green px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-electric-volt-green"
                          >
                            Reactivate
                          </button>
                          <button
                            onClick={() => handleRemove(item.id, item.name)}
                            className="rounded-full border border-white/20 px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/70 transition hover:text-hot-pink"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            <aside className="sticky top-6 space-y-6 rounded-[32px] border border-white/10 bg-white/5 p-6">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-white/60">Summary</p>
                <h2 className="mt-2 text-3xl font-black">{formatNGN(total)}</h2>
                <p className="text-sm text-white/50">Taxes and shipping calculated at checkout.</p>
              </div>
              <div className="space-y-3 text-sm text-white/70">
                <div className="flex items-center justify-between">
                  <span>Items</span>
                  <span>{items.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Supply status</span>
                  <span className="text-electric-volt-green">In stock</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Shipping</span>
                  <span className="text-hot-pink">Calculated next step</span>
                </div>
              </div>
              <Link
                href="/checkout"
                className="block rounded-full border border-electric-volt-green bg-electric-volt-green px-6 py-4 text-center text-sm font-black uppercase tracking-[0.4em] text-black transition hover:-translate-y-1"
              >
                Proceed to checkout
              </Link>
              <p className="text-xs uppercase tracking-[0.4em] text-white/40">Encrypted checkout · SSL Secured</p>
            </aside>
          </div>
        )}
      </div>
    </div>
  )
}
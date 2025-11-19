'use client'

import { useEffect, useState } from 'react'
import { useCartStore } from '@/stores/useCartStore'
import { useWishlistStore } from '@/stores/useWishlistStore'
import { useRecentlyViewedStore } from '@/stores/useRecentlyViewedStore'
import { Product } from '@/lib/api'
import { ProductImageGallery } from '@/components/ui/ProductImageGallery'
import { formatNGN } from '@/utils/currency'
import { Heart, ShoppingCart, Ruler, Package, Truck, Shield, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function ProductClient({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem)
  const addToWishlist = useWishlistStore((s) => s.addItem)
  const removeFromWishlist = useWishlistStore((s) => s.removeItem)
  const isInWishlist = useWishlistStore((s) => s.isInWishlist)
  const addToRecentlyViewed = useRecentlyViewedStore((s) => s.addItem)
  
  const [showSizeGuide, setShowSizeGuide] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const inWishlist = isInWishlist(product.id)

  useEffect(() => {
    // Track recently viewed
    addToRecentlyViewed(product)
  }, [product.id])

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem(product)
    }
    toast.success(`${quantity} x ${product.name} added to cart`)
  }

  const handleToggleWishlist = () => {
    if (inWishlist) {
      removeFromWishlist(product.id)
      toast.success('Removed from wishlist')
    } else {
      addToWishlist(product)
      toast.success('Added to wishlist')
    }
  }

  const images = product.images?.map(img => img.image_url) || []

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <div className="absolute inset-0 hero-grid opacity-15" aria-hidden="true" />
      <div className="absolute inset-0 hero-noise opacity-20" aria-hidden="true" />

      <div className="relative z-10 container mx-auto px-4 py-12 space-y-10">
        <nav className="flex items-center gap-2 text-xs uppercase tracking-[0.4em] text-white/60">
          <Link href="/" className="hover:text-electric-volt-green transition">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-electric-volt-green transition">Products</Link>
          <span>/</span>
          <span className="text-electric-volt-green">{product.name}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[32px] border border-white/10 bg-neutral-950/70 p-6">
            <ProductImageGallery images={images} productName={product.name} />
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-1 text-xs font-semibold uppercase tracking-[0.4em] text-white/60">
                <Sparkles className="h-4 w-4 text-electric-volt-green" />
                Drop #{product.id}
              </p>
              <h1 className="text-4xl md:text-5xl font-black leading-tight">{product.name}</h1>
              <p className="text-3xl font-black text-electric-volt-green">{formatNGN(product.price)}</p>
            </div>

            {product.description && (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-black">
                <h3 className="text-sm uppercase tracking-[0.4em] text-white/60">Description</h3>
                <p className="mt-3 text-lg text-black/70">{product.description}</p>
              </div>
            )}

            <div className="rounded-3xl border border-white/10 bg-neutral-950/70 p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm uppercase tracking-[0.3em] text-white/60">Quantity</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="h-11 w-11 rounded-2xl border border-white/20 text-xl font-bold text-white transition hover:border-electric-volt-green"
                  >
                    −
                  </button>
                  <span className="min-w-[4ch] text-center text-2xl font-black">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="h-11 w-11 rounded-2xl border border-white/20 text-xl font-bold text-white transition hover:border-electric-volt-green"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleAddToCart}
                className="inline-flex w-full items-center justify-center gap-3 rounded-3xl border border-electric-volt-green bg-electric-volt-green px-6 py-4 text-base font-semibold uppercase tracking-[0.3em] text-black transition hover:-translate-y-1"
              >
                <ShoppingCart className="h-5 w-5" />
                Add to Cart
              </button>
              <button
                onClick={handleToggleWishlist}
                className={`inline-flex w-full items-center justify-center gap-3 rounded-3xl border px-6 py-4 text-base font-semibold uppercase tracking-[0.3em] transition ${
                  inWishlist
                    ? 'border-red-400 bg-red-500/20 text-red-200'
                    : 'border-white/20 text-white/80 hover:border-electric-volt-green'
                }`}
              >
                <Heart className={`h-5 w-5 ${inWishlist ? 'fill-current' : ''}`} />
                {inWishlist ? 'Saved in Wishlist' : 'Save to Wishlist'}
              </button>
            </div>

            <button
              onClick={() => setShowSizeGuide(!showSizeGuide)}
              className="flex items-center gap-2 text-electric-volt-green transition hover:text-white"
            >
              <Ruler className="h-4 w-4" />
              Size Guide
            </button>

            {showSizeGuide && (
              <div className="rounded-3xl border border-white/10 bg-neutral-950/60 p-5">
                <h4 className="text-sm uppercase tracking-[0.4em] text-white/50">Fit grid</h4>
                <table className="mt-4 w-full text-sm text-white/70">
                  <thead className="border-b border-white/10">
                    <tr>
                      <th className="pb-2 text-left">Size</th>
                      <th className="pb-2 text-left">Chest (in)</th>
                      <th className="pb-2 text-left">Waist (in)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['S', '34-36', '28-30'],
                      ['M', '38-40', '32-34'],
                      ['L', '42-44', '36-38'],
                      ['XL', '46-48', '40-42'],
                    ].map(([size, chest, waist]) => (
                      <tr key={size} className="border-b border-white/5 last:border-none">
                        <td className="py-2">{size}</td>
                        <td>{chest}</td>
                        <td>{waist}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="grid gap-4 rounded-3xl border border-white/10 bg-neutral-950/70 p-6 md:grid-cols-3">
              {[{
                icon: Package,
                title: 'Free Returns',
                copy: 'Within 30 days'
              }, {
                icon: Truck,
                title: 'Rush Delivery',
                copy: '2-5 business days'
              }, {
                icon: Shield,
                title: 'Secure Checkout',
                copy: 'End-to-end encrypted'
              }].map((feature) => (
                <div key={feature.title} className="space-y-2">
                  <feature.icon className="h-5 w-5 text-electric-volt-green" />
                  <p className="text-sm font-semibold">{feature.title}</p>
                  <p className="text-xs text-white/60">{feature.copy}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

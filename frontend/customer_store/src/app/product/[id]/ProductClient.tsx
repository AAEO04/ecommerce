'use client'

import { useEffect, useState } from 'react'
import { useCartStore } from '@/stores/useCartStore'
import { useWishlistStore } from '@/stores/useWishlistStore'
import { useRecentlyViewedStore } from '@/stores/useRecentlyViewedStore'
import { Product, ProductVariant } from '@/lib/api'
import { ProductImageGallery } from '@/components/ui/ProductImageGallery'
import { VariantSelector } from '@/components/ui/VariantSelector'
import { StockBadge } from '@/components/ui/StockBadge'
import { LowStockWarning } from '@/components/ui/LowStockWarning'
import { formatNGN } from '@/utils/currency'
import { Heart, ShoppingCart, Ruler, Package, Truck, Shield, Sparkles, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function ProductClient({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem)
  const addToWishlist = useWishlistStore((s) => s.addItem)
  const removeFromWishlist = useWishlistStore((s) => s.removeItem)
  const isInWishlist = useWishlistStore((s) => s.isInWishlist)
  const addToRecentlyViewed = useRecentlyViewedStore((s) => s.addItem)

  const [showSizeGuide, setShowSizeGuide] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)
  const inWishlist = isInWishlist(product.id)

  // Get current price and stock based on selected variant
  const currentPrice = selectedVariant?.price ?? product.price
  const currentStock = selectedVariant?.stock_quantity ?? 0
  const isOutOfStock = currentStock === 0
  const maxQuantity = Math.min(currentStock, 99)

  useEffect(() => {
    // Track recently viewed
    addToRecentlyViewed(product)
  }, [product.id])

  const handleAddToCart = () => {
    if (!selectedVariant) {
      toast.error('Please select a size first')
      return
    }

    if (isOutOfStock) {
      toast.error('This variant is out of stock')
      return
    }

    if (quantity > currentStock) {
      toast.error(`Only ${currentStock} items available`)
      return
    }

    for (let i = 0; i < quantity; i++) {
      addItem(product, selectedVariant.id)
    }
    toast.success(`${quantity} x ${product.name} (${selectedVariant.size}${selectedVariant.color ? ` - ${selectedVariant.color}` : ''}) added to cart`)
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
    <div className="relative min-h-screen bg-black text-white selection:bg-electric-volt-green selection:text-black">
      <div className="fixed inset-0 hero-grid opacity-10 pointer-events-none" aria-hidden="true" />
      <div className="fixed inset-0 hero-noise opacity-20 pointer-events-none" aria-hidden="true" />

      <div className="relative z-10 container mx-auto px-4 py-12 space-y-10">
        <nav className="flex items-center gap-2 text-[10px] uppercase tracking-[0.4em] text-white/40">
          <Link href="/" className="hover:text-electric-volt-green transition-colors">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-electric-volt-green transition-colors">Products</Link>
          <span>/</span>
          <span className="text-white">{product.name}</span>
        </nav>

        <div className="grid gap-16 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-8">
            <div className="rounded-[32px] border border-white/10 bg-neutral-950/50 p-2 backdrop-blur-sm">
              <ProductImageGallery images={images} productName={product.name} />
            </div>

            {/* Desktop Description */}
            <div className="hidden lg:block space-y-8">
              <div className="border-t border-white/10 pt-8">
                <h3 className="text-xs font-bold uppercase tracking-[0.4em] text-white mb-4">Description</h3>
                <p className="text-gray-400 leading-relaxed">{product.description}</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
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
                  <div key={feature.title} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center space-y-2">
                    <feature.icon className="h-5 w-5 text-electric-volt-green mx-auto" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">{feature.title}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-8 lg:sticky lg:top-24 h-fit">
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="inline-flex items-center gap-2 rounded-full border border-electric-volt-green/30 bg-electric-volt-green/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-electric-volt-green">
                    <Sparkles className="h-3 w-3" />
                    Drop #{product.id}
                  </span>
                  <StockBadge variants={product.variants} />
                </div>

                <h1 className="text-4xl md:text-6xl font-black leading-[0.9] tracking-tight" style={{ fontFamily: 'Druk Wide, Arial Black, sans-serif' }}>
                  {product.name}
                </h1>

                <p className="text-3xl font-bold text-electric-volt-green font-mono">
                  {formatNGN(currentPrice)}
                </p>
              </div>

              {/* Mobile Description */}
              <div className="lg:hidden border-t border-white/10 pt-6 pb-6">
                <p className="text-sm text-gray-400 leading-relaxed">{product.description}</p>
              </div>

              <div className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
                <VariantSelector
                  variants={product.variants}
                  selectedVariant={selectedVariant}
                  onSelectVariant={setSelectedVariant}
                />

                {selectedVariant && selectedVariant.stock_quantity > 0 && selectedVariant.stock_quantity <= 5 && (
                  <LowStockWarning stockQuantity={selectedVariant.stock_quantity} />
                )}

                <div className="flex items-center justify-between border-t border-white/10 pt-6">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500">Quantity</span>
                  <div className="flex items-center gap-4 rounded-full border border-white/20 bg-black/50 px-4 py-2">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={!selectedVariant || isOutOfStock}
                      className="text-white hover:text-electric-volt-green disabled:opacity-30 transition-colors"
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-mono font-bold">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                      disabled={!selectedVariant || isOutOfStock || quantity >= maxQuantity}
                      className="text-white hover:text-electric-volt-green disabled:opacity-30 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <Button
                    onClick={handleAddToCart}
                    disabled={!selectedVariant || isOutOfStock}
                    variant={!selectedVariant || isOutOfStock ? "outline" : "kinetic"}
                    className="w-full h-14 text-sm"
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    {!selectedVariant ? 'Select Size' : isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                  </Button>

                  <button
                    onClick={handleToggleWishlist}
                    className={`w-full flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.2em] py-3 transition-colors ${inWishlist ? 'text-red-400' : 'text-gray-500 hover:text-white'
                      }`}
                  >
                    <Heart className={`h-4 w-4 ${inWishlist ? 'fill-current' : ''}`} />
                    {inWishlist ? 'Saved to Wishlist' : 'Save to Wishlist'}
                  </button>
                </div>
              </div>

              <button
                onClick={() => setShowSizeGuide(!showSizeGuide)}
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-gray-500 hover:text-white transition-colors"
              >
                <Ruler className="h-4 w-4" />
                Size Guide
              </button>

              {showSizeGuide && (
                <div className="rounded-2xl border border-white/10 bg-neutral-900 p-6 animate-in fade-in slide-in-from-top-2">
                  <h4 className="text-xs font-bold uppercase tracking-[0.4em] text-white mb-4">Fit Grid</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-gray-400">
                      <thead>
                        <tr className="border-b border-white/10 text-white">
                          <th className="pb-3 text-left font-bold uppercase tracking-wider">Size</th>
                          <th className="pb-3 text-left font-bold uppercase tracking-wider">Chest</th>
                          <th className="pb-3 text-left font-bold uppercase tracking-wider">Waist</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {[
                          ['S', '34-36"', '28-30"'],
                          ['M', '38-40"', '32-34"'],
                          ['L', '42-44"', '36-38"'],
                          ['XL', '46-48"', '40-42"'],
                        ].map(([size, chest, waist]) => (
                          <tr key={size}>
                            <td className="py-3 font-bold text-white">{size}</td>
                            <td className="py-3">{chest}</td>
                            <td className="py-3">{waist}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Add to Cart Bar */}
      <div className={`fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-black/80 backdrop-blur-xl transition-transform duration-300 ${selectedVariant ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="hidden md:flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-white/10 overflow-hidden">
              {/* Thumbnail would go here */}
              <div className="h-full w-full bg-neutral-800" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">{product.name}</p>
              <p className="text-xs text-gray-400">{selectedVariant?.size} {selectedVariant?.color && `· ${selectedVariant.color}`}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="hidden md:block text-right">
              <p className="text-lg font-bold text-electric-volt-green font-mono">{formatNGN(currentPrice)}</p>
            </div>
            <Button
              onClick={handleAddToCart}
              disabled={!selectedVariant || isOutOfStock}
              variant="kinetic"
              className="flex-1 md:flex-none md:w-64"
            >
              {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

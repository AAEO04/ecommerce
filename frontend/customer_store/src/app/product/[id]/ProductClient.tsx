'use client'

import { useEffect, useState } from 'react'
import { useCartStore } from '@/stores/useCartStore'
import { useWishlistStore } from '@/stores/useWishlistStore'
import { useRecentlyViewedStore } from '@/stores/useRecentlyViewedStore'
import { Product } from '@/lib/api'
import { ProductImageGallery } from '@/components/ui/ProductImageGallery'
import { formatNGN } from '@/utils/currency'
import { Heart, ShoppingCart, Ruler, Package, Truck, Shield } from 'lucide-react'
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
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-neutral-400 mb-6">
        <Link href="/" className="hover:text-white">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/products" className="hover:text-white">Products</Link>
        <span className="mx-2">/</span>
        <span className="text-white">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div>
          <ProductImageGallery images={images} productName={product.name} />
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{product.name}</h1>
            <div className="text-4xl font-bold text-accent-green mb-4">
              {formatNGN(product.price)}
            </div>
          </div>

          {product.description && (
            <div className="text-neutral-300">
              <h3 className="font-semibold text-white mb-2">Description</h3>
              <p>{product.description}</p>
            </div>
          )}

          {/* Quantity selector */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Quantity</label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors"
              >
                -
              </button>
              <span className="px-6 py-2 bg-neutral-900 text-white rounded-lg font-semibold min-w-[4ch] text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            <button
              onClick={handleAddToCart}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-accent-green hover:bg-accent-green-700 text-white rounded-lg font-semibold transition-colors"
            >
              <ShoppingCart className="h-5 w-5" />
              Add to Cart
            </button>

            <button
              onClick={handleToggleWishlist}
              className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-lg font-semibold transition-colors ${
                inWishlist
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700'
              }`}
            >
              <Heart className={`h-5 w-5 ${inWishlist ? 'fill-current' : ''}`} />
              {inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
            </button>
          </div>

          {/* Size guide button */}
          <button
            onClick={() => setShowSizeGuide(!showSizeGuide)}
            className="flex items-center gap-2 text-accent-green hover:text-accent-green-700 transition-colors"
          >
            <Ruler className="h-4 w-4" />
            Size Guide
          </button>

          {showSizeGuide && (
            <div className="p-4 bg-neutral-900 rounded-lg border border-neutral-700">
              <h4 className="font-semibold text-white mb-3">Size Guide</h4>
              <table className="w-full text-sm text-neutral-300">
                <thead>
                  <tr className="border-b border-neutral-700">
                    <th className="text-left py-2">Size</th>
                    <th className="text-left py-2">Chest (in)</th>
                    <th className="text-left py-2">Waist (in)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-neutral-800">
                    <td className="py-2">S</td>
                    <td className="py-2">34-36</td>
                    <td className="py-2">28-30</td>
                  </tr>
                  <tr className="border-b border-neutral-800">
                    <td className="py-2">M</td>
                    <td className="py-2">38-40</td>
                    <td className="py-2">32-34</td>
                  </tr>
                  <tr className="border-b border-neutral-800">
                    <td className="py-2">L</td>
                    <td className="py-2">42-44</td>
                    <td className="py-2">36-38</td>
                  </tr>
                  <tr>
                    <td className="py-2">XL</td>
                    <td className="py-2">46-48</td>
                    <td className="py-2">40-42</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Product features */}
          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-neutral-800">
            <div className="flex items-center gap-3">
              <Package className="h-5 w-5 text-accent-green" />
              <div className="text-sm">
                <div className="font-semibold text-white">Free Returns</div>
                <div className="text-neutral-400">Within 30 days</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Truck className="h-5 w-5 text-accent-green" />
              <div className="text-sm">
                <div className="font-semibold text-white">Fast Delivery</div>
                <div className="text-neutral-400">2-5 business days</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-accent-green" />
              <div className="text-sm">
                <div className="font-semibold text-white">Secure Payment</div>
                <div className="text-neutral-400">SSL encrypted</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

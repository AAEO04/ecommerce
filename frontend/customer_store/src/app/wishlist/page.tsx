'use client'

import { useWishlistStore } from '@/stores/useWishlistStore'
import { useCartStore } from '@/stores/useCartStore'
import Image from 'next/image'
import Link from 'next/link'
import { formatNGN } from '@/utils/currency'
import { Heart, ShoppingCart, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function WishlistPage() {
  const items = useWishlistStore((s) => s.items)
  const removeItem = useWishlistStore((s) => s.removeItem)
  const addToCart = useCartStore((s) => s.addItem)

  const handleAddToCart = (item: any) => {
    // Convert wishlist item to product format
    const product = {
      id: item.id,
      name: item.name,
      price: item.price,
      description: '',
      images: [{ image_url: item.image }],
      variants: item.variants || [{ id: 1, size: 'Default', price: item.price, stock_quantity: 100 }],
    }
    // Use first available variant
    const variantId = product.variants[0]?.id || 1
    addToCart(product, variantId)
    toast.success(`${item.name} added to cart`)
  }

  return (
    <div className="container mx-auto px-4 py-8 pb-24 md:pb-8">
      <div className="flex items-center gap-3 mb-6">
        <Heart className="h-8 w-8 text-red-500 fill-current" />
        <h1 className="text-3xl font-bold text-white">My Wishlist</h1>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold mb-2 text-white">Your wishlist is empty</h2>
          <p className="text-gray-600 mb-6">
            Save your favorite items to your wishlist
          </p>
          <Link
            href="/products"
            className="inline-block px-6 py-3 bg-accent-green text-white rounded-lg hover:bg-accent-green-700 transition-colors"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="border border-neutral-800 rounded-lg p-4 bg-neutral-900 hover:border-accent-green transition-colors"
            >
              <Link href={`/product/${item.id}`} className="block">
                <div className="relative aspect-square rounded-lg overflow-hidden mb-3">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover hover:scale-110 transition-transform"
                  />
                </div>
              </Link>

              <div className="space-y-3">
                <div>
                  <Link href={`/product/${item.id}`}>
                    <h3 className="text-lg font-semibold text-white hover:text-accent-green transition-colors">
                      {item.name}
                    </h3>
                  </Link>
                  <p className="text-xl font-bold text-accent-green">
                    {formatNGN(item.price)}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-accent-green hover:bg-accent-green-700 text-white rounded-lg transition-colors"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Add to Cart
                  </button>
                  <button
                    onClick={() => {
                      removeItem(item.id)
                      toast.success('Removed from wishlist')
                    }}
                    className="p-2 border border-neutral-700 hover:border-red-500 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors"
                    title="Remove from wishlist"
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
  )
}

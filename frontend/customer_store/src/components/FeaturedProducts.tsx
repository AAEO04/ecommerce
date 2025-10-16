'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { StarIcon, HeartIcon } from '@heroicons/react/24/solid'
import { HeartIcon as HeartOutlineIcon } from '@heroicons/react/24/outline'
import { useCart } from '@/context/CartContext'

interface Product {
  id: number
  name: string
  description: string
  category: string
  price: number
  image: string
  rating: number
  variants: Array<{
    id: number
    size: string
    color?: string
    stock_quantity: number
    price: number
  }>
}

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState<number[]>([])
  const { addItem } = useCart()

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products?limit=8`)
      const data = await response.json()
      setProducts(data.map((product: any) => ({
        ...product,
        rating: Math.random() * 2 + 3, // Mock rating for now
        image: product.images?.[0]?.image_url || '/placeholder-product.jpg'
      })))
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleFavorite = (productId: number) => {
    setFavorites(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const handleAddToCart = (product: Product) => {
    const variant = product.variants[0] // Use first variant for now
    if (variant) {
      addItem({
        productId: product.id,
        variantId: variant.id,
        name: product.name,
        size: variant.size,
        color: variant.color,
        price: variant.price,
        quantity: 1,
        image: product.image
      })
    }
  }

  if (loading) {
    return (
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10 lg:mb-12">
            <div className="animate-pulse">
              <div className="h-6 sm:h-7 lg:h-8 bg-secondary-200 rounded w-48 sm:w-56 lg:w-64 mx-auto mb-3 sm:mb-4"></div>
              <div className="h-3 sm:h-4 bg-secondary-200 rounded w-72 sm:w-80 lg:w-96 mx-auto"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-secondary-200 rounded-lg sm:rounded-xl h-48 sm:h-56 lg:h-64 mb-3 sm:mb-4"></div>
                <div className="h-3 sm:h-4 bg-secondary-200 rounded mb-1.5 sm:mb-2"></div>
                <div className="h-3 sm:h-4 bg-secondary-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-secondary-900 mb-3 sm:mb-4">
            Featured <span className="mad-rush-logo">Products</span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-secondary-600 max-w-2xl mx-auto">
            Discover our most popular pieces that define the MAD RUSH lifestyle. 
            Bold, uncompromising, and built for the urban warrior.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {products.map((product) => (
            <div key={product.id} className="product-card group">
              <div className="relative overflow-hidden rounded-lg sm:rounded-xl">
                {/* Product Image */}
                <div className="aspect-square bg-secondary-100 relative">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Favorite Button */}
                  <button
                    onClick={() => toggleFavorite(product.id)}
                    className="absolute top-2 right-2 sm:top-3 sm:right-3 lg:top-4 lg:right-4 p-1.5 sm:p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
                  >
                    {favorites.includes(product.id) ? (
                      <HeartIcon className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
                    ) : (
                      <HeartOutlineIcon className="h-4 w-4 sm:h-5 sm:w-5 text-secondary-600" />
                    )}
                  </button>

                  {/* Quick Add Button */}
                  <div className="absolute inset-x-2 bottom-2 sm:inset-x-3 sm:bottom-3 lg:inset-x-4 lg:bottom-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="w-full btn-primary text-xs sm:text-sm py-2 sm:py-2.5"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-3 sm:p-4">
                  <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                    <span className="text-xs sm:text-sm text-secondary-500 uppercase tracking-wide">
                      {product.category}
                    </span>
                    <div className="flex items-center">
                      <StarIcon className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400" />
                      <span className="text-xs sm:text-sm text-secondary-600 ml-1">
                        {product.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  
                  <h3 className="text-base sm:text-lg font-semibold text-secondary-900 mb-1.5 sm:mb-2 line-clamp-2">
                    <Link href={`/products/${product.id}`} className="hover:text-primary-600 transition-colors">
                      {product.name}
                    </Link>
                  </h3>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-lg sm:text-xl lg:text-2xl font-bold text-primary-600">
                      ${product.variants[0]?.price || product.price}
                    </span>
                    <div className="flex space-x-1">
                      {product.variants.slice(0, 2).map((variant, index) => (
                        <span
                          key={variant.id}
                          className="text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 bg-secondary-100 text-secondary-600 rounded"
                        >
                          {variant.size}
                        </span>
                      ))}
                      {product.variants.length > 2 && (
                        <span className="text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 bg-secondary-100 text-secondary-600 rounded">
                          +{product.variants.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-8 sm:mt-10 lg:mt-12">
          <Link href="/products" className="btn-outline text-sm sm:text-base py-2.5 sm:py-3 px-4 sm:px-6">
            View All Products
          </Link>
        </div>
      </div>
    </section>
  )
}

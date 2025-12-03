'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@radix-ui/react-dialog'
import { X, Heart, ShoppingCart } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Product } from '@/lib/api'
import { formatNGN } from '@/utils/currency'
import { useCartStore } from '@/stores/useCartStore'
import { useWishlistStore } from '@/stores/useWishlistStore'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

interface QuickViewModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
}

export function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const addToCart = useCartStore((s) => s.addItem)
  const addToWishlist = useWishlistStore((s) => s.addItem)
  const isInWishlist = useWishlistStore((s) => s.isInWishlist)

  if (!product) return null

  const handleAddToCart = () => {
    const variantId = product.variants?.[0]?.id || 1
    addToCart(product, variantId)
    toast.success(`${product.name} added to cart`)
  }

  const handleToggleWishlist = () => {
    if (isInWishlist(product.id)) {
      useWishlistStore.getState().removeItem(product.id)
      toast.success('Removed from wishlist')
    } else {
      addToWishlist(product)
      toast.success('Added to wishlist')
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-neutral-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-neutral-800 hover:bg-neutral-700 transition-colors z-10"
                aria-label="Close quick view"
              >
                <X className="h-5 w-5 text-white" />
              </button>

              <div className="grid md:grid-cols-2 gap-6 p-6">
                {/* Images */}
                <div className="space-y-4">
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-neutral-800">
                    <Image
                      src={product.images[selectedImageIndex]?.image_url || product.images[0]?.image_url}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>

                  {product.images.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {product.images.map((img, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${selectedImageIndex === index
                            ? 'border-accent-green'
                            : 'border-neutral-700 hover:border-neutral-500'
                            }`}
                        >
                          <Image
                            src={img.image_url}
                            alt={`${product.name} thumbnail ${index + 1}`}
                            fill
                            className="object-cover"
                            sizes="100px"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Product details */}
                <div className="space-y-4">
                  <DialogTitle className="text-2xl font-bold text-white">
                    {product.name}
                  </DialogTitle>

                  <div className="text-3xl font-bold text-accent-green">
                    {product.variants?.[0]?.price ? formatNGN(Number(product.variants[0].price)) : 'N/A'}
                  </div>

                  {product.description && (
                    <div className="text-neutral-300 text-sm">
                      {product.description}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="space-y-3">
                    <button
                      onClick={handleAddToCart}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-accent-green hover:bg-accent-green-700 text-white rounded-lg font-semibold transition-colors"
                    >
                      <ShoppingCart className="h-5 w-5" />
                      Add to Cart
                    </button>

                    <button
                      onClick={handleToggleWishlist}
                      className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${isInWishlist(product.id)
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-neutral-800 hover:bg-neutral-700 text-white'
                        }`}
                    >
                      <Heart className={`h-5 w-5 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                      {isInWishlist(product.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                    </button>

                    <Link
                      href={`/product/${product.id}`}
                      className="block text-center px-6 py-3 border border-neutral-700 hover:border-neutral-500 text-white rounded-lg font-semibold transition-colors"
                      onClick={onClose}
                    >
                      View Full Details
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </Dialog>
      )}
    </AnimatePresence>
  )
}

'use client'

import { useState } from 'react'
import { Product, ProductVariant } from '@/lib/api'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { VariantSelector } from '@/components/ui/VariantSelector'
import { useCartStore } from '@/stores/useCartStore'
import { formatNGN } from '@/utils/currency'
import { ShoppingCart, X } from 'lucide-react'
import toast from 'react-hot-toast'

interface QuickAddModalProps {
    product: Product
    isOpen: boolean
    onClose: () => void
}

export function QuickAddModal({ product, isOpen, onClose }: QuickAddModalProps) {
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)
    const [quantity, setQuantity] = useState(1)
    const addItem = useCartStore((state) => state.addItem)

    // Calculate current price with better fallbacks
    const getCurrentPrice = () => {
        if (selectedVariant?.price !== undefined && selectedVariant.price !== null) {
            return typeof selectedVariant.price === 'number' ? selectedVariant.price : Number(selectedVariant.price)
        }

        const firstVariant = product.variants?.[0]
        if (firstVariant?.price !== undefined && firstVariant.price !== null) {
            return typeof firstVariant.price === 'number' ? firstVariant.price : Number(firstVariant.price)
        }

        if (product.price !== undefined && product.price !== null) {
            return typeof product.price === 'number' ? product.price : Number(product.price)
        }

        return 0
    }

    const currentPrice = getCurrentPrice()
    const currentStock = selectedVariant?.stock_quantity ?? 0
    const isOutOfStock = currentStock === 0
    const maxQuantity = Math.min(currentStock, 99)

    const handleAddToCart = () => {
        if (!selectedVariant) {
            toast.error('Please select a size')
            return
        }

        if (isOutOfStock) {
            toast.error('This variant is out of stock')
            return
        }

        for (let i = 0; i < quantity; i++) {
            addItem(product, selectedVariant.id)
        }

        toast.success(`${quantity} x ${product.name} added to cart`)
        onClose()

        // Reset for next time
        setSelectedVariant(null)
        setQuantity(1)
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[95vw] sm:max-w-2xl bg-black border-white/20 text-white max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl sm:text-2xl font-black pr-8">{product.name}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 sm:space-y-6 mt-4">
                    {/* Product Image */}
                    {product.images?.[0] && (
                        <div className="relative aspect-square rounded-2xl overflow-hidden bg-neutral-900">
                            <img
                                src={product.images[0].image_url}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    {/* Price */}
                    <div className="text-2xl sm:text-3xl font-black text-electric-volt-green">
                        {formatNGN(currentPrice)}
                    </div>

                    {/* Variant Selector */}
                    <VariantSelector
                        variants={product.variants}
                        selectedVariant={selectedVariant}
                        onSelectVariant={setSelectedVariant}
                    />

                    {/* Quantity Selector */}
                    <div className="rounded-2xl sm:rounded-3xl border border-white/10 bg-neutral-950/70 p-4 sm:p-5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs sm:text-sm uppercase tracking-[0.2em] sm:tracking-[0.3em] text-white/60">Quantity</span>
                            <div className="flex items-center gap-2 sm:gap-3">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    disabled={!selectedVariant || isOutOfStock}
                                    className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl sm:rounded-2xl border border-white/20 text-lg sm:text-xl font-bold text-white transition hover:border-electric-volt-green disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    −
                                </button>
                                <span className="min-w-[3ch] sm:min-w-[4ch] text-center text-xl sm:text-2xl font-black">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                                    disabled={!selectedVariant || isOutOfStock || quantity >= maxQuantity}
                                    className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl sm:rounded-2xl border border-white/20 text-lg sm:text-xl font-bold text-white transition hover:border-electric-volt-green disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                        onClick={handleAddToCart}
                        disabled={!selectedVariant || isOutOfStock}
                        className={`inline-flex w-full items-center justify-center gap-2 sm:gap-3 rounded-2xl sm:rounded-3xl border px-5 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-semibold uppercase tracking-[0.2em] sm:tracking-[0.3em] transition ${!selectedVariant || isOutOfStock
                            ? 'border-white/20 bg-white/5 text-white/30 cursor-not-allowed'
                            : 'border-electric-volt-green bg-electric-volt-green text-black hover:-translate-y-1'
                            }`}
                    >
                        <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                        {!selectedVariant ? 'Select a Size' : isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

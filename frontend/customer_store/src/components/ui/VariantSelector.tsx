'use client'

import { ProductVariant } from '@/lib/api'
import { Check } from 'lucide-react'

interface VariantSelectorProps {
    variants: ProductVariant[]
    selectedVariant: ProductVariant | null
    onSelectVariant: (variant: ProductVariant) => void
}

export function VariantSelector({
    variants,
    selectedVariant,
    onSelectVariant
}: VariantSelectorProps) {
    // Group variants by size for better organization
    const sizes = Array.from(new Set(variants.map(v => v.size)))
    const colors = Array.from(new Set(variants.map(v => v.color).filter(Boolean)))

    const getVariantByAttributes = (size: string, color?: string) => {
        return variants.find(v =>
            v.size === size &&
            (color ? v.color === color : true) &&
            v.is_active
        )
    }

    const isOutOfStock = (variant: ProductVariant) => variant.stock_quantity === 0
    const isLowStock = (variant: ProductVariant) => variant.stock_quantity > 0 && variant.stock_quantity <= 5

    return (
        <div className="space-y-6">
            {/* Size Selection */}
            <div className="space-y-3">
                <label className="text-sm uppercase tracking-[0.3em] text-white/60">
                    Select Size
                </label>
                <div className="flex flex-wrap gap-3">
                    {sizes.map((size) => {
                        const variant = getVariantByAttributes(size)
                        if (!variant) return null

                        const isSelected = selectedVariant?.size === size
                        const outOfStock = isOutOfStock(variant)

                        return (
                            <button
                                key={size}
                                onClick={() => !outOfStock && onSelectVariant(variant)}
                                disabled={outOfStock}
                                className={`
                  relative min-w-[4rem] rounded-2xl border px-6 py-3 text-sm font-semibold uppercase tracking-wider transition-all
                  ${isSelected
                                        ? 'border-electric-volt-green bg-electric-volt-green/10 text-electric-volt-green'
                                        : outOfStock
                                            ? 'border-white/10 bg-white/5 text-white/30 cursor-not-allowed line-through'
                                            : 'border-white/20 text-white hover:border-electric-volt-green hover:text-electric-volt-green'
                                    }
                `}
                            >
                                {size}
                                {isSelected && (
                                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-electric-volt-green">
                                        <Check className="h-3 w-3 text-black" />
                                    </span>
                                )}
                                {outOfStock && (
                                    <span className="absolute inset-0 flex items-center justify-center text-[10px] text-red-400">
                                        OUT
                                    </span>
                                )}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Color Selection (if applicable) */}
            {colors.length > 0 && (
                <div className="space-y-3">
                    <label className="text-sm uppercase tracking-[0.3em] text-white/60">
                        Select Color
                    </label>
                    <div className="flex flex-wrap gap-3">
                        {colors.map((color) => {
                            if (!color) return null

                            const variant = getVariantByAttributes(selectedVariant?.size || sizes[0], color)
                            if (!variant) return null

                            const isSelected = selectedVariant?.color === color
                            const outOfStock = isOutOfStock(variant)

                            return (
                                <button
                                    key={color}
                                    onClick={() => !outOfStock && onSelectVariant(variant)}
                                    disabled={outOfStock}
                                    className={`
                    relative min-w-[5rem] rounded-2xl border px-6 py-3 text-sm font-semibold capitalize tracking-wider transition-all
                    ${isSelected
                                            ? 'border-electric-volt-green bg-electric-volt-green/10 text-electric-volt-green'
                                            : outOfStock
                                                ? 'border-white/10 bg-white/5 text-white/30 cursor-not-allowed line-through'
                                                : 'border-white/20 text-white hover:border-electric-volt-green hover:text-electric-volt-green'
                                        }
                  `}
                                >
                                    {color}
                                    {isSelected && (
                                        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-electric-volt-green">
                                            <Check className="h-3 w-3 text-black" />
                                        </span>
                                    )}
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Stock Status for Selected Variant */}
            {selectedVariant && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm uppercase tracking-[0.3em] text-white/60">
                            Stock Status
                        </span>
                        <div className="flex items-center gap-2">
                            {isOutOfStock(selectedVariant) ? (
                                <span className="rounded-full bg-red-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-red-400">
                                    Out of Stock
                                </span>
                            ) : isLowStock(selectedVariant) ? (
                                <>
                                    <span className="rounded-full bg-yellow-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-yellow-400">
                                        Low Stock
                                    </span>
                                    <span className="text-sm text-white/80">
                                        Only {selectedVariant.stock_quantity} left
                                    </span>
                                </>
                            ) : (
                                <>
                                    <span className="rounded-full bg-electric-volt-green/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-electric-volt-green">
                                        In Stock
                                    </span>
                                    <span className="text-sm text-white/80">
                                        {selectedVariant.stock_quantity} available
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

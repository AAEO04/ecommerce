'use client'

import { ProductVariant } from '@/lib/api'

interface StockBadgeProps {
    variants: ProductVariant[]
    className?: string
}

export function StockBadge({ variants, className = '' }: StockBadgeProps) {
    // Calculate total stock across all active variants
    const totalStock = variants
        .filter(v => v.is_active)
        .reduce((sum, v) => sum + v.stock_quantity, 0)

    const isOutOfStock = totalStock === 0
    const isLowStock = totalStock > 0 && totalStock <= 5

    if (isOutOfStock) {
        return (
            <div className={`inline-flex items-center gap-1.5 rounded-full bg-red-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-red-400 ${className}`}>
                <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                Out of Stock
            </div>
        )
    }

    if (isLowStock) {
        return (
            <div className={`inline-flex items-center gap-1.5 rounded-full bg-yellow-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-yellow-400 ${className}`}>
                <span className="h-1.5 w-1.5 rounded-full bg-yellow-400 animate-pulse" />
                Low Stock
            </div>
        )
    }

    return (
        <div className={`inline-flex items-center gap-1.5 rounded-full bg-electric-volt-green/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-electric-volt-green ${className}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-electric-volt-green" />
            In Stock
        </div>
    )
}

'use client'

import { AlertTriangle } from 'lucide-react'

interface LowStockWarningProps {
    stockQuantity: number
    className?: string
}

const LOW_STOCK_THRESHOLD = 5

export function LowStockWarning({ stockQuantity, className = '' }: LowStockWarningProps) {
    if (stockQuantity <= 0 || stockQuantity > LOW_STOCK_THRESHOLD) {
        return null
    }

    return (
        <div className={`flex items-center gap-3 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-4 ${className}`}>
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-yellow-500/20">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="flex-1">
                <p className="text-sm font-semibold text-yellow-400">Low Stock Alert</p>
                <p className="text-xs text-white/70">
                    Only <span className="font-bold text-yellow-400">{stockQuantity}</span> {stockQuantity === 1 ? 'item' : 'items'} left in stock. Order soon!
                </p>
            </div>
        </div>
    )
}

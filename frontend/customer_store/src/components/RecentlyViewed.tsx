'use client'

import { useRecentlyViewedStore } from '@/stores/useRecentlyViewedStore'
import Image from 'next/image'
import Link from 'next/link'
import { formatNGN } from '@/utils/currency'

export function RecentlyViewed() {
  const items = useRecentlyViewedStore((s) => s.items)

  if (items.length === 0) return null

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-white mb-6">Recently Viewed</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {items.slice(0, 6).map((item) => (
          <Link
            key={item.id}
            href={`/product/${item.id}`}
            className="group border border-neutral-800 rounded-lg p-3 bg-neutral-900 hover:border-accent-green transition-colors"
          >
            <div className="relative aspect-square rounded-lg overflow-hidden mb-2">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform"
              />
            </div>
            <h3 className="text-sm font-semibold text-white truncate">{item.name}</h3>
            <p className="text-xs text-accent-green font-bold">{formatNGN(item.price)}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}

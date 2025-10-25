'use client'

import Link from 'next/link'
import { useCartStore } from '@/stores/useCartStore'

export default function Header() {
  const totalCount = useCartStore((s) => s.getTotalCount())

  return (
    <header className="w-full bg-white shadow-sm">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">MAD RUSH</Link>
        <nav className="flex items-center gap-4">
          <Link href="/products" className="text-sm">Products</Link>
          <Link href="/cart" className="text-sm">Cart ({totalCount})</Link>
        </nav>
      </div>
    </header>
  )
}

'use client'

import { Home, ShoppingBag, Heart, Search } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCartStore } from '@/stores/useCartStore'
import { useWishlistStore } from '@/stores/useWishlistStore'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export function MobileBottomNav() {
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const cartCount = useCartStore((s) => s.getTotalCount())
  const wishlistCount = useWishlistStore((s) => s.items.length)

  useEffect(() => {
    setMounted(true)
  }, [])

  const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/products', icon: Search, label: 'Search' },
    { href: '/cart', icon: ShoppingBag, label: 'Cart', badge: cartCount },
    { href: '/wishlist', icon: Heart, label: 'Wishlist', badge: wishlistCount },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-2xl border-t border-white/5 z-50 pb-safe">
      <div className="grid grid-cols-4 h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={`${item.label}${mounted && item.badge && item.badge > 0 ? ` (${item.badge} items)` : ''}`}
              className="relative flex flex-col items-center justify-center gap-1"
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={`relative p-1 rounded-xl transition-colors ${isActive ? 'text-electric-volt-green' : 'text-white/50'
                  }`}
              >
                <Icon className="h-6 w-6" />

                {mounted && item.badge && item.badge > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`absolute -top-1 -right-1 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center border border-black ${item.label === 'Cart' ? 'bg-electric-volt-green' : 'bg-purple-500'
                      }`}
                  >
                    {item.badge > 9 ? '9+' : item.badge}
                  </motion.span>
                )}
              </motion.div>

              {isActive && (
                <motion.div
                  layoutId="mobileNavIndicator"
                  className="absolute bottom-1 w-1 h-1 bg-electric-volt-green rounded-full shadow-[0_0_8px_var(--volt-green)]"
                />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

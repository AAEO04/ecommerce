'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Flame, Heart } from 'lucide-react'
import toast from 'react-hot-toast'

import { BestSellerProduct, Product } from '@/lib/api'
import { useCartStore } from '@/stores/useCartStore'
import { useWishlistStore } from '@/stores/useWishlistStore'
import { formatNGN } from '@/utils/currency'

interface BestSellersProps {
  bestSellers: BestSellerProduct[]
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const formatCategory = (value?: string | null) => {
  if (!value) return 'Uncategorized'
  return value.replace(/[-_]/g, ' ').toUpperCase()
}

const getPrice = (product: Product) => {
  if (typeof product.price === 'number') return product.price
  const variantPrice = product.variants?.[0]?.price
  return typeof variantPrice === 'number' ? Number(variantPrice) : 0
}

export function BestSellers({ bestSellers }: BestSellersProps) {
  const addItem = useCartStore((state) => state.addItem)
  const addToWishlist = useWishlistStore((state) => state.addItem)
  const removeFromWishlist = useWishlistStore((state) => state.removeItem)
  const isInWishlist = useWishlistStore((state) => state.isInWishlist)

  if (!bestSellers?.length) {
    return null
  }

  const totalUnits = bestSellers.reduce((sum, entry) => sum + (entry.unitsSold || 0), 0)
  const totalRevenue = bestSellers.reduce((sum, entry) => sum + (entry.revenue || 0), 0)

  const handleQuickAdd = (product: Product) => {
    addItem(product)
    toast.success(`${product.name} added to cart`)
  }

  const toggleWishlist = (product: Product) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id)
      toast.success('Removed from wishlist')
    } else {
      addToWishlist(product)
      toast.success('Saved to wishlist')
    }
  }

  return (
    <section className="relative overflow-hidden bg-black py-20">
      <div className="absolute inset-0 hero-grid opacity-10" aria-hidden="true" />
      <div className="absolute inset-0 hero-noise opacity-30" aria-hidden="true" />

      <div className="relative z-10 container mx-auto px-4 space-y-12">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4 max-w-2xl">
            <p className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.35em] text-white/60">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-electric-volt-green/10 text-electric-volt-green">
                <Flame className="h-4 w-4" />
              </span>
              Most Ordered
            </p>
            <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
              Best Sellers heat board
            </h2>
            <p className="text-white/70 text-lg">
              Real orders from the last 30 days, ranked by units sold and revenue. Tap in to what the MAD RUSH fam is actually copping.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="rounded-full border border-white/20 px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
              30 DAY SIGNAL
            </span>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/30 px-5 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-white hover:bg-white hover:text-black transition"
            >
              Shop the board
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <motion.div
          className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          transition={{ staggerChildren: 0.12 }}
        >
          {bestSellers.map((entry, index) => {
            const product = entry.product
            const coverImage = product.images?.[0]?.image_url
            const price = getPrice(product)
            const wishlistActive = isInWishlist(product.id)

            return (
              <motion.div
                key={product.id}
                variants={itemVariants}
                whileHover={{ y: -8 }}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-neutral-950/80 p-6 backdrop-blur"
              >
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.35em] text-white/60">
                  <span className="flex items-center gap-2 text-electric-volt-green">
                    <Flame className="h-4 w-4" />
                    #{index + 1}
                  </span>
                  <span className="text-white/50">{entry.unitsSold} orders</span>
                </div>

                {coverImage && (
                  <div className="mt-4 overflow-hidden rounded-2xl border border-white/5">
                    <Image
                      src={coverImage}
                      alt={product.name}
                      width={480}
                      height={320}
                      className="h-56 w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>
                )}

                <div className="mt-5 space-y-2">
                  <p className="text-xs uppercase tracking-[0.4em] text-white/50">{formatCategory(product.category)}</p>
                  <h3 className="text-2xl font-semibold text-white leading-tight">{product.name}</h3>
                  <p className="text-lg font-bold text-electric-volt-green">{formatNGN(price)}</p>
                </div>

                <div className="mt-5 flex items-center gap-3">
                  <button
                    onClick={() => handleQuickAdd(product)}
                    className="flex-1 rounded-2xl bg-electric-volt-green px-4 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-black shadow-[0_12px_30px_rgba(173,255,0,0.35)] transition hover:-translate-y-0.5"
                  >
                    Quick Add
                  </button>
                  <button
                    aria-pressed={wishlistActive}
                    onClick={() => toggleWishlist(product)}
                    className={`rounded-full border p-3 transition ${
                      wishlistActive ? 'border-red-400 text-red-400' : 'border-white/30 text-white/70'
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${wishlistActive ? 'fill-red-400 text-red-400' : ''}`} />
                  </button>
                </div>

                <div className="mt-6 flex items-center justify-between text-xs text-white/60">
                  <span>Revenue {formatNGN(entry.revenue)}</span>
                  <Link
                    href={`/product/${product.id}`}
                    className="inline-flex items-center gap-2 text-electric-volt-green hover:underline"
                  >
                    View product
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white">
            <p className="text-sm uppercase tracking-[0.4em] text-white/50">Total orders</p>
            <p className="mt-2 text-3xl font-black">{totalUnits}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white">
            <p className="text-sm uppercase tracking-[0.4em] text-white/50">Revenue pulse</p>
            <p className="mt-2 text-3xl font-black">{formatNGN(totalRevenue)}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white">
            <p className="text-sm uppercase tracking-[0.4em] text-white/50">Sell through</p>
            <p className="mt-2 text-3xl font-black">{bestSellers.length} styles</p>
          </div>
        </div>
      </div>
    </section>
  )
}

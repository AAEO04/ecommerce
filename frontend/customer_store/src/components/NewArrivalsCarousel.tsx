'use client'

import Image from 'next/image'
import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Sparkles, Heart } from 'lucide-react'
import toast from 'react-hot-toast'

import { Product } from '@/lib/api'
import { useCartStore } from '@/stores/useCartStore'
import { useWishlistStore } from '@/stores/useWishlistStore'
import { formatNGN } from '@/utils/currency'

interface NewArrivalsCarouselProps {
  products: Product[]
}

const normalizeCategory = (value?: string | null) => value?.toLowerCase()?.trim() ?? ''

const formatCategory = (value?: string | null) => {
  if (!value) return 'NEW SIGNAL'
  return value.replace(/[-_]/g, ' ').toUpperCase()
}

const getPrice = (product: Product) => {
  // Prioritize variant price as it's the actual selling price
  const variantPrice = product.variants?.[0]?.price
  if (variantPrice !== undefined && variantPrice !== null) {
    const price = typeof variantPrice === 'number' ? variantPrice : Number(variantPrice)
    if (!isNaN(price) && price > 0) return price
  }

  // Fallback to product.price
  if (product.price !== undefined && product.price !== null) {
    const price = typeof product.price === 'number' ? product.price : Number(product.price)
    if (!isNaN(price) && price > 0) return price
  }

  return 0
}

export function NewArrivalsCarousel({ products }: NewArrivalsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [itemsPerView, setItemsPerView] = useState(4)
  const [activeFilter, setActiveFilter] = useState('all')

  const addItem = useCartStore((state) => state.addItem)
  const addToWishlist = useWishlistStore((state) => state.addItem)
  const removeFromWishlist = useWishlistStore((state) => state.removeItem)
  const isInWishlist = useWishlistStore((state) => state.isInWishlist)

  useEffect(() => {
    const handleResize = () => {
      // On mobile, show all items for native scrolling
      if (window.innerWidth < 640) setItemsPerView(99)
      else if (window.innerWidth < 1024) setItemsPerView(2)
      else if (window.innerWidth < 1440) setItemsPerView(3)
      else setItemsPerView(4)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const filters = useMemo(() => {
    const unique = new Set<string>()
    products.forEach((product) => {
      const normalized = normalizeCategory(product.category)
      if (normalized) unique.add(normalized)
    })

    return ['all', ...Array.from(unique)]
  }, [products])

  const filteredProducts = useMemo(() => {
    if (activeFilter === 'all') return products
    return products.filter((product) => normalizeCategory(product.category) === activeFilter)
  }, [products, activeFilter])

  useEffect(() => {
    setCurrentIndex(0)
  }, [activeFilter, itemsPerView])

  useEffect(() => {
    setCurrentIndex((prev) => {
      const max = Math.max(0, filteredProducts.length - itemsPerView)
      return Math.min(prev, max)
    })
  }, [filteredProducts.length, itemsPerView])

  const maxIndex = Math.max(0, filteredProducts.length - itemsPerView)

  const handlePrevious = () => setCurrentIndex((prev) => Math.max(0, prev - 1))
  const handleNext = () => setCurrentIndex((prev) => Math.min(maxIndex, prev + 1))

  const visibleProducts = filteredProducts.slice(currentIndex, currentIndex + itemsPerView)

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
      <div className="absolute inset-0 hero-grid opacity-20" aria-hidden="true" />
      <div className="absolute inset-0 hero-noise opacity-30" aria-hidden="true" />

      <div className="relative z-10 container mx-auto px-4 space-y-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4 max-w-2xl">
            <p className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.4em] text-white/60">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-electric-volt-green/10 text-electric-volt-green">
                <Sparkles className="h-4 w-4" />
              </span>
              Incoming Heat
            </p>
            <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
              New Arrivals radar
            </h2>
            <p className="text-white/70 text-lg">
              Quick-turn silhouettes tested in the MAD RUSH lab. Filter by energy lane and swipe through the freshest grid with tilt-on-hover interactions.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                aria-current={activeFilter === filter ? 'true' : 'false'}
                aria-label={`Filter by ${filter}`}
                className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${activeFilter === filter
                  ? 'border-electric-volt-green bg-electric-volt-green text-black shadow-[0_10px_30px_rgba(173,255,0,0.35)]'
                  : 'border-white/30 text-white/70 hover:border-electric-volt-green/70'
                  }`}
              >
                {filter === 'all' ? 'All Drops' : filter.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-1 text-white/70 text-sm uppercase tracking-[0.4em]">
            <p>{filteredProducts.length} styles on deck</p>
            <p>
              Window {currentIndex + 1} / {maxIndex + 1 || 1}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="rounded-2xl border border-white/30 p-3 text-white transition disabled:opacity-40 disabled:cursor-not-allowed hover:border-electric-volt-green hover:text-electric-volt-green"
              aria-label="Previous products"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex >= maxIndex}
              className="rounded-2xl border border-white/30 p-3 text-white transition disabled:opacity-40 disabled:cursor-not-allowed hover:border-electric-volt-green hover:text-electric-volt-green"
              aria-label="Next products"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${currentIndex}-${activeFilter}`}
              initial={{ opacity: 0, x: 120 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -120 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-4 pb-8 -mx-4 px-4 sm:grid sm:grid-cols-2 sm:gap-5 sm:pb-0 sm:mx-0 sm:px-0 lg:grid-cols-3 xl:grid-cols-4"
            >
              {visibleProducts.map((product) => {
                const primaryImage = product.images?.[0]?.image_url || '/brand-circle.png'
                const secondaryImage = product.images?.[1]?.image_url
                const wishlistActive = isInWishlist(product.id)
                const price = getPrice(product)

                return (
                  <motion.div
                    key={product.id}
                    whileHover={{ y: -8, rotateX: -2 }}
                    className="min-w-[85vw] snap-center flex-shrink-0 group relative overflow-hidden rounded-[28px] border border-white/10 bg-neutral-950/90 p-5 text-white shadow-[0_20px_60px_rgba(0,0,0,0.35)] sm:min-w-0"
                  >
                    <div className="relative mb-5 aspect-[4/5] overflow-hidden rounded-2xl border border-white/5 bg-black/60">
                      <Image
                        src={primaryImage}
                        alt={product.name}
                        fill
                        sizes="(max-width:768px) 100vw, 25vw"
                        className="object-cover transition duration-500 group-hover:opacity-0"
                      />
                      {secondaryImage && (
                        <Image
                          src={secondaryImage}
                          alt={`${product.name} alternate view`}
                          fill
                          sizes="(max-width:768px) 100vw, 25vw"
                          className="object-cover opacity-0 transition duration-500 group-hover:opacity-100"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
                      <span className="absolute left-4 top-4 rounded-full border border-white/30 px-4 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/70">
                        {formatCategory(product.category)}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs uppercase tracking-[0.4em] text-white/50">Drop #{product.id}</p>
                      <h3 className="text-2xl font-semibold leading-tight">{product.name}</h3>
                      <p className="text-lg font-bold text-electric-volt-green">{formatNGN(price)}</p>
                    </div>

                    <div className="mt-4 flex items-center gap-3">
                      <button
                        onClick={() => handleQuickAdd(product)}
                        className="flex-1 rounded-2xl bg-electric-volt-green/90 px-4 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-black transition hover:bg-electric-volt-green"
                      >
                        Quick Add
                      </button>
                      <button
                        aria-label={wishlistActive ? 'Remove from wishlist' : 'Add to wishlist'}
                        onClick={() => toggleWishlist(product)}
                        className={`rounded-full border p-3 transition ${wishlistActive ? 'border-red-400 text-red-400' : 'border-white/40 text-white/70'
                          }`}
                      >
                        <Heart className={`h-4 w-4 ${wishlistActive ? 'fill-red-400 text-red-400' : ''}`} />
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex justify-center gap-2">
          {Array.from({ length: maxIndex + 1 || 1 }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-1.5 rounded-full transition-all ${currentIndex === index
                ? 'w-14 bg-electric-volt-green shadow-[0_0_25px_rgba(173,255,0,0.6)]'
                : 'w-4 bg-white/30'
                }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

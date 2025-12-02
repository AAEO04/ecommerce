'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Play, Heart } from 'lucide-react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef, useMemo, useCallback } from 'react'
import { Product } from '@/lib/api'
import { useCartStore } from '@/stores/useCartStore'
import { useWishlistStore } from '@/stores/useWishlistStore'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'

type HeroProps = {
  featuredProducts?: Product[]
}

const fallbackProducts = [
  {
    id: -1,
    name: 'Neon Velocity Jacket',
    description: 'Volt infused shell with reflective seams.',
    price: 240,
    images: [{ image_url: '/brand-circle.png' }],
    variants: [],
    category: 'New Arrival',
    colorLabel: 'Chrome / Volt',
  },
  {
    id: -2,
    name: 'Static Pulse Crew',
    description: 'Graphite knit with purple accents.',
    price: 140,
    images: [{ image_url: '/brand-circle.png' }],
    variants: [],
    category: 'Core Drop',
    colorLabel: 'Graphite / Purple',
  },
  {
    id: -3,
    name: 'Hyper Rush Cargo',
    description: 'Matte black cargo with strap system.',
    price: 220,
    images: [{ image_url: '/brand-circle.png' }],
    variants: [],
    category: 'Collab',
    colorLabel: 'Matte Black',
  },
]

export function Hero({ featuredProducts }: HeroProps) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%'])
  const addItem = useCartStore((s) => s.addItem)

  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } =
    useWishlistStore((s) => ({
      addItem: s.addItem,
      removeItem: s.removeItem,
      isInWishlist: s.isInWishlist,
    }))

  const checkWishlist = useCallback((id: number) => isInWishlist(id), [isInWishlist])

  const carouselProducts = useMemo(() => {
    return featuredProducts?.length ? featuredProducts.slice(0, 6) : fallbackProducts
  }, [featuredProducts])

  const handleQuickAdd = (product: Product) => {
    const firstVariant = product.variants?.[0]
    if (!firstVariant) {
      toast.error('Product has no available variants')
      return
    }
    addItem(product, firstVariant.id)
    toast.success(`${product.name} added to cart`)
  }

  const toggleWishlist = (product: Product) => {
    if (checkWishlist(product.id)) {
      removeFromWishlist(product.id)
      toast.success('Removed from wishlist')
    } else {
      addToWishlist(product)
      toast.success('Saved to wishlist')
    }
  }

  return (
    <section
      ref={ref}
      className="relative min-h-[85vh] overflow-hidden bg-black text-white overflow-x-hidden"
    >
      <motion.div className="absolute inset-0 hero-grid opacity-30" style={{ y }} />
      <div className="absolute inset-0 hero-noise" aria-hidden="true" />

      <div className="relative z-10 container mx-auto px-3 sm:px-6 py-16 sm:py-20 max-w-full">
        {/* Tags */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-wrap gap-2 sm:gap-3 mb-10"
        >
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-semibold bg-electric-volt-green text-black tracking-[0.15em]">
            NEW DROP
          </span>
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-semibold border border-white/40 text-white/80 tracking-[0.15em]">
            KINETIC CHAOS LAB
          </span>
        </motion.div>

        {/* Main grid */}
        <div className="grid gap-8 lg:gap-12 grid-cols-1 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Left column */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="space-y-5"
            >
              <p className="text-[10px] sm:text-xs uppercase text-white/60 tracking-[0.2em]">
                DROP 07 · HYPER RUSH
              </p>

              <h1 className="font-black leading-tight text-3xl sm:text-4xl md:text-5xl lg:text-6xl break-words">
                Streetwear engineered for motion blur.
              </h1>

              <p className="text-white/70 text-base sm:text-lg leading-relaxed">
                Built for velocity, tuned for expressive silhouettes. High-impact textures,
                reflective inks, and adaptive fits for the ones who move fast.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="flex flex-wrap gap-3 sm:gap-4"
            >
              <Link
                href="/products"
                className="group inline-flex items-center justify-center bg-electric-volt-green text-black rounded-xl sm:rounded-2xl font-semibold px-5 py-3 sm:px-6 sm:py-4 text-sm sm:text-base shadow-[0_10px_35px_rgba(173,255,0,0.35)] hover:-translate-y-1 transition-all"
              >
                Shop the drop
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/lookbook"
                className="inline-flex items-center justify-center border border-white/40 rounded-xl sm:rounded-2xl font-semibold text-white px-5 py-3 sm:px-6 sm:py-4 text-sm sm:text-base hover:bg-white hover:text-black transition-all"
              >
                <Play className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Watch campaign
              </Link>
            </motion.div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Video */}
            <div className="relative hero-media overflow-hidden rounded-3xl border border-white/10 group aspect-[3/4] sm:aspect-[4/5] md:aspect-[3/4]">
              <video
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                className="absolute inset-0 w-full h-full object-cover"
                style={{ willChange: 'transform' }}
              >
                <source src="/videos/campaign.mp4" type="video/mp4" />
              </video>

              <div className="absolute bottom-6 left-6">
                <p className="text-xs tracking-[0.3em] text-white/70">CAMPAIGN FILM</p>
                <Link
                  href="/campaign"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-electric-volt-green hover:text-white transition-colors"
                >
                  View behind the scenes
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Carousel */}
            <div className="overflow-x-auto scrollbar-hide -mx-3 px-3">
              <div className="flex gap-4 pb-4">
                {carouselProducts.map((product) => {
                  const image = product?.images?.[0]?.image_url
                  const canTransact = product.id > 0
                  const wishlistActive = canTransact && checkWishlist(product.id)

                  const price =
                    typeof product.price === 'number'
                      ? product.price
                      : product.variants?.[0]?.price ?? null

                  const displayPrice = price ? price.toLocaleString() : '--'

                  return (
                    <div
                      key={`${product.id}-${product.name}`}
                      className="min-w-[75vw] sm:min-w-[220px] flex-shrink-0 group relative p-4 rounded-2xl border border-white/10 bg-white/5"
                    >
                      <div className="absolute top-3 left-3">
                        <span className="inline-flex items-center px-2 py-1 rounded bg-red-600 text-[10px] font-bold uppercase tracking-wider">
                          Limited Run
                        </span>
                      </div>

                      {image && (
                        <div className="mb-3 overflow-hidden rounded-xl border border-white/5">
                          <Image
                            src={image}
                            alt={product.name}
                            width={240}
                            height={160}
                            className="h-32 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                      )}

                      <p className="text-[10px] uppercase tracking-[0.2em] text-white/50">
                        {product.category ?? 'Featured'}
                      </p>

                      <p className="text-lg font-bold text-white mt-1">{product.name}</p>

                      <p className="text-xs uppercase text-white/60 mt-1">
                        {product.colorLabel ?? 'Limited Run'}
                      </p>

                      <p className="text-electric-volt-green font-bold mt-2 text-lg">
                        ₦{displayPrice}
                      </p>

                      <div className="mt-4 flex items-center justify-between gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="kinetic"
                          className="flex-1 text-[10px]"
                          disabled={!canTransact}
                          onClick={() => canTransact && handleQuickAdd(product)}
                        >
                          Quick Add
                        </Button>

                        <button
                          aria-label="Toggle wishlist"
                          className={`rounded-full p-2 border ${wishlistActive
                            ? 'border-red-400 text-red-400'
                            : 'border-white/30 text-white/70'
                            } hover:border-red-400 hover:text-red-400 transition-colors`}
                          disabled={!canTransact}
                          onClick={() => canTransact && toggleWishlist(product)}
                        >
                          <Heart
                            className="h-4 w-4"
                            fill={wishlistActive ? '#f87171' : 'transparent'}
                          />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Play, Heart } from 'lucide-react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef, useMemo } from 'react'
import { Product } from '@/lib/api'
import { useCartStore } from '@/stores/useCartStore'
import { useWishlistStore } from '@/stores/useWishlistStore'
import toast from 'react-hot-toast'

type HeroProps = {
  featuredProducts?: Product[]
}

const fallbackProducts: (Product & { category?: string; colorLabel?: string })[] = [
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
    description: 'Graphite knit with cyan accents.',
    price: 140,
    images: [{ image_url: '/brand-circle.png' }],
    variants: [],
    category: 'Core Drop',
    colorLabel: 'Graphite / Cyan',
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
  const addToWishlist = useWishlistStore((s) => s.addItem)
  const removeFromWishlist = useWishlistStore((s) => s.removeItem)
  const isInWishlist = useWishlistStore((s) => s.isInWishlist)

  const carouselProducts = useMemo(() => {
    if (featuredProducts && featuredProducts.length > 0) {
      return featuredProducts.slice(0, 6)
    }
    return fallbackProducts
  }, [featuredProducts])

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
    <section ref={ref} className="relative min-h-[90vh] overflow-hidden bg-black text-white">
      {/* Background layers */}
      <motion.div className="absolute inset-0 hero-grid opacity-30" style={{ y }} />
      <div className="absolute inset-0 hero-noise" aria-hidden="true" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 py-20">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <div className="max-w-3xl space-y-10">
            {/* Brand Tags */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-wrap gap-3"
            >
              <span className="inline-flex items-center px-4 py-2 rounded-full text-xs md:text-sm font-semibold bg-electric-volt-green text-black tracking-[0.2em]">
                NEW DROP
              </span>
              <span className="inline-flex items-center px-4 py-2 rounded-full text-xs md:text-sm font-semibold border border-white/40 text-white/80 tracking-[0.2em]">
                KINETIC CHAOS LAB
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="space-y-6"
            >
              <p className="text-xs uppercase tracking-[0.6em] text-white/60">DROP 07 · HYPER RUSH</p>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight">
                Streetwear engineered for motion blur.
              </h1>
              <p className="text-lg md:text-xl text-white/70 max-w-2xl">
                Built for velocity, tuned for expressive silhouettes. High-impact textures, reflective inks, and adaptive fits for the ones who move fast.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="flex flex-wrap gap-5"
            >
              <Link
                href="/products"
                className="group inline-flex items-center px-8 py-4 bg-electric-volt-green text-black rounded-2xl font-semibold tracking-wide hover:-translate-y-1 transition-all duration-300 shadow-[0_10px_35px_rgba(173,255,0,0.35)]"
              >
                Shop the drop
                <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/lookbook"
                className="inline-flex items-center px-8 py-4 border border-white/40 rounded-2xl font-semibold text-white hover:bg-white hover:text-black transition-all duration-300"
              >
                <Play className="mr-3 h-5 w-5" />
                Watch campaign
              </Link>
            </motion.div>
          </div>

          <div className="space-y-6">
            <div className="relative hero-media overflow-hidden rounded-[32px] border border-white/10">
              <Image
                src="/brand-circle.png"
                alt="Mad Rush campaign still"
                width={900}
                height={1100}
                className="h-full w-full object-cover"
                priority
              />
              <div className="hero-typography">
                <span>DROP 07</span>
                <span>HYPER RUSH</span>
              </div>
              <div className="absolute bottom-6 left-6 flex flex-col gap-1 text-white">
                <p className="text-xs tracking-[0.4em] text-white/70">CAMPAIGN FILM</p>
                <Link href="/campaign" className="inline-flex items-center gap-2 text-sm font-semibold text-electric-volt-green">
                  View behind the scenes
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="hero-carousel">
              <div className="hero-carousel-track">
                {carouselProducts.map((product) => {
                  const image = product.images?.[0]?.image_url
                  const canTransact = product.id > 0
                  const wishlistActive = canTransact && isInWishlist(product.id)

                  return (
                    <div key={`${product.id}-${product.name}`} className="hero-carousel-card group">
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
                      <p className="text-[11px] uppercase tracking-[0.3em] text-white/50">
                        {'category' in product && product.category ? product.category : 'Featured'}
                      </p>
                      <p className="text-lg font-semibold text-white">{product.name}</p>
                      <p className="text-xs uppercase text-white/60">
                        {'colorLabel' in product && product.colorLabel ? product.colorLabel : 'Limited Run'}
                      </p>
                      <p className="text-electric-volt-green font-bold">₦{product.price?.toLocaleString() ?? '--'}</p>

                      <div className="mt-4 flex items-center justify-between gap-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <button
                          className="flex-1 rounded-xl bg-gradient-to-r from-green-500 via-red-500 to-purple-600 py-2 text-xs font-semibold uppercase tracking-[0.2em] shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={!canTransact}
                          onClick={() => canTransact && handleQuickAdd(product)}
                        >
                          Quick Add
                        </button>
                        <button
                          aria-pressed={wishlistActive}
                          className={`rounded-full p-2 border ${wishlistActive ? 'border-red-400 text-red-400' : 'border-white/30 text-white/70'} hover:border-red-400 hover:text-red-400 transition-colors`}
                          disabled={!canTransact}
                          onClick={() => canTransact && toggleWishlist(product)}
                        >
                          <Heart className="h-4 w-4" fill={wishlistActive ? '#f87171' : 'transparent'} />
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
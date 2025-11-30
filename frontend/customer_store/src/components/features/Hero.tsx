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
import { Button } from '@/components/ui/button'

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
    // Use the first available variant
    const firstVariant = product.variants?.[0]
    if (!firstVariant) {
      toast.error('Product has no available variants')
      return
    }
    addItem(product, firstVariant.id)
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
      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-20 max-w-full overflow-hidden">
        {/* Brand Tags - Aligned with Campaign Video */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-wrap gap-3 mb-12"
        >
          <span className="inline-flex items-center px-4 py-2 rounded-full text-xs md:text-sm font-semibold bg-electric-volt-green text-black tracking-[0.2em]">
            NEW DROP
          </span>
          <span className="inline-flex items-center px-4 py-2 rounded-full text-xs md:text-sm font-semibold border border-white/40 text-white/80 tracking-[0.2em]">
            KINETIC CHAOS LAB
          </span>
        </motion.div>

        <div className="grid items-start gap-8 lg:gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <div className="w-full space-y-8 lg:space-y-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="space-y-6"
              style={{ width: '100%' }}
            >
              <p className="text-xs sm:text-sm uppercase text-white/60 tracking-[0.2em] sm:tracking-[0.6em]">DROP 07 · HYPER RUSH</p>
              <h1 className="font-black leading-[1.1] tracking-tight break-words text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl max-w-full">
                Streetwear engineered for motion blur.
              </h1>
              <p className="text-white/70 break-words text-base sm:text-lg md:text-xl leading-relaxed max-w-full">
                Built for velocity, tuned for expressive silhouettes. High-impact textures, reflective inks, and adaptive fits for the ones who move fast.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="flex flex-wrap gap-3 sm:gap-4 md:gap-5"
            >
              <Link
                href="/products"
                className="group inline-flex items-center justify-center bg-electric-volt-green text-black rounded-2xl font-semibold hover:-translate-y-1 transition-all duration-300 shadow-[0_10px_35px_rgba(173,255,0,0.35)] px-5 py-3 sm:px-6 sm:py-4 md:px-8 md:py-4 text-sm sm:text-base"
              >
                Shop the drop
                <ArrowRight className="ml-2 sm:ml-3 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/lookbook"
                className="inline-flex items-center justify-center border border-white/40 rounded-2xl font-semibold text-white hover:bg-white hover:text-black transition-all duration-300 px-5 py-3 sm:px-6 sm:py-4 md:px-8 md:py-4 text-sm sm:text-base"
              >
                <Play className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5" />
                Watch campaign
              </Link>
            </motion.div>
          </div>

          <div className="space-y-6">
            <div className="relative hero-media overflow-hidden rounded-[32px] border border-white/10 group aspect-[4/5] md:aspect-[3/4]">
              <video
                autoPlay
                muted
                loop
                playsInline
                poster="/videos/campaign-poster.jpg"
                className="absolute inset-0 w-full h-full object-cover"
              >
                <source src="/videos/campaign.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <div className="hero-typography">
                <span>DROP 07</span>
                <span>HYPER RUSH</span>
              </div>
              <div className="absolute bottom-6 left-6 flex flex-col gap-1 text-white z-20">
                <p className="text-xs tracking-[0.4em] text-white/70">CAMPAIGN FILM</p>
                <Link href="/campaign" className="inline-flex items-center gap-2 text-sm font-semibold text-electric-volt-green hover:text-white transition-colors">
                  View behind the scenes
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="overflow-x-auto overflow-y-hidden -mx-6 px-6 scrollbar-hide">
              <div className="flex gap-4 pb-4">
                {carouselProducts.map((product) => {
                  const image = product.images?.[0]?.image_url
                  const canTransact = product.id > 0
                  const wishlistActive = canTransact && isInWishlist(product.id)

                  // Robust price logic
                  let displayPrice = '--'
                  if (typeof product.price === 'number') {
                    displayPrice = product.price.toLocaleString()
                  } else if (product.variants && product.variants.length > 0) {
                    displayPrice = Number(product.variants[0].price).toLocaleString()
                  }

                  return (
                    <div key={`${product.id}-${product.name}`} className="min-w-[240px] flex-shrink-0 group relative p-4 rounded-2xl border border-white/10 bg-white/5">
                      {/* Limited Run Badge */}
                      <div className="absolute top-3 left-3 z-10">
                        <span className="inline-flex items-center px-2 py-1 rounded bg-red-600 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg">
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
                      <p className="text-[11px] uppercase tracking-[0.3em] text-white/50 font-display">
                        {'category' in product && product.category ? product.category : 'Featured'}
                      </p>
                      <p className="text-lg font-bold text-white font-display leading-tight mt-1">{product.name}</p>
                      <p className="text-xs uppercase text-white/60 mt-1">
                        {'colorLabel' in product && product.colorLabel ? product.colorLabel : 'Limited Run'}
                      </p>
                      <p className="text-electric-volt-green font-bold mt-2 text-lg">₦{displayPrice}</p>

                      <div className="mt-4 flex items-center justify-between gap-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <Button
                          variant="kinetic"
                          className="flex-1 text-[10px]"
                          disabled={!canTransact}
                          onClick={() => canTransact && handleQuickAdd(product)}
                        >
                          Quick Add
                        </Button>
                        <button
                          aria-label={wishlistActive ? 'Remove from wishlist' : 'Add to wishlist'}
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
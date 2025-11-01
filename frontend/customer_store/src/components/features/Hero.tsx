'use client'

import Link from 'next/link'
import { ArrowRight, Play } from 'lucide-react'
import { motion, useScroll, useTransform } from 'framer-motion'
import GlitchText from './GlitchText'
import { useRef } from 'react'

export function Hero() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%'])

  return (
    <section ref={ref} className="relative min-h-[80vh] max-h-screen overflow-hidden animated-gradient-border">
      {/* Background with Parallax */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black z-0"
        style={{ y }}
      />

      {/* Content */}
      <div className="relative h-full flex items-center z-10">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl">
            {/* Brand Tags */}
            <div className="mb-6 flex flex-wrap gap-2">
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-accent-green text-white">
                New Season
              </span>
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-accent-purple text-white">
                Streetwear
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6">
              <GlitchText text="MAD RUSH" />
            </h1>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <Link
                href="/products"
                className="inline-flex items-center px-6 py-3 bg-accent-green text-white rounded-lg font-medium hover:bg-accent-green-700 transition-colors animate-pulse"
              >
                Shop Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <button className="inline-flex items-center px-6 py-3 border-2 border-white text-white rounded-lg font-medium hover:bg-white/10 transition-colors">
                <Play className="mr-2 h-5 w-5" />
                View Collection
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

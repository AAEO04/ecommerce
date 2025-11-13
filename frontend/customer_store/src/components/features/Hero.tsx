'use client'

import Link from 'next/link'
import { ArrowRight, Play } from 'lucide-react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { GlitchText } from './GlitchText'
import { useRef } from 'react'

export function Hero() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%'])

  return (
    <section ref={ref} className="relative min-h-[85vh] overflow-hidden bg-gradient-to-br from-gray-900 via-purple-900 to-black">
      {/* Background with Parallax */}
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-600/20 via-transparent to-transparent z-0"
        style={{ y }}
      />

      {/* Content */}
      <div className="relative h-full flex items-center z-10 min-h-[85vh]">
        <div className="container mx-auto px-6 py-20">
          <div className="max-w-4xl">
            {/* Brand Tags */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8 flex flex-wrap gap-3"
            >
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-green-500 text-white shadow-lg">
                New Season
              </span>
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-purple-600 text-white shadow-lg">
                Premium Streetwear
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 tracking-tight leading-tight"
            >
              MAD RUSH
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-2xl md:text-3xl text-gray-200 font-medium mb-10 leading-relaxed"
            >
              No Chills, Just Mad Rush
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap gap-5"
            >
              <Link
                href="/products"
                className="group inline-flex items-center px-8 py-4 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
              >
                Shop Now
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center px-8 py-4 border-2 border-white text-white rounded-xl font-semibold hover:bg-white hover:text-gray-900 transition-all duration-300 shadow-xl"
              >
                <Play className="mr-2 h-5 w-5" />
                View Collection
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

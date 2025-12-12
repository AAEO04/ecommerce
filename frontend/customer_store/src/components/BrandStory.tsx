'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

export function BrandStory() {
  return (
    <section className="py-32 bg-black relative overflow-hidden">
      <div className="absolute inset-0 hero-grid opacity-20" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="space-y-10"
          >
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="h-px w-12 bg-electric-volt-green" />
                <span className="text-xs font-bold uppercase tracking-[0.4em] text-electric-volt-green">Brand Story</span>
              </div>

              <h2 className="text-5xl md:text-7xl font-black text-white tracking-tight leading-[0.9]" style={{ fontFamily: 'Druk Wide, Arial Black, sans-serif' }}>
                BUILT FOR<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50">VELOCITY.</span>
              </h2>

              <p className="text-lg text-gray-400 leading-relaxed max-w-xl">
                MAD RUSH is the collision of underground art, performance fabrics, and nightlife energy. Every release is numbered, archived, and built to withstand motion blur.
              </p>
            </div>
          </motion.div>

          {/* Campaign Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
              <Image
                src="/brand-lifestyle.jpg"
                alt="Wear it however TF you want - MAD RUSH Beanie Campaign"
                width={800}
                height={1000}
                className="w-full h-auto object-cover"
                priority
              />

              {/* Subtle overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Decorative accent */}
            <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-electric-volt-green/20 blur-3xl" />
            <div className="absolute -top-4 -left-4 h-16 w-16 rounded-full bg-electric-volt-green/10 blur-2xl" />
          </motion.div>
        </div>
      </div>
    </section>
  )
}

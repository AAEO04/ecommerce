'use client'

import { motion } from 'framer-motion'
import { Zap, Heart, TrendingUp, Shield } from 'lucide-react'

export function BrandStory() {
  const features = [
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Experience the rush with our quick delivery and seamless shopping',
      accentBar: 'bg-electric-volt-green',
      accentText: 'text-electric-volt-green'
    },
    {
      icon: Heart,
      title: 'Customer First',
      description: 'Your satisfaction is our priority. We go the extra mile for you',
      accentBar: 'bg-accent-red-500',
      accentText: 'text-accent-red-500'
    },
    {
      icon: TrendingUp,
      title: 'Trending Products',
      description: 'Stay ahead with the latest and hottest items in the market',
      accentBar: 'bg-accent-purple-600',
      accentText: 'text-accent-purple-600'
    },
    {
      icon: Shield,
      title: 'Secure Shopping',
      description: 'Shop with confidence knowing your data is protected',
      accentBar: 'bg-white/70',
      accentText: 'text-white/80'
    }
  ]

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

            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <h3 className="text-3xl font-black text-white">12+</h3>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500">Cities Activated</p>
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-black text-white">48</h3>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500">Limited Capsules</p>
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-black text-white">9K+</h3>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500">Community Drops</p>
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-black text-white">24/7</h3>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500">Support Signal</p>
              </div>
            </div>
          </motion.div>

          <div className="grid gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 hover:bg-white/10 transition-colors"
              >
                <div className={`absolute top-0 left-0 h-full w-1 opacity-0 group-hover:opacity-100 transition-opacity ${feature.accentBar}`} />
                <div className="flex items-start gap-6">
                  <div className={`p-3 rounded-xl bg-white/5 ${feature.accentText}`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-white uppercase tracking-wide">{feature.title}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

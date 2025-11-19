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
    <section className="py-20 bg-black relative overflow-hidden">
      <div className="absolute inset-0 hero-grid opacity-20" aria-hidden="true" />
      <div className="absolute inset-0 hero-noise opacity-10" aria-hidden="true" />
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl"
        >
          <p className="text-xs uppercase tracking-[0.6em] text-white/40 mb-4">MAD RUSH / BRAND STORY</p>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-6">
            Built for the ones who move fast.
          </h2>
          <div className="flex flex-wrap gap-4 text-sm uppercase tracking-[0.35em] text-white/60">
            <span>Design Lab · Lagos</span>
            <span className="text-electric-volt-green">Drop pipeline · Weekly</span>
            <span className="text-accent-red-500">Community first</span>
          </div>
        </motion.div>

        <div className="mt-12 grid lg:grid-cols-[1.1fr_0.9fr] gap-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-6 bg-neutral-950 border border-white/10 rounded-3xl p-8"
          >
            <div className="flex gap-6 flex-wrap text-base text-neutral-200">
              <div className="flex-1 min-w-[220px]">
                <h3 className="text-xl font-bold text-electric-volt-green mb-2">Why we rush</h3>
                <p>
                  MAD RUSH is the collision of underground art, performance fabrics, and nightlife energy. Every release is numbered, archived, and built to withstand motion blur.
                </p>
              </div>
              <div className="flex-1 min-w-[220px]">
                <h3 className="text-xl font-bold text-accent-red-500 mb-2">Drop ritual</h3>
                <p>
                  We prototype on Monday, field test mid-week, and ship before the weekend hits. No leftovers. No chill. Just limited runs tuned to the city.
                </p>
              </div>
            </div>
            <div className="grid sm:grid-cols-3 gap-4 text-center">
              {[
                { label: 'Cities activated', value: '12', accent: 'text-electric-volt-green' },
                { label: 'Limited capsules', value: '48', accent: 'text-accent-red-500' },
                { label: 'Community drops', value: '9K+', accent: 'text-accent-purple-600' },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-white/10 p-4">
                  <p className={`text-3xl font-black ${stat.accent}`}>{stat.value}</p>
                  <p className="text-xs uppercase tracking-[0.35em] text-white/50 mt-2">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="space-y-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
                className="flex gap-4 rounded-2xl border border-white/10 bg-neutral-950/90 p-5"
              >
                <span className={`w-1.5 rounded-full ${feature.accentBar}`} aria-hidden="true" />
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <feature.icon className={`h-5 w-5 ${feature.accentText}`} />
                    <p className={`text-xs uppercase tracking-[0.4em] ${feature.accentText}`}>Pillar</p>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-1">{feature.title}</h3>
                  <p className="text-sm text-neutral-300">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

'use client'

import { motion } from 'framer-motion'
import { Zap, Heart, TrendingUp, Shield } from 'lucide-react'

export function BrandStory() {
  const features = [
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Experience the rush with our quick delivery and seamless shopping'
    },
    {
      icon: Heart,
      title: 'Customer First',
      description: 'Your satisfaction is our priority. We go the extra mile for you'
    },
    {
      icon: TrendingUp,
      title: 'Trending Products',
      description: 'Stay ahead with the latest and hottest items in the market'
    },
    {
      icon: Shield,
      title: 'Secure Shopping',
      description: 'Shop with confidence knowing your data is protected'
    }
  ]

  return (
    <section className="py-20 bg-gradient-to-b from-neutral-900 to-black">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-accent-green via-accent-purple to-pink-500 mb-4">
            Welcome to MAD RUSH
          </h2>
          <p className="text-xl text-neutral-300 max-w-3xl mx-auto">
            Where shopping meets excitement! We're not just another store – we're a movement. 
            Join the rush and discover products that match your energy and style.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 rounded-xl p-6 hover:border-accent-green transition-all duration-300 hover:scale-105"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-accent-green to-accent-purple rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-neutral-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          
        </motion.div>
      </div>
    </section>
  )
}

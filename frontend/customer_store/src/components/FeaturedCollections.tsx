'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'

export function FeaturedCollections() {
  const collections = [
    {
      title: 'Summer Essentials',
      description: 'Beat the heat with our cool collection',
      image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&h=600&fit=crop',
      link: '/products?category=summer',
      color: 'from-orange-500 to-pink-500'
    },
    {
      title: 'Tech & Gadgets',
      description: 'Latest tech for the modern lifestyle',
      image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&h=600&fit=crop',
      link: '/products?category=tech',
      color: 'from-blue-500 to-purple-500'
    },
    {
      title: 'Fitness & Sports',
      description: 'Gear up for your active lifestyle',
      image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=600&fit=crop',
      link: '/products?category=sports',
      color: 'from-green-500 to-teal-500'
    }
  ]

  return (
    <section className="py-16 bg-neutral-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-black text-white mb-2">
            Featured Collections
          </h2>
          <p className="text-neutral-400">Curated just for you</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((collection, index) => (
            <motion.div
              key={collection.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Link
                href={collection.link}
                className="group block relative overflow-hidden rounded-xl aspect-[4/3] bg-neutral-800"
              >
                <Image
                  src={collection.image}
                  alt={collection.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className={`absolute inset-0 bg-gradient-to-br ${collection.color} opacity-0 group-hover:opacity-30 transition-opacity duration-500`} />
                
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-accent-green transition-colors">
                    {collection.title}
                  </h3>
                  <p className="text-neutral-300 text-sm mb-4">
                    {collection.description}
                  </p>
                  <span className="inline-flex items-center gap-2 text-accent-green font-semibold group-hover:gap-3 transition-all">
                    Shop Now
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

'use client'

import Link from 'next/link'
import { ArrowRightIcon } from '@heroicons/react/24/outline'

const categories = [
  {
    id: 1,
    name: 'T-Shirts',
    slug: 't-shirts',
    description: 'Essential streetwear tees',
    image: '/category-tshirts.jpg',
    color: 'from-blue-500 to-purple-600'
  },
  {
    id: 2,
    name: 'Hoodies',
    slug: 'hoodies',
    description: 'Urban comfort meets style',
    image: '/category-hoodies.jpg',
    color: 'from-gray-600 to-gray-900'
  },
  {
    id: 3,
    name: 'Jackets',
    slug: 'jackets',
    description: 'Bold outerwear statements',
    image: '/category-jackets.jpg',
    color: 'from-red-500 to-orange-600'
  },
  {
    id: 4,
    name: 'Accessories',
    slug: 'accessories',
    description: 'Complete your look',
    image: '/category-accessories.jpg',
    color: 'from-yellow-500 to-red-600'
  }
]

export default function Categories() {
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-secondary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-secondary-900 mb-3 sm:mb-4">
            Shop by <span className="mad-rush-logo">Category</span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-secondary-600 max-w-2xl mx-auto">
            Explore our curated collections designed for every aspect of your urban lifestyle
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/collections/${category.slug}`}
              className="group relative overflow-hidden rounded-xl sm:rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 sm:hover:-translate-y-2"
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-90`}></div>
              
              {/* Content */}
              <div className="relative p-4 sm:p-6 lg:p-8 text-white min-h-[200px] sm:min-h-[250px] lg:min-h-[300px] flex flex-col justify-between">
                {/* Category Icon/Image Placeholder */}
                <div className="flex justify-center mb-4 sm:mb-6">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-full flex items-center justify-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/30 rounded-lg flex items-center justify-center">
                      <span className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
                        {category.name.charAt(0)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Category Info */}
                <div className="text-center">
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-display font-bold mb-1.5 sm:mb-2">
                    {category.name}
                  </h3>
                  <p className="text-white/90 mb-4 sm:mb-6 text-sm sm:text-base">
                    {category.description}
                  </p>
                  
                  {/* CTA */}
                  <div className="inline-flex items-center text-white/90 group-hover:text-white transition-colors">
                    <span className="font-semibold text-sm sm:text-base">Shop Now</span>
                    <ArrowRightIcon className="ml-2 h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>

              {/* Hover Effect Overlay */}
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
          ))}
        </div>

        {/* Additional CTA */}
        <div className="text-center mt-8 sm:mt-10 lg:mt-12">
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg max-w-2xl mx-auto">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-display font-bold text-secondary-900 mb-3 sm:mb-4">
              Can't Find What You're Looking For?
            </h3>
            <p className="text-secondary-600 mb-4 sm:mb-6 text-sm sm:text-base">
              Browse our complete collection or get in touch with our style experts
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link href="/products" className="btn-primary text-sm sm:text-base py-2.5 sm:py-3 px-4 sm:px-6">
                Browse All Products
              </Link>
              <Link href="/contact" className="btn-outline text-sm sm:text-base py-2.5 sm:py-3 px-4 sm:px-6">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

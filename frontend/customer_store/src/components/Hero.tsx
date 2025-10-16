'use client'

import Link from 'next/link'
import { ArrowRightIcon, PlayIcon } from '@heroicons/react/24/outline'

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-secondary-900 via-secondary-800 to-primary-900 text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] bg-repeat"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-center">
          {/* Content */}
          <div className="space-y-6 sm:space-y-8 order-2 lg:order-1">
            {/* Brand Tagline */}
            <div className="space-y-3 sm:space-y-4">
              <div className="inline-block">
                <span className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium bg-primary-600 text-white">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-yellow-400 rounded-full mr-2 animate-pulse"></span>
                  NEW COLLECTION
                </span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-display font-bold leading-tight">
                <span className="block">NO</span>
                <span className="block lightning-bolt">CHILLS</span>
                <span className="block text-lg sm:text-xl md:text-2xl lg:text-3xl font-normal text-primary-300 mt-2 sm:mt-4">
                  ...Just MAD-RUSH
                </span>
              </h1>
            </div>

            <p className="text-base sm:text-lg lg:text-xl text-secondary-300 leading-relaxed max-w-lg">
              Express your bold personality with premium streetwear that breaks boundaries. 
              From urban essentials to statement pieces, MAD RUSH delivers uncompromising style.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link href="/products" className="btn-primary inline-flex items-center justify-center group text-sm sm:text-base py-2.5 sm:py-3 px-4 sm:px-6">
                Shop Now
                <ArrowRightIcon className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <button className="btn-outline inline-flex items-center justify-center group text-white border-white hover:bg-white hover:text-secondary-900 text-sm sm:text-base py-2.5 sm:py-3 px-4 sm:px-6">
                <PlayIcon className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Watch Collection
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 sm:gap-6 lg:gap-8 pt-6 sm:pt-8 border-t border-secondary-700">
              <div className="text-center sm:text-left">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary-400">10K+</div>
                <div className="text-xs sm:text-sm text-secondary-400">Happy Customers</div>
              </div>
              <div className="text-center sm:text-left">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary-400">500+</div>
                <div className="text-xs sm:text-sm text-secondary-400">Products</div>
              </div>
              <div className="text-center sm:text-left">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary-400">24/7</div>
                <div className="text-xs sm:text-sm text-secondary-400">Support</div>
              </div>
            </div>
          </div>

          {/* Visual Element */}
          <div className="relative order-1 lg:order-2">
            <div className="relative z-10 max-w-md mx-auto lg:max-w-none">
              {/* Main Product Display */}
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8 transform rotate-1 sm:rotate-2 lg:rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="aspect-square bg-gradient-to-br from-secondary-100 to-secondary-200 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mx-auto mb-3 sm:mb-4 relative">
                      {/* Lightning Bolt */}
                      <svg viewBox="0 0 24 24" className="w-full h-full fill-current text-primary-600">
                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                      </svg>
                    </div>
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-display font-bold text-secondary-800">PREMIUM</h3>
                    <p className="text-sm sm:text-base text-secondary-600">Streetwear</p>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 w-12 h-12 sm:w-16 sm:h-16 bg-accent-400 rounded-full flex items-center justify-center animate-bounce-slow">
                <span className="text-white font-bold text-xs sm:text-sm">50%</span>
              </div>
              
              <div className="absolute -bottom-2 -left-2 sm:-bottom-4 sm:-left-4 w-16 h-16 sm:w-20 sm:h-20 bg-primary-600 rounded-full flex items-center justify-center animate-pulse-slow">
                <span className="text-white font-bold text-xs sm:text-sm">NEW</span>
              </div>
            </div>

            {/* Background Elements */}
            <div className="absolute inset-0 -z-10">
              <div className="absolute top-1/4 left-1/4 w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 bg-primary-600 rounded-full opacity-20 blur-xl"></div>
              <div className="absolute bottom-1/4 right-1/4 w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-accent-400 rounded-full opacity-20 blur-xl"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-4 sm:bottom-6 lg:bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="w-5 h-8 sm:w-6 sm:h-10 border-2 border-white rounded-full flex justify-center">
          <div className="w-0.5 h-2 sm:w-1 sm:h-3 bg-white rounded-full mt-1.5 sm:mt-2 animate-bounce"></div>
        </div>
      </div>
    </section>
  )
}

'use client'

import { useState } from 'react'
import { EnvelopeIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      setIsSubscribed(true)
      setIsLoading(false)
      setEmail('')
    }, 1000)
  }

  if (isSubscribed) {
    return (
      <section className="py-16 bg-primary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-6">
            <CheckCircleIcon className="h-16 w-16 text-white" />
          </div>
          <h2 className="text-3xl font-display font-bold text-white mb-4">
            Welcome to the MAD RUSH Family!
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            You're now subscribed to our newsletter. Get ready for exclusive drops, 
            early access to new collections, and special member-only deals.
          </p>
          <button
            onClick={() => setIsSubscribed(false)}
            className="btn-outline text-white border-white hover:bg-white hover:text-primary-600"
          >
            Subscribe Another Email
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-gradient-to-br from-secondary-900 via-primary-900 to-secondary-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-display font-bold text-white mb-4">
            Stay in the <span className="lightning-bolt">Loop</span>
          </h2>
          <p className="text-xl text-secondary-300 max-w-2xl mx-auto">
            Join thousands of urban warriors who get first access to new drops, 
            exclusive deals, and insider updates from MAD RUSH.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <EnvelopeIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full pl-12 pr-4 py-4 bg-white rounded-lg text-secondary-900 placeholder-secondary-500 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary whitespace-nowrap disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Subscribing...
                  </div>
                ) : (
                  'Subscribe'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-secondary-300">
              By subscribing, you agree to our{' '}
              <a href="/privacy" className="text-white hover:underline">
                Privacy Policy
              </a>{' '}
              and{' '}
              <a href="/terms" className="text-white hover:underline">
                Terms of Service
              </a>
              . Unsubscribe anytime.
            </p>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-8 border-t border-white/20">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">🎯</span>
              </div>
              <h3 className="text-white font-semibold mb-2">Exclusive Drops</h3>
              <p className="text-secondary-300 text-sm">
                First access to limited edition collections
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">💰</span>
              </div>
              <h3 className="text-white font-semibold mb-2">Member Deals</h3>
              <p className="text-secondary-300 text-sm">
                Special discounts and early sale access
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">📱</span>
              </div>
              <h3 className="text-white font-semibold mb-2">Style Updates</h3>
              <p className="text-secondary-300 text-sm">
                Latest trends and styling inspiration
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

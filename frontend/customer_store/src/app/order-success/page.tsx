'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { CheckCircle, Package, Truck, Mail, Home, ShoppingBag } from 'lucide-react'
import confetti from 'canvas-confetti'

export default function OrderSuccessPage() {
  const [orderNumber] = useState(() => `MR${Date.now().toString().slice(-8)}`)
  const [estimatedDelivery] = useState(() => {
    const date = new Date()
    date.setDate(date.getDate() + 5)
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  })

  useEffect(() => {
    // Trigger confetti
    const duration = 3000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min
    }

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      })
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      })
    }, 250)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-900 to-black py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Left Side - Order Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Success Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', duration: 0.6, delay: 0.2 }}
                className="flex justify-center lg:justify-start mb-8"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-accent-green/20 rounded-full blur-xl" />
                  <CheckCircle className="h-20 w-20 text-accent-green relative" />
                </div>
              </motion.div>

              {/* Main Message */}
              <div className="text-center lg:text-left mb-8">
                <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
                  Order Confirmed!
                </h1>
                <p className="text-xl text-neutral-300 mb-2">
                  Thank you for shopping with MAD RUSH
                </p>
                <p className="text-neutral-400">
                  Order #{orderNumber}
                </p>
              </div>

              {/* Order Details Card */}
              <div className="bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 rounded-xl p-6 mb-6">
                <h2 className="text-xl font-bold text-white mb-4">What's Next?</h2>

                <div className="space-y-4">
                  {/* Timeline */}
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-accent-green/20 rounded-full flex items-center justify-center">
                      <Mail className="h-5 w-5 text-accent-green" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white text-sm">Confirmation Email Sent</h3>
                      <p className="text-xs text-neutral-400">Check your inbox for order details</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-neutral-700 rounded-full flex items-center justify-center">
                      <Package className="h-5 w-5 text-neutral-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white text-sm">Processing Your Order</h3>
                      <p className="text-xs text-neutral-400">We're preparing your items</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-neutral-700 rounded-full flex items-center justify-center">
                      <Truck className="h-5 w-5 text-neutral-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white text-sm">Estimated Delivery</h3>
                      <p className="text-xs text-neutral-400">{estimatedDelivery}</p>
                    </div>
                  </div>
                </div>

                {/* Tracking Info */}
                <div className="mt-6 p-3 bg-accent-green/10 border border-accent-green/20 rounded-lg">
                  <p className="text-xs text-neutral-300">
                    <strong className="text-accent-green">Track your order:</strong> We'll send tracking info via email once shipped.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/"
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg font-semibold transition-colors text-sm"
                >
                  <Home className="h-4 w-4" />
                  Home
                </Link>
                <Link
                  href="/products"
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-accent-green hover:bg-accent-green-700 text-white rounded-lg font-semibold transition-colors text-sm"
                >
                  <ShoppingBag className="h-4 w-4" />
                  Shop More
                </Link>
              </div>
            </motion.div>

            {/* Right Side - Campaign Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="hidden lg:block"
            >
              <div className="relative">
                <div className="overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
                  <Image
                    src="/order-success-campaign.jpg"
                    alt="MAD RUSH Shopping - Your order is on the way!"
                    width={600}
                    height={750}
                    className="w-full h-auto object-cover"
                    priority
                  />
                </div>

                {/* Decorative glows */}
                <div className="absolute -bottom-6 -right-6 h-32 w-32 rounded-full bg-electric-volt-green/20 blur-3xl" />
                <div className="absolute -top-6 -left-6 h-24 w-24 rounded-full bg-accent-green/20 blur-2xl" />
              </div>
            </motion.div>
          </div>

          {/* Additional Info */}
          <div className="text-center text-sm text-neutral-400 mt-8">
            <p>Need help? Contact support@Madrush.com.ng</p>
          </div>
        </div>
      </div>
    </div>
  )
}
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { CheckCircle, Package, Truck, Mail, Download, Home, ShoppingBag } from 'lucide-react'
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.6, delay: 0.2 }}
            className="flex justify-center mb-8"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-accent-green/20 rounded-full blur-xl" />
              <CheckCircle className="h-24 w-24 text-accent-green relative" />
            </div>
          </motion.div>

          {/* Main Message */}
          <div className="text-center mb-12">
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
          <div className="bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 rounded-xl p-6 md:p-8 mb-6">
            <h2 className="text-2xl font-bold text-white mb-6">What's Next?</h2>
            
            <div className="space-y-6">
              {/* Timeline */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-accent-green/20 rounded-full flex items-center justify-center">
                  <Mail className="h-6 w-6 text-accent-green" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-1">Confirmation Email Sent</h3>
                  <p className="text-sm text-neutral-400">
                    Check your inbox for order details and receipt
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-neutral-700 rounded-full flex items-center justify-center">
                  <Package className="h-6 w-6 text-neutral-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-1">Processing Your Order</h3>
                  <p className="text-sm text-neutral-400">
                    We're preparing your items for shipment
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-neutral-700 rounded-full flex items-center justify-center">
                  <Truck className="h-6 w-6 text-neutral-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-1">Estimated Delivery</h3>
                  <p className="text-sm text-neutral-400">
                    {estimatedDelivery}
                  </p>
                </div>
              </div>
            </div>

            {/* Tracking Info */}
            <div className="mt-8 p-4 bg-accent-green/10 border border-accent-green/20 rounded-lg">
              <p className="text-sm text-neutral-300">
                <strong className="text-accent-green">Track your order:</strong> We'll send you tracking information via email once your order ships.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 px-6 py-4 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg font-semibold transition-colors"
            >
              <Home className="h-5 w-5" />
              Back to Home
            </Link>
            <Link
              href="/products"
              className="flex items-center justify-center gap-2 px-6 py-4 bg-accent-green hover:bg-accent-green-700 text-white rounded-lg font-semibold transition-colors"
            >
              <ShoppingBag className="h-5 w-5" />
              Continue Shopping
            </Link>
          </div>

          {/* Additional Info */}
          <div className="text-center text-sm text-neutral-400">
            <p className="mb-2">Need help? Contact our support team at support@madrush.com</p>
            <p>or call us at 1-800-MAD-RUSH</p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
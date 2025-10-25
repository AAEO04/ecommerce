'use client'

import Link from 'next/link'

export default function OrderSuccessPage() {
  return (
    <div className="container mx-auto px-4 py-12 text-center">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-green-600 mb-4">Order Confirmed! 🎉</h1>
        <p className="text-gray-600 mb-8">
          Thank you for your purchase! We&apos;ll send you an email with your order details and tracking information once your order ships.
        </p>
        <Link
          href="/products"
          className="inline-block px-6 py-3 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  )
}
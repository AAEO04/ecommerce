'use client'

import { useState } from 'react'
import { openPaystackPopup, toKobo, formatCurrency } from '@/lib/paystack'
import { Loader2 } from 'lucide-react'

interface PaystackButtonProps {
  email: string
  amount: number // Amount in Naira
  orderId: number
  onSuccess: (reference: string) => void
  onClose?: () => void
  metadata?: Record<string, any>
  className?: string
  children?: React.ReactNode
}

export default function PaystackButton({
  email,
  amount,
  orderId,
  onSuccess,
  onClose,
  metadata,
  className = '',
  children,
}: PaystackButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePayment = async () => {
    setIsLoading(true)
    setError(null)

    try {
      await openPaystackPopup(
        email,
        toKobo(amount), // Convert to kobo
        orderId,
        (reference) => {
          setIsLoading(false)
          onSuccess(reference)
        },
        () => {
          setIsLoading(false)
          onClose?.()
        },
        metadata
      )
    } catch (err) {
      setIsLoading(false)
      const errorMessage = err instanceof Error ? err.message : 'Payment failed'
      setError(errorMessage)
      console.error('Payment error:', err)
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handlePayment}
        disabled={isLoading}
        className={`
          relative inline-flex items-center justify-center
          px-6 py-3 rounded-lg font-medium
          bg-blue-600 hover:bg-blue-700 text-white
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors duration-200
          ${className}
        `}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          children || `Pay ${formatCurrency(amount)}`
        )}
      </button>

      {error && (
        <p className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}

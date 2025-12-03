'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { verifyPayment } from '@/lib/api'
import { useCartStore } from '@/stores/useCartStore'
import { toast } from 'react-hot-toast'

export default function PaymentCallbackPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying')
    const [orderNumber, setOrderNumber] = useState<string>('')
    const [retryCount, setRetryCount] = useState(0)
    const { clear } = useCartStore()

    useEffect(() => {
        const reference = searchParams.get('reference') || sessionStorage.getItem('payment_reference')

        if (!reference) {
            setStatus('failed')
            toast.error('No payment reference found')
            return
        }

        // Verify payment with polling for pending status
        const verify = async () => {
            try {
                const result = await verifyPayment(reference)

                // Backend returns: { status: true, message: "...", data: { order_number, status, ... } }
                if (result.status && result.data?.status === 'success' && result.data?.order_number) {
                    setStatus('success')
                    setOrderNumber(result.data.order_number)
                    clear()
                    sessionStorage.removeItem('payment_reference')
                    sessionStorage.removeItem('checkout_email')
                    toast.success('Payment successful!')
                } else if (result.data?.status === 'pending') {
                    // Payment is still being processed, retry
                    if (retryCount < 10) { // Max 10 retries (30 seconds)
                        setTimeout(() => {
                            setRetryCount(prev => prev + 1)
                        }, 3000) // Retry every 3 seconds
                    } else {
                        // After 30 seconds, show a different message
                        setStatus('failed')
                        toast.error('Payment is taking longer than expected. Please check your order status later.')
                    }
                } else {
                    setStatus('failed')
                    toast.error(result.message || 'Payment verification failed')
                }
            } catch (error) {
                console.error('Payment verification error:', error)
                setStatus('failed')
                toast.error('Failed to verify payment')
            }
        }

        verify()
    }, [searchParams, clear, retryCount])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                {status === 'verifying' && (
                    <>
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 mx-auto mb-4"></div>
                        <h2 className="text-2xl font-bold mb-2">Verifying Payment...</h2>
                        <p className="text-gray-600">Please wait while we confirm your payment.</p>
                        {retryCount > 0 && (
                            <p className="text-sm text-gray-500 mt-2">
                                Checking status... ({retryCount}/10)
                            </p>
                        )}
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="text-green-500 mb-4">
                            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
                        <p className="text-gray-600 mb-4">Your order has been confirmed.</p>
                        {orderNumber && (
                            <p className="text-sm text-gray-500 mb-6">Order Number: <span className="font-mono font-semibold">{orderNumber}</span></p>
                        )}
                        <button
                            onClick={() => router.push('/')}
                            className="w-full bg-black text-white py-3 px-6 rounded-lg hover:bg-gray-800 transition-colors"
                        >
                            Continue Shopping
                        </button>
                    </>
                )}

                {status === 'failed' && (
                    <>
                        <div className="text-red-500 mb-4">
                            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Verification Issue</h2>
                        <p className="text-gray-600 mb-6">
                            {retryCount >= 10
                                ? "Your payment is being processed. Please check your email for order confirmation, or contact support if you don't receive it within 10 minutes."
                                : "We couldn't verify your payment. Please try again or contact support."}
                        </p>
                        <div className="space-y-3">
                            <button
                                onClick={() => router.push('/checkout')}
                                className="w-full bg-black text-white py-3 px-6 rounded-lg hover:bg-gray-800 transition-colors"
                            >
                                Try Again
                            </button>
                            <button
                                onClick={() => router.push('/')}
                                className="w-full bg-gray-200 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                Go Home
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

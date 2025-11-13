/**
 * Paystack Payment Integration
 * Handles payment initialization and processing with Paystack Popup
 */

// Paystack Popup types
interface PaystackPopupOptions {
  key: string
  email: string
  amount: number
  ref: string
  onClose?: () => void
  callback?: (response: PaystackResponse) => void
}

interface PaystackResponse {
  reference: string
  status: string
  message: string
  trans: string
  transaction: string
  trxref: string
}

declare global {
  interface Window {
    PaystackPop: {
      setup: (options: PaystackPopupOptions) => {
        openIframe: () => void
      }
    }
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_test_xxx'

/**
 * Load Paystack Inline JS library
 */
export const loadPaystackScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.PaystackPop) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = 'https://js.paystack.co/v2/inline.js'
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Paystack script'))
    document.body.appendChild(script)
  })
}

/**
 * Initialize payment transaction with backend
 */
export const initializePayment = async (
  email: string,
  amount: number,
  orderId: number,
  metadata?: Record<string, any>
): Promise<{
  status: boolean
  message: string
  authorization_url?: string
  access_code?: string
  reference?: string
}> => {
  try {
    const response = await fetch(`${API_URL}/api/payment/initialize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount, // Amount in kobo
        order_id: orderId,
        callback_url: `${window.location.origin}/payment/callback`,
        metadata,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to initialize payment')
    }

    return await response.json()
  } catch (error) {
    console.error('Payment initialization error:', error)
    throw error
  }
}

/**
 * Verify payment transaction
 */
export const verifyPayment = async (reference: string): Promise<{
  status: boolean
  message: string
  data?: any
}> => {
  try {
    const response = await fetch(`${API_URL}/api/payment/verify/${reference}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to verify payment')
    }

    return await response.json()
  } catch (error) {
    console.error('Payment verification error:', error)
    throw error
  }
}

/**
 * Open Paystack payment popup
 */
export const openPaystackPopup = async (
  email: string,
  amount: number,
  orderId: number,
  onSuccess: (reference: string) => void,
  onClose: () => void,
  metadata?: Record<string, any>
): Promise<void> => {
  try {
    // Load Paystack script
    await loadPaystackScript()

    // Initialize payment with backend
    const initResult = await initializePayment(email, amount, orderId, metadata)

    if (!initResult.status || !initResult.access_code) {
      throw new Error(initResult.message || 'Failed to initialize payment')
    }

    // Open Paystack popup
    const popup = window.PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email,
      amount,
      ref: initResult.reference!,
      onClose: () => {
        console.log('Payment popup closed')
        onClose()
      },
      callback: async (response: PaystackResponse) => {
        console.log('Payment successful:', response)
        
        // Verify payment with backend
        try {
          const verifyResult = await verifyPayment(response.reference)
          
          if (verifyResult.status && verifyResult.data?.status === 'success') {
            onSuccess(response.reference)
          } else {
            throw new Error('Payment verification failed')
          }
        } catch (error) {
          console.error('Payment verification error:', error)
          alert('Payment verification failed. Please contact support.')
        }
      },
    })

    popup.openIframe()
  } catch (error) {
    console.error('Paystack popup error:', error)
    throw error
  }
}

/**
 * Helper to convert amount to kobo
 */
export const toKobo = (amount: number): number => {
  return Math.round(amount * 100)
}

/**
 * Helper to convert kobo to naira
 */
export const toNaira = (kobo: number): number => {
  return kobo / 100
}

/**
 * Format amount as currency
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
  }).format(amount)
}

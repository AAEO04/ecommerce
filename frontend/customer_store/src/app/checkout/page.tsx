"use client"
import { useState } from 'react'
import { useCartStore } from '@/stores/useCartStore'
import { checkout, CheckoutPayload } from '@/lib/api'
import { launchSuccessConfetti } from '@/utils/confetti'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const router = useRouter()
  const items = useCartStore((s) => s.items)
  const clear = useCartStore((s) => s.clear)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const [errors, setErrors] = useState<Record<string, string>>({})

  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (isSubmitting) return

    const newErrors: Record<string, string> = {}
    if (!name) newErrors.name = 'Name is required'
    if (!email) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email is invalid'
    if (!phone) newErrors.phone = 'Phone is required'
    if (!address) newErrors.address = 'Address is required'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setLoading(true)
    setIsSubmitting(true)

    const payload: CheckoutPayload = {
      cart: items.map((i) => ({ variant_id: i.variant_id, quantity: i.quantity })),
      customer_name: name,
      customer_email: email,
      customer_phone: phone,
      shipping_address: address,
      payment_method: 'card'
    }
import toast from 'react-hot-toast';

// ... (imports)

// ... (component body)

    try {
      const res = await checkout(payload)
      setSuccess(true)
      clear() // Clear the cart
      launchSuccessConfetti()
      toast.success('Order placed successfully!');
      setTimeout(() => {
        router.push('/order-success')
      }, 2000)
    } catch (error) {
      console.error('Checkout failed:', error)
      toast.error('Checkout failed. Please try again.');
    } finally {
// ... (rest of the function)
      setLoading(false)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-4">Checkout</h1>
      {success ? (
        <div className="text-center py-12" aria-live="polite" role="status">
          <h2 className="text-2xl font-bold text-green-600 mb-2">Order Placed Successfully!</h2>
          <p className="text-gray-600">Redirecting to order confirmation...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
            <input 
              id="name"
              required 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Full name" 
              className={`w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-accent focus:border-accent ${errors.name ? 'border-red-500' : ''}`} 
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'name-error' : undefined}
            />
            {errors.name && <p id="name-error" className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              id="email"
              required 
              type="email"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="Email" 
              className={`w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-accent focus:border-accent ${errors.email ? 'border-red-500' : ''}`} 
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && <p id="email-error" className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input 
              id="phone"
              required 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
              placeholder="Phone" 
              className={`w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-accent focus:border-accent ${errors.phone ? 'border-red-500' : ''}`} 
              aria-invalid={!!errors.phone}
              aria-describedby={errors.phone ? 'phone-error' : undefined}
            />
            {errors.phone && <p id="phone-error" className="text-red-500 text-sm mt-1">{errors.phone}</p>}
          </div>
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Shipping address</label>
            <textarea 
              id="address"
              required 
              value={address} 
              onChange={(e) => setAddress(e.target.value)} 
              placeholder="Shipping address" 
              rows={4}
              className={`w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-accent focus:border-accent ${errors.address ? 'border-red-500' : ''}`} 
              aria-invalid={!!errors.address}
              aria-describedby={errors.address ? 'address-error' : undefined}
            />
            {errors.address && <p id="address-error" className="text-red-500 text-sm mt-1">{errors.address}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-accent-green text-white rounded-lg font-semibold hover:bg-accent-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Processing...
              </span>
            ) : (
              'Place Order'
            )}
          </button>        </form>
      )}
    </div>
  )
}

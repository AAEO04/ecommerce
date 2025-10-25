"use client"
import { useState } from 'react'
import { useCartStore } from '@/stores/useCartStore'
import { checkout } from '@/lib/api'
import { launchSuccessConfetti } from '@/utils/confetti'
import { useRouter } from 'next/navigation'

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

  async function handleSubmit(e: any) {
    e.preventDefault()
    setLoading(true)
    const payload = {
      cart: items.map((i) => ({ variant_id: i.variant_id, quantity: i.quantity })),
      customer_name: name,
      customer_email: email,
      customer_phone: phone,
      shipping_address: address,
      payment_method: 'card'
    }
    try {
      const res = await checkout(payload)
      setSuccess(true)
      clear() // Clear the cart
      launchSuccessConfetti()
      setTimeout(() => {
        router.push('/order-success')
      }, 2000)
    } catch (error) {
      console.error('Checkout failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-4">Checkout</h1>
      {success ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-green-600 mb-2">Order Placed Successfully!</h2>
          <p className="text-gray-600">Redirecting to order confirmation...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
          <input 
            required 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="Full name" 
            className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-accent focus:border-accent" 
          />
          <input 
            required 
            type="email"
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="Email" 
            className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-accent focus:border-accent" 
          />
          <input 
            required 
            value={phone} 
            onChange={(e) => setPhone(e.target.value)} 
            placeholder="Phone" 
            className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-accent focus:border-accent" 
          />
          <textarea 
            required 
            value={address} 
            onChange={(e) => setAddress(e.target.value)} 
            placeholder="Shipping address" 
            rows={4}
            className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-accent focus:border-accent" 
          />
          <div>
            <button 
              disabled={loading} 
              className="w-full px-6 py-3 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Processing...' : 'Place Order'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

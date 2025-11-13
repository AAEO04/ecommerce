"use client"
import { useState } from 'react'
import { useCartStore } from '@/stores/useCartStore'
import { checkout, CheckoutPayload } from '@/lib/api'
import { launchSuccessConfetti } from '@/utils/confetti'
import { useRouter } from 'next/navigation'
import { Loader2, CreditCard, Lock, Shield, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatNGN } from '@/utils/currency'
import Image from 'next/image'
import PaystackButton from '@/components/PaystackButton'
import { toKobo } from '@/lib/paystack'

type CheckoutStep = 1 | 2 | 3

export default function CheckoutPage() {
  const router = useRouter()
  const items = useCartStore((s) => s.items)
  const clear = useCartStore((s) => s.clear)
  const getTotal = useCartStore((s) => s.getTotal)
  
  const [currentStep, setCurrentStep] = useState<CheckoutStep>(1)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderId, setOrderId] = useState<number | null>(null)
  const [showPayment, setShowPayment] = useState(false)
  
  const total = getTotal()
  const shippingFee = 0
  const grandTotal = total

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (isSubmitting) return

    const newErrors: Record<string, string> = {}
    if (!name) newErrors.name = 'Name is required'
    if (!email) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email is invalid'
    if (!phone) newErrors.phone = 'Phone is required'
    else if (!/^[0-9]{10,11}$/.test(phone.replace(/[^0-9]/g, ''))) newErrors.phone = 'Invalid phone number'
    if (!address) newErrors.address = 'Address is required'
    if (!city) newErrors.city = 'City is required'
    if (!state) newErrors.state = 'State is required'
    if (!zipCode) newErrors.zipCode = 'ZIP code is required'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setLoading(true)
    setIsSubmitting(true)

    const fullAddress = `${address}, ${city}, ${state} ${zipCode}`
    
    const payload: CheckoutPayload = {
      cart: items.map((i) => ({ variant_id: i.variant_id, quantity: i.quantity })),
      customer_name: name,
      customer_email: email,
      customer_phone: phone,
      shipping_address: fullAddress,
      payment_method: paymentMethod
    }

    try {
      const res = await checkout(payload)
      
      // Store order ID and show payment
      if (res && res.order_id) {
        setOrderId(res.order_id)
        setShowPayment(true)
        toast.success('Order created! Please complete payment.')
      } else {
        throw new Error('Order ID not returned')
      }
    } catch (error) {
      console.error('Checkout failed:', error)
      toast.error('Checkout failed. Please try again.')
    } finally {
      setLoading(false)
      setIsSubmitting(false)
    }
  }

  const handlePaymentSuccess = (reference: string) => {
    setSuccess(true)
    clear() // Clear the cart
    launchSuccessConfetti()
    toast.success('Payment successful!')
    setTimeout(() => {
      router.push(`/order-success?ref=${reference}&order=${orderId}`)
    }, 2000)
  }

  const handlePaymentClose = () => {
    toast('Payment cancelled. You can complete payment later from your orders.')
    router.push('/orders')
  }

  const steps = [
    { number: 1, title: 'Shipping Info' },
    { number: 2, title: 'Payment' },
    { number: 3, title: 'Review' },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">Checkout</h1>
      
      {success ? (
        <div className="text-center py-12" aria-live="polite" role="status">
          <h2 className="text-2xl font-bold text-green-600 mb-2">Order Placed Successfully!</h2>
          <p className="text-gray-600">Redirecting to order confirmation...</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main checkout form */}
          <div className="lg:col-span-2">
            {/* Progress indicator */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                  <div key={step.number} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                          currentStep >= step.number
                            ? 'bg-accent-green text-white'
                            : 'bg-neutral-800 text-neutral-400'
                        }`}
                      >
                        {currentStep > step.number ? (
                          <Check className="h-5 w-5" />
                        ) : (
                          step.number
                        )}
                      </div>
                      <span className="text-xs mt-2 text-neutral-400">{step.title}</span>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`h-1 flex-1 mx-2 transition-colors ${
                          currentStep > step.number ? 'bg-accent-green' : 'bg-neutral-800'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 1: Shipping Info */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
                  
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-neutral-300 mb-1">Full name</label>
                    <input 
                      id="name"
                      required 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      placeholder="John Doe" 
                      className={`w-full p-3 bg-neutral-900 border rounded-lg focus:ring-2 focus:ring-accent-green focus:border-accent-green text-white ${errors.name ? 'border-red-500' : 'border-neutral-700'}`} 
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-neutral-300 mb-1">Email</label>
                      <input 
                        id="email"
                        required 
                        type="email"
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        placeholder="john@example.com" 
                        className={`w-full p-3 bg-neutral-900 border rounded-lg focus:ring-2 focus:ring-accent-green focus:border-accent-green text-white ${errors.email ? 'border-red-500' : 'border-neutral-700'}`} 
                      />
                      {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-neutral-300 mb-1">Phone</label>
                      <input 
                        id="phone"
                        required 
                        value={phone} 
                        onChange={(e) => setPhone(e.target.value)} 
                        placeholder="08012345678" 
                        className={`w-full p-3 bg-neutral-900 border rounded-lg focus:ring-2 focus:ring-accent-green focus:border-accent-green text-white ${errors.phone ? 'border-red-500' : 'border-neutral-700'}`} 
                      />
                      {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-neutral-300 mb-1">Street address</label>
                    <input 
                      id="address"
                      required 
                      value={address} 
                      onChange={(e) => setAddress(e.target.value)} 
                      placeholder="123 Main Street" 
                      className={`w-full p-3 bg-neutral-900 border rounded-lg focus:ring-2 focus:ring-accent-green focus:border-accent-green text-white ${errors.address ? 'border-red-500' : 'border-neutral-700'}`} 
                    />
                    {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-neutral-300 mb-1">City</label>
                      <input 
                        id="city"
                        required 
                        value={city} 
                        onChange={(e) => setCity(e.target.value)} 
                        placeholder="Lagos" 
                        className={`w-full p-3 bg-neutral-900 border rounded-lg focus:ring-2 focus:ring-accent-green focus:border-accent-green text-white ${errors.city ? 'border-red-500' : 'border-neutral-700'}`} 
                      />
                      {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                    </div>

                    <div>
                      <label htmlFor="state" className="block text-sm font-medium text-neutral-300 mb-1">State</label>
                      <input 
                        id="state"
                        required 
                        value={state} 
                        onChange={(e) => setState(e.target.value)} 
                        placeholder="Lagos" 
                        className={`w-full p-3 bg-neutral-900 border rounded-lg focus:ring-2 focus:ring-accent-green focus:border-accent-green text-white ${errors.state ? 'border-red-500' : 'border-neutral-700'}`} 
                      />
                      {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                    </div>

                    <div>
                      <label htmlFor="zipCode" className="block text-sm font-medium text-neutral-300 mb-1">ZIP Code</label>
                      <input 
                        id="zipCode"
                        required 
                        value={zipCode} 
                        onChange={(e) => setZipCode(e.target.value)} 
                        placeholder="100001" 
                        className={`w-full p-3 bg-neutral-900 border rounded-lg focus:ring-2 focus:ring-accent-green focus:border-accent-green text-white ${errors.zipCode ? 'border-red-500' : 'border-neutral-700'}`} 
                      />
                      {errors.zipCode && <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="w-full px-6 py-3 bg-accent-green text-white rounded-lg font-semibold hover:bg-accent-green-700 transition-colors"
                  >
                    Continue to Payment
                  </button>
                </div>
              )}

              {/* Step 2: Payment */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
                  
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-4 border border-neutral-700 rounded-lg cursor-pointer hover:border-accent-green transition-colors">
                      <input
                        type="radio"
                        name="payment"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-4 h-4"
                      />
                      <CreditCard className="h-5 w-5 text-accent-green" />
                      <span className="text-white">Credit/Debit Card</span>
                    </label>

                    <label className="flex items-center gap-3 p-4 border border-neutral-700 rounded-lg cursor-pointer hover:border-accent-green transition-colors">
                      <input
                        type="radio"
                        name="payment"
                        value="bank_transfer"
                        checked={paymentMethod === 'bank_transfer'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-4 h-4"
                      />
                      <span className="text-white">Bank Transfer</span>
                    </label>
                  </div>

                  {/* Security badges */}
                  <div className="flex items-center gap-4 p-4 bg-neutral-900 rounded-lg">
                    <Lock className="h-5 w-5 text-accent-green" />
                    <div className="text-sm text-neutral-300">
                      <div className="font-semibold">Secure Payment</div>
                      <div className="text-xs text-neutral-400">Your payment information is encrypted</div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="flex-1 px-6 py-3 border border-neutral-700 text-white rounded-lg font-semibold hover:border-neutral-500 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="flex-1 px-6 py-3 bg-accent-green text-white rounded-lg font-semibold hover:bg-accent-green-700 transition-colors"
                    >
                      Review Order
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Review */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold mb-4">Review Your Order</h2>
                  
                  <div className="space-y-3 p-4 bg-neutral-900 rounded-lg">
                    <div>
                      <div className="text-sm text-neutral-400">Shipping to:</div>
                      <div className="text-white font-semibold">{name}</div>
                      <div className="text-neutral-300 text-sm">{address}, {city}, {state} {zipCode}</div>
                      <div className="text-neutral-300 text-sm">{email} • {phone}</div>
                    </div>
                    
                    <div className="border-t border-neutral-700 pt-3">
                      <div className="text-sm text-neutral-400">Payment method:</div>
                      <div className="text-white">{paymentMethod === 'card' ? 'Credit/Debit Card' : 'Bank Transfer'}</div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      disabled={showPayment}
                      className="flex-1 px-6 py-3 border border-neutral-700 text-white rounded-lg font-semibold hover:border-neutral-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Back
                    </button>
                    
                    {!showPayment ? (
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 px-6 py-3 bg-accent-green text-white rounded-lg font-semibold hover:bg-accent-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {loading ? (
                          <span className="flex items-center justify-center gap-2">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Creating Order...
                          </span>
                        ) : (
                          'Continue to Payment'
                        )}
                      </button>
                    ) : (
                      <div className="flex-1">
                        <PaystackButton
                          email={email}
                          amount={grandTotal}
                          orderId={orderId!}
                          onSuccess={handlePaymentSuccess}
                          onClose={handlePaymentClose}
                          metadata={{
                            customer_name: name,
                            customer_phone: phone,
                            order_total: grandTotal,
                            items_count: items.length
                          }}
                          className="w-full"
                        >
                          <span className="flex items-center justify-center gap-2">
                            <CreditCard className="h-5 w-5" />
                            Pay {formatNGN(grandTotal)}
                          </span>
                        </PaystackButton>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-neutral-900 rounded-lg p-6 sticky top-4">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    {item.image && (
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name || 'Product'}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="text-sm text-white">{item.name}</div>
                      <div className="text-xs text-neutral-400">Qty: {item.quantity}</div>
                      <div className="text-sm text-accent-green font-semibold">
                        {formatNGN((item.price || 0) * item.quantity)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-neutral-700 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-400">Subtotal</span>
                  <span className="text-white">{formatNGN(total)}</span>
                </div>

                <div className="flex justify-between text-lg font-bold border-t border-neutral-700 pt-2">
                  <span className="text-white">Total</span>
                  <span className="text-accent-green">{formatNGN(grandTotal)}</span>
                </div>
              </div>

              {/* Security badge */}
              <div className="mt-6 flex items-center gap-2 text-xs text-neutral-400">
                <Shield className="h-4 w-4 text-accent-green" />
                <span>Secure checkout powered by SSL encryption</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

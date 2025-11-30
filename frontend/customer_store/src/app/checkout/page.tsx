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
      payment_method: paymentMethod,
      idempotency_key: crypto.randomUUID()
    }

    try {
      const res = await checkout(payload)

      // Check if order is already completed
      if (res.payment_completed) {
        setOrderId(res.order_id!)
        setSuccess(true)
        toast.success('Order already completed!')
        clear()
        return
      }

      // Redirect to Paystack payment page
      if (res.authorization_url) {
        toast.success('Redirecting to payment...')
        // Store payment reference in sessionStorage for verification after redirect
        sessionStorage.setItem('payment_reference', res.payment_reference)
        sessionStorage.setItem('checkout_email', email)

        // Redirect to Paystack
        window.location.href = res.authorization_url
      } else {
        throw new Error('Payment URL not returned')
      }
    } catch (error) {
      console.error('Checkout failed:', error)
      toast.error('Checkout failed. Please try again.')
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

  const fieldClass = (hasError?: boolean) =>
    [
      'w-full rounded-2xl border bg-black/40 px-4 py-3 text-sm font-medium tracking-wide text-white placeholder:text-white/30 transition focus:outline-none focus:ring-2 focus:ring-electric-volt-green/70',
      hasError ? 'border-hot-pink/70' : 'border-white/15',
    ].join(' ')

  return (
    <div className="relative overflow-hidden bg-black text-white">
      <div className="absolute inset-0 hero-grid opacity-10" aria-hidden />
      <div className="absolute inset-0 hero-noise opacity-15" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-4 py-14">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.4em] text-white/60">Checkout · Mission clearance</p>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl font-black uppercase tracking-[0.2em]">Lock the drop</h1>
              <p className="text-white/60">
                Verify your signal, secure the route, and ignite payment to deploy {items.length}{' '}
                {items.length === 1 ? 'item' : 'items'}.
              </p>
            </div>
            <div className="rounded-full border border-white/20 px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
              Live total · {formatNGN(grandTotal)}
            </div>
          </div>
        </header>

        {success ? (
          <div
            className="mt-12 rounded-[32px] border border-electric-volt-green/30 bg-gradient-to-br from-black via-black/80 to-electric-volt-green/5 p-10 text-center shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
            aria-live="polite"
            role="status"
          >
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-electric-volt-green/50">
              <Check className="h-10 w-10 text-electric-volt-green" />
            </div>
            <p className="text-xs uppercase tracking-[0.4em] text-electric-volt-green">Order secured</p>
            <h2 className="mt-3 text-3xl font-black">Transmission locked in</h2>
            <p className="mt-2 text-white/60">Redirecting to confirmation...</p>
          </div>
        ) : (
          <div className="mt-12 grid gap-8 lg:grid-cols-[1.75fr_1fr]">
            <div className="space-y-8">
              <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_20px_40px_rgba(0,0,0,0.35)]">
                <div className="flex flex-wrap items-center gap-4">
                  {steps.map((step, index) => (
                    <div key={step.number} className="flex items-center">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-full border-2 text-base font-semibold transition ${currentStep >= step.number
                            ? 'border-electric-volt-green text-electric-volt-green'
                            : 'border-white/15 text-white/40'
                            }`}
                        >
                          {currentStep > step.number ? <Check className="h-5 w-5" /> : step.number}
                        </div>
                        <div className="text-xs uppercase tracking-[0.35em] text-white/60">{step.title}</div>
                      </div>
                      {index < steps.length - 1 && (
                        <div className="mx-4 hidden h-px w-14 bg-white/20 sm:block" aria-hidden />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {currentStep === 1 && (
                  <section className="rounded-[28px] border border-white/10 bg-black/40 p-6">
                    <div className="mb-6 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.4em] text-white/60">Step 1</p>
                        <h2 className="text-2xl font-semibold">Route your shipment</h2>
                      </div>
                      <span className="text-xs text-white/60">All fields mandatory</span>
                    </div>

                    <div className="space-y-5">
                      <div>
                        <label htmlFor="name" className="text-xs uppercase tracking-[0.3em] text-white/50">
                          Full name
                        </label>
                        <input
                          id="name"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="John Doe"
                          className={fieldClass(Boolean(errors.name))}
                        />
                        {errors.name && <p className="mt-1 text-xs text-hot-pink">{errors.name}</p>}
                      </div>

                      <div className="grid gap-5 md:grid-cols-2">
                        <div>
                          <label htmlFor="email" className="text-xs uppercase tracking-[0.3em] text-white/50">
                            Email
                          </label>
                          <input
                            id="email"
                            required
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="john@example.com"
                            className={fieldClass(Boolean(errors.email))}
                          />
                          {errors.email && <p className="mt-1 text-xs text-hot-pink">{errors.email}</p>}
                        </div>
                        <div>
                          <label htmlFor="phone" className="text-xs uppercase tracking-[0.3em] text-white/50">
                            Phone
                          </label>
                          <input
                            id="phone"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="08012345678"
                            className={fieldClass(Boolean(errors.phone))}
                          />
                          {errors.phone && <p className="mt-1 text-xs text-hot-pink">{errors.phone}</p>}
                        </div>
                      </div>

                      <div>
                        <label htmlFor="address" className="text-xs uppercase tracking-[0.3em] text-white/50">
                          Street address
                        </label>
                        <input
                          id="address"
                          required
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="123 Main Street"
                          className={fieldClass(Boolean(errors.address))}
                        />
                        {errors.address && <p className="mt-1 text-xs text-hot-pink">{errors.address}</p>}
                      </div>

                      <div className="grid gap-5 md:grid-cols-3">
                        <div>
                          <label htmlFor="city" className="text-xs uppercase tracking-[0.3em] text-white/50">
                            City
                          </label>
                          <input
                            id="city"
                            required
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="Lagos"
                            className={fieldClass(Boolean(errors.city))}
                          />
                          {errors.city && <p className="mt-1 text-xs text-hot-pink">{errors.city}</p>}
                        </div>
                        <div>
                          <label htmlFor="state" className="text-xs uppercase tracking-[0.3em] text-white/50">
                            State
                          </label>
                          <input
                            id="state"
                            required
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                            placeholder="Lagos"
                            className={fieldClass(Boolean(errors.state))}
                          />
                          {errors.state && <p className="mt-1 text-xs text-hot-pink">{errors.state}</p>}
                        </div>
                        <div>
                          <label htmlFor="zipCode" className="text-xs uppercase tracking-[0.3em] text-white/50">
                            ZIP Code
                          </label>
                          <input
                            id="zipCode"
                            value={zipCode}
                            onChange={(e) => setZipCode(e.target.value)}
                            placeholder="100001"
                            className={fieldClass(Boolean(errors.zipCode))}
                          />
                          {errors.zipCode && <p className="mt-1 text-xs text-hot-pink">{errors.zipCode}</p>}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="mt-8 w-full rounded-full border border-electric-volt-green bg-electric-volt-green px-6 py-4 text-sm font-black uppercase tracking-[0.35em] text-black transition hover:-translate-y-1"
                    >
                      Continue to payment
                    </button>
                  </section>
                )}

                {currentStep === 2 && (
                  <section className="rounded-[28px] border border-white/10 bg-black/40 p-6">
                    <div className="mb-6 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.4em] text-white/60">Step 2</p>
                        <h2 className="text-2xl font-semibold">Select payment channel</h2>
                      </div>
                      <span className="text-xs text-white/60">Encrypted rails</span>
                    </div>

                    <div className="space-y-4">
                      {['card'].map((method) => (
                        <label
                          key={method}
                          className={`flex items-center gap-4 rounded-3xl border px-5 py-4 transition ${paymentMethod === method ? 'border-electric-volt-green bg-electric-volt-green/5' : 'border-white/15 hover:border-white/40'
                            }`}
                        >
                          <input
                            type="radio"
                            name="payment"
                            value={method}
                            checked={paymentMethod === method}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="h-4 w-4"
                          />
                          {method === 'card' && <CreditCard className="h-5 w-5 text-electric-volt-green" />}
                          <div>
                            <p className="text-sm font-semibold">
                              {method === 'card' ? 'Credit / Debit Card' : 'Bank Transfer'}
                            </p>
                            <p className="text-xs text-white/50">
                              {method === 'card'
                                ? 'Instant confirmation via Paystack'
                                : 'Manual verification within 30 mins'}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>

                    <div className="mt-6 flex flex-wrap items-center gap-4 rounded-2xl border border-white/15 bg-white/5 px-5 py-4 text-sm text-white/70">
                      <Lock className="h-5 w-5 text-electric-volt-green" />
                      <span>Payments are encrypted with end-to-end SSL and monitored 24/7.</span>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-4">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="flex-1 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:border-white/50"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(3)}
                        className="flex-1 rounded-full border border-electric-volt-green bg-electric-volt-green px-6 py-3 text-sm font-black uppercase tracking-[0.3em] text-black transition hover:-translate-y-1"
                      >
                        Review order
                      </button>
                    </div>
                  </section>
                )}

                {currentStep === 3 && (
                  <section className="rounded-[28px] border border-white/10 bg-black/40 p-6">
                    <div className="mb-6 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.4em] text-white/60">Step 3</p>
                        <h2 className="text-2xl font-semibold">Final review</h2>
                      </div>
                      <span className="text-xs text-white/60">Confirm details below</span>
                    </div>

                    <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm">
                      <div>
                        <p className="text-white/50">Shipping to</p>
                        <p className="text-lg font-semibold">{name}</p>
                        <p className="text-white/70">{address}, {city}, {state} {zipCode}</p>
                        <p className="text-white/60">{email} • {phone}</p>
                      </div>
                      <div className="border-t border-white/10 pt-4">
                        <p className="text-white/50">Payment method</p>
                        <p className="text-white">
                          {paymentMethod === 'card' ? 'Credit/Debit Card via Paystack' : 'Bank Transfer'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-4">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        disabled={showPayment}
                        className="flex-1 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:border-white/50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Back
                      </button>

                      {!showPayment ? (
                        <button
                          type="submit"
                          disabled={loading}
                          className="flex-1 rounded-full border border-electric-volt-green bg-electric-volt-green px-6 py-3 text-sm font-black uppercase tracking-[0.3em] text-black transition hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {loading ? (
                            <span className="flex items-center justify-center gap-2">
                              <Loader2 className="h-5 w-5 animate-spin" />
                              Creating order…
                            </span>
                          ) : (
                            'Continue to payment'
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
                              items_count: items.length,
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
                  </section>
                )}
              </form>
            </div>

            <aside className="sticky top-6 space-y-6 rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_25px_45px_rgba(0,0,0,0.45)]">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-white/60">Order summary</p>
                <h2 className="mt-2 text-3xl font-black">{formatNGN(grandTotal)}</h2>
                <p className="text-sm text-white/50">Shipping and taxes finalize after confirmation.</p>
              </div>

              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 rounded-2xl border border-white/10 bg-black/40 p-3">
                    {item.image && (
                      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl">
                        <Image src={item.image} alt={item.name || 'Product'} fill className="object-cover" />
                      </div>
                    )}
                    <div className="flex-1 text-sm">
                      <p className="font-semibold">{item.name}</p>
                      {(item.size || item.color) && (
                        <p className="text-xs text-white/50">
                          {item.size && <span>Size: {item.size}</span>}
                          {item.size && item.color && <span className="mx-1">•</span>}
                          {item.color && <span>Color: {item.color}</span>}
                        </p>
                      )}
                      <p className="text-white/50">Qty · {item.quantity}</p>
                      <p className="text-electric-volt-green font-semibold">
                        {formatNGN(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 border-t border-white/10 pt-4 text-sm text-white/70">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span>{formatNGN(total)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Shipping</span>
                  <span className="text-hot-pink">Calculated next</span>
                </div>
                <div className="flex items-center justify-between text-lg font-black text-electric-volt-green">
                  <span>Total due</span>
                  <span>{formatNGN(grandTotal)}</span>
                </div>
              </div>

              <div className="space-y-3 rounded-2xl border border-white/15 bg-black/40 p-4 text-xs uppercase tracking-[0.4em] text-white/60">
                <div className="flex items-center justify-between">
                  <span>Signals</span>
                  <span>{items.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Supply status</span>
                  <span className="text-electric-volt-green">In stock</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Security</span>
                  <span>SSL 256-bit</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs text-white/60">
                <Shield className="h-4 w-4 text-electric-volt-green" />
                <span>Secure checkout powered by Paystack & SSL vaulting.</span>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  )
}

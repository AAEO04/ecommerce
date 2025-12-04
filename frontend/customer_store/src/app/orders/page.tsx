"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Package, CheckCircle, Clock, XCircle, Sparkles, Mail, Hash } from 'lucide-react'
import { formatNGN } from '@/utils/currency'
import toast from 'react-hot-toast'

interface OrderItem {
    product_name: string
    size?: string
    color?: string
    quantity: number
    unit_price: number
    total_price: number
}

interface Order {
    order_number: string
    status: string
    payment_status: string
    total_amount: number
    created_at: string
    items: OrderItem[]
}

export default function OrdersPage() {
    const [email, setEmail] = useState('')
    const [orderNumber, setOrderNumber] = useState('')
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(false)
    const [searched, setSearched] = useState(false)

    const handleLookup = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!email) {
            toast.error('Email is required', {
                style: { background: '#000', color: '#fff', border: '1px solid #ff00ff' }
            })
            return
        }

        setLoading(true)
        setSearched(true)

        try {
            const params = new URLSearchParams({ email })
            if (orderNumber) params.append('order_number', orderNumber)

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/orders/lookup?${params}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            })

            if (!res.ok) {
                if (res.status === 404) {
                    setOrders([])
                    toast.error('No orders found for this email', {
                        style: { background: '#000', color: '#fff' }
                    })
                    return
                }
                throw new Error('Failed to lookup orders')
            }

            const data = await res.json()
            setOrders(data)
            toast.success(`Found ${data.length} order(s)`, {
                style: { background: '#000', color: '#fff', border: '1px solid #00ff00' }
            })
        } catch (error) {
            console.error('Lookup error:', error)
            toast.error('Failed to lookup orders. Please try again.', {
                style: { background: '#000', color: '#fff', border: '1px solid #ff0000' }
            })
        } finally {
            setLoading(false)
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'confirmed':
            case 'processing':
                return <Clock className="h-5 w-5 text-electric-volt-green" />
            case 'shipped':
            case 'delivered':
                return <CheckCircle className="h-5 w-5 text-electric-volt-green" />
            case 'cancelled':
                return <XCircle className="h-5 w-5 text-accent-red-500" />
            default:
                return <Package className="h-5 w-5 text-white/60" />
        }
    }

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'confirmed':
            case 'processing':
                return 'text-electric-volt-green'
            case 'shipped':
            case 'delivered':
                return 'text-electric-volt-green'
            case 'cancelled':
                return 'text-accent-red-500'
            default:
                return 'text-white/60'
        }
    }

    return (
        <div className="relative min-h-screen overflow-hidden bg-black text-white py-20">
            <div className="absolute inset-0 hero-grid opacity-10" aria-hidden="true" />
            <div className="absolute inset-0 hero-noise opacity-20" aria-hidden="true" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-12 text-center">
                        <p className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-1 text-xs uppercase tracking-[0.4em] text-white/60 mb-4">
                            <Sparkles className="h-4 w-4 text-electric-volt-green" />
                            Order Tracking
                        </p>
                        <h1 className="text-5xl md:text-7xl font-black mb-4 tracking-tight leading-[0.9]">
                            TRACK YOUR <span className="text-electric-volt-green">ORDER</span>
                        </h1>
                        <p className="text-white/60 text-lg">Enter your email to view your order history</p>
                    </div>

                    <motion.form
                        onSubmit={handleLookup}
                        className="bg-neutral-950/70 border border-white/10 rounded-3xl p-8 mb-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="space-y-6">
                            <div>
                                <label className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.3em] mb-3 text-white/80">
                                    <Mail className="h-4 w-4 text-electric-volt-green" />
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    className="w-full bg-black/50 border border-white/20 rounded-2xl px-5 py-4 text-white placeholder:text-white/40 focus:border-electric-volt-green focus:outline-none transition-colors"
                                    required
                                />
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.3em] mb-3 text-white/80">
                                    <Hash className="h-4 w-4 text-white/60" />
                                    Order Number (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={orderNumber}
                                    onChange={(e) => setOrderNumber(e.target.value)}
                                    placeholder="ORD-20241204..."
                                    className="w-full bg-black/50 border border-white/20 rounded-2xl px-5 py-4 text-white placeholder:text-white/40 focus:border-electric-volt-green focus:outline-none transition-colors"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-electric-volt-green text-black font-black py-4 rounded-2xl uppercase tracking-[0.3em] hover:bg-electric-volt-green/90 transition-all disabled:opacity-50 flex items-center justify-center gap-3 hover:-translate-y-1"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin h-5 w-5 border-2 border-black border-t-transparent rounded-full" />
                                        Searching...
                                    </>
                                ) : (
                                    <>
                                        <Search className="h-5 w-5" />
                                        Find Orders
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.form>

                    {searched && orders.length === 0 && !loading && (
                        <div className="text-center py-16 bg-neutral-950/70 border border-white/10 rounded-3xl">
                            <Package className="h-20 w-20 text-white/10 mx-auto mb-6" />
                            <h3 className="text-3xl font-black mb-3 uppercase tracking-tight">No Orders Found</h3>
                            <p className="text-white/60 text-lg">No orders found for this email address</p>
                        </div>
                    )}

                    {orders.length > 0 && (
                        <div className="space-y-6">
                            {orders.map((order, idx) => (
                                <motion.div
                                    key={order.order_number}
                                    className="bg-neutral-950/70 border border-white/10 rounded-3xl p-6 hover:border-electric-volt-green/50 transition-colors"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                >
                                    <div className="flex flex-wrap items-start justify-between gap-4 mb-6 pb-6 border-b border-white/10">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                {getStatusIcon(order.status)}
                                                <h3 className="text-xl font-black tracking-tight">{order.order_number}</h3>
                                            </div>
                                            <p className="text-sm text-white/50 font-mono">
                                                {new Date(order.created_at).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-sm font-black uppercase tracking-[0.3em] ${getStatusColor(order.status)} mb-2`}>
                                                {order.status}
                                            </p>
                                            <p className="text-xs text-white/50 uppercase tracking-wider mb-3">
                                                Payment: <span className={order.payment_status === 'paid' ? 'text-electric-volt-green' : 'text-white/60'}>{order.payment_status}</span>
                                            </p>
                                            <p className="text-3xl font-black text-electric-volt-green">
                                                {formatNGN(order.total_amount)}
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-xs font-black uppercase tracking-[0.4em] text-white/60 mb-4">Order Items</h4>
                                        <div className="space-y-3">
                                            {order.items.map((item, idx) => (
                                                <div key={idx} className="flex justify-between items-start gap-4 p-4 rounded-2xl bg-black/30 border border-white/5">
                                                    <div className="flex-1">
                                                        <span className="font-bold text-white">{item.product_name}</span>
                                                        {(item.size || item.color) && (
                                                            <span className="text-white/50 text-sm ml-3">
                                                                ({[item.size, item.color].filter(Boolean).join(', ')})
                                                            </span>
                                                        )}
                                                        <div className="text-white/40 text-sm mt-1">
                                                            Qty: {item.quantity} × {formatNGN(item.unit_price)}
                                                        </div>
                                                    </div>
                                                    <span className="font-black text-electric-volt-green text-lg">{formatNGN(item.total_price)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

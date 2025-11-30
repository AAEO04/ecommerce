'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Instagram } from 'lucide-react'

const communityPosts = [
    { id: 1, user: '@neon_rider', image: '/brand-circle.png', caption: 'Full kit engaged. #MADRUSH', productId: 1 },
    { id: 2, user: '@kinetic_flow', image: '/brand-circle.png', caption: 'No chills detected. ⚡️', productId: 2 },
    { id: 3, user: '@urban_ghost', image: '/brand-circle.png', caption: 'Night ops gear.', productId: 3 },
    { id: 4, user: '@velocity_x', image: '/brand-circle.png', caption: 'Speed checks.', productId: 4 },
]

export function CommunityFeed() {
    return (
        <section className="py-32 bg-black border-t border-white/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay pointer-events-none" />
            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="h-px w-12 bg-hot-pink" />
                            <span className="text-xs font-bold uppercase tracking-[0.4em] text-hot-pink">Community</span>
                        </div>
                        <h2 className="text-5xl md:text-7xl font-black text-white tracking-tight leading-[0.9]" style={{ fontFamily: 'Druk Wide, Arial Black, sans-serif' }}>
                            SEEN ON THE<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50">STREETS.</span>
                        </h2>
                    </div>

                    <a
                        href="https://instagram.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center gap-3 px-8 py-4 rounded-full border border-white/20 bg-white/5 hover:bg-white hover:text-black transition-all duration-300"
                    >
                        <Instagram className="w-5 h-5" />
                        <span className="font-bold uppercase tracking-widest text-xs">Tag #MADRUSH</span>
                    </a>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {communityPosts.map((post, i) => (
                        <Link
                            key={post.id}
                            href={`/product/${post.productId}`}
                            className="block"
                        >
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1, duration: 0.5 }}
                                viewport={{ once: true }}
                                className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-neutral-900 border border-white/10 cursor-pointer"
                            >
                                <Image
                                    src={post.image}
                                    alt={post.caption}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-500" />

                                <div className="absolute inset-0 p-6 flex flex-col justify-end transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                    <div className="glass-dark rounded-xl p-4 backdrop-blur-md border border-white/10">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-white font-bold text-sm tracking-wide">{post.user}</p>
                                            <Instagram className="w-3 h-3 text-white/60" />
                                        </div>
                                        <p className="text-gray-300 text-xs leading-relaxed line-clamp-2">{post.caption}</p>
                                        <p className="text-electric-volt-green text-xs font-semibold mt-2">View Product →</p>
                                    </div>
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}

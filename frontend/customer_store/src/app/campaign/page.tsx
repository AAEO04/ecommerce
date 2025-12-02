import React from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function CampaignPage() {
    return (
        <div className="min-h-screen bg-black text-white pt-24 pb-12">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="mb-12 text-center">
                    <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter uppercase">
                        Behind the <span className="text-electric-volt-green">Scenes</span>
                    </h1>
                    <p className="text-white/70 max-w-2xl mx-auto text-lg">
                        Go behind the lens of our latest campaign shoot.
                    </p>
                </div>

                {/* Coming Soon Content */}
                <div className="flex flex-col items-center justify-center py-20 bg-white/5 rounded-2xl border border-white/10">
                    <div className="relative w-full max-w-2xl aspect-video mb-8 overflow-hidden rounded-xl shadow-2xl bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
                        <span className="text-white/20 font-bold text-3xl tracking-widest uppercase">Campaign Film</span>
                    </div>

                    <h2 className="text-3xl font-bold mb-4 text-center">Campaign Coming Soon</h2>
                    <p className="text-white/60 text-center max-w-md mb-8">
                        We're putting the finishing touches on our latest visual story. Check back soon.
                    </p>

                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-8 py-3 bg-electric-volt-green text-black rounded-full font-medium hover:bg-electric-volt-green/90 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Store
                    </Link>
                </div>
            </div>
        </div>
    )
}

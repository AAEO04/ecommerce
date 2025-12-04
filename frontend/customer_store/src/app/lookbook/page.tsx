import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Sparkles, Zap } from 'lucide-react'

export default function LookbookPage() {
    return (
        <div className="relative min-h-screen overflow-hidden bg-black text-white">
            <div className="absolute inset-0 hero-grid opacity-10" aria-hidden="true" />
            <div className="absolute inset-0 hero-noise opacity-20" aria-hidden="true" />

            <div className="relative z-10 container mx-auto px-4 py-20">
                {/* Header */}
                <div className="mb-16 text-center">
                    <p className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-1 text-xs uppercase tracking-[0.4em] text-white/60 mb-4">
                        <Sparkles className="h-4 w-4 text-electric-volt-green" />
                        Visual Archive
                    </p>
                    <h1 className="text-5xl md:text-7xl font-black mb-4 tracking-tight leading-[0.9]">
                        LOOK<span className="text-electric-volt-green">BOOK</span>
                    </h1>
                    <p className="text-white/60 max-w-2xl mx-auto text-lg">
                        Explore our latest collections and style inspiration.
                    </p>
                </div>

                {/* Coming Soon Content */}
                <div className="flex flex-col items-center justify-center py-20 bg-neutral-950/70 rounded-3xl border border-white/10">
                    <div className="relative w-full max-w-md aspect-[4/5] mb-8 overflow-hidden rounded-3xl border border-white/10 shadow-2xl rotate-3 transition-transform hover:rotate-0 duration-500">
                        <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-black to-neutral-950 flex items-center justify-center">
                            <div className="text-center space-y-4">
                                <Zap className="h-16 w-16 text-electric-volt-green mx-auto animate-pulse" />
                                <span className="text-white/20 font-black text-2xl tracking-[0.4em] uppercase block">Coming Soon</span>
                            </div>
                        </div>
                    </div>

                    <h2 className="text-3xl md:text-4xl font-black mb-4 text-center uppercase tracking-tight">
                        New Collection <span className="text-electric-volt-green">Dropping Soon</span>
                    </h2>
                    <p className="text-white/60 text-center max-w-md mb-8 text-lg">
                        We're curating a visual experience that defines the next season of street fashion. Stay tuned.
                    </p>

                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-electric-volt-green text-black rounded-2xl font-bold uppercase tracking-wider hover:bg-electric-volt-green/90 transition-all hover:-translate-y-1"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Store
                    </Link>
                </div>
            </div>
        </div>
    )
}

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function LookbookPage() {
    return (
        <div className="min-h-screen bg-white pt-24 pb-12">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="mb-12 text-center">
                    <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter uppercase">
                        Look<span className="text-orange-600">book</span>
                    </h1>
                    <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                        Explore our latest collections and style inspiration.
                    </p>
                </div>

                {/* Coming Soon Content */}
                <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="relative w-full max-w-md aspect-[4/5] mb-8 overflow-hidden rounded-xl shadow-2xl rotate-3 transition-transform hover:rotate-0 duration-500">
                        {/* Placeholder for a hero image if we had one, using a generic pattern for now */}
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
                            <span className="text-white font-bold text-2xl tracking-widest uppercase opacity-20">Coming Soon</span>
                        </div>
                    </div>

                    <h2 className="text-3xl font-bold mb-4 text-center">New Collection Dropping Soon</h2>
                    <p className="text-gray-500 text-center max-w-md mb-8">
                        We are curating a visual experience that defines the next season of street fashion. Stay tuned.
                    </p>

                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-8 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-900 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Store
                    </Link>
                </div>
            </div>
        </div>
    )
}

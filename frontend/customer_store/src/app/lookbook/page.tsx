'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Sparkles, X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface LookbookImage {
    id: string
    url: string
    optimizedUrl: string
    thumbnailUrl: string
    width: number
    height: number
}

export default function LookbookPage() {
    const [images, setImages] = useState<LookbookImage[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

    useEffect(() => {
        async function fetchImages() {
            try {
                const response = await fetch('/api/lookbook')
                const data = await response.json()

                if (data.error) {
                    setError(data.error)
                } else {
                    setImages(data.images || [])
                }
            } catch (err) {
                setError('Failed to load images')
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        fetchImages()
    }, [])

    const openLightbox = (index: number) => setSelectedIndex(index)
    const closeLightbox = () => setSelectedIndex(null)

    const goNext = () => {
        if (selectedIndex !== null && selectedIndex < images.length - 1) {
            setSelectedIndex(selectedIndex + 1)
        }
    }

    const goPrev = () => {
        if (selectedIndex !== null && selectedIndex > 0) {
            setSelectedIndex(selectedIndex - 1)
        }
    }

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (selectedIndex === null) return
            if (e.key === 'Escape') closeLightbox()
            if (e.key === 'ArrowRight') goNext()
            if (e.key === 'ArrowLeft') goPrev()
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [selectedIndex])

    return (
        <div className="relative min-h-screen overflow-hidden bg-black text-white">
            <div className="absolute inset-0 hero-grid opacity-10" aria-hidden="true" />
            <div className="absolute inset-0 hero-noise opacity-20" aria-hidden="true" />

            <div className="relative z-10 container mx-auto px-4 py-20">
                {/* Header */}
                <div className="mb-16 text-center">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Store
                    </Link>

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

                {/* Loading State */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-12 h-12 text-electric-volt-green animate-spin mb-4" />
                        <p className="text-white/60">Loading lookbook...</p>
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <div className="text-center py-20">
                        <p className="text-red-400 mb-4">{error}</p>
                        <p className="text-white/60">Please check your Cloudinary configuration.</p>
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && images.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 bg-neutral-950/70 rounded-3xl border border-white/10">
                        <Sparkles className="h-16 w-16 text-electric-volt-green mb-6" />
                        <h2 className="text-2xl font-bold mb-2">Coming Soon</h2>
                        <p className="text-white/60 text-center max-w-md">
                            We&apos;re curating a visual experience. Check back soon!
                        </p>
                    </div>
                )}

                {/* Image Gallery - Masonry Grid */}
                {!loading && !error && images.length > 0 && (
                    <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
                        {images.map((image, index) => (
                            <motion.div
                                key={image.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="break-inside-avoid group cursor-pointer"
                                onClick={() => openLightbox(index)}
                            >
                                <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-neutral-900">
                                    <Image
                                        src={image.thumbnailUrl}
                                        alt={`Lookbook image ${index + 1}`}
                                        width={image.width}
                                        height={image.height}
                                        className="w-full h-auto transition-transform duration-500 group-hover:scale-105"
                                        loading={index < 8 ? 'eager' : 'lazy'}
                                    />

                                    {/* Hover Overlay */}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                                        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white font-bold uppercase tracking-wider text-sm">
                                            View
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Lightbox Modal */}
                <AnimatePresence>
                    {selectedIndex !== null && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
                            onClick={closeLightbox}
                        >
                            {/* Close Button */}
                            <button
                                onClick={closeLightbox}
                                className="absolute top-6 right-6 p-2 text-white/60 hover:text-white transition-colors z-50"
                                aria-label="Close lightbox"
                            >
                                <X className="w-8 h-8" />
                            </button>

                            {/* Navigation Arrows */}
                            {selectedIndex > 0 && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); goPrev() }}
                                    className="absolute left-4 md:left-8 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                                    aria-label="Previous image"
                                >
                                    <ChevronLeft className="w-6 h-6 text-white" />
                                </button>
                            )}

                            {selectedIndex < images.length - 1 && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); goNext() }}
                                    className="absolute right-4 md:right-8 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                                    aria-label="Next image"
                                >
                                    <ChevronRight className="w-6 h-6 text-white" />
                                </button>
                            )}

                            {/* Image */}
                            <motion.div
                                key={selectedIndex}
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="max-w-[90vw] max-h-[85vh] relative"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <Image
                                    src={images[selectedIndex].optimizedUrl}
                                    alt={`Lookbook image ${selectedIndex + 1}`}
                                    width={images[selectedIndex].width}
                                    height={images[selectedIndex].height}
                                    className="max-w-full max-h-[85vh] w-auto h-auto object-contain rounded-lg"
                                    priority
                                />

                                {/* Image Counter */}
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 px-4 py-2 rounded-full text-sm text-white/80">
                                    {selectedIndex + 1} / {images.length}
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}

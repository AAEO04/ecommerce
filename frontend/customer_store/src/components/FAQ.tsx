'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus, MessageCircle } from 'lucide-react'

const faqs = [
    {
        question: "How fast is shipping?",
        answer: "We move at the speed of chaos. Orders in Lagos are delivered within 24-48 hours. Nationwide delivery takes 3-5 business days."
    },
    {
        question: "What is your return policy?",
        answer: "If the fit isn't right, you have 7 days to return it. Items must be unworn and in original packaging with tags attached."
    },
    {
        question: "How do I track my order?",
        answer: "Once your gear is dispatched, you'll receive a tracking link via email. You can also track it directly from your account dashboard."
    },
    {
        question: "Do you ship internationally?",
        answer: "Currently, we are focused on dominating the Nigerian streetwear scene. International shipping is coming soon."
    }
]

export function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(0)

    return (
        <section className="py-20 bg-neutral-950 border-t border-white/5">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="text-center mb-16">
                    <span className="text-electric-volt-green text-xs font-bold tracking-[0.3em] uppercase">
                        Support
                    </span>
                    <h2 className="text-3xl md:text-4xl font-black text-white uppercase mt-4">
                        Frequently Asked
                    </h2>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className="border border-white/10 rounded-2xl overflow-hidden bg-white/5 backdrop-blur-sm"
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors"
                            >
                                <span className="font-bold text-white uppercase tracking-wide text-sm md:text-base">
                                    {faq.question}
                                </span>
                                <span className="ml-4 text-electric-volt-green">
                                    {openIndex === index ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                                </span>
                            </button>

                            <AnimatePresence>
                                {openIndex === index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                    >
                                        <div className="p-6 pt-0 text-white/70 leading-relaxed text-sm md:text-base border-t border-white/5">
                                            {faq.answer}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <p className="text-white/50 text-sm mb-4">Still need help?</p>
                    <button className="inline-flex items-center gap-2 px-8 py-4 bg-electric-volt-green text-black font-bold uppercase tracking-widest text-xs rounded-xl hover:brightness-110 transition-all shadow-[0_0_20px_rgba(70,192,24,0.3)]">
                        <MessageCircle className="w-4 h-4" />
                        Chat with Support
                    </button>
                </div>
            </div>
        </section>
    )
}

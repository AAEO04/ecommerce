'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface FAQItem {
  question: string
  answer: string
  category: string
}

const faqs: FAQItem[] = [
  {
    category: 'Orders & Shipping',
    question: 'How long does shipping take?',
    answer: 'Standard shipping typically takes 3-5 business days. Express shipping is available for 1-2 business days delivery. You\'ll receive a tracking number once your order ships.'
  },
  {
    category: 'Orders & Shipping',
    question: 'Do you ship internationally?',
    answer: 'Yes! We ship to most countries worldwide. International shipping times vary by location but typically take 7-14 business days. Customs fees may apply depending on your country.'
  },
  {
    category: 'Orders & Shipping',
    question: 'Can I track my order?',
    answer: 'Absolutely! Once your order ships, you\'ll receive a tracking number via email. You can use this to track your package in real-time.'
  },
  {
    category: 'Orders & Shipping',
    question: 'What if my order is delayed?',
    answer: 'If your order is taking longer than expected, please contact our customer service team at hello@Madrush.com.ng with your order number, and we\'ll investigate immediately.'
  },
  {
    category: 'Returns & Exchanges',
    question: 'What is your return policy?',
    answer: 'We offer a 30-day return policy for unworn, unwashed items with original tags attached. Items must be in original condition. Refunds are processed within 5-7 business days of receiving the return.'
  },
  {
    category: 'Returns & Exchanges',
    question: 'How do I initiate a return?',
    answer: 'Contact our customer service team at hello@Madrush.com.ng with your order number and reason for return. We\'ll provide you with a return shipping label and instructions.'
  },
  {
    category: 'Returns & Exchanges',
    question: 'Can I exchange an item?',
    answer: 'Yes! If you need a different size or color, contact us and we\'ll arrange an exchange. Exchanges are subject to availability.'
  },
  {
    category: 'Returns & Exchanges',
    question: 'Who pays for return shipping?',
    answer: 'For defective items or our errors, we cover return shipping. For other returns, customers are responsible for return shipping costs unless otherwise stated.'
  },
  {
    category: 'Products & Sizing',
    question: 'How do I choose the right size?',
    answer: 'Check our detailed Size Guide page for measurements. If you\'re between sizes, we recommend sizing up for a more relaxed fit. Our customer service team can also help with sizing questions.'
  },
  {
    category: 'Products & Sizing',
    question: 'Are your products true to size?',
    answer: 'Yes, our products generally run true to size. However, some items are designed with an oversized fit for streetwear aesthetic. Check individual product descriptions for fit details.'
  },
  {
    category: 'Products & Sizing',
    question: 'How do I care for my MAD RUSH items?',
    answer: 'Machine wash cold with like colors, tumble dry low. Avoid bleach and ironing directly on prints. Check individual care labels for specific instructions.'
  },
  {
    category: 'Products & Sizing',
    question: 'When will sold-out items be restocked?',
    answer: 'Restock times vary by item. Sign up for email notifications on product pages to be alerted when items are back in stock. Follow us on social media for restock announcements.'
  },
  {
    category: 'Payment & Account',
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and other secure payment methods through our payment processor.'
  },
  {
    category: 'Payment & Account',
    question: 'Is my payment information secure?',
    answer: 'Yes! We use industry-standard SSL encryption to protect your payment information. We never store your full credit card details on our servers.'
  },
  {
    category: 'Payment & Account',
    question: 'Do I need an account to place an order?',
    answer: 'No, you can checkout as a guest. However, creating an account lets you track orders, save addresses, and access exclusive member benefits.'
  },
  {
    category: 'Payment & Account',
    question: 'Can I cancel or modify my order?',
    answer: 'Orders can be cancelled or modified within 1 hour of placement. After that, they enter processing and cannot be changed. Contact us immediately if you need to make changes.'
  }
]

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('All')

  const categories = ['All', ...Array.from(new Set(faqs.map(faq => faq.category)))]
  const filteredFaqs = selectedCategory === 'All'
    ? faqs
    : faqs.filter(faq => faq.category === selectedCategory)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="relative bg-black text-white py-20 border-b border-white/10">
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="absolute inset-0 hero-grid" aria-hidden="true" />
          <div className="absolute inset-0 hero-noise" aria-hidden="true" />
        </div>
        <div className="max-w-4xl mx-auto px-4 text-center relative">
          <h1 className="text-4xl md:text-6xl font-black tracking-[0.2em] text-white mb-4 uppercase" style={{ fontFamily: 'var(--font-display)' }}>
            FAQ
          </h1>
          <p className="text-xl md:text-2xl text-electric-volt-green italic mb-4 font-bold tracking-wider">
            No Chills, Just Mad Rush
          </p>
          <p className="text-base md:text-lg text-gray-400">
            Find answers to common questions about orders, shipping, returns, and more.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Category Filter */}
        <div className="mb-12">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-3 rounded-full font-semibold uppercase tracking-[0.2em] text-xs transition-all ${selectedCategory === category
                  ? 'bg-electric-volt-green text-black shadow-[0_0_20px_rgba(173,255,0,0.4)]'
                  : 'bg-white/5 text-white/70 border border-white/10 hover:border-electric-volt-green hover:text-white'
                  }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {filteredFaqs.map((faq, index) => (
            <div
              key={index}
              className="border border-white/10 rounded-2xl overflow-hidden bg-white/5 backdrop-blur-sm hover:border-electric-volt-green/50 transition-all"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
              >
                <div className="flex-1">
                  <span className="text-xs font-bold text-purple-400 mb-2 block uppercase tracking-[0.2em]">
                    {faq.category}
                  </span>
                  <span className="text-base md:text-lg font-semibold text-white">
                    {faq.question}
                  </span>
                </div>
                <div className="ml-4 flex-shrink-0">
                  {openIndex === index ? (
                    <ChevronUp className="h-5 w-5 text-electric-volt-green" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-white/50" />
                  )}
                </div>
              </button>
              {openIndex === index && (
                <div className="px-6 py-5 bg-black/40 border-t border-white/10">
                  <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Still Have Questions */}
        <div className="mt-16 rounded-3xl border border-electric-volt-green/30 bg-gradient-to-br from-electric-volt-green/10 to-purple-500/10 p-8 md:p-12 text-white text-center backdrop-blur-sm">
          <h2 className="text-3xl md:text-4xl font-black mb-4 uppercase tracking-[0.2em]" style={{ fontFamily: 'var(--font-display)' }}>
            Still Have Questions?
          </h2>
          <p className="text-base md:text-lg mb-8 text-gray-300">
            Can't find what you're looking for? Our customer service team is here to help!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="inline-block bg-electric-volt-green text-black font-bold py-4 px-8 rounded-full uppercase tracking-[0.3em] text-sm hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(173,255,0,0.5)] transition-all"
            >
              Contact Us
            </a>
            <a
              href="mailto:hello@Madrush.com.ng"
              className="inline-block bg-transparent border-2 border-electric-volt-green text-electric-volt-green font-bold py-4 px-8 rounded-full uppercase tracking-[0.3em] text-sm hover:bg-electric-volt-green hover:text-black transition-all"
            >
              Email Support
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

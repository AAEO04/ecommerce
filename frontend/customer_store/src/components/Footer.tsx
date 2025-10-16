import React from 'react'
import Link from 'next/link'
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon,
  HeartIcon 
} from '@heroicons/react/24/outline'

const footerLinks = {
  shop: [
    { name: 'New Arrivals', href: '/products?filter=new' },
    { name: 'T-Shirts', href: '/collections/t-shirts' },
    { name: 'Hoodies', href: '/collections/hoodies' },
    { name: 'Jackets', href: '/collections/jackets' },
    { name: 'Accessories', href: '/collections/accessories' },
  ],
  support: [
    { name: 'Size Guide', href: '/size-guide' },
    { name: 'Shipping Info', href: '/shipping' },
    { name: 'Returns', href: '/returns' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Contact Us', href: '/contact' },
  ],
  company: [
    { name: 'About Us', href: '/about' },
    { name: 'Careers', href: '/careers' },
    { name: 'Press', href: '/press' },
    { name: 'Blog', href: '/blog' },
    { name: 'Sustainability', href: '/sustainability' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Cookie Policy', href: '/cookies' },
    { name: 'Accessibility', href: '/accessibility' },
  ]
}

export default function Footer() {
  return (
    <footer className="bg-secondary-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8">
          {/* Brand Section */}
          <div className="sm:col-span-2 lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
              <div className="relative">
                {/* Lightning Bolt Logo */}
                <div className="w-6 h-6 sm:w-8 sm:h-8 relative">
                  <svg viewBox="0 0 24 24" className="w-full h-full fill-current text-primary-400">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                  </svg>
                </div>
                {/* Stylized R */}
                <div className="absolute -right-0.5 -top-0.5 sm:-right-1 sm:-top-1 w-4 h-4 sm:w-6 sm:h-6">
                  <svg viewBox="0 0 24 24" className="w-full h-full fill-current text-primary-400">
                    <path d="M4 2h8c2.21 0 4 1.79 4 4v2c0 1.38-.84 2.56-2.03 3.06L16 16H14l-2-4H6v6H4V2zm4 4h4v2H8V6zm8 0h2v8h-2V6z"/>
                  </svg>
                </div>
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-display font-bold lightning-bolt">MAD RUSH</h2>
                <p className="text-xs text-secondary-400 font-medium tracking-wider">NO CHILLS</p>
              </div>
            </Link>
            
            <p className="text-secondary-300 mb-4 sm:mb-6 max-w-md text-sm sm:text-base">
              Express your bold personality with premium streetwear that breaks boundaries. 
              From urban essentials to statement pieces, MAD RUSH delivers uncompromising style.
            </p>

            {/* Contact Info */}
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <EnvelopeIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary-400" />
                <span className="text-secondary-300 text-sm sm:text-base">hello@madrush.com</span>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <PhoneIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary-400" />
                <span className="text-secondary-300 text-sm sm:text-base">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <MapPinIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary-400" />
                <span className="text-secondary-300 text-sm sm:text-base">New York, NY</span>
              </div>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Shop</h3>
            <ul className="space-y-2 sm:space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-secondary-300 hover:text-white transition-colors text-sm sm:text-base"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Support</h3>
            <ul className="space-y-2 sm:space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-secondary-300 hover:text-white transition-colors text-sm sm:text-base"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Company</h3>
            <ul className="space-y-2 sm:space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-secondary-300 hover:text-white transition-colors text-sm sm:text-base"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="mt-8 sm:mt-10 lg:mt-12 pt-6 sm:pt-8 border-t border-secondary-800">
          <div className="max-w-md">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Stay Connected</h3>
            <p className="text-secondary-300 mb-3 sm:mb-4 text-sm sm:text-base">
              Get the latest drops and exclusive offers delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-0">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-secondary-800 border border-secondary-700 rounded-lg sm:rounded-l-lg sm:rounded-r-none text-white placeholder-secondary-400 focus:ring-2 focus:ring-primary-500 focus:outline-none text-sm sm:text-base"
              />
              <button className="px-4 sm:px-6 py-2 sm:py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg sm:rounded-l-none sm:rounded-r-lg transition-colors text-sm sm:text-base">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-secondary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
            <d
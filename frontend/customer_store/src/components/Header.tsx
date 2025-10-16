'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ShoppingCartIcon, Bars3Icon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { useCart } from '@/context/CartContext'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const { items, isOpen, setIsOpen } = useCart()

  const totalItems = items.reduce((total, item) => total + item.quantity, 0)

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 sm:space-x-3">
            <div className="relative">
              {/* Lightning Bolt Logo */}
              <div className="w-6 h-6 sm:w-8 sm:h-8 relative">
                <svg viewBox="0 0 24 24" className="w-full h-full fill-current text-primary-600">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                </svg>
              </div>
              {/* Stylized R */}
              <div className="absolute -right-0.5 -top-0.5 sm:-right-1 sm:-top-1 w-4 h-4 sm:w-6 sm:h-6">
                <svg viewBox="0 0 24 24" className="w-full h-full fill-current text-primary-600">
                  <path d="M4 2h8c2.21 0 4 1.79 4 4v2c0 1.38-.84 2.56-2.03 3.06L16 16H14l-2-4H6v6H4V2zm4 4h4v2H8V6zm8 0h2v8h-2V6z"/>
                </svg>
              </div>
            </div>
            <div>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-display mad-rush-logo font-bold">MAD RUSH</h1>
              <p className="text-xs text-secondary-500 font-medium tracking-wider hidden sm:block">NO CHILLS</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
            <Link href="/" className="text-secondary-700 hover:text-primary-600 font-medium transition-colors text-sm lg:text-base">
              Home
            </Link>
            <Link href="/products" className="text-secondary-700 hover:text-primary-600 font-medium transition-colors text-sm lg:text-base">
              Products
            </Link>
            <Link href="/collections" className="text-secondary-700 hover:text-primary-600 font-medium transition-colors text-sm lg:text-base">
              Collections
            </Link>
            <Link href="/about" className="text-secondary-700 hover:text-primary-600 font-medium transition-colors text-sm lg:text-base">
              About
            </Link>
            <Link href="/contact" className="text-secondary-700 hover:text-primary-600 font-medium transition-colors text-sm lg:text-base">
              Contact
            </Link>
          </nav>

          {/* Search and Cart */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Search Button */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-1.5 sm:p-2 text-secondary-700 hover:text-primary-600 transition-colors"
            >
              <MagnifyingGlassIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setIsOpen(true)}
              className="relative p-1.5 sm:p-2 text-secondary-700 hover:text-primary-600 transition-colors"
            >
              <ShoppingCartIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-primary-600 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center font-semibold">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-1.5 sm:p-2 text-secondary-700 hover:text-primary-600 transition-colors"
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              ) : (
                <Bars3Icon className="h-5 w-5 sm:h-6 sm:w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {isSearchOpen && (
          <div className="py-3 sm:py-4 border-t border-secondary-200">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 text-sm sm:text-base border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <MagnifyingGlassIcon className="absolute left-2 sm:left-3 top-2 sm:top-2.5 h-4 w-4 sm:h-5 sm:w-5 text-secondary-400" />
            </div>
          </div>
        )}

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-3 sm:py-4 border-t border-secondary-200">
            <nav className="flex flex-col space-y-3 sm:space-y-4">
              <Link
                href="/"
                className="text-secondary-700 hover:text-primary-600 font-medium transition-colors text-sm sm:text-base py-1"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/products"
                className="text-secondary-700 hover:text-primary-600 font-medium transition-colors text-sm sm:text-base py-1"
                onClick={() => setIsMenuOpen(false)}
              >
                Products
              </Link>
              <Link
                href="/collections"
                className="text-secondary-700 hover:text-primary-600 font-medium transition-colors text-sm sm:text-base py-1"
                onClick={() => setIsMenuOpen(false)}
              >
                Collections
              </Link>
              <Link
                href="/about"
                className="text-secondary-700 hover:text-primary-600 font-medium transition-colors text-sm sm:text-base py-1"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="/contact"
                className="text-secondary-700 hover:text-primary-600 font-medium transition-colors text-sm sm:text-base py-1"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

import Link from 'next/link'
import { Home, Search, ShoppingBag } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        {/* MAD RUSH Logo */}
        <div className="mb-8">
          <div className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-accent-green via-accent-purple to-pink-500 mb-4">
            404
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Oops! Page Not Found
          </h1>
          <p className="text-xl text-neutral-400 mb-8">
            Looks like this page went on a mad rush somewhere else!
          </p>
        </div>

        {/* Illustration */}
        <div className="mb-8 text-9xl">
          🏃‍♂️💨
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-accent-green hover:bg-accent-green-700 text-white rounded-lg font-semibold transition-colors"
          >
            <Home className="h-5 w-5" />
            Go Home
          </Link>
          <Link
            href="/products"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg font-semibold transition-colors"
          >
            <ShoppingBag className="h-5 w-5" />
            Browse Products
          </Link>
          <Link
            href="/products?search="
            className="flex items-center justify-center gap-2 px-6 py-3 border border-neutral-700 hover:border-neutral-500 text-white rounded-lg font-semibold transition-colors"
          >
            <Search className="h-5 w-5" />
            Search
          </Link>
        </div>

        {/* Popular links */}
        <div className="mt-12 pt-8 border-t border-neutral-800">
          <p className="text-sm text-neutral-400 mb-4">Popular pages:</p>
          <div className="flex flex-wrap gap-3 justify-center">
            {['New Arrivals', 'Best Sellers', 'Sale', 'About Us', 'Contact'].map((link) => (
              <Link
                key={link}
                href={`/${link.toLowerCase().replace(' ', '-')}`}
                className="text-sm text-accent-green hover:text-accent-green-700 transition-colors"
              >
                {link}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

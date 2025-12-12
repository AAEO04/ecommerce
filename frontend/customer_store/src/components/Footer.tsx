import Link from 'next/link'
import { Facebook, Instagram, Mail, MapPin, Phone } from 'lucide-react'

const quickLinks = [
  { label: 'Shop All', href: '/products' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'Size Guide', href: '/size-guide' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Wishlist', href: '/wishlist' },
]

const serviceHighlights = [
  { title: 'Same-Day Dispatch', detail: 'Order by 2PM EST' },
  { title: 'Free Returns', detail: '30-day window' },
  { title: 'Secure Checkout', detail: 'End-to-end encrypted' },
  { title: 'Global Shipping', detail: '23 cities active' },
]

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="relative mt-24 border-t border-white/10 bg-black text-white overflow-hidden">
      <div className="absolute inset-0 urban-wall opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/90 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-16 lg:grid-cols-[2fr_1fr_1fr_1.5fr]">
          {/* Brand Column */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="text-4xl md:text-5xl font-black text-white tracking-tight" style={{ fontFamily: 'Druk Wide, Arial Black, Impact, sans-serif' }}>
                MAD RUSH
              </div>
              <p className="font-tagline text-xl uppercase tracking-[0.3em] text-electric-volt-green/90">
                No chills. Just MADRUSH.
              </p>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed max-w-md">
              Built in the late-night labs for the people who refuse to power down. Every drop is engineered for motion,
              glow, and relentless pace.
            </p>
            <div className="flex flex-wrap gap-4">
              {serviceHighlights.map((item) => (
                <div
                  key={item.title}
                  className="group flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 transition-all hover:border-electric-volt-green/50 hover:bg-electric-volt-green/10"
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-electric-volt-green shadow-[0_0_8px_#46C018]" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white group-hover:text-electric-volt-green transition-colors">{item.title}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="mb-6 text-xs font-bold uppercase tracking-[0.4em] text-purple-500">Explore</h3>
            <ul className="space-y-4">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="group flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white"
                  >
                    <span className="h-px w-0 bg-electric-volt-green transition-all group-hover:w-4" />
                    <span className="uppercase tracking-widest text-[10px] font-semibold">{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-[0.4em] text-hot-pink">Connect</h3>
            <div className="space-y-4">
              <a href="mailto:hey@madrush.store" className="group flex items-center gap-3 text-gray-400 hover:text-white transition-colors">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
                  <Mail className="h-4 w-4" />
                </div>
                <span className="text-xs uppercase tracking-widest">hey@madrush.store</span>
              </a>
              <div className="flex items-start gap-3 text-gray-400">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5">
                  <MapPin className="h-4 w-4" />
                </div>
                <div className="flex flex-col gap-1 pt-1.5">
                  <span className="text-xs uppercase tracking-widest">Studio 47</span>
                  <span className="text-[10px] uppercase tracking-widest text-gray-600">lagos Nigeria · </span>
                </div>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <h3 className="text-xs font-bold uppercase tracking-[0.4em] text-white mb-2">Join the Rush</h3>
              <p className="text-xs text-gray-400 mb-4">Get early access to drops and exclusive kinetic gear.</p>
              <form className="space-y-3" onSubmit={(event) => event.preventDefault()}>
                <input
                  type="email"
                  placeholder="ENTER EMAIL"
                  className="w-full rounded-lg border border-white/10 bg-black/50 px-4 py-3 text-xs font-bold uppercase tracking-widest text-white placeholder:text-gray-700 focus:border-electric-volt-green focus:outline-none transition-colors"
                  aria-label="Email address"
                />
                <button
                  type="submit"
                  className="w-full rounded-lg bg-white py-3 text-xs font-black uppercase tracking-[0.3em] text-black transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Subscribe
                </button>
              </form>
            </div>

            <div className="flex gap-3">
              <a
                href="https://www.instagram.com/wearmadrush"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-400 transition-all hover:border-purple-500 hover:text-purple-500 hover:scale-110"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="https://www.tiktok.com/@mad_rushh00"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-400 transition-all hover:border-pink-500 hover:text-pink-500 hover:scale-110"
                aria-label="TikTok"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
              </a>
              <a
                href="https://x.com/mad_rushh"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-400 transition-all hover:border-white hover:text-white hover:scale-110"
                aria-label="X"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-20 border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-600">
            © {year} MAD RUSH. All rights reserved.
          </p>
          <div className="flex gap-8">
            <Link href="/privacy" className="text-[10px] uppercase tracking-[0.2em] text-gray-600 hover:text-white transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-[10px] uppercase tracking-[0.2em] text-gray-600 hover:text-white transition-colors">
              Terms
            </Link>
            <Link href="/contact" className="text-[10px] uppercase tracking-[0.2em] text-gray-600 hover:text-white transition-colors">
              Support
            </Link>
          </div>
        </div>
      </div>

      {/* Decorative Background Elements */}
      <div className="pointer-events-none absolute top-0 right-0 -mt-20 -mr-20 h-96 w-96 rounded-full bg-purple-900/20 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-0 left-0 -mb-20 -ml-20 h-96 w-96 rounded-full bg-electric-volt-green/10 blur-[100px]" />
    </footer>
  )
}


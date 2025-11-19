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
    <footer className="relative mt-12 border-t-4 border-white bg-black text-white overflow-hidden">
      <div className="absolute inset-0 urban-wall opacity-40" />
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            'radial-gradient(circle at 15% 20%, rgba(173,255,0,0.12), transparent 45%), radial-gradient(circle at 80% 10%, rgba(255,59,92,0.15), transparent 40%), radial-gradient(circle at 70% 70%, rgba(168,85,247,0.2), transparent 55%)',
        }}
      />

      <div className="relative mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-10 lg:grid-cols-4">
          <div className="space-y-5 lg:col-span-2">
            <div className="text-3xl font-extrabold text-white drip" style={{ fontFamily: 'Druk Wide, Arial Black, Impact, sans-serif' }}>
              MAD RUSH
            </div>
            <p className="font-tagline text-2xl uppercase tracking-[0.3em] text-electric-volt-green">
              No chills. Just kinetic street energy.
            </p>
            <p className="text-sm text-gray-300">
              Built in the late-night labs for the people who refuse to power down. Every drop is engineered for motion,
              glow, and relentless pace.
            </p>
            <div className="flex flex-wrap gap-3">
              {serviceHighlights.map((item) => (
                <div
                  key={item.title}
                  className="rounded-md border border-white/20 bg-white/5 px-3 py-2 text-xs uppercase tracking-widest text-gray-200"
                >
                  <p className="font-semibold text-electric-volt-green">{item.title}</p>
                  <p className="text-[10px] text-gray-400">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.4em] text-cyan-accent">Navigation</h3>
            <ul className="space-y-3 text-sm">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="flex items-center justify-between text-gray-300 transition-colors hover:text-electric-volt-green"
                  >
                    {link.label}
                    <span className="text-xs tracking-widest text-white/40">GO</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-5">
            <h3 className="text-sm font-semibold uppercase tracking-[0.4em] text-hot-pink">Support Signal</h3>
            <div className="space-y-3 text-sm text-gray-300">
              <a href="mailto:hey@madrush.store" className="flex items-center gap-3 hover:text-electric-volt-green">
                <Mail className="h-4 w-4 text-electric-volt-green" />
                hey@madrush.store
              </a>
              <a href="tel:+11234567890" className="flex items-center gap-3 hover:text-electric-volt-green">
                <Phone className="h-4 w-4 text-electric-volt-green" />
                +1 (123) 456-7890
              </a>
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 text-electric-volt-green" />
                <p>Studio 47 · Lower East Side · NYC</p>
              </div>
            </div>
            <div className="rounded-lg border border-white/20 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.4em] text-gray-400">Stay in the signal</p>
              <form className="mt-3 space-y-3" onSubmit={(event) => event.preventDefault()}>
                <input
                  type="email"
                  placeholder="email@domain.com"
                  className="w-full rounded-md border border-white/20 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-electric-volt-green focus:outline-none"
                  aria-label="Email address"
                />
                <button
                  type="submit"
                  className="w-full rounded-md bg-electric-volt-green py-2 text-sm font-bold uppercase tracking-[0.3em] text-black transition hover:bg-white"
                >
                  Join the rush
                </button>
              </form>
            </div>
          </div>

          <div className="space-y-4 lg:col-span-1" aria-hidden>
            <div className="rounded-xl border border-white/15 bg-gradient-to-br from-black via-purple/40 to-transparent p-6 text-sm text-gray-400">
              <p className="font-semibold uppercase tracking-[0.4em] text-purple">First Drop</p>
              <p className="mt-3 text-lg font-black text-white">MAD RUSH 01</p>
              <p className="mt-2 text-xs">
                Prototype batch deployed. Limited units. No reruns.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-6 border-t border-white/10 pt-8 text-sm text-gray-300 lg:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-gray-500">Connect</p>
            <div className="mt-3 flex flex-wrap gap-4">
              <a
                href="https://www.instagram.com/mad_rushh?igsh=dnB5YjNmOHBkZWM5&utm_source=qr"
                target="_blank"
                rel="noopener noreferrer"
                className="h-12 w-12 rounded-full border-2 border-white/30 bg-gradient-to-br from-[#fdf497] via-[#fd5949] to-[#285AEB] backdrop-blur transition hover:scale-110"
                aria-label="Instagram"
              >
                <Instagram className="mx-auto mt-3 h-6 w-6 text-white" />
              </a>
              <a
                href="https://x.com/mad_rushh?s=21"
                target="_blank"
                rel="noopener noreferrer"
                className="h-12 w-12 rounded-full border-2 border-electric-volt-green text-electric-volt-green transition hover:scale-110"
                aria-label="X"
              >
                <svg className="mx-auto mt-3 h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://facebook.com/madrush"
                target="_blank"
                rel="noopener noreferrer"
                className="h-12 w-12 rounded-full border-2 border-blue-500 bg-blue-600 transition hover:scale-110"
                aria-label="Facebook"
              >
                <Facebook className="mx-auto mt-3 h-6 w-6" />
              </a>
            </div>
          </div>
          <div className="flex flex-col justify-between gap-3 lg:items-end">
            <p className="text-xs uppercase tracking-[0.4em] text-gray-500">Field Notes</p>
            <p className="text-sm text-gray-300">
              Broadcasting straight from the Lower East concrete grid. Tag <span className="text-electric-volt-green font-semibold">#MADRUSH</span> for a feature.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-gray-400 md:flex-row md:items-center md:justify-between">
          <p>
            © {year} <span className="font-semibold text-electric-volt-green">MAD RUSH</span>. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-6">
            <Link href="/privacy" className="uppercase tracking-[0.3em] hover:text-hot-pink">
              Privacy
            </Link>
            <Link href="/terms" className="uppercase tracking-[0.3em] hover:text-hot-pink">
              Terms
            </Link>
            <Link href="/contact" className="uppercase tracking-[0.3em] hover:text-hot-pink">
              Support
            </Link>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute top-16 right-10 font-tagline text-7xl text-purple opacity-10">
        RUSH
      </div>
      <div className="pointer-events-none absolute bottom-16 left-6 font-tagline text-6xl text-hot-pink opacity-10">
        MAD
      </div>
    </footer>
  )
}

'use client';

import Link from 'next/link';
import { useCartStore } from '@/stores/useCartStore';
import { useContext, useEffect, useRef, useState } from 'react';
import { Menu } from 'lucide-react';
import { AnimationContext } from '@/context/AnimationContext';
import { motion } from 'framer-motion';

export function Header() {
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const totalCount = useCartStore((s) => s.getTotalCount());
  const cartRef = useRef<HTMLDivElement>(null);
  const animationContext = useContext(AnimationContext);

  useEffect(() => {
    setMounted(true);
    if (animationContext && cartRef.current) {
      animationContext.setCartRef(cartRef);
    }
  }, [animationContext]);

  return (
    <header className="sticky top-0 z-50 w-full bg-neutral-900 border-b border-neutral-800">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-white">MAD RUSH</Link>
        <nav className="hidden md:flex items-center gap-4">
          <Link href="/products" className="text-sm text-neutral-300 hover:text-white">Products</Link>
          <div ref={cartRef}>
            <Link href="/cart" className="text-sm text-neutral-300 hover:text-white">
              Cart (
              <motion.span
                key={totalCount}
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 0.3 }}
              >
                {mounted ? totalCount : 0}
              </motion.span>
              )
            </Link>
          </div>
        </nav>
        <div className="md:hidden">
          <button onClick={() => setMobileMenuOpen(true)} aria-label="Open menu">
            <Menu className="h-6 w-6 text-white" />
          </button>
        </div>
      </div>
      {/* Mobile menu will be implemented here */}
    </header>
  );
}

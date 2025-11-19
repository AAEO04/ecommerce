'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useWishlistStore } from '@/stores/useWishlistStore';
import { useCartStore } from '@/stores/useCartStore';
import { useContext, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AnimationContext } from '@/context/AnimationContext';
import { motion } from 'framer-motion';
import { Cart } from '@/components/ui/Cart';
import { SearchBar } from '@/components/SearchBar';
import { Search, Heart, Sparkles } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/Sheet";

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export function Header() {
  const [mounted, setMounted] = useState(false);
  const cartRef = useRef<HTMLDivElement>(null);
  const animationContext = useContext(AnimationContext);
  const wishlistItems = useWishlistStore((s) => s.items);
  const cartItems = useCartStore((s) => s.items);
  const pathname = usePathname();
  const wishlistCount = wishlistItems.length;
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const [cartShake, setCartShake] = useState(false);
  const [wishlistBeat, setWishlistBeat] = useState(false);
  const prevCartCount = useRef(cartCount);
  const prevWishlistCount = useRef(wishlistCount);

  useEffect(() => {
    setMounted(true);
    if (animationContext && cartRef.current) {
      animationContext.setCartRef(cartRef);
    }
  }, [animationContext]);

  useEffect(() => {
    if (!mounted) {
      prevCartCount.current = cartCount;
      return;
    }
    if (cartCount > prevCartCount.current) {
      setCartShake(true);
      const timer = setTimeout(() => setCartShake(false), 600);
      prevCartCount.current = cartCount;
      return () => clearTimeout(timer);
    }
    prevCartCount.current = cartCount;
  }, [cartCount, mounted]);

  useEffect(() => {
    if (!mounted) {
      prevWishlistCount.current = wishlistCount;
      return;
    }
    if (wishlistCount > prevWishlistCount.current) {
      setWishlistBeat(true);
      const timer = setTimeout(() => setWishlistBeat(false), 500);
      prevWishlistCount.current = wishlistCount;
      return () => clearTimeout(timer);
    }
    prevWishlistCount.current = wishlistCount;
  }, [wishlistCount, mounted]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/80 backdrop-blur-lg">
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute inset-0 hero-grid" aria-hidden="true" />
        <div className="absolute inset-0 hero-noise" aria-hidden="true" />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative">
              <Image src="/logo.png" alt="MAD RUSH Logo" width={50} height={50} className="w-12 h-12 drop-shadow-[0_0_15px_rgba(173,255,0,0.6)]" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-xl font-black tracking-[0.3em] text-white">MAD RUSH</span>
              <span className="text-[10px] uppercase tracking-[0.5em] text-electric-volt-green hidden sm:block">No chills. Stay kinetic.</span>
            </div>
          </Link>

          <div className="hidden lg:flex flex-1 items-center justify-center px-6">
            <div className="flex w-full max-w-xl items-center gap-3 rounded-full border border-white/15 bg-white/5 px-4 py-2 shadow-[0_0_20px_rgba(0,0,0,0.35)]">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-electric-volt-green/20 text-electric-volt-green">
                <Search className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <SearchBar />
              </div>
              <span className="hidden xl:inline text-[10px] uppercase tracking-[0.4em] text-white/40">CTRL + K</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <nav className="flex items-center gap-3 pr-4 border-r border-white/10">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] transition ${
                      isActive
                        ? 'bg-electric-volt-green text-black shadow-[0_0_15px_rgba(173,255,0,0.45)]'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {link.label}
                    {isActive && <span className="absolute -bottom-1 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full bg-black/70" />}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-3">
              <Link
                href="/wishlist"
                className="group relative inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:border-electric-volt-green hover:bg-electric-volt-green/10"
              >
                <motion.span
                  animate={wishlistBeat ? { scale: [1, 1.25, 0.95, 1] } : { scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-electric-volt-green/15 text-electric-volt-green"
                >
                  <Heart className="h-4 w-4" />
                </motion.span>
                Wishlist
                {wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-2 rounded-full border border-black bg-electric-volt-green px-2 py-0.5 text-[10px] font-bold text-black">
                    {wishlistCount}
                  </span>
                )}
              </Link>
              <motion.div
                ref={cartRef}
                animate={cartShake ? { rotate: [0, -4, 4, -2, 2, 0], x: [0, -4, 4, -2, 2, 0] } : { rotate: 0, x: 0 }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
                className="rounded-full border border-white/15 bg-white/5 p-2"
              >
                <Cart />
              </motion.div>
            </div>
          </div>

          <div className="flex items-center gap-3 md:hidden">
            <motion.div
              ref={cartRef}
              animate={cartShake ? { rotate: [0, -4, 4, -2, 2, 0], x: [0, -4, 4, -2, 2, 0] } : { rotate: 0, x: 0 }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5"
            >
              <Cart />
            </motion.div>
            <Sheet>
              <SheetTrigger>
                <div className="relative h-6 w-6 flex flex-col justify-between cursor-pointer">
                  <span className="sr-only">Open navigation</span>
                  <div className="w-full h-1 bg-electric-volt-green rounded" />
                  <div className="w-full h-1 bg-hot-pink rounded" />
                  <div className="w-full h-1 bg-purple rounded" />
                </div>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 border-white/10 bg-black text-white">
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-2 border-b border-white/10 pb-4">
                    <Image src="/logo.png" alt="MAD RUSH Logo" width={36} height={36} className="w-10 h-10" />
                    <div>
                      <p className="text-lg font-black tracking-[0.4em]">MAD RUSH</p>
                      <p className="text-[10px] uppercase tracking-[0.4em] text-electric-volt-green">Global drop feed</p>
                    </div>
                  </div>
                  <div className="py-4">
                    <div className="rounded-2xl border border-white/15 bg-white/5 px-3 py-2">
                      <SearchBar />
                    </div>
                  </div>
                  <nav className="flex-1 space-y-2">
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="flex items-center justify-between rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white/80 transition hover:border-electric-volt-green hover:text-white"
                      >
                        {link.label}
                        {pathname === link.href && <Sparkles className="h-4 w-4 text-electric-volt-green" />}
                      </Link>
                    ))}
                    <Link
                      href="/wishlist"
                      className="flex items-center justify-between rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white/80 transition hover:border-hot-pink hover:text-white"
                    >
                      Wishlist
                      <div className="flex items-center gap-2">
                        <Heart className="h-4 w-4 text-hot-pink" />
                        {wishlistItems.length > 0 && (
                          <span className="rounded-full bg-electric-volt-green px-2 py-0.5 text-xs font-bold text-black">
                            {wishlistItems.length}
                          </span>
                        )}
                      </div>
                    </Link>
                  </nav>
                  <div className="mt-6 rounded-2xl border border-electric-volt-green/40 bg-[var(--accent-dark)] p-4 text-xs uppercase tracking-[0.4em] text-electric-volt-green">
                    Next drop sync · 23:59 · No chills worldwide
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}



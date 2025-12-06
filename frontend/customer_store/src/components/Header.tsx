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
  const [isOpen, setIsOpen] = useState(false);

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
    <header className="sticky top-0 z-50 w-full border-b border-white/5 glass-dark transition-all duration-500 ease-premium">
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 hero-grid" aria-hidden="true" />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
              <Image src="/logo.png" alt="MAD RUSH Logo" width={50} height={50} className="w-12 h-12 drop-shadow-[0_0_15px_rgba(173,255,0,0.6)]" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-xl font-black tracking-[0.3em] text-white group-hover:text-electric-volt-green transition-colors duration-300">MADRUSH</span>
              <span className="text-[10px] uppercase tracking-[0.5em] text-electric-volt-green hidden sm:block opacity-80 group-hover:opacity-100 transition-opacity">No chills.just Madrush.</span>
            </div>
          </Link>

          <div className="hidden lg:flex flex-1 items-center justify-center px-6">
            <div className="flex w-full max-w-xl items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 shadow-[0_0_20px_rgba(0,0,0,0.2)] transition-all duration-300 focus-within:border-electric-volt-green/50 focus-within:shadow-[0_0_30px_rgba(70,192,24,0.15)]">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-electric-volt-green/10 text-electric-volt-green">
                <Search className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <SearchBar />
              </div>
              <span className="hidden xl:inline text-[10px] uppercase tracking-[0.4em] text-white/30">CTRL + K</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <nav className="flex items-center gap-1 pr-4 border-r border-white/10">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative rounded-full px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 ${isActive
                      ? 'bg-electric-volt-green text-black shadow-[0_0_20px_rgba(70,192,24,0.4)]'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-3">
              <Link
                href="/wishlist"
                className="group relative inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition-all duration-300 hover:border-purple-500 hover:bg-purple-500/10 hover:shadow-[0_0_15px_rgba(168,85,247,0.2)]"
              >
                <motion.span
                  animate={wishlistBeat ? { scale: [1, 1.4, 0.9, 1] } : { scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-purple-500/10 text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-colors"
                >
                  <Heart className="h-3.5 w-3.5" />
                </motion.span>
                <span className="hidden lg:inline">Wishlist</span>
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-purple-500 text-[9px] font-bold text-white shadow-lg">
                    {wishlistCount}
                  </span>
                )}
              </Link>
              <motion.div
                ref={cartRef}
                animate={cartShake ? { rotate: [0, -5, 5, -3, 3, 0], scale: [1, 1.1, 1] } : { rotate: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: 'backOut' }}
                className="rounded-full border border-white/10 bg-white/5 p-2 transition-colors hover:bg-white/10 hover:border-electric-volt-green/50 cursor-pointer"
              >
                <Cart />
              </motion.div>
            </div>
          </div>

          <div className="flex items-center gap-3 md:hidden">
            <Link
              href="/wishlist"
              aria-label={`Wishlist${wishlistCount > 0 ? ` (${wishlistCount} items)` : ''}`}
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-colors hover:border-purple-500 hover:bg-purple-500/10"
            >
              <Heart className="h-5 w-5" />
              {mounted && wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-purple-500 text-[9px] font-bold text-white">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <motion.div
              ref={cartRef}
              animate={cartShake ? { rotate: [0, -4, 4, -2, 2, 0] } : { rotate: 0 }}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5"
            >
              <Cart />
            </motion.div>
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <button
                  aria-label="Open navigation menu"
                  className="relative h-10 w-10 flex items-center justify-center rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <div className="flex flex-col gap-1.5 w-5">
                    <div className="w-full h-0.5 bg-electric-volt-green rounded-full" />
                    <div className="w-full h-0.5 bg-hot-pink rounded-full" />
                    <div className="w-full h-0.5 bg-purple rounded-full" />
                  </div>
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-md border-l border-white/10 glass-dark p-0">
                <div className="flex flex-col h-full bg-black/40 backdrop-blur-xl">
                  <div className="flex items-center gap-3 border-b border-white/10 p-6">
                    <Image src="/logo.png" alt="MAD RUSH Logo" width={40} height={40} className="w-10 h-10" />
                    <div>
                      <p className="text-xl font-black tracking-[0.2em] text-white">MAD RUSH</p>
                      <p className="text-[10px] uppercase tracking-[0.4em] text-electric-volt-green">Global drop feed</p>
                    </div>
                  </div>

                  <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                    <div className="relative">
                      <SearchBar />
                    </div>

                    <nav className="flex flex-col gap-2">
                      {navLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setIsOpen(false)}
                          className={`group flex items-center justify-between rounded-xl border border-white/5 p-4 text-sm font-bold uppercase tracking-[0.2em] transition-all duration-300 ${pathname === link.href
                            ? 'bg-electric-volt-green text-black border-electric-volt-green'
                            : 'text-white/70 hover:bg-white/5 hover:text-white hover:border-white/20'
                            }`}
                        >
                          {link.label}
                          {pathname === link.href && <Sparkles className="h-4 w-4" />}
                        </Link>
                      ))}
                    </nav>

                    <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold uppercase tracking-widest text-white/60">Your Stash</span>
                        <Link href="/wishlist" className="text-xs text-purple-400 hover:text-purple-300">View All</Link>
                      </div>
                      <Link
                        href="/wishlist"
                        className="flex items-center gap-4 rounded-lg bg-black/40 p-3 transition-colors hover:bg-black/60"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/20 text-purple-500">
                          <Heart className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">Wishlist</p>
                          <p className="text-xs text-white/50">{wishlistItems.length} items saved</p>
                        </div>
                      </Link>
                    </div>
                  </div>

                  <div className="p-6 border-t border-white/10 bg-black/20">
                    <div className="rounded-xl border border-electric-volt-green/30 bg-electric-volt-green/5 p-4 text-center">
                      <p className="text-[10px] uppercase tracking-[0.3em] text-electric-volt-green font-bold mb-1">Next Drop Sync</p>
                      <p className="text-2xl font-black text-white tracking-widest font-display">23:59:00</p>
                    </div>
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

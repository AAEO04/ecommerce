'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/stores/useCartStore';
import { useWishlistStore } from '@/stores/useWishlistStore';
import { useContext, useEffect, useRef, useState } from 'react';
import { AnimationContext } from '@/context/AnimationContext';
import { motion } from 'framer-motion';
import { Cart } from '@/components/ui/Cart';
import { SearchBar } from '@/components/SearchBar';
import { Search, Menu, Heart } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/Sheet";

export function Header() {
  const [mounted, setMounted] = useState(false);
  const cartRef = useRef<HTMLDivElement>(null);
  const animationContext = useContext(AnimationContext);
  const wishlistItems = useWishlistStore((s) => s.items);

  useEffect(() => {
    setMounted(true);
    if (animationContext && cartRef.current) {
      animationContext.setCartRef(cartRef);
    }
  }, [animationContext]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.png" alt="MAD RUSH Logo" width={50} height={50} className="w-12 h-12" />
              <div className="flex flex-col">
                <span className="text-xl font-bold text-gray-900">MAD RUSH</span>
                <span className="text-xs text-gray-600 italic hidden sm:block">No Chills just Mad Rush</span>
              </div>
            </Link>
          </div>
          <div className="hidden md:flex flex-1 items-center justify-center px-2 lg:ml-6 lg:justify-end">
            <div className="max-w-lg w-full lg:max-w-xs">
              <SearchBar />
            </div>
          </div>
          <div className="flex items-center">
            <div className="hidden md:flex items-center gap-6">
                <Link href="/" className="text-sm font-medium text-gray-700 hover:text-gray-900">
                    Home
                </Link>
                <Link href="/products" className="text-sm font-medium text-gray-700 hover:text-gray-900">
                    Products
                </Link>
                <Link href="/about" className="text-sm font-medium text-gray-700 hover:text-gray-900">
                    About
                </Link>
                <Link href="/contact" className="text-sm font-medium text-gray-700 hover:text-gray-900">
                    Contact
                </Link>
                <Link href="/wishlist" className="relative text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center gap-1">
                    <Heart className="h-5 w-5" />
                    {wishlistItems.length > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {wishlistItems.length}
                      </span>
                    )}
                </Link>
            </div>
            <div className="ml-4 flow-root lg:ml-6" ref={cartRef}>
              <Cart />
            </div>
            <div className="flex md:hidden ml-4">
                <Sheet>
                    <SheetTrigger>
                        <div className="relative h-6 w-6 flex flex-col justify-between cursor-pointer">
                            <div className="w-full h-1 bg-green-500 rounded"></div>
                            <div className="w-full h-1 bg-red-500 rounded"></div>
                            <div className="w-full h-1 bg-purple-500 rounded"></div>
                        </div>
                    </SheetTrigger>
                    <SheetContent side="left">
                        <div className="flex flex-col h-full">
                            <div className="p-4">
                                <Link href="/" className="flex items-center gap-2">
                                    <Image src="/logo.png" alt="MAD RUSH Logo" width={40} height={40} className="w-10 h-10" />
                                    <div className="flex flex-col">
                                        <span className="text-xl font-bold text-gray-900">MAD RUSH</span>
                                        <span className="text-xs text-gray-600 italic">No Chills just Mad Rush</span>
                                    </div>
                                </Link>
                            </div>
                            <div className="p-4">
                                <SearchBar />
                            </div>
                            <nav className="flex-1 px-2 space-y-1">
                                <Link href="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                                    Home
                                </Link>
                                <Link href="/products" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                                    Products
                                </Link>
                                <Link href="/about" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                                    About
                                </Link>
                                <Link href="/contact" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                                    Contact
                                </Link>
                                <Link href="/wishlist" className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                                    <Heart className="h-5 w-5" />
                                    Wishlist
                                    {wishlistItems.length > 0 && (
                                      <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                                        {wishlistItems.length}
                                      </span>
                                    )}
                                </Link>
                            </nav>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}



'use client';

import { Suspense, useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import ProductCard from '@/components/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Product } from '@/components/ProductCard';
import { buttonHoverTap } from '@/lib/animations';

function ProductsLoading() {
  return (
    <div>
      <div role="status" aria-live="polite" className="sr-only">
        Loading products...
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="border p-4 rounded-lg">
            <Skeleton className="h-48 w-full mb-4" />
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-8 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}

async function getProducts() {
  // Add a delay to simulate a network request
  await new Promise(resolve => setTimeout(resolve, 2000));
  const res = await fetch('http://localhost:8000/products');
  if (!res.ok) {
    throw new Error('Failed to fetch products');
  }
  const products = await res.json();
  return products;
}

async function ProductsAsync() {
  const products = await getProducts();
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((p: Product) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}

export default function ProductsPage() {
  const [showButton, setShowButton] = useState(false);
  const controls = useAnimation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 200) {
        setShowButton(true);
      } else {
        setShowButton(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (showButton) {
      controls.start({ opacity: 1, y: 0 });
    } else {
      controls.start({ opacity: 0, y: 100 });
    }
  }, [showButton, controls]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-4">All Products</h1>
      <Suspense fallback={<ProductsLoading />}>
        <ProductsAsync />
      </Suspense>
      <motion.button
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 bg-primary text-primary-foreground p-3 rounded-full shadow-lg"
        initial={{ opacity: 0, y: 100 }}
        animate={controls}
        whileHover={buttonHoverTap.hover}
        whileTap={buttonHoverTap.tap}
      >
        ↑
      </motion.button>
    </div>
  );
}

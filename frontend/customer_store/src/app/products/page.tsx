'use client';

import { Suspense, useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import ProductCard from '@/components/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchProducts } from '@/lib/api'; // Use centralized API
import { Product } from '@/lib/api';
import { buttonHoverTap } from '@/lib/animations';

function ProductsLoading() {
  return (
    <div>
      <div role="status" aria-live="polite" className="sr-only">
        Loading products...
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="border border-neutral-800 p-4 rounded-lg bg-neutral-900">
            <Skeleton className="h-48 w-full mb-4" />
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-8 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showButton, setShowButton] = useState(false);
  const controls = useAnimation();

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowButton(window.scrollY > 200);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    controls.start(showButton ? { opacity: 1, y: 0 } : { opacity: 0, y: 100 });
  }, [showButton, controls]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={loadProducts}
            className="px-4 py-2 bg-accent-green text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6 text-white">All Products</h1>
      
      {loading ? (
        <ProductsLoading />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      <motion.button
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 bg-accent-purple text-white p-3 rounded-full shadow-lg z-50"
        initial={{ opacity: 0, y: 100 }}
        animate={controls}
        whileHover={buttonHoverTap.hover}
        whileTap={buttonHoverTap.tap}
        aria-label="Scroll to top"
      >
        ↑
      </motion.button>
    </div>
  );
}
'use client'
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { fetchCategories, type Category } from '@/lib/api';

export function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories();
        console.log('Fetched categories:', data);
        // Only show active categories that have images, limit to 6 for display
        const activeCategories = data
          .filter(cat => cat.is_active && cat.image_url)
          .slice(0, 6);
        setCategories(activeCategories);
      } catch (error) {
        console.error('Failed to load categories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, []);

  // Don't render the section if there are no categories
  if (!isLoading && categories.length === 0) {
    return null;
  }

  return (
    <section className="py-12 md:py-20 bg-neutral-950 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8 md:mb-10">
          <div>
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-2 uppercase tracking-tight">Browse by Category</h2>
            <p className="text-sm md:text-base text-neutral-400">Curated collections for the fast lane</p>
          </div>
          <Link href="/products" className="text-electric-volt-green hover:text-white transition-colors text-sm font-medium hidden md:block uppercase tracking-wider">
            View All &rarr;
          </Link>
        </div>

        {isLoading ? (
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="min-w-[280px] md:min-w-0 md:w-full aspect-[3/4] bg-neutral-900 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="flex md:grid md:grid-cols-3 gap-4 overflow-x-auto md:overflow-visible pb-6 md:pb-0 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
            {categories.map((category) => {
              return (
                <Link
                  key={category.id}
                  href={`/products?category=${category.slug}`}
                  className="group relative min-w-[85vw] sm:min-w-[45vw] md:min-w-0 aspect-[3/4] md:aspect-[4/5] overflow-hidden rounded-2xl bg-neutral-900 block snap-center border border-white/10"
                >
                  <Image
                    src={category.image_url}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                    sizes="(max-width: 768px) 85vw, (max-width: 1200px) 50vw, 33vw"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-90 transition-opacity group-hover:opacity-100" />

                  <div className="absolute bottom-0 left-0 p-6 w-full">
                    <h3 className="text-2xl md:text-3xl font-black text-white mb-2 uppercase italic tracking-tighter transform translate-y-0 md:translate-y-2 md:group-hover:translate-y-0 transition-transform duration-500">
                      {category.name}
                    </h3>
                    <div className="flex items-center gap-2 text-electric-volt-green text-xs font-bold uppercase tracking-widest opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-500 delay-100">
                      <span>Shop Collection</span>
                      <span className="transform group-hover:translate-x-1 transition-transform">&rarr;</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <div className="mt-4 text-center md:hidden">
          <Link href="/products" className="inline-block py-3 px-8 border border-white/20 rounded-full text-white hover:bg-white hover:text-black transition-all text-xs font-bold uppercase tracking-widest">
            View All Categories
          </Link>
        </div>
      </div>
    </section>
  );
}
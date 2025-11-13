'use client'
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Shirt, Zap, Package } from 'lucide-react';
import { fetchCategories, type Category } from '@/lib/api';

// Icon mapping for categories
const getCategoryIcon = (categoryName: string) => {
  const name = categoryName.toLowerCase();
  if (name.includes('shirt') || name.includes('top')) return Shirt;
  if (name.includes('new') || name.includes('drop')) return Zap;
  return Package; // Default icon
};

export function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories();
        // Only show active categories, limit to 6 for display
        const activeCategories = data.filter(cat => cat.is_active).slice(0, 6);
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
    <section className="py-12">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-2xl font-semibold mb-6 text-white">Browse by Category</h2>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 h-32 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map((category) => {
              const IconComponent = getCategoryIcon(category.name);
              return (
                <Link
                  key={category.id}
                  href={`/products?category=${category.slug}`}
                  className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:border-accent-purple transition-colors cursor-pointer"
                >
                  <div className="text-accent-purple mb-4">
                    <IconComponent size={40} />
                  </div>
                  <h3 className="text-lg font-semibold text-white">{category.name}</h3>
                  {category.description && (
                    <p className="text-sm text-gray-400 mt-2">{category.description}</p>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
"use client";

import { Suspense, useEffect, useMemo, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { ProductGridSkeleton } from '@/components/ui/ProductCardSkeleton';
import { ProductFilters, FilterState } from '@/components/ProductFilters';
import { fetchProducts, fetchCategories } from '@/lib/api';
import { Product } from '@/lib/api';
import { buttonHoverTap } from '@/lib/animations';
import { Grid, List, SlidersHorizontal, X, ArrowUp, Sparkles } from 'lucide-react';
import { formatNGN } from '@/utils/currency';

type ViewMode = 'grid' | 'list';

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams?.get('search') || '';
  
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showButton, setShowButton] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const controls = useAnimation();
  
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 1000000],
    categories: [],
    sortBy: 'newest'
  });
  

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const [productsData, categoriesData] = await Promise.all([
        fetchProducts(),
        fetchCategories()
      ]);
      setProducts(productsData);
      setFilteredProducts(productsData);
      setCategories(categoriesData.map(cat => cat.name));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    let result = [...products];
    
    // Apply search
    if (searchQuery) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply price filter
    result = result.filter(p => 
      p.variants[0].price >= filters.priceRange[0] && p.variants[0].price <= filters.priceRange[1]
    );
    
    // Apply category filter
    if (filters.categories.length > 0) {
      // Note: Add category field to Product type if needed
      // result = result.filter(p => filters.categories.includes(p.category))
    }
    
    // Apply sorting
    switch (filters.sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.variants[0].price - b.variants[0].price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.variants[0].price - a.variants[0].price);
        break;
      case 'newest':
        result.sort((a, b) => b.id - a.id);
        break;
      case 'popular':
        // Implement popularity logic
        break;
    }
    
    setFilteredProducts(result);
    setCurrentPage(1);
  }, [products, filters, searchQuery]);

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

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  
  const activeFiltersCount = filters.categories.length + 
    (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000000 ? 1 : 0);

  const categoryChips = useMemo(() => {
    if (!categories.length) return []
    return categories.slice(0, 6)
  }, [categories])
  
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
    <div className="relative overflow-hidden bg-black text-white">
      <div className="absolute inset-0 hero-grid opacity-10" aria-hidden="true" />
      <div className="absolute inset-0 hero-noise opacity-20" aria-hidden="true" />
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-14 pb-24 md:pb-8 space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-1 text-xs uppercase tracking-[0.4em] text-white/60">
                <Sparkles className="h-4 w-4 text-electric-volt-green" />
                Product grid
              </p>
              <h1 className="mt-4 text-4xl md:text-5xl font-black">
                {searchQuery ? `Search signal: "${searchQuery}"` : 'Browse the drop archive'}
              </h1>
              <p className="text-white/60 mt-2">{filteredProducts.length} pieces tuned to the MAD RUSH frequency.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {categoryChips.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilters((prev) => ({ ...prev, categories: prev.categories.includes(cat) ? prev.categories : [...prev.categories, cat] }))}
                  className={`rounded-full border px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] transition ${filters.categories.includes(cat) ? 'border-electric-volt-green bg-electric-volt-green text-black' : 'border-white/30 text-white/70 hover:border-electric-volt-green/80'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/10 bg-neutral-950/70 p-5">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 rounded-2xl border border-white/30 px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-white hover:border-electric-volt-green"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="rounded-full bg-electric-volt-green px-2 py-0.5 text-xs font-bold text-black">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
              {activeFiltersCount > 0 && (
                <div className="hidden md:flex flex-wrap items-center gap-2">
                  {filters.categories.map((cat) => (
                    <span key={cat} className="flex items-center gap-1 rounded-full border border-white/20 px-3 py-1 text-xs">
                      {cat}
                      <button onClick={() => setFilters({ ...filters, categories: filters.categories.filter((c) => c !== cat) })}>
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 rounded-2xl border border-white/20 p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`rounded-2xl px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] transition ${viewMode === 'grid' ? 'bg-electric-volt-green text-black' : 'text-white/70'}`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`rounded-2xl px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] transition ${viewMode === 'list' ? 'bg-electric-volt-green text-black' : 'text-white/70'}`}
              >
                List
              </button>
            </div>
          </div>

          <div className="flex gap-6">
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <ProductFilters
                filters={filters}
                onFilterChange={setFilters}
                categories={categories}
              />
            </aside>

            <ProductFilters
              filters={filters}
              onFilterChange={setFilters}
              categories={categories}
              isMobile
              isOpen={showFilters}
              onClose={() => setShowFilters(false)}
            />

            <div className="flex-1">
              {loading ? (
                <ProductGridSkeleton count={12} />
              ) : filteredProducts.length === 0 ? (
                <div className="rounded-3xl border border-white/10 bg-neutral-950/80 py-16 text-center">
                  <div className="text-6xl mb-4">⚠️</div>
                  <h3 className="text-2xl font-semibold mb-2">Nothing in this frequency</h3>
                  <p className="text-white/60 mb-6">
                    {searchQuery ? `No results for "${searchQuery}"` : 'Adjust your filters or explore different chips'}
                  </p>
                  <button
                    onClick={() => {
                      setFilters({ priceRange: [0, 1000000], categories: [], sortBy: 'newest' });
                      window.history.pushState({}, '', '/products');
                    }}
                    className="rounded-2xl border border-electric-volt-green bg-electric-volt-green px-6 py-3 text-black transition hover:-translate-y-1"
                  >
                    Reset filters
                  </button>
                </div>
              ) : (
                <>
                  {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                      {paginatedProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {paginatedProducts.map((product) => (
                        <Link
                          key={product.id}
                          href={`/product/${product.id}`}
                          className="flex gap-4 rounded-3xl border border-white/10 bg-neutral-950/70 p-4 transition hover:border-electric-volt-green"
                        >
                          <div className="relative w-32 h-32 flex-shrink-0 overflow-hidden rounded-2xl">
                            <Image
                              src={product.images[0]?.image_url}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold">{product.name}</h3>
                            <p className="text-white/60 mb-3 line-clamp-2">{product.description}</p>
                            <div className="text-2xl font-black text-electric-volt-green">{formatNGN(product.variants[0].price)}</div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-10">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="rounded-2xl border border-white/20 px-4 py-2 text-white/70 transition hover:border-electric-volt-green disabled:opacity-40"
                      >
                        Previous
                      </button>
                      <div className="flex gap-2">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`h-10 w-10 rounded-2xl transition ${currentPage === page ? 'bg-electric-volt-green text-black' : 'bg-white/5 text-white/70 hover:bg-white/10'}`}
                          >
                            {page}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="rounded-2xl border border-white/20 px-4 py-2 text-white/70 transition hover:border-electric-volt-green disabled:opacity-40"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <motion.button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 rounded-full border border-electric-volt-green bg-black/60 p-4 text-electric-volt-green backdrop-blur-lg"
          initial={{ opacity: 0, y: 100 }}
          animate={controls}
          whileHover={buttonHoverTap.hover}
          whileTap={buttonHoverTap.tap}
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-5 w-5" />
        </motion.button>
      </div>
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductGridSkeleton count={12} />}>
      <ProductsPageContent />
    </Suspense>
  )
}
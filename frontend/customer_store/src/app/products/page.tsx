'use client';

import { Suspense, useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import { ProductGridSkeleton } from '@/components/ui/ProductCardSkeleton';
import { ProductFilters, FilterState } from '@/components/ProductFilters';
import { fetchProducts, fetchCategories, Category } from '@/lib/api';
import { Product } from '@/lib/api';
import { buttonHoverTap } from '@/lib/animations';
import { Grid, List, SlidersHorizontal, X, ArrowUp } from 'lucide-react';
import { formatNGN } from '@/utils/currency';
import Image from 'next/image';
import Link from 'next/link';

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
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">
          {searchQuery ? `Search results for "${searchQuery}"` : 'All Products'}
        </h1>
        <p className="text-neutral-400">{filteredProducts.length} products found</p>
      </div>
      
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          {/* Mobile filter button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="bg-accent-green text-white text-xs rounded-full px-2 py-0.5">
                {activeFiltersCount}
              </span>
            )}
          </button>
          
          {/* Active filters */}
          {activeFiltersCount > 0 && (
            <div className="hidden md:flex items-center gap-2">
              {filters.categories.map(cat => (
                <span key={cat} className="flex items-center gap-1 px-3 py-1 bg-accent-green/20 text-accent-green rounded-full text-sm">
                  {cat}
                  <button onClick={() => setFilters({...filters, categories: filters.categories.filter(c => c !== cat)})}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
        
        {/* View toggle */}
        <div className="flex items-center gap-2 bg-neutral-800 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded transition-colors ${viewMode === 'grid' ? 'bg-accent-green text-white' : 'text-neutral-400 hover:text-white'}`}
            aria-label="Grid view"
          >
            <Grid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded transition-colors ${viewMode === 'list' ? 'bg-accent-green text-white' : 'text-neutral-400 hover:text-white'}`}
            aria-label="List view"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      <div className="flex gap-6">
        {/* Desktop Filters Sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <ProductFilters
            filters={filters}
            onFilterChange={setFilters}
            categories={categories}
          />
        </aside>
        
        {/* Mobile Filters */}
        <ProductFilters
          filters={filters}
          onFilterChange={setFilters}
          categories={categories}
          isMobile
          isOpen={showFilters}
          onClose={() => setShowFilters(false)}
        />
        
        {/* Products Grid/List */}
        <div className="flex-1">
          {loading ? (
            <ProductGridSkeleton count={12} />
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-white mb-2">No products found</h3>
              <p className="text-neutral-400 mb-6">
                {searchQuery ? `No results for "${searchQuery}"` : 'Try adjusting your filters'}
              </p>
              <button
                onClick={() => {
                  setFilters({ priceRange: [0, 1000000], categories: [], sortBy: 'newest' });
                  window.history.pushState({}, '', '/products');
                }}
                className="px-6 py-3 bg-accent-green hover:bg-accent-green-700 text-white rounded-lg transition-colors"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
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
                      className="flex gap-4 p-4 bg-neutral-900 border border-neutral-800 rounded-lg hover:border-accent-green transition-colors"
                    >
                      <div className="relative w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden">
                        <Image
                          src={product.images[0]?.image_url}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-2">{product.name}</h3>
                        <p className="text-sm text-neutral-400 mb-3 line-clamp-2">{product.description}</p>
                        <div className="text-xl font-bold text-accent-green">{formatNGN(product.variants[0].price)}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    Previous
                  </button>
                  <div className="flex gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 rounded-lg transition-colors ${
                          currentPage === page
                            ? 'bg-accent-green text-white'
                            : 'bg-neutral-800 hover:bg-neutral-700 text-white'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Scroll to top button */}
      <motion.button
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 bg-accent-green text-white p-3 rounded-full shadow-lg z-30"
        initial={{ opacity: 0, y: 100 }}
        animate={controls}
        whileHover={buttonHoverTap.hover}
        whileTap={buttonHoverTap.tap}
        aria-label="Scroll to top"
      >
        <ArrowUp className="h-5 w-5" />
      </motion.button>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductGridSkeleton count={12} />}>
      <ProductsPageContent />
    </Suspense>
  );
}
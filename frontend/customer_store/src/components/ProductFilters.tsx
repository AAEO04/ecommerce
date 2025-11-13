'use client'

import { useState } from 'react'
import { X, ChevronDown, ChevronUp, SlidersHorizontal } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export interface FilterState {
  priceRange: [number, number]
  categories: string[]
  sortBy: 'newest' | 'price-asc' | 'price-desc' | 'popular'
}

interface ProductFiltersProps {
  filters: FilterState
  onFilterChange: (filters: FilterState) => void
  categories: string[]
  isMobile?: boolean
  isOpen?: boolean
  onClose?: () => void
}

export function ProductFilters({
  filters,
  onFilterChange,
  categories,
  isMobile = false,
  isOpen = true,
  onClose
}: ProductFiltersProps) {
  const [expandedSections, setExpandedSections] = useState({
    price: true,
    category: true,
    sort: true
  })

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const handlePriceChange = (index: 0 | 1, value: number) => {
    const newRange: [number, number] = [...filters.priceRange] as [number, number]
    newRange[index] = value
    onFilterChange({ ...filters, priceRange: newRange })
  }

  const handleCategoryToggle = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category]
    onFilterChange({ ...filters, categories: newCategories })
  }

  const handleClearAll = () => {
    onFilterChange({
      priceRange: [0, 1000000],
      categories: [],
      sortBy: 'newest'
    })
  }

  const hasActiveFilters = filters.categories.length > 0 || 
    filters.priceRange[0] > 0 || 
    filters.priceRange[1] < 1000000

  const content = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5 text-accent-green" />
          <h3 className="font-semibold text-white text-lg">Filters</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={handleClearAll}
            className="text-sm text-accent-green hover:text-accent-green-700 transition-colors"
          >
            Clear all
          </button>
        )}
        {isMobile && onClose && (
          <button onClick={onClose} className="p-2 hover:bg-neutral-800 rounded-lg">
            <X className="h-5 w-5 text-white" />
          </button>
        )}
      </div>

      {/* Sort */}
      <div className="border-b border-neutral-800 pb-4">
        <button
          onClick={() => toggleSection('sort')}
          className="flex items-center justify-between w-full text-white font-medium mb-3"
        >
          <span>Sort By</span>
          {expandedSections.sort ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        <AnimatePresence>
          {expandedSections.sort && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-2"
            >
              {[
                { value: 'newest', label: 'Newest' },
                { value: 'popular', label: 'Most Popular' },
                { value: 'price-asc', label: 'Price: Low to High' },
                { value: 'price-desc', label: 'Price: High to Low' }
              ].map((option) => (
                <label key={option.value} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    name="sort"
                    value={option.value}
                    checked={filters.sortBy === option.value}
                    onChange={(e) => onFilterChange({ ...filters, sortBy: e.target.value as any })}
                    className="w-4 h-4 text-accent-green focus:ring-accent-green"
                  />
                  <span className="text-sm text-neutral-300 group-hover:text-white transition-colors">
                    {option.label}
                  </span>
                </label>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Price Range */}
      <div className="border-b border-neutral-800 pb-4">
        <button
          onClick={() => toggleSection('price')}
          className="flex items-center justify-between w-full text-white font-medium mb-3"
        >
          <span>Price Range</span>
          {expandedSections.price ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        <AnimatePresence>
          {expandedSections.price && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-neutral-400 mb-1 block">Min</label>
                  <input
                    type="number"
                    value={filters.priceRange[0]}
                    onChange={(e) => handlePriceChange(0, Number(e.target.value))}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-accent-green focus:border-accent-green"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-xs text-neutral-400 mb-1 block">Max</label>
                  <input
                    type="number"
                    value={filters.priceRange[1]}
                    onChange={(e) => handlePriceChange(1, Number(e.target.value))}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-accent-green focus:border-accent-green"
                    placeholder="1000000"
                  />
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="1000000"
                step="1000"
                value={filters.priceRange[1]}
                onChange={(e) => handlePriceChange(1, Number(e.target.value))}
                className="w-full accent-accent-green"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Categories */}
      <div>
        <button
          onClick={() => toggleSection('category')}
          className="flex items-center justify-between w-full text-white font-medium mb-3"
        >
          <span>Categories</span>
          {expandedSections.category ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        <AnimatePresence>
          {expandedSections.category && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-2"
            >
              {categories.map((category) => (
                <label key={category} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.categories.includes(category)}
                    onChange={() => handleCategoryToggle(category)}
                    className="w-4 h-4 text-accent-green focus:ring-accent-green rounded"
                  />
                  <span className="text-sm text-neutral-300 group-hover:text-white transition-colors">
                    {category}
                  </span>
                </label>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={onClose}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed left-0 top-0 bottom-0 w-80 bg-neutral-900 z-50 p-6 overflow-y-auto"
            >
              {content}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    )
  }

  return (
    <div className="bg-neutral-900 rounded-lg p-6 border border-neutral-800 sticky top-4">
      {content}
    </div>
  )
}

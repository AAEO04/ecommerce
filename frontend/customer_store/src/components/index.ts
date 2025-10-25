/**
 * Root Components Index
 * 
 * This file re-exports components from their respective directories
 * for easy importing throughout the application.
 */

// UI Components
export * from './ui'

// Feature Components
export * from './features'

// Common Components
export * from './common'

// Individual Components
export { default as Categories } from './Categories'
export { default as ProductCard } from './ProductCard'
export type { Product } from './ProductCard'
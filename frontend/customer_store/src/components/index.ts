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

// Individual Components - export specific ones to avoid circular deps
export { Categories } from './Categories'
export { Header } from './Header'
export { Footer } from './Footer'
export { RecentlyViewed } from './RecentlyViewed'
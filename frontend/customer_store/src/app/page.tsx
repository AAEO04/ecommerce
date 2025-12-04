import dynamic from 'next/dynamic'
import { Hero } from '@/components/features/Hero'
import { fetchBestSellers, fetchProducts } from '@/lib/api'
import { SectionReveal } from '@/components/ui/SectionReveal'

// Lazy load below-the-fold components
const BestSellers = dynamic(() => import('@/components/features/BestSellers').then(mod => mod.BestSellers))
const Categories = dynamic(() => import('@/components/Categories').then(mod => mod.Categories))
const Newsletter = dynamic(() => import('@/components/Newsletter').then(mod => mod.Newsletter))
const BrandStory = dynamic(() => import('@/components/BrandStory').then(mod => mod.BrandStory))
const NewArrivalsCarousel = dynamic(() => import('@/components/NewArrivalsCarousel').then(mod => mod.NewArrivalsCarousel))
const FAQ = dynamic(() => import('@/components/FAQ').then(mod => mod.FAQ))

export default async function Home() {
  let products = []
  let featured = []
  let newArrivals = []
  let bestSellers = []

  try {
    products = await fetchProducts()
    featured = products.slice(0, 3)
    newArrivals = products.slice(0, 8)
  } catch (error) {
    console.error('Failed to load products', error)
    // Products will be empty arrays, components will handle gracefully
  }

  try {
    bestSellers = await fetchBestSellers()
  } catch (error) {
    console.error('Failed to load best sellers', error)
  }

  return (
    <div className="min-h-screen">
      {/* Hero is critical for LCP, so we keep it static */}
      <Hero featuredProducts={featured} />

      <SectionReveal>
        <Categories />
      </SectionReveal>

      <SectionReveal>
        <BrandStory />
      </SectionReveal>

      <SectionReveal>
        <NewArrivalsCarousel products={newArrivals} />
      </SectionReveal>

      <SectionReveal>
        <BestSellers bestSellers={bestSellers} />
      </SectionReveal>

      <SectionReveal>
        <FAQ />
      </SectionReveal>

      <SectionReveal>
        <Newsletter />
      </SectionReveal>
    </div>
  )
}

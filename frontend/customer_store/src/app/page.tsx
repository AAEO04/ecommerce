import { Hero } from '@/components/features/Hero'
import { BestSellers } from '@/components/features/BestSellers'
import { Categories } from '@/components/Categories'
import { Newsletter } from '@/components/Newsletter'
import { BrandStory } from '@/components/BrandStory'
import { NewArrivalsCarousel } from '@/components/NewArrivalsCarousel'
import { fetchBestSellers, fetchProducts } from '@/lib/api'

export default async function Home() {
  const products = await fetchProducts()
  const featured = products.slice(0, 3)
  const newArrivals = products.slice(0, 8)
  let bestSellers = []

  try {
    bestSellers = await fetchBestSellers()
  } catch (error) {
    console.error('Failed to load best sellers', error)
  }

  return (
    <div className="min-h-screen">
      <Hero featuredProducts={featured} />
      <BrandStory />
      <NewArrivalsCarousel products={newArrivals} />
      <BestSellers bestSellers={bestSellers} />
      <Categories />
      <Newsletter />
    </div>
  )
}

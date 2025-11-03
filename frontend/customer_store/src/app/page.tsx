import { Hero } from '@/components/features/Hero'
import { FeaturedProducts } from '@/components/features/FeaturedProducts'
import { Categories } from '@/components/Categories'
import { Newsletter } from '@/components/Newsletter'
import { fetchProducts } from '@/lib/api'

export default async function Home() {
  const products = await fetchProducts()
  const featured = products.slice(0, 3)

  return (
    <div className="min-h-screen">
      <Hero />
      <FeaturedProducts products={featured} />
      <Categories />
      <Newsletter />
    </div>
  )
}

import { fetchProducts } from '@/lib/api'
import { ProductGrid } from './ProductGrid'

export default async function FeaturedProducts() {
  const products = await fetchProducts()
  // In a real app, we'd filter for featured products
  const featured = products.slice(0, 3)

  return (
    <section className="py-12">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-2xl font-semibold mb-6">Featured Products</h2>
        <ProductGrid products={featured} />
      </div>
    </section>
  )
}
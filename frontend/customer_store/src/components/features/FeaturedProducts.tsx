import { ProductGrid } from './ProductGrid'
import type { Product } from '@/lib/api'

interface FeaturedProductsProps {
  products: Product[];
}

export default function FeaturedProducts({ products }: FeaturedProductsProps) {
  return (
    <section className="py-12">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-2xl font-semibold mb-6 text-white">Featured Products</h2>
        <ProductGrid products={products} />
      </div>
    </section>
  )
}
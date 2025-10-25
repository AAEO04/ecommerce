import ProductCard from '@/components/ProductCard'
import { fetchProducts } from '@/lib/api'

export default async function ProductsPage() {
  const products = await fetchProducts()
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-4">All Products</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((p: any) => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  )
}

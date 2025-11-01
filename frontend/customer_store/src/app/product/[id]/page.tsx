import { fetchProduct } from '@/lib/api'
import ProductClient from './ProductClient'
import { Product } from '@/lib/api'

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await fetchProduct(Number(params.id))
  return <ProductClient product={product} />
}

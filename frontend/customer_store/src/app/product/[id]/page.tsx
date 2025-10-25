'use client'

import { fetchProduct } from '@/lib/api'
import { useCartStore } from '@/stores/useCartStore'

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await fetchProduct(Number(params.id))
  const addItem = useCartStore((state) => state.addItem)

  return (
    <div>
      <h1 className="text-2xl font-semibold">{product.name}</h1>
      <p className="mt-2">{product.description}</p>
      <div className="mt-4">
        <button 
          onClick={() => addItem(product)}
          className="px-4 py-2 bg-accentGreen text-white rounded hover:bg-opacity-90 transition"
        >
          Add to cart
        </button>
      </div>
    </div>
  )
}

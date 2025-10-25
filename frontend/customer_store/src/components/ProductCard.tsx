import Link from 'next/link'
import { useCartStore } from '@/stores/useCartStore'

export type Product = any

export default function ProductCard({ product }: any) {
  const addItem = useCartStore((s) => s.addItem)
  const variant = product.variants?.[0]

  const handleAdd = () => {
    if (!variant) return
    // adapt to the new store shape: addItem expects { variant_id, quantity, name, price }
    addItem({ variant_id: variant.id, quantity: 1, name: product.name, price: Number(variant.price) })
  }

  return (
    <div className="border rounded p-3 bg-white">
      <Link href={`/product/${product.id}`} className="block">
        <h3 className="font-semibold">{product.name}</h3>
        <p className="text-sm text-muted-foreground">{product.category}</p>
      </Link>
      <div className="mt-2 flex items-center justify-between">
        <div className="text-lg font-bold">${variant?.price}</div>
        <button onClick={handleAdd} className="px-3 py-1 bg-accentRed text-white rounded">Add</button>
      </div>
    </div>
  )
}

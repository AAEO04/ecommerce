'use client'

export function ProductCardSkeleton() {
  return (
    <div className="border rounded p-3 bg-neutral-900 border-neutral-800 animate-pulse">
      <div className="w-full h-32 bg-neutral-800 rounded-lg mb-2" />
      <div className="space-y-2">
        <div className="h-4 bg-neutral-800 rounded w-3/4" />
        <div className="h-3 bg-neutral-800 rounded w-1/2" />
        <div className="h-8 bg-neutral-800 rounded w-full mt-2" />
      </div>
    </div>
  )
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}

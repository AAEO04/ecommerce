'use client'

export function CheckoutSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 animate-pulse">
      <div className="h-8 bg-neutral-800 rounded w-48 mb-6" />
      
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Form skeleton */}
        <div className="lg:col-span-2 space-y-6">
          <div className="h-12 bg-neutral-800 rounded" />
          <div className="space-y-4">
            <div className="h-12 bg-neutral-800 rounded" />
            <div className="h-12 bg-neutral-800 rounded" />
            <div className="h-12 bg-neutral-800 rounded" />
            <div className="h-32 bg-neutral-800 rounded" />
          </div>
          <div className="h-12 bg-neutral-800 rounded" />
        </div>
        
        {/* Summary skeleton */}
        <div className="lg:col-span-1">
          <div className="bg-neutral-900 rounded-lg p-6 space-y-4">
            <div className="h-6 bg-neutral-800 rounded w-32" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-16 h-16 bg-neutral-800 rounded" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-neutral-800 rounded w-3/4" />
                    <div className="h-3 bg-neutral-800 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

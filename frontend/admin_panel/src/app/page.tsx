'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Simply redirect to admin - let the layout handle auth
    router.push('/admin')
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-accent mx-auto mb-4"></div>
        <p className="text-gray-600">Loading admin panel...</p>
      </div>
    </div>
  )
}

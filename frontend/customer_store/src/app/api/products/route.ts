import { NextResponse } from 'next/server'
import { CONFIG } from '@/lib/config'

export async function GET() {
  try {
    const res = await fetch(`${CONFIG.API_BASE}/api/products`, {
      next: { revalidate: 60 }
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('API fetch error:', error)
    return NextResponse.json({ error: 'Backend unavailable' }, { status: 503 })
  }
}

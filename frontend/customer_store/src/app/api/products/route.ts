import { NextResponse } from 'next/server'

export async function GET() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`, {
    next: { revalidate: 60 }
  })
  
  if (!res.ok) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
  
  const data = await res.json()
  return NextResponse.json(data)
}

import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 3600 // Cache for 1 hour

interface CloudinaryResource {
    public_id: string
    secure_url: string
    width: number
    height: number
    format: string
    created_at: string
}

interface CloudinaryResponse {
    resources: CloudinaryResource[]
    next_cursor?: string
}

export async function GET() {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET

    if (!cloudName || !apiKey || !apiSecret) {
        console.error('Cloudinary credentials not configured')
        return NextResponse.json(
            { error: 'Cloudinary not configured', images: [] },
            { status: 500 }
        )
    }

    try {
        // Fetch images from madrush/lookbook folder
        const url = `https://api.cloudinary.com/v1_1/${cloudName}/resources/image/upload?prefix=madrush/lookbook&max_results=100&type=upload`

        const authString = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')

        const response = await fetch(url, {
            headers: {
                'Authorization': `Basic ${authString}`,
            },
            next: { revalidate: 3600 } // Cache for 1 hour
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error('Cloudinary API error:', errorText)
            return NextResponse.json(
                { error: 'Failed to fetch images', images: [] },
                { status: response.status }
            )
        }

        const data: CloudinaryResponse = await response.json()

        // Transform to simpler format for frontend
        const images = data.resources.map((resource) => ({
            id: resource.public_id,
            url: resource.secure_url,
            width: resource.width,
            height: resource.height,
            format: resource.format,
            // Generate optimized URL
            optimizedUrl: `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto/${resource.public_id}`,
            thumbnailUrl: `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto,w_400/${resource.public_id}`,
        }))

        return NextResponse.json({ images })
    } catch (error) {
        console.error('Error fetching lookbook images:', error)
        return NextResponse.json(
            { error: 'Internal server error', images: [] },
            { status: 500 }
        )
    }
}

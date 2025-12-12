/**
 * Cloudinary API Utility for Customer Store
 * Fetches images from Cloudinary folders for lookbook display
 */

export interface CloudinaryImage {
    public_id: string
    secure_url: string
    width: number
    height: number
    format: string
    created_at: string
}

export interface LookbookImage {
    id: string
    url: string
    width: number
    height: number
    alt: string
}

/**
 * Generate optimized Cloudinary URL with transformations
 */
export function getOptimizedUrl(
    publicId: string,
    options: {
        width?: number
        height?: number
        quality?: number
        format?: string
    } = {}
): string {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    if (!cloudName) return ''

    const { width, height, quality = 'auto', format = 'auto' } = options

    let transforms = `f_${format},q_${quality}`
    if (width) transforms += `,w_${width}`
    if (height) transforms += `,h_${height}`

    return `https://res.cloudinary.com/${cloudName}/image/upload/${transforms}/${publicId}`
}

/**
 * Generate responsive srcSet for images
 */
export function getSrcSet(publicId: string, widths: number[] = [400, 800, 1200, 1600]): string {
    return widths
        .map(w => `${getOptimizedUrl(publicId, { width: w })} ${w}w`)
        .join(', ')
}

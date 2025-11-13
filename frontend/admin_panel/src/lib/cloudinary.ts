/**
 * Cloudinary Upload Utility
 * Handles image uploads directly to Cloudinary from the frontend
 */

interface CloudinaryUploadResponse {
  secure_url: string
  public_id: string
  width: number
  height: number
  format: string
  resource_type: string
  created_at: string
}

interface UploadResult {
  success: boolean
  url?: string
  error?: string
  publicId?: string
}

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

/**
 * Upload an image to Cloudinary
 * @param file - The image file to upload
 * @param folder - Optional folder name in Cloudinary
 * @returns Upload result with URL or error
 */
export async function uploadToCloudinary(
  file: File,
  folder: string = 'madrush/products'
): Promise<UploadResult> {
  // Validate configuration
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    console.error('Cloudinary configuration missing')
    return {
      success: false,
      error: 'Cloudinary is not configured. Please contact administrator.',
    }
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
  if (!allowedTypes.includes(file.type)) {
    return {
      success: false,
      error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.',
    }
  }

  // Validate file size (10MB max)
  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    return {
      success: false,
      error: 'File too large. Maximum size is 10MB.',
    }
  }

  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', UPLOAD_PRESET)
    formData.append('folder', folder)

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Cloudinary upload failed:', errorData)
      return {
        success: false,
        error: errorData.error?.message || 'Upload failed',
      }
    }

    const data: CloudinaryUploadResponse = await response.json()

    return {
      success: true,
      url: data.secure_url,
      publicId: data.public_id,
    }
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    }
  }
}

/**
 * Upload multiple images to Cloudinary
 * @param files - Array of image files to upload
 * @param folder - Optional folder name in Cloudinary
 * @returns Array of upload results
 */
export async function uploadMultipleToCloudinary(
  files: File[],
  folder: string = 'madrush/products'
): Promise<UploadResult[]> {
  const uploadPromises = files.map((file) => uploadToCloudinary(file, folder))
  return Promise.all(uploadPromises)
}

/**
 * Delete an image from Cloudinary
 * Note: This requires backend implementation with Cloudinary API credentials
 * @param publicId - The public ID of the image to delete
 */
export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  // This should be implemented on the backend for security
  console.warn('Delete operation should be handled by backend')
  return false
}

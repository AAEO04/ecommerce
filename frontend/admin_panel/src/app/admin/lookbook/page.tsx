'use client'

import { useState, useCallback } from 'react'
import { Upload, Trash2, Image as ImageIcon, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { uploadMultipleToCloudinary } from '@/lib/cloudinary'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'

interface UploadedImage {
    url: string
    publicId: string
    status: 'uploading' | 'success' | 'error'
}

export default function LookbookPage() {
    const [images, setImages] = useState<UploadedImage[]>([])
    const [isUploading, setIsUploading] = useState(false)
    const [dragActive, setDragActive] = useState(false)

    const handleFiles = useCallback(async (files: FileList) => {
        const fileArray = Array.from(files).filter(f => f.type.startsWith('image/'))

        if (fileArray.length === 0) {
            toast.error('Please select image files only')
            return
        }

        setIsUploading(true)

        // Add placeholders
        const placeholders: UploadedImage[] = fileArray.map((_, i) => ({
            url: '',
            publicId: `uploading-${Date.now()}-${i}`,
            status: 'uploading' as const
        }))
        setImages(prev => [...placeholders, ...prev])

        try {
            const results = await uploadMultipleToCloudinary(fileArray, 'madrush/lookbook')

            // Update with actual results
            setImages(prev => {
                const updated = [...prev]
                results.forEach((result, index) => {
                    const placeholderIndex = prev.findIndex(img => img.publicId === `uploading-${Date.now()}-${index}`)
                    if (result.success && result.url) {
                        if (placeholderIndex >= 0) {
                            updated[placeholderIndex] = {
                                url: result.url,
                                publicId: result.publicId || '',
                                status: 'success'
                            }
                        } else {
                            updated.unshift({
                                url: result.url,
                                publicId: result.publicId || '',
                                status: 'success'
                            })
                        }
                    }
                })
                // Remove remaining placeholders
                return updated.filter(img => img.status !== 'uploading')
            })

            const successCount = results.filter(r => r.success).length
            toast.success(`${successCount} image(s) uploaded successfully!`)
        } catch (error) {
            console.error('Upload error:', error)
            toast.error('Failed to upload images')
            // Remove placeholders on error
            setImages(prev => prev.filter(img => img.status !== 'uploading'))
        } finally {
            setIsUploading(false)
        }
    }, [])

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true)
        } else if (e.type === 'dragleave') {
            setDragActive(false)
        }
    }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files)
        }
    }, [handleFiles])

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFiles(e.target.files)
        }
    }, [handleFiles])

    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Lookbook</h1>
                <p className="text-gray-600 mt-2">
                    Upload images to display in your customer store lookbook gallery.
                </p>
            </div>

            {/* Upload Zone */}
            <div
                className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-colors ${dragActive
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleInputChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={isUploading}
                />

                <div className="flex flex-col items-center gap-4">
                    {isUploading ? (
                        <>
                            <Loader2 className="h-12 w-12 text-green-500 animate-spin" />
                            <p className="text-lg font-medium text-gray-700">Uploading images...</p>
                        </>
                    ) : (
                        <>
                            <Upload className="h-12 w-12 text-gray-400" />
                            <div>
                                <p className="text-lg font-medium text-gray-700">
                                    Drop images here or click to upload
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                    JPG, PNG, WebP supported. Max 10MB per image.
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Info Box */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-800 flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    How the Lookbook Works
                </h3>
                <p className="text-sm text-blue-700 mt-2">
                    Images uploaded here are stored in Cloudinary under the <code className="bg-blue-100 px-1 rounded">madrush/lookbook</code> folder.
                    Your customer store automatically displays all images from this folder in a beautiful gallery.
                </p>
                <p className="text-sm text-blue-700 mt-2">
                    <strong>To manage or delete images:</strong> Visit your{' '}
                    <a
                        href="https://cloudinary.com/console/media_library/folders/madrush/lookbook"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-blue-900"
                    >
                        Cloudinary Media Library
                    </a>
                </p>
            </div>

            {/* Uploaded Images Preview */}
            {images.length > 0 && (
                <div className="mt-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Recently Uploaded</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {images.map((image, index) => (
                            <div key={image.publicId || index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                                {image.status === 'uploading' ? (
                                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                                        <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
                                    </div>
                                ) : image.status === 'success' ? (
                                    <>
                                        <img
                                            src={image.url}
                                            alt={`Lookbook ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
                                            <CheckCircle className="h-4 w-4 text-white" />
                                        </div>
                                    </>
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center bg-red-50">
                                        <AlertCircle className="h-8 w-8 text-red-400" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

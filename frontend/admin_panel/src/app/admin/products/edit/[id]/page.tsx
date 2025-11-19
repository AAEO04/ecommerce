'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { adminApi } from '@/lib/admin/api'
import { toast } from 'sonner'
import { ArrowLeft, Upload, X, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { uploadMultipleToCloudinary } from '@/lib/cloudinary'
import { Loading } from '@/components/ui/loading'
import type { Product, ProductImagePayload } from '@/types/admin'

type CategoryOption = {
  id: number
  name: string
  slug: string
  is_active?: boolean
}

type VariantForm = {
  id?: number
  size: string
  color: string
  price: string
  stock_quantity: number
  [key: string]: unknown
}

type ProductFormData = {
  name: string
  description: string
  category: string
  variants: VariantForm[]
  imageFiles: File[]
}

export default function EditProductPage() {
  const [product, setProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    category: '',
    variants: [{ size: '', color: '', price: '', stock_quantity: 0 }],
    imageFiles: [],
  })
  const [isUploading, setIsUploading] = useState(false)
  const [existingImages, setExistingImages] = useState<ProductImagePayload[]>([])
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const router = useRouter()
  const params = useParams<{ id?: string }>()
  const id = params?.id ?? ''

  useEffect(() => {
    const loadCategories = async () => {
      setIsLoadingCategories(true)
      const response = await adminApi.getCategories()
      if (response.success && response.data) {
        const activeCategories = response.data.filter((category: CategoryOption) => category.is_active !== false)
        setCategories(activeCategories)
      } else {
        toast.error(response.error || 'Failed to load categories')
      }
      setIsLoadingCategories(false)
    }

    loadCategories()
  }, [])

  useEffect(() => {
    if (id) {
      loadProduct(parseInt(id, 10))
    }
  }, [id])

  const loadProduct = async (productId: number) => {
    const response = await adminApi.getProduct(productId)
    if (response.success && response.data) {
      const productData = response.data
      setProduct(productData)

      const mappedImages: ProductImagePayload[] = (productData.images || [])
        .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
        .map((image, index) => ({
          image_url: image.image_url,
          alt_text: image.alt_text || `${productData.name} image ${index + 1}`,
          display_order: image.display_order ?? index,
          is_primary: image.is_primary ?? index === 0,
        }))

      setExistingImages(mappedImages)
      setFormData({
        name: productData.name,
        description: productData.description || '',
        category: productData.category || '',
        variants: (productData.variants || []).map(v => ({
          ...v,
          color: v.color || '',
          price: v.price ? v.price.toString() : '',
        })),
        imageFiles: [],
      })
    } else {
      toast.error(response.error || 'Failed to load product')
      router.push('/admin/products')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.variants.length === 0 || formData.variants.some(v => !v.size)) {
      toast.error('Please add at least one variant with a size.')
      return
    }

    let imageUrls: string[] = []
    if (formData.imageFiles.length > 0) {
      setIsUploading(true)
      toast.loading('Uploading images to Cloudinary...')
      
      const uploadResults = await uploadMultipleToCloudinary(formData.imageFiles)

      uploadResults.forEach((result, index) => {
        if (result.success && result.url) {
          imageUrls.push(result.url)
        } else {
          console.error(`Failed to upload image ${index + 1}:`, result.error)
        }
      })

      toast.dismiss()
      setIsUploading(false)

      if (imageUrls.length === 0 && formData.imageFiles.length > 0) {
        toast.error('All image uploads failed. Please try again.')
        return
      }

      if (imageUrls.length < formData.imageFiles.length) {
        toast.warning(`${formData.imageFiles.length - imageUrls.length} image(s) failed to upload`)
      }
    }

    const uploadedImages: ProductImagePayload[] = imageUrls.map((url, index) => ({
      image_url: url,
      alt_text: `${formData.name} image ${existingImages.length + index + 1}`,
      display_order: existingImages.length + index,
      is_primary: existingImages.length === 0 && index === 0,
    }))

    const combinedImages = [...existingImages, ...uploadedImages].map((image, index) => ({
      ...image,
      display_order: index,
      is_primary: index === 0,
    }))

    const productData = {
      name: formData.name,
      description: formData.description,
      category: formData.category || undefined,
      images: combinedImages,
      variants: formData.variants.map(v => ({
        ...v,
        price: parseFloat(v.price || '0') || 0,
        stock_quantity: parseInt(v.stock_quantity.toString()) || 0,
      })),
    }

    const response = await adminApi.updateProduct(parseInt(id, 10), productData)

    if (response.success) {
      toast.success('Product updated successfully')
      router.push('/admin/products')
    } else {
      toast.error(response.error || 'Failed to save product')
    }
  }

  const addVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, { size: '', color: '', price: '', stock_quantity: 0 }]
    }))
  }

  const removeVariant = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }))
  }

  const updateVariant = (index: number, field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((v, i) =>
        i === index ? { ...v, [field]: value } : v
      )
    }))
  }

  const removeExistingImage = (index: number) => {
    setExistingImages(prev =>
      prev
        .filter((_, i) => i !== index)
        .map((image, newIndex) => ({
          ...image,
          display_order: newIndex,
          is_primary: newIndex === 0,
        }))
    )
  }

  if (!product) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <Loading text="Loading product..." />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-10">
        <div>
          <Link href="/admin/products" className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Edit Product</h1>
          <p className="mt-3 text-base text-gray-600 max-w-2xl">
            Update the details of the product.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter product name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter product description"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none"
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    disabled={isLoadingCategories}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category.slug} value={category.slug}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label>Product Images</Label>
                  {existingImages.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {existingImages.map((image, index) => (
                        <div key={`${image.image_url}-${index}`} className="flex items-center justify-between rounded border border-gray-200 bg-gray-50 p-2 text-sm text-gray-700">
                          <span className="truncate pr-4">{image.image_url}</span>
                          <div className="flex items-center gap-2">
                            {image.is_primary && (
                              <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs uppercase tracking-wide">Primary</span>
                            )}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeExistingImage(index)}
                              aria-label={`Remove existing image ${index + 1}`}
                            >
                              <X className="h-4 w-4" aria-hidden="true" />
                              <span className="sr-only">Remove existing image</span>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mt-2">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || [])
                        setFormData(prev => ({ ...prev, imageFiles: files }))
                      }}
                      className="hidden"
                      id="image-upload"
                    />
                    <Label htmlFor="image-upload" className="cursor-pointer">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                        <Upload className="mx-auto h-8 w-8 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600">
                          Click to upload images or drag and drop
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          PNG, JPG, WEBP up to 10MB each
                        </p>
                      </div>
                    </Label>
                    {formData.imageFiles.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {formData.imageFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                            <span className="text-sm text-gray-700">{file.name}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const newFiles = formData.imageFiles.filter((_, i) => i !== index)
                                setFormData(prev => ({ ...prev, imageFiles: newFiles }))
                              }}
                              aria-label={`Remove image ${file.name}`}
                            >
                              <X className="h-4 w-4" aria-hidden="true" />
                              <span className="sr-only">Remove image</span>
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Label>Product Variants</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addVariant}>
                      Add Variant
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {formData.variants.map((variant, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <div>
                              <Label htmlFor={`size-${index}`}>Size</Label>
                              <Input
                                id={`size-${index}`}
                                value={variant.size}
                                onChange={(e) => updateVariant(index, 'size', e.target.value)}
                                placeholder="S, M, L, etc."
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor={`color-${index}`}>Color</Label>
                              <Input
                                id={`color-${index}`}
                                value={variant.color || ''}
                                onChange={(e) => updateVariant(index, 'color', e.target.value)}
                                placeholder="Black, White, etc."
                              />
                            </div>
                            <div>
                              <Label htmlFor={`price-${index}`}>Price</Label>
                              <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                                  ₦
                                </span>
                                <Input
                                  id={`price-${index}`}
                                  type="number"
                                  step="0.01"
                                  value={variant.price as string}
                                  onChange={(e) => updateVariant(index, 'price', e.target.value)}
                                  placeholder="0.00"
                                  required
                                  className="pl-7"
                                />
                              </div>
                            </div>
                            <div>
                              <Label htmlFor={`stock-${index}`}>Stock</Label>
                              <Input
                                id={`stock-${index}`}
                                type="number"
                                value={variant.stock_quantity}
                                onChange={(e) => updateVariant(index, 'stock_quantity', parseInt(e.target.value) || 0)}
                                placeholder="0"
                                required
                              />
                            </div>
                            <div className="flex items-end">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeVariant(index)}
                                disabled={formData.variants.length === 1}
                                className="w-full"
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Link href="/admin/products">
                  <Button type="button" variant="outline" disabled={isUploading}>
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={isUploading}>
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading Images...
                    </>
                  ) : (
                    'Update Product'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}

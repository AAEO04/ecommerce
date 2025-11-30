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
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Loading } from '@/components/ui/loading'
import { uploadToCloudinary } from '@/lib/cloudinary'

interface Category {
  id: number
  name: string
  slug: string
  description?: string
  parent_id?: number
}

export default function EditCategoryPage() {
  const [category, setCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image_url: '',
    parent_id: null as number | null,
  })
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  useEffect(() => {
    if (id) {
      loadCategory(parseInt(id, 10))
    }
  }, [id])

  const loadCategory = async (categoryId: number) => {
    try {
      const response = await adminApi.getCategory(categoryId)
      if (response.success && response.data) {
        setCategory(response.data)
        setFormData({
          name: response.data.name,
          slug: response.data.slug,
          description: response.data.description || '',
          image_url: response.data.image_url || '',
          parent_id: response.data.parent_id || null,
        })
      } else {
        toast.error(response.error || 'Failed to load category')
        router.push('/admin/categories')
      }
    } catch (error) {
      toast.error('Failed to load category')
      router.push('/admin/categories')
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/[\s-]+/g, '-')
  }

  const [imageFile, setImageFile] = useState<File | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error('Category name is required')
      return
    }

    if (!id) {
      toast.error('Invalid category ID')
      return
    }

    let imageUrl = formData.image_url

    if (imageFile) {
      try {
        toast.loading('Uploading image...')
        const uploadResult = await uploadToCloudinary(imageFile, 'madrush/categories')
        toast.dismiss()

        if (uploadResult.success && uploadResult.url) {
          imageUrl = uploadResult.url
        } else {
          toast.error(uploadResult.error || 'Failed to upload image')
          return
        }
      } catch (error) {
        toast.dismiss()
        toast.error('Failed to upload image')
        return
      }
    }

    const categoryData = {
      name: formData.name.trim(),
      slug: formData.slug.trim() || generateSlug(formData.name),
      description: formData.description.trim() || undefined,
      image_url: imageUrl || undefined,
      parent_id: formData.parent_id || undefined,
    }

    try {
      const response = await adminApi.updateCategory(parseInt(id, 10), categoryData)

      if (response.success) {
        toast.success('Category updated successfully')
        router.push('/admin/categories')
      } else {
        toast.error(response.error || 'Failed to save category')
      }
    } catch (error) {
      toast.error('An error occurred while saving the category')
    }
  }

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: prev.slug || generateSlug(name)
    }))
  }

  if (!category) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <Loading text="Loading category..." />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-10">
        <div>
          <Link href="/admin/categories" className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Categories
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Edit Category</h1>
          <p className="mt-3 text-base text-gray-600 max-w-2xl">
            Update the details of the category.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Category Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5 mt-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold text-gray-700">Category Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g., Tank Top, Crop Top"
                  className="h-11 text-base"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug" className="text-sm font-semibold text-gray-700">URL Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="auto-generated from name"
                  className="h-11 text-base font-mono text-sm"
                />
                <p className="text-sm text-gray-500 mt-1.5">
                  Used in URLs. Leave blank to auto-generate.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-semibold text-gray-700">Description</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of this category"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-base"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image" className="text-sm font-semibold text-gray-700">Category Image</Label>

                {formData.image_url && !imageFile && (
                  <div className="mb-4 relative w-40 h-40 rounded-lg overflow-hidden border border-gray-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={formData.image_url.startsWith('http') ? formData.image_url : `${adminApi['apiUrl']}${formData.image_url}`}
                      alt="Category preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setImageFile(e.target.files[0])
                    }
                  }}
                  className="cursor-pointer"
                />
                <p className="text-sm text-gray-500 mt-1.5">
                  Upload a new image to replace the current one. Recommended size: 800x600px.
                </p>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Link href="/admin/categories">
                  <Button type="button" variant="outline" className="px-6">
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6"
                >
                  Update Category
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import AdminLayout from '@/components/admin/AdminLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { adminApi } from '@/lib/admin/api'
import { Loading } from '@/components/ui/loading'
import { Plus, Edit, Trash2, Tag, FolderTree } from 'lucide-react'
import { toast } from 'sonner'

interface Category {
  id: number
  name: string
  slug: string
  description?: string
  image_url?: string
  parent_id?: number
  is_active: boolean
  created_at: string
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    setIsLoading(true)
    try {
      const response = await adminApi.getCategories()
      if (response.success && response.data) {
        setCategories(response.data)
      } else {
        toast.error(response.error || 'Failed to load categories')
      }
    } catch (error) {
      toast.error('Failed to load categories')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (categoryId: number) => {
    try {
      const response = await adminApi.deleteCategory(categoryId)
      if (response.success) {
        toast.success('Category deleted successfully')
        loadCategories()
      } else {
        toast.error(response.error || 'Failed to delete category')
      }
    } catch (error) {
      toast.error('An error occurred while deleting the category')
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Categories</h1>
            <p className="mt-3 text-base text-gray-600 max-w-2xl">
              Organize your products with categories. Create, edit, and manage your product taxonomy.
            </p>
          </div>

          <Link href="/admin/categories/new">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
              <Plus className="mr-2 h-5 w-5" />
              Add Category
            </Button>
          </Link>
        </div>

        {/* Categories Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loading text="Loading categories..." />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category) => (
              <Card key={category.id} className="hover:shadow-xl transition-all duration-300 hover:border-purple-200 group">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-purple-100 rounded-xl group-hover:bg-purple-200 transition-colors">
                        <Tag className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold text-gray-900">{category.name}</CardTitle>
                        <CardDescription className="mt-1.5 font-mono text-sm">
                          /{category.slug}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Link href={`/admin/categories/edit/${category.id}`}>
                        <Button
                          variant="outline"
                          size="icon"
                          aria-label={`Edit category ${category.name}`}
                          className="hover:bg-purple-50 hover:border-purple-300 transition-colors"
                        >
                          <Edit className="h-4 w-4 text-purple-600" aria-hidden="true" />
                        </Button>
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            aria-label={`Delete category ${category.name}`}
                            className="hover:bg-red-50 hover:border-red-300 transition-colors"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" aria-hidden="true" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Category</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete &ldquo;{category.name}&rdquo;?
                              If products are using this category, it will be deactivated instead of deleted.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(category.id)}
                              className="bg-red-500 hover:bg-red-600"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {category.description && (
                    <p className="text-gray-600 text-base mb-5 line-clamp-2 leading-relaxed">
                      {category.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-sm pt-4 border-t border-gray-100">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${category.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                      }`}>
                      {category.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <span className="text-gray-500 text-xs font-medium">
                      {new Date(category.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {categories.length === 0 && !isLoading && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-100 mb-6">
              <FolderTree className="h-10 w-10 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No categories yet</h3>
            <p className="text-base text-gray-500 mb-6">Get started by creating your first category.</p>
            <Link href="/admin/categories/new">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                <Plus className="mr-2 h-5 w-5" />
                Create First Category
              </Button>
            </Link>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
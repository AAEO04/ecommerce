'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import AdminLayout from '@/components/admin/AdminLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { adminApi } from '@/lib/admin/api'
import { Loading } from '@/components/ui/loading'
import type { Product } from '@/types/admin'
import { Plus, Edit, Trash2, Package } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    setIsLoading(true)
    const response = await adminApi.getProducts()
    if (response.success && response.data) {
      setProducts(response.data)
    }
    setIsLoading(false)
  }

  const handleDelete = async (productId: number) => {
    const response = await adminApi.deleteProduct(productId)
    if (response.success) {
      toast.success('Product deleted successfully')
      loadProducts()
    } else {
      toast.error(response.error || 'Failed to delete product')
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Products</h1>
            <p className="mt-3 text-base text-gray-600 max-w-2xl">
              Manage your product catalog, inventory, and variants. Keep your store up to date.
            </p>
          </div>

          <Link href="/admin/products/new">
            <Button className="bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-200">
              <Plus className="mr-2 h-5 w-5" />
              Add Product
            </Button>
          </Link>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loading text="Loading products..." />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {product.variants?.length || 0} variants
                      </CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <Link href={`/admin/products/edit/${product.id}`}>
                        <Button
                          variant="outline"
                          size="icon"
                          aria-label={`Edit product ${product.name}`}
                        >
                          <Edit className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="icon" aria-label={`Delete product ${product.name}`}>
                            <Trash2 className="h-4 w-4 text-red-500" aria-hidden="true" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Product</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete &ldquo;{product.name}&rdquo;? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(product.id)}
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
                <CardContent>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {product.description}
                  </p>
                  {product.images && product.images.length > 0 && (
                    <div className="mb-4">
                      <img
                        src={product.images[0].image_url}
                        alt={product.name}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {product.variants?.reduce((total, v) => total + v.stock_quantity, 0) || 0} in stock
                    </span>
                    <span className="font-semibold text-gray-900">
                      ${product.variants?.[0]?.price || 0}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {products.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No products</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating your first product.</p>
            <Link href="/admin/products/new">
              <Button className="mt-6 bg-green-500 hover:bg-green-600 text-white">
                <Plus className="mr-2 h-4 w-4" />
                Create Product
              </Button>
            </Link>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

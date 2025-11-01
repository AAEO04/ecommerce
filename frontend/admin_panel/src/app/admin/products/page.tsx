'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { adminApi } from '@/lib/admin/api'
import type { Product } from '@/types/admin'
import { Plus, Edit, Trash2, Upload, X, Package } from 'lucide-react'

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    variants: [{ size: '', color: '', price: 0, stock_quantity: 0 }],
    imageFiles: [] as File[],
  })

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.variants.length === 0 || formData.variants.some(v => !v.size)) {
      alert('Please add at least one variant with a size.')
      return
    }

    // Upload images first
    let imageUrls: string[] = []
    if (formData.imageFiles.length > 0) {
      for (const file of formData.imageFiles) {
        const uploadResponse = await adminApi.uploadImage(file)
        if (uploadResponse.success && uploadResponse.data) {
          imageUrls.push(uploadResponse.data.image_url)
        }
      }
    }

    // Include existing image URLs if editing
    if (editingProduct) {
      imageUrls = [...(editingProduct.images?.map(img => img.image_url) || []), ...imageUrls]
    }

    const productData = {
      name: formData.name,
      description: formData.description,
      image_urls: imageUrls,
      variants: formData.variants.map(v => ({
        ...v,
        price: parseFloat(v.price.toString()) || 0,
        stock_quantity: parseInt(v.stock_quantity.toString()) || 0,
      })),
    }

    const response = editingProduct
      ? await adminApi.updateProduct(editingProduct.id, productData)
      : await adminApi.createProduct(productData)

    if (response.success) {
      resetForm()
      setIsDialogOpen(false)
      loadProducts()
    } else {
      alert(response.error || 'Failed to save product')
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      variants: (product.variants || []).map(v => ({
        ...v,
        color: v.color || ''
      })),
      imageFiles: [],
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (productId: number) => {
    const response = await adminApi.deleteProduct(productId)
    if (response.success) {
      loadProducts()
    } else {
      alert(response.error || 'Failed to delete product')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      variants: [{ size: '', color: '', price: 0, stock_quantity: 0 }],
      imageFiles: [],
    })
    setEditingProduct(null)
  }

  const addVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, { size: '', color: '', price: 0, stock_quantity: 0 }]
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

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Products</h1>
            <p className="mt-2 text-gray-600">
              Manage your product catalog and inventory
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setIsDialogOpen(true) }}>
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </DialogTitle>
                <DialogDescription>
                  {editingProduct ? 'Update product information' : 'Create a new product for your store'}
                </DialogDescription>
              </DialogHeader>

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

                  {/* Image Upload */}
                  <div>
                    <Label>Product Images</Label>
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
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Variants */}
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
                                <Input
                                  id={`price-${index}`}
                                  type="number"
                                  step="0.01"
                                  value={variant.price}
                                  onChange={(e) => updateVariant(index, 'price', parseFloat(e.target.value) || 0)}
                                  placeholder="0.00"
                                  required
                                />
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
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingProduct ? 'Update Product' : 'Create Product'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
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
                      <Button
                        variant="outline"
                        size="icon"
                        aria-label={`Edit product ${product.name}`}
                        onClick={() => handleEdit(product)}
                      >
                        <Edit className="h-4 w-4" aria-hidden="true" />
                      </Button>
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
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export interface Product {
  id: number
  name: string
  description: string
  category?: string
  price: number
  images?: Array<{
    id: number
    image_url: string
  }>
  variants: Array<{
    id: number
    size: string
    color?: string
    stock_quantity: number
    price: number
  }>
  created_at?: string
  updated_at?: string
}

export interface ProductFormData {
  name: string
  description: string
  variants: Array<{
    size: string
    color: string
    price: number
    stock_quantity: number
  }>
  imageFiles: File[]
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface AdminApiConfig {
  adminApiUrl: string
  productApiUrl: string
}

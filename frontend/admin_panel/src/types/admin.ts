import type { OrderStatus, PaymentStatus } from '../lib/constants'

export interface Product {
  id: number
  name: string
  description: string
  category?: string
  price: number
  images?: Array<{
    id: number
    image_url: string
    alt_text?: string
    display_order?: number
    is_primary?: boolean
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

export interface ProductImagePayload {
  image_url: string
  alt_text?: string
  display_order: number
  is_primary: boolean
}

export interface ProductFormData {
  name: string
  description: string
  category?: string
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
  customer_name: string
  customer_email: string
  customer_phone: string
  shipping_address: string
  total_amount: number | string
  limit?: number
}

export interface Category {
  id: number
  name: string
  slug: string
  description?: string
  image_url?: string
  parent_id?: number
  is_active: boolean
  created_at: string
}
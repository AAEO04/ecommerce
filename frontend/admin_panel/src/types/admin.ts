import type { OrderStatus, PaymentStatus } from '../lib/constants'

export type { OrderStatus, PaymentStatus }

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

export interface ProductVariant {
  id: number
  size: string
  color?: string
  stock_quantity: number
  price: number
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
  data?: T
  error?: string
  message?: string
  isAuthError?: boolean
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

export interface OrderItem {
  id: number
  product_id: number
  product_name: string
  variant_id?: number
  variant_name?: string
  variant?: {
    id: number
    size: string
    color?: string
    product: {
      name: string
    }
  }
  quantity: number
  price: number
  unit_price: number
  total: number
  total_price: number
}

export interface Order {
  id: number
  order_number: string
  customer_name: string
  customer_email: string
  customer_phone: string
  shipping_address: string
  total_amount: number
  status: OrderStatus
  payment_status: PaymentStatus
  payment_method?: string
  notes?: string
  items: OrderItem[]
  created_at: string
  updated_at: string
}

export interface OrderFilters {
  status: OrderStatus | 'all'
  paymentStatus: PaymentStatus | 'all'
  search: string
  page?: number
  limit?: number
}
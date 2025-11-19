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
  data?: T
  error?: string
  message?: string
  isAuthError?: boolean
}

export interface AdminApiConfig {
  adminApiUrl: string
  productApiUrl: string
}

import type { OrderStatus, PaymentStatus } from '../lib/constants'

export interface Order {
  id: number
  order_number: string
  customer_name: string
  customer_email: string
  customer_phone: string
  shipping_address: string
  total_amount: number | string
  status: OrderStatus
  payment_status: PaymentStatus
  payment_method: string
  created_at: string
  notes?: string
  items?: OrderItem[]
}

export interface OrderItem {
  id: number
  quantity: number
  unit_price: number | string
  total_price: number | string
  variant: ProductVariant
}

export interface ProductVariant {
  id: number
  size: string
  color: string | null
  product: {
    id: number
    name: string
  }
}

export interface OrderFilters {
  status?: string
  paymentStatus?: string
  search?: string
  page?: number
  limit?: number
}
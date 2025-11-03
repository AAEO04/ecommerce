import type { Product, ApiResponse } from '@/types/admin'
import { CONFIG } from '@/lib/config'
import { toast } from 'sonner'

interface AdminApiConfig {
  apiUrl: string
}

/**
 * Admin API Client with enhanced security features
 * Includes authentication, request validation, and secure error handling
 */
class AdminApiClient {
  private apiUrl: string
  private adminApiUrl: string
  private productApiUrl: string
  private authApiUrl: string

  constructor(config: AdminApiConfig) {
    this.apiUrl = config.apiUrl
    this.adminApiUrl = `${this.apiUrl}/api/admin`
    this.productApiUrl = `${this.apiUrl}/products`
    this.authApiUrl = `${this.apiUrl}/api/auth`
  }

  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
    }
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    if (!response.ok) {
      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          // The UI layer should handle this error and redirect to the login page.
          toast.error('Session expired. Please log in again.')
        }
        return { 
          success: false, 
          error: 'Authentication expired. Please log in again.',
          isAuthError: true // Add a flag for the UI to check
        }
      }

      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        error: errorData.message || `HTTP ${response.status}: ${response.statusText}`
      }
    }

    const data = await response.json()
    return { success: true, data }
  }

  private async request<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
        credentials: 'include',
      })

      return this.handleResponse<T>(response)
    } catch (error) {
      console.error('API request failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      }
    }
  }


  // Dashboard statistics
  async getDashboardStats(): Promise<ApiResponse<{
    totalProducts: number
    totalOrders: number
    totalCustomers: number
    revenue: number
    recentOrders: Array<{
      id: string
      customer: string
      amount: string
      status: string
    }>
  }>> {
    return this.request(`${this.adminApiUrl}/dashboard/stats`)
  }

  // Product CRUD operations
  async getProducts(): Promise<ApiResponse<Product[]>> {
    return this.request<Product[]>(`${this.productApiUrl}/products/`)
  }

  async createProduct(productData: {
    name: string
    description: string
    image_urls: string[]
    variants: Array<{
      size: string
      color?: string
      price: number
      stock_quantity: number
    }>
  }): Promise<ApiResponse<Product>> {
    return this.request<Product>(`${this.adminApiUrl}/products/`, {
      method: 'POST',
      body: JSON.stringify(productData),
    })
  }

  async updateProduct(
    productId: number,
    productData: {
      name: string
      description: string
      image_urls: string[]
      variants: Array<{
        size: string
        color?: string
        price: number
        stock_quantity: number
      }>
    }
  ): Promise<ApiResponse<Product>> {
    return this.request<Product>(`${this.adminApiUrl}/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    })
  }

  async deleteProduct(productId: number): Promise<ApiResponse<void>> {
    return this.request<void>(`${this.adminApiUrl}/products/${productId}`, {
      method: 'DELETE',
    })
  }

  // Image upload with security validation
  async uploadImage(file: File): Promise<ApiResponse<{ image_url: string }>> {
    // Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    const maxSize = 10 * 1024 * 1024 // 10MB

    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.'
      }
    }

    if (file.size > maxSize) {
      return {
        success: false,
        error: 'File too large. Maximum size is 10MB.'
      }
    }

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch(`${this.adminApiUrl}/admin/upload-image/`, {
        method: 'POST',
        credentials: 'include', // Include cookies
        body: formData,
      })

      return this.handleResponse(response)
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      }
    }
  }

  // Order Management
  async getOrders(filters?: {
    status?: string
    paymentStatus?: string
    search?: string
    page?: number
    limit?: number
  }): Promise<ApiResponse<any[]>> {
    const params = new URLSearchParams()
    if (filters?.status && filters.status !== 'all') params.append('status', filters.status)
    if (filters?.paymentStatus && filters.paymentStatus !== 'all') params.append('payment_status', filters.paymentStatus)
    if (filters?.search) params.append('search', filters.search)
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())
    
    const queryString = params.toString()
    return this.request(`${this.adminApiUrl}/orders/${queryString ? '?' + queryString : ''}`)
  }

  async getOrder(orderId: number): Promise<ApiResponse<any>> {
    return this.request(`${this.adminApiUrl}/orders/${orderId}`)
  }

  async updateOrderStatus(
    orderId: number,
    updates: { status?: string; payment_status?: string; notes?: string }
  ): Promise<ApiResponse<{message: string}>> {
    return this.request(`${this.adminApiUrl}/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
  }

  // Authentication check - verify with backend
  async isAuthenticated(): Promise<boolean> {
    try {
      const response = await this.request(`${this.authApiUrl}/verify`)
      return response.success
    } catch {
      return false
    }
  }

  // Logout
  async logout(): Promise<void> {
    try {
      await this.request(`${this.authApiUrl}/logout`, {
        method: 'POST'
      })
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }
}

// Create singleton instance
const config: AdminApiConfig = {
  apiUrl: CONFIG.API_URL,
}

export const adminApi = new AdminApiClient(config)
export default adminApi

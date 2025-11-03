export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const

export const STATUS_COLORS = {
  [ORDER_STATUS.PENDING]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  [ORDER_STATUS.PROCESSING]: 'bg-blue-100 text-blue-800 border-blue-200',
  [ORDER_STATUS.SHIPPED]: 'bg-purple-100 text-purple-800 border-purple-200',
  [ORDER_STATUS.COMPLETED]: 'bg-green-100 text-green-800 border-green-200',
  [ORDER_STATUS.CANCELLED]: 'bg-red-100 text-red-800 border-red-200',
} as const

export type OrderStatus = typeof ORDER_STATUS[keyof typeof ORDER_STATUS]
export type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS]

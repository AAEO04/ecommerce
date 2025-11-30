import { z } from 'zod'

const envSchema = z.object({
  API_BASE: z.string().url(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

const env = envSchema.parse({
  API_BASE: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  NODE_ENV: process.env.NODE_ENV,
})

export const CONFIG = {
  API_BASE: env.API_BASE,
  IS_DEV: env.NODE_ENV === 'development',
  IS_PROD: env.NODE_ENV === 'production',
} as const

// Enforce HTTPS in production
if (CONFIG.IS_PROD && !CONFIG.API_BASE.startsWith('https://')) {
  console.warn('⚠️ Production API URL should use HTTPS');
}
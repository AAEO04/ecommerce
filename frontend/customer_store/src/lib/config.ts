import { z } from 'zod'

const envSchema = z.object({
  API_BASE: z.string().url(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

const isProd = process.env.NODE_ENV === 'production'
const defaultApiUrl = isProd ? 'https://madrush.fly.dev' : 'http://localhost:8000'

// Get the API URL from environment or use default
let apiUrl = process.env.NEXT_PUBLIC_API_URL || defaultApiUrl

// Force HTTPS in production to prevent mixed content errors
// Force HTTPS in production or if using fly.dev
if (apiUrl.includes('fly.dev') && apiUrl.startsWith('http://')) {
  console.warn('⚠️ Converting HTTP to HTTPS for fly.dev API URL');
  apiUrl = apiUrl.replace('http://', 'https://')
} else if (isProd && apiUrl.startsWith('http://')) {
  console.warn('⚠️ Converting HTTP to HTTPS for production API URL');
  apiUrl = apiUrl.replace('http://', 'https://')
}

const env = envSchema.parse({
  API_BASE: apiUrl,
  NODE_ENV: process.env.NODE_ENV,
})

export const CONFIG = {
  API_BASE: env.API_BASE,
  IS_DEV: env.NODE_ENV === 'development',
  IS_PROD: env.NODE_ENV === 'production',
} as const

// Enforce HTTPS in production
if (CONFIG.IS_PROD && !CONFIG.API_BASE.startsWith('https://')) {
  throw new Error('❌ Production API URL must use HTTPS to prevent mixed content errors');
}
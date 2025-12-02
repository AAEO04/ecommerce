import { z } from 'zod'

const isProd = process.env.NODE_ENV === 'production'
const defaultApiUrl = isProd ? 'https://madrush.fly.dev' : 'http://localhost:8000'

// Get the API URL from environment or use default
let apiUrl = process.env.NEXT_PUBLIC_API_URL || defaultApiUrl

// Force HTTPS in production or if using fly.dev
if (apiUrl.includes('fly.dev') && apiUrl.startsWith('http://')) {
  console.warn('⚠️ Converting HTTP to HTTPS for fly.dev API URL');
  apiUrl = apiUrl.replace('http://', 'https://')
} else if (isProd && apiUrl.startsWith('http://')) {
  console.warn('⚠️ Converting HTTP to HTTPS for production API URL');
  apiUrl = apiUrl.replace('http://', 'https://')
}

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url().default(apiUrl),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

const env = envSchema.parse(process.env)

export const CONFIG = {
  API_URL: env.NEXT_PUBLIC_API_URL,
  IS_DEV: env.NODE_ENV === 'development',
  IS_PROD: env.NODE_ENV === 'production',
} as const

// Enforce HTTPS in production
if (CONFIG.IS_PROD && !CONFIG.API_URL.startsWith('https://')) {
  throw new Error('❌ Production API URL must use HTTPS to prevent mixed content errors');
}

console.log('[Config] API URL:', CONFIG.API_URL);
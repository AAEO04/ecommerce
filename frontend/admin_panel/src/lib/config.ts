import { z } from 'zod'

const isProd = process.env.NODE_ENV === 'production'
// Hardcoded API URL as requested to resolve Vercel env var issues
const PROD_API_URL = 'https://madrush.fly.dev';
const DEV_API_URL = 'http://localhost:8000';

// In production, ALWAYS use the hardcoded HTTPS URL
// In development, use env var or localhost
let apiUrl = isProd ? PROD_API_URL : (process.env.NEXT_PUBLIC_API_URL || DEV_API_URL);

// Double check to ensure no HTTP in production
if (isProd && apiUrl.startsWith('http://')) {
  apiUrl = PROD_API_URL;
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
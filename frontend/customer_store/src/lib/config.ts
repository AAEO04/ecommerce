import { z } from 'zod'

const envSchema = z.object({
  API_BASE: z.string().url(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

const isProd = process.env.NODE_ENV === 'production'
// Hardcoded API URL as requested to resolve Vercel env var issues
const PROD_API_URL = 'https://api.madrush.com.ng';
const DEV_API_URL = 'http://localhost:8000';

// In production, ALWAYS use the hardcoded HTTPS URL
// In development, use env var or localhost
let apiUrl = isProd ? PROD_API_URL : (process.env.NEXT_PUBLIC_API_URL || DEV_API_URL);

// Double check to ensure no HTTP in production
if (isProd && apiUrl.startsWith('http://')) {
  apiUrl = PROD_API_URL;
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
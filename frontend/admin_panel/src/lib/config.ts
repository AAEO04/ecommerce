import { z } from 'zod'

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url().default('http://localhost:8000/api'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

const env = envSchema.parse(process.env)

export const CONFIG = {
  API_URL: env.NEXT_PUBLIC_API_URL,
  IS_DEV: env.NODE_ENV === 'development',
  IS_PROD: env.NODE_ENV === 'production',
} as const
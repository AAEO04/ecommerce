import { z } from 'zod'

const envSchema = z.object({
  API_BASE: z.string().url(),
})

export const CONFIG = envSchema.parse({
  API_BASE: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
})



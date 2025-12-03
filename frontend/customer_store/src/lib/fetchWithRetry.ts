import { ApiError, handleApiError } from '@/lib/errorHandler';

const MAX_RETRIES = 5;
const INITIAL_DELAY = 1000;
const MAX_DELAY = 30000;

export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
): Promise<any> {
  let lastError: any = null;

  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      const res = await fetch(url, {
        ...options,
        // Ensure redirects are followed (this is the default, but being explicit)
        redirect: 'follow',
      });

      // 3xx redirects are successful and should be handled by fetch automatically
      // If we get here after following redirects, check if the final response is ok
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errorMessage = errorData.detail || `Request failed: ${res.statusText}`;
        throw new ApiError(res.status, errorMessage);
      }

      return res.json();
    } catch (error) {
      lastError = error;

      // Don't retry client errors (4xx)
      if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
        throw error;
      }

      // Don't retry redirect errors either - they should be handled by fetch
      if (error instanceof ApiError && error.status >= 300 && error.status < 400) {
        throw error;
      }

      if (i < MAX_RETRIES - 1) {
        const delay = Math.min(INITIAL_DELAY * Math.pow(2, i) + Math.random() * 1000, MAX_DELAY);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  return Promise.reject(lastError);
}

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
      const res = await fetch(url, options);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errorMessage = errorData.detail || `Request failed: ${res.statusText}`;
        if (res.status >= 500) {
          throw new ApiError(res.status, errorMessage);
        }
        handleApiError(new ApiError(res.status, errorMessage));
      }

      return res.json();
    } catch (error) {
      lastError = error;
      if (i < MAX_RETRIES - 1) {
        const delay = Math.min(INITIAL_DELAY * Math.pow(2, i) + Math.random() * 1000, MAX_DELAY);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  return Promise.reject(lastError);
}

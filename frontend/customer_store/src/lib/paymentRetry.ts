/**
 * Payment Retry Logic
 * Handles retry attempts for failed payments
 */

import { initializePayment } from './paystack'

export interface RetryState {
    orderId: number
    attempts: number
    lastAttempt: Date
    lastError?: string
    maxRetries: number
}

const RETRY_STORAGE_KEY = 'payment_retry_state'
const MAX_RETRIES = 3

/**
 * Get retry state from localStorage
 */
export const getRetryState = (orderId: number): RetryState | null => {
    if (typeof window === 'undefined') return null

    try {
        const stored = localStorage.getItem(`${RETRY_STORAGE_KEY}_${orderId}`)
        if (!stored) return null

        const state = JSON.parse(stored)
        return {
            ...state,
            lastAttempt: new Date(state.lastAttempt)
        }
    } catch (error) {
        console.error('Failed to get retry state:', error)
        return null
    }
}

/**
 * Save retry state to localStorage
 */
export const saveRetryState = (state: RetryState): void => {
    if (typeof window === 'undefined') return

    try {
        localStorage.setItem(
            `${RETRY_STORAGE_KEY}_${state.orderId}`,
            JSON.stringify(state)
        )
    } catch (error) {
        console.error('Failed to save retry state:', error)
    }
}

/**
 * Clear retry state
 */
export const clearRetryState = (orderId: number): void => {
    if (typeof window === 'undefined') return

    try {
        localStorage.removeItem(`${RETRY_STORAGE_KEY}_${orderId}`)
    } catch (error) {
        console.error('Failed to clear retry state:', error)
    }
}

/**
 * Check if payment can be retried
 */
export const canRetryPayment = (orderId: number): boolean => {
    const state = getRetryState(orderId)

    if (!state) return true // First attempt

    if (state.attempts >= state.maxRetries) {
        return false // Max retries reached
    }

    // Check if enough time has passed since last attempt (30 seconds cooldown)
    const cooldownMs = 30000
    const timeSinceLastAttempt = Date.now() - state.lastAttempt.getTime()

    return timeSinceLastAttempt >= cooldownMs
}

/**
 * Get remaining retry attempts
 */
export const getRemainingRetries = (orderId: number): number => {
    const state = getRetryState(orderId)

    if (!state) return MAX_RETRIES

    return Math.max(0, state.maxRetries - state.attempts)
}

/**
 * Record a retry attempt
 */
export const recordRetryAttempt = (orderId: number, error?: string): void => {
    const existingState = getRetryState(orderId)

    const newState: RetryState = {
        orderId,
        attempts: (existingState?.attempts || 0) + 1,
        lastAttempt: new Date(),
        lastError: error,
        maxRetries: MAX_RETRIES
    }

    saveRetryState(newState)
}

/**
 * Retry payment with exponential backoff
 */
export const retryPayment = async (
    email: string,
    amount: number,
    orderId: number,
    metadata?: Record<string, any>
): Promise<{
    success: boolean
    message: string
    data?: any
    retriesLeft: number
}> => {
    // Check if retry is allowed
    if (!canRetryPayment(orderId)) {
        const state = getRetryState(orderId)

        if (state && state.attempts >= state.maxRetries) {
            return {
                success: false,
                message: `Maximum retry attempts (${MAX_RETRIES}) reached. Please contact support.`,
                retriesLeft: 0
            }
        }

        return {
            success: false,
            message: 'Please wait 30 seconds before retrying payment.',
            retriesLeft: getRemainingRetries(orderId)
        }
    }

    try {
        // Record this attempt
        recordRetryAttempt(orderId)

        // Attempt payment initialization
        const result = await initializePayment(
            email,
            amount,
            orderId,
            metadata
        )

        if (result.status) {
            // Success - clear retry state
            clearRetryState(orderId)

            return {
                success: true,
                message: 'Payment retry initiated successfully',
                data: result,
                retriesLeft: MAX_RETRIES
            }
        } else {
            // Failed - record error
            recordRetryAttempt(orderId, result.message)

            return {
                success: false,
                message: result.message || 'Payment retry failed',
                retriesLeft: getRemainingRetries(orderId)
            }
        }
    } catch (error: any) {
        // Error - record error
        const errorMessage = error.message || 'Network error during retry'
        recordRetryAttempt(orderId, errorMessage)

        return {
            success: false,
            message: errorMessage,
            retriesLeft: getRemainingRetries(orderId)
        }
    }
}

/**
 * Get time until next retry is allowed (in seconds)
 */
export const getRetryCountdown = (orderId: number): number => {
    const state = getRetryState(orderId)

    if (!state) return 0

    const cooldownMs = 30000
    const timeSinceLastAttempt = Date.now() - state.lastAttempt.getTime()
    const timeRemaining = Math.max(0, cooldownMs - timeSinceLastAttempt)

    return Math.ceil(timeRemaining / 1000)
}

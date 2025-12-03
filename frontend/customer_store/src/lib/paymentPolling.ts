/**
 * Payment Status Polling
 * Polls for payment verification status during pending transactions
 */

import { verifyPayment } from './paystack'

export interface PollingOptions {
    reference: string
    maxAttempts?: number
    intervalMs?: number
    onStatusChange?: (status: string) => void
}

export interface PollingResult {
    success: boolean
    status: string
    data?: any
    attempts: number
    aborted?: boolean
}

/**
 * Poll payment status with exponential backoff
 * 
 * Timing: 3s, 3s, 5s, 5s, 10s, 10s, 15s, 15s, 20s, 20s
 * Total: ~106 seconds over 10 attempts
 */
export const pollPaymentStatus = async (
    options: PollingOptions
): Promise<PollingResult> => {
    const {
        reference,
        maxAttempts = 10,
        intervalMs = 3000,
        onStatusChange
    } = options

    let attempts = 0
    let aborted = false

    // Create abort controller for cleanup
    const abortController = new AbortController()

    // Cleanup function
    const cleanup = () => {
        aborted = true
        abortController.abort()
    }

    // Expose cleanup globally (for component unmount)
    if (typeof window !== 'undefined') {
        ; (window as any).__paymentPollingCleanup = cleanup
    }

    try {
        for (let i = 0; i < maxAttempts; i++) {
            if (aborted) {
                return {
                    success: false,
                    status: 'aborted',
                    attempts: i,
                    aborted: true
                }
            }

            attempts = i + 1

            try {
                console.log(`[Payment Polling] Attempt ${attempts}/${maxAttempts} for ${reference}`)

                const result = await verifyPayment(reference)

                if (result.status && result.data) {
                    const paymentStatus = result.data.status

                    onStatusChange?.(paymentStatus)

                    // Success - payment confirmed
                    if (paymentStatus === 'success') {
                        console.log(`[Payment Polling] Payment confirmed on attempt ${attempts}`)
                        return {
                            success: true,
                            status: 'success',
                            data: result.data,
                            attempts
                        }
                    }

                    // Failed - no need to continue polling
                    if (paymentStatus === 'failed' || paymentStatus === 'cancelled') {
                        console.log(`[Payment Polling] Payment ${paymentStatus} on attempt ${attempts}`)
                        return {
                            success: false,
                            status: paymentStatus,
                            data: result.data,
                            attempts
                        }
                    }

                    // Still pending - continue polling
                    console.log(`[Payment Polling] Payment still pending, status: ${paymentStatus}`)
                } else {
                    console.warn(`[Payment Polling] Invalid response on attempt ${attempts}`)
                }
            } catch (error) {
                console.error(`[Payment Polling] Error on attempt ${attempts}:`, error)
                // Continue trying even if one attempt fails
            }

            // Don't wait after the last attempt
            if (i < maxAttempts - 1 && !aborted) {
                // Exponential backoff: 3s, 3s, 5s, 5s, 10s, 10s, 15s, 15s, 20s, 20s
                const delay = calculateBackoff(i, intervalMs)
                await sleep(delay)
            }
        }

        // Timeout - max attempts reached
        console.warn(`[Payment Polling] Timeout after ${attempts} attempts`)
        return {
            success: false,
            status: 'timeout',
            attempts
        }
    } finally {
        cleanup()
    }
}

/**
 * Calculate backoff delay with exponential increase
 */
function calculateBackoff(attemptIndex: number, baseInterval: number): number {
    if (attemptIndex < 2) return baseInterval // 3s, 3s
    if (attemptIndex < 4) return baseInterval + 2000 // 5s, 5s  
    if (attemptIndex < 6) return baseInterval + 7000 // 10s, 10s
    if (attemptIndex < 8) return baseInterval + 12000 // 15s, 15s
    return baseInterval + 17000 // 20s, 20s
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Stop any active polling (call on component unmount)
 */
export const stopPolling = () => {
    if (typeof window !== 'undefined' && (window as any).__paymentPollingCleanup) {
        ; (window as any).__paymentPollingCleanup()
        delete (window as any).__paymentPollingCleanup
    }
}

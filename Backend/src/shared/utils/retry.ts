/**
 * Retry utilities for handling transient failures
 */

const DEFAULT_MAX_RETRIES = 3
const DEFAULT_INITIAL_DELAY = 1000

export interface RetryOptions {
  maxRetries?: number
  initialDelay?: number
  maxDelay?: number
  backoffMultiplier?: number
  shouldRetry?: (error: any) => boolean
}

/**
 * Execute a function with automatic retry on transient failures
 * Uses exponential backoff strategy
 */
export async function executeWithRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = DEFAULT_MAX_RETRIES,
    initialDelay = DEFAULT_INITIAL_DELAY,
    maxDelay = 30000,
    backoffMultiplier = 2,
    shouldRetry = isTransientError,
  } = options

  let lastError: any

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error: any) {
      lastError = error

      if (attempt === maxRetries || !shouldRetry(error)) {
        throw error
      }

      const delay = Math.min(
        initialDelay * Math.pow(backoffMultiplier, attempt),
        maxDelay
      )

      console.log(
        `Retry: Attempt ${attempt + 1}/${maxRetries} failed. Retrying in ${delay}ms...`
      )

      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  throw lastError
}

/**
 * Check if an error is transient and worth retrying
 */
export function isTransientError(error: any): boolean {
  if (!error) return false

  const code = error.code ?? error.meta?.code ?? ''
  
  return (
    code === 'P2028' || 
    code === 'P1001' || 
    code === 'P1002' ||
    error.message?.includes('connection') ||
    error.message?.includes('timeout') ||
    error.message?.includes('ECONNREFUSED')
  )
}

/**
 * Sleep for a specified duration
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const RetryUtils = {
  executeWithRetry,
  isTransientError,
  sleep,
  DEFAULT_MAX_RETRIES,
  DEFAULT_INITIAL_DELAY,
}
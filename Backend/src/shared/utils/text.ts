/**
 * Shared text normalization utilities
 * Provides consistent text processing across all services
 */

export function normalizeOptionalText(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

/**
 * Normalize optional text but preserve undefined (for partial updates)
 */
export function normalizeOptionalTextPreserve(
  value: string | null | undefined
): string | null | undefined {
  if (value === undefined) {
    return undefined
  }

  if (value === null) {
    return null
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export function normalizeOptionalEmail(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null
  }

  const trimmed = value.trim().toLowerCase()
  if (trimmed.length === 0) {
    return null
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(trimmed) ? trimmed : null
}

export function normalizePhone(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null
  }

  const digits = value.replace(/\D/g, '')
  return digits.length >= 10 ? digits : null
}

export function normalizeRequiredText(value: string): string {
  return value?.trim() ?? ''
}

export function capitalizeFirst(value: string): string {
  if (!value) return ''
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
}

export const TextUtils = {
  normalizeOptionalText,
  normalizeOptionalTextPreserve,
  normalizeOptionalEmail,
  normalizePhone,
  normalizeRequiredText,
  capitalizeFirst,
}
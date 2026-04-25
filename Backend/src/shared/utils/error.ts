/**
 * Error handling utilities
 */

export class AppError extends Error {
  public readonly code: string
  public readonly statusCode: number
  public readonly details?: any

  constructor(
    message: string,
    code: string = 'INTERNAL_ERROR',
    statusCode: number = 500,
    details?: any
  ) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.statusCode = statusCode
    this.details = details

    Error.captureStackTrace(this, this.constructor)
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found', entity: string = 'Resource') {
    super(
      `${entity} not found: ${message}`,
      'NOT_FOUND',
      404
    )
    this.name = 'NotFoundError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', 400, details)
    this.name = 'ValidationError'
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 'AUTHORIZATION_ERROR', 403)
    this.name = 'AuthorizationError'
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Conflict') {
    super(message, 'CONFLICT_ERROR', 409)
    this.name = 'ConflictError'
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 'RATE_LIMIT', 429)
    this.name = 'RateLimitError'
  }
}

/**
 * Check if entity exists, throw if not
 */
export function assertFound<T>(
  entity: T | null | undefined,
  entityType: string,
  id?: number | string
): asserts entity is T {
  if (!entity) {
    throw new NotFoundError(
      id ? `${entityType} #${id} not found` : `${entityType} not found`,
      entityType
    )
  }
}

/**
 * Check condition, throw if false
 */
export function assertCondition(
  condition: boolean,
  message: string,
  code: string = 'VALIDATION_ERROR',
  statusCode: number = 400
): void {
  if (!condition) {
    throw new AppError(message, code, statusCode)
  }
}

/**
 * Format error for response
 */
export function formatError(error: any): {
  message: string
  code?: string
  details?: any
} {
  if (error instanceof AppError) {
    return {
      message: error.message,
      code: error.code,
      details: error.details,
    }
  }

  return {
    message: error.message || 'An unexpected error occurred',
    code: error.code,
  }
}

/**
 * Handle async route handler errors
 */
export function asyncHandler(
  fn: (req: any, res: any, next: any) => Promise<any>
) {
  return (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

export const ErrorUtils = {
  AppError,
  NotFoundError,
  ValidationError,
  AuthorizationError,
  ConflictError,
  RateLimitError,
  assertFound,
  assertCondition,
  formatError,
  asyncHandler,
}
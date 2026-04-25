/**
 * Query builder utilities for consistent filtering and pagination
 */

export interface PaginationParams {
  page?: number
  limit?: number
  maxLimit?: number
  defaultLimit?: number
}

export interface PaginationResult {
  skip: number
  take: number
  page: number
  limit: number
}

export interface DateRangeParams {
  startDate?: string | Date
  endDate?: string | Date
}

export interface SearchParams {
  search?: string
  searchFields?: string[]
}

export interface BaseFilterParams {
  organizationId: number
  branchId?: number
}

/**
 * Build pagination options from params
 */
export function buildPagination(params: PaginationParams = {}): PaginationResult {
  const {
    maxLimit = 500,
    defaultLimit = 50,
  } = params

  const page = Math.max(params.page || 1, 1)
  const limit = Math.min(
    Math.max(params.limit || defaultLimit, 1),
    maxLimit
  )

  return {
    skip: (page - 1) * limit,
    take: limit,
    page,
    limit,
  }
}

/**
 * Build Prisma date range filter
 */
export function buildDateRange(
  params: DateRangeParams,
  fieldName: string = 'createdAt'
): Record<string, any> {
  const { startDate, endDate } = params

  if (!startDate && !endDate) {
    return {}
  }

  const filter: Record<string, any> = {}

  if (startDate) {
    const parsed = new Date(startDate)
    if (!isNaN(parsed.getTime())) {
      filter.gte = parsed
    }
  }

  if (endDate) {
    const parsed = new Date(endDate)
    if (!isNaN(parsed.getTime())) {
      const endOfDay = new Date(parsed)
      endOfDay.setHours(23, 59, 59, 999)
      filter.lte = endOfDay
    }
  }

  return { [fieldName]: filter }
}

/**
 * Build Prisma search filter for multiple fields
 */
export function buildSearchFilter(
  params: SearchParams,
  prismaMode: 'insensitive' | 'default' = 'insensitive'
): Record<string, any> {
  const { search, searchFields = [] } = params

  if (!search || searchFields.length === 0) {
    return {}
  }

  const searchTerms = search.trim()
  if (!searchTerms) {
    return {}
  }

  return {
    OR: searchFields.map((field) => ({
      [field]: {
        ...(prismaMode === 'insensitive'
          ? { contains: searchTerms, mode: 'insensitive' }
          : { contains: searchTerms }),
      },
    })),
  }
}

/**
 * Build simple equality filter for optional values
 */
export function buildEqualsFilter<T>(
  value: T | undefined,
  defaultValue?: T
): Record<string, T> | undefined {
  const finalValue = value ?? defaultValue
  if (finalValue === undefined) {
    return undefined
  }
  return { equals: finalValue }
}

/**
 * Build branch filter for organization-scoped queries
 */
export function buildBranchFilter(
  branchId: number | null | undefined
): Record<string, any> {
  if (branchId === null || branchId === undefined) {
    return {}
  }
  return { branchId }
}

/**
 * Build status filter with 'all' handling
 */
export function buildStatusFilter(
  status: string | undefined,
  allowedStatuses: string[]
): Record<string, string> | undefined {
  if (!status || status === 'all') {
    return undefined
  }
  
  if (!allowedStatuses.includes(status.toLowerCase())) {
    return undefined
  }

  return { equals: status }
}

/**
 * Build soft delete filter (isActive/deletedAt)
 */
export function buildSoftDeleteFilter(
  includeInactive: boolean = false
): Record<string, any> {
  if (includeInactive) {
    return {}
  }

  return {
    isActive: true,
    deletedAt: null,
  }
}

/**
 * Calculate pagination metadata
 */
export function buildPaginationMeta(
  totalItems: number,
  page: number,
  limit: number
) {
  const totalPages = Math.ceil(totalItems / limit)

  return {
    totalItems,
    totalPages,
    currentPage: page,
    limit,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  }
}

export const QueryUtils = {
  buildPagination,
  buildDateRange,
  buildSearchFilter,
  buildEqualsFilter,
  buildBranchFilter,
  buildStatusFilter,
  buildSoftDeleteFilter,
  buildPaginationMeta,
}
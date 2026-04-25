/**
 * Shared filter type definitions
 */

import type { Prisma } from '@prisma/client'

export interface ListParams {
  organizationId: number
  branchId?: number
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface ListResult<T> {
  data: T[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface IdParams {
  id: number
  organizationId: number
  branchId?: number
}

export interface CreateParams<T> {
  data: T
  organizationId: number
  userId?: number
  branchId?: number
}

export interface UpdateParams<T> {
  id: number
  data: Partial<T>
  organizationId: number
}

export interface DeleteParams {
  id: number
  organizationId: number
}

export type SoftDeleteParams = DeleteParams

export interface TenantFilter {
  organizationId: number
  branchId?: number | null
}

export interface SoftDeletableFilter extends TenantFilter {
  isActive?: boolean
  deletedAt?: Prisma.DateTimeFilter | null
}

export type { ListParams as BaseListParams, ListResult as BaseListResult }
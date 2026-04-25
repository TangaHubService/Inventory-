/**
 * Base CRUD Service
 * Provides generic CRUD operations for all tenant-scoped entities
 */

import { prisma } from '../../lib/prisma'
import { NotFoundError, ConflictError } from '../utils/error'
import { buildPagination, buildSoftDeleteFilter } from '../utils/query'

export interface FindAllParams {
  organizationId: number
  branchId?: number
  page?: number
  limit?: number
  search?: string
  includeInactive?: boolean
  searchFields?: string[]
}

export interface FindOneParams {
  id: number
  organizationId: number
  branchId?: number
}

export interface CreateParams<T> {
  data: T
  organizationId: number
}

export interface UpdateParams<T> {
  id: number
  data: Partial<T>
  organizationId: number
}

export interface DeleteParams {
  id: number
  organizationId: number
  hardDelete?: boolean
}

type ModelName = 'customer' | 'supplier' | 'expense' | 'product' | 'branch' | 'user' | 'sale'

/**
 * Create a CRUD service for a specific model
 */
export function createCrudService(modelName: ModelName, options: {
  softDelete?: boolean
  uniqueFields?: string[]
} = {}) {
  const { softDelete = true, uniqueFields = [] } = options

  async function findAll(params: FindAllParams) {
    const { organizationId, page = 1, limit = 50, search, includeInactive = false, searchFields } = params

    const where: any = { organizationId }

    if (softDelete) {
      Object.assign(where, buildSoftDeleteFilter(includeInactive))
    }

    if (search && searchFields && searchFields.length > 0) {
      const searchTerms = search.trim()
      if (searchTerms) {
        where.OR = searchFields.map((field) => ({
          [field]: { contains: searchTerms, mode: 'insensitive' },
        }))
      }
    }

    const { skip, take } = buildPagination({ page, limit })

    const [data, total] = await Promise.all([
      (prisma as any)[modelName].findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      (prisma as any)[modelName].count({ where }),
    ])

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async function findById(params: FindOneParams) {
    const { id, organizationId } = params

    const where: any = { id, organizationId }

    if (softDelete) {
      where.deletedAt = null
    }

    const entity = await (prisma as any)[modelName].findFirst({ where })

    if (!entity) {
      throw new NotFoundError(`${modelName} #${id} not found`, modelName)
    }

    return entity
  }

  async function create(params: CreateParams<any>) {
    const { data, organizationId } = params

    if (uniqueFields.length > 0) {
      for (const field of uniqueFields) {
        const value = data[field]
        if (value !== undefined && value !== null) {
          const existing = await (prisma as any)[modelName].findFirst({
            where: { [field]: value, organizationId },
          })

          if (existing) {
            throw new ConflictError(`${modelName} with ${field} already exists`)
          }
        }
      }
    }

    const entity = await (prisma as any)[modelName].create({
      data: {
        ...data,
        organizationId,
      },
    })

    return entity
  }

  async function update(params: UpdateParams<any>) {
    const { id, data, organizationId } = params

    const existing = await findById({ id, organizationId })

    if (uniqueFields.length > 0) {
      for (const field of uniqueFields) {
        const value = data[field]
        if (value !== undefined && value !== null) {
          const existing = await (prisma as any)[modelName].findFirst({
            where: { [field]: value, organizationId, NOT: { id } },
          })

          if (existing) {
            throw new ConflictError(`${modelName} with ${field} already exists`)
          }
        }
      }
    }

    const entity = await (prisma as any)[modelName].update({
      where: { id },
      data,
    })

    return entity
  }

  async function remove(params: DeleteParams) {
    const { id, organizationId, hardDelete = false } = params

    const existing = await findById({ id, organizationId })

    if (hardDelete) {
      return await (prisma as any)[modelName].delete({ where: { id } })
    }

    if (softDelete) {
      return await (prisma as any)[modelName].update({
        where: { id },
        data: {
          isActive: false,
          deletedAt: new Date(),
        },
      })
    }

    throw new Error('Soft delete is not enabled for this model')
  }

  return {
    findAll,
    findById,
    create,
    update,
    remove,
  }
}

/**
 * Pre-built CRUD services for common entities
 */

export const customerCrud = createCrudService('customer', {
  uniqueFields: ['email', 'phone'],
})

export const supplierCrud = createCrudService('supplier', {
  uniqueFields: ['email'],
})

export const expenseCrud = createCrudService('expense')

export const productCrud = createCrudService('product', {
  uniqueFields: ['batchNumber'],
})

export const CrudService = {
  customerCrud,
  supplierCrud,
  expenseCrud,
  productCrud,
  createCrudService,
}
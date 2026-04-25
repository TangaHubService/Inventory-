/**
 * Shared validation Zod schemas
 * Provides consistent validation across all services
 */

import { z } from 'zod'

export const idSchema = z.number().int().positive()

export const organizationIdSchema = z.number().int().positive()

export const pageLimitSchema = z
  .object({
    page: z.number().int().positive().default(1),
    limit: z.number().int().positive().max(500).default(50),
  })
  .default({ page: 1, limit: 50 })

export const dateRangeSchema = z
  .object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  })
  .optional()

export const searchSchema = z
  .object({
    search: z.string().max(100).optional(),
  })
  .optional()

export const statusSchema = z.enum([
  'all',
  'ACTIVE',
  'INACTIVE',
  'PENDING',
  'COMPLETED',
  'CANCELLED',
  'REFUNDED',
])

const emailSchema = z
  .string()
  .email()
  .optional()
  .or(z.literal(''))

const phoneSchema = z
  .string()
  .min(10)
  .max(20)
  .optional()
  .or(z.literal(''))

export const customerSchema = z.object({
  name: z.string().min(1).max(255),
  email: emailSchema,
  phone: phoneSchema,
  customerType: z.enum(['INDIVIDUAL', 'CORPORATE', 'INSURANCE']).default('INDIVIDUAL'),
  TIN: z.string().max(20).optional(),
  address: z.string().max(500).optional(),
  organizationId: organizationIdSchema,
})

export const supplierSchema = z.object({
  name: z.string().min(1).max(255),
  email: emailSchema,
  phone: phoneSchema,
  address: z.string().max(500).optional(),
  contactPerson: z.string().max(255).optional(),
  organizationId: organizationIdSchema,
})

export const productSchema = z.object({
  name: z.string().min(1).max(255),
  batchNumber: z.string().min(1).max(100),
  sku: z.string().max(100).optional(),
  itemCode: z.string().max(50).optional(),
  itemClassCode: z.string().max(20).optional(),
  packageUnitCode: z.string().max(20).optional(),
  quantityUnitCode: z.string().max(20).optional(),
  quantity: z.number().int().min(0),
  unitPrice: z.number().min(0),
  category: z.string().max(100),
  description: z.string().max(1000).optional(),
  imageUrl: z.string().url().optional(),
  minStock: z.number().int().min(0).default(10),
  expiryDate: z.string().datetime().optional(),
  barcode: z.string().max(100).optional(),
  organizationId: organizationIdSchema,
})

export const branchSchema = z.object({
  name: z.string().min(1).max(255),
  code: z.string().min(1).max(50),
  bhfId: z.string().max(50).optional(),
  location: z.string().max(255).optional(),
  address: z.string().max(500).optional(),
  phone: phoneSchema,
  organizationId: organizationIdSchema,
})

export const saleSchema = z.object({
  customerId: idSchema,
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().positive(),
      unitPrice: z.number().positive(),
    })
  ).min(1),
  paymentType: z.enum([
    'CASH',
    'MOBILE_MONEY',
    'CREDIT_CARD',
    'INSURANCE',
    'DEBT',
    'MIXED',
  ]),
  cashAmount: z.number().min(0).default(0),
  insuranceAmount: z.number().min(0).default(0),
  debtAmount: z.number().min(0).default(0),
  purchaseOrderCode: z.string().max(100).optional(),
})

export const expenseSchema = z.object({
  category: z.enum([
    'OPERATIONAL',
    'SALARY',
    'RENT',
    'UTILITIES',
    'MAINTENANCE',
    'MARKETING',
    'OTHER',
  ]),
  amount: z.number().positive(),
  paymentMethod: z.string().min(1),
  description: z.string().min(1).max(500),
  reference: z.string().max(100).optional(),
  expenseDate: z.string().datetime(),
  notes: z.string().max(1000).optional(),
  organizationId: organizationIdSchema,
  userId: idSchema,
  branchId: idSchema,
})

export const ValidationSchemas = {
  id: idSchema,
  organizationId: organizationIdSchema,
  pageLimit: pageLimitSchema,
  dateRange: dateRangeSchema,
  search: searchSchema,
  status: statusSchema,
  customer: customerSchema,
  supplier: supplierSchema,
  product: productSchema,
  branch: branchSchema,
  sale: saleSchema,
  expense: expenseSchema,
}
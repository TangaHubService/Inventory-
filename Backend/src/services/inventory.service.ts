import { prisma } from "../lib/prisma"
import type { Product, PrismaClient } from "@prisma/client"
import { TaxCategory } from "@prisma/client"
import type { BranchAuthRequest } from "../middleware/branchAuth.middleware"
import { buildBranchFilter } from "../middleware/branchAuth.middleware"
import { normalizeOptionalText } from "../shared/utils/text"
import { buildPagination, buildSearchFilter } from "../shared/utils/query"
import { getCategoryFiscalConfig, generateItemCode } from "../config/category-fiscal"
import {
  adjustStock as ledgerAdjustStock,
  removeStock as ledgerRemoveStock,
  getCurrentStock,
  addStock as ledgerAddStock
} from "./inventory-ledger.service"

export interface ProductFilterParams {
  organizationId: number
  branchId?: number
  search?: string
  category?: string
  expiryStatus?: string
  limit?: number
  page?: number
}

export const getProducts = async (params: ProductFilterParams) => {
  const { organizationId, branchId, search, category, expiryStatus, limit = 50, page = 1 } = params

  const limitNum = Math.min(Math.max(limit, 1), 500)
  const pageNum = Math.max(page, 1)
  const skip = (pageNum - 1) * limitNum

  const where: any = {
    organizationId,
    isActive: true,
    deletedAt: null,
  }

  if (branchId) {
    where.batches = {
      some: {
        branchId
      }
    }
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { batchNumber: { contains: search, mode: "insensitive" } },
    ]
  }

  if (category) {
    where.category = category
  }

  const expiryCondition: any = {}
  if (expiryStatus === "expired") {
    expiryCondition.expiryDate = {
      not: null,
      lt: new Date(),
    }
  } else if (expiryStatus === "expiring") {
    expiryCondition.expiryDate = {
      not: null,
      gte: new Date(),
      lte: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    }
  } else {
    expiryCondition.OR = [
      { expiryDate: null },
      { expiryDate: { gte: new Date() } }
    ]
  }

  where.AND = [expiryCondition]

  const [products, totalCount] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { expiryDate: "asc" },
      skip,
      take: limitNum,
    }),
    prisma.product.count({ where }),
  ])

  const productsWithStock = await Promise.all(
    products.map(async (product) => {
      const ledgerEntryCount = await prisma.inventoryLedger.count({
        where: {
          productId: product.id,
          organizationId,
          branchId: branchId ?? undefined,
        },
      })

      let actualStock
      if (ledgerEntryCount === 0) {
        actualStock = product.quantity
      } else {
        actualStock = await getCurrentStock(organizationId, product.id, branchId)
      }

      return {
        ...product,
        quantity: actualStock,
      }
    })
  )

  const lowStockResult = await prisma.$queryRaw<Array<{ count: bigint }>>`
    SELECT COUNT(*)::int as count
    FROM products
    WHERE "organizationId" = ${organizationId}
      AND quantity <= "minStock"
      AND "minStock" > 0
  `
  const lowStockProducts = Number(lowStockResult[0]?.count || 0)

  const expiredProducts = await prisma.product.count({
    where: {
      organizationId,
      expiryDate: {
        not: null,
        lt: new Date(),
      },
    },
  })

  const expiringProducts = await prisma.product.count({
    where: {
      organizationId,
      expiryDate: {
        not: null,
        gte: new Date(),
        lte: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      },
    },
  })

  return {
    data: productsWithStock,
    lowStockProducts,
    expiredProducts,
    expiringProducts,
    pagination: {
      totalItems: totalCount,
      totalPages: Math.ceil(totalCount / limitNum),
      currentPage: pageNum,
      limit: limitNum,
    },
  }
}

export const getProductById = async (id: number, organizationId: number) => {
  return prisma.product.findFirst({
    where: { id, organizationId, deletedAt: null },
  })
}

export interface CreateProductInput {
  name: string
  sku?: string
  batchNumber: string
  quantity: number
  unitPrice: number
  imageUrl?: string
  expiryDate?: string
  category: string
  description?: string
  minStock?: number
  barcode?: string
  unitOfMeasure?: string
}

export const createProduct = async (
  input: CreateProductInput,
  organizationId: number,
  userId: number,
  branchId?: number
) => {
  if (input.expiryDate && new Date(input.expiryDate) < new Date()) {
    throw new Error("Expiry date cannot be in the past")
  }

  const fiscalConfig = getCategoryFiscalConfig(input.category)
  const itemCode = generateItemCode(organizationId)

  return await prisma.$transaction(async (tx) => {
    const product = await tx.product.create({
      data: {
        name: input.name,
        sku: normalizeOptionalText(input.sku),
        itemCode: itemCode,
        itemClassCode: fiscalConfig.itemClsCd,
        taxTyCd: fiscalConfig.taxTyCd,
        packageUnitCode: fiscalConfig.pkgUnitCd,
        quantityUnitCode: input.unitOfMeasure || fiscalConfig.qtyUnitCd,
        batchNumber: input.batchNumber,
        quantity: input.quantity,
        unitPrice: input.unitPrice,
        expiryDate: input.expiryDate ? new Date(input.expiryDate) : null,
        category: input.category,
        description: input.description,
        imageUrl: input.imageUrl,
        minStock: input.minStock || 10,
        taxCategory: fiscalConfig.taxTyCd === 'A' ? 'EXEMPT' : 'STANDARD',
        barcode: normalizeOptionalText(input.barcode),
        organizationId,
      },
    })

    if (input.quantity > 0) {
      await ledgerAddStock({
        organizationId,
        productId: product.id,
        userId,
        quantity: input.quantity,
        movementType: 'INITIAL_STOCK',
        branchId: branchId || 0,
        reference: `INIT-${product.id}`,
        referenceType: 'INITIAL_STOCK',
        note: 'Initial stock from product creation',
        batchNumber: input.batchNumber,
        expiryDate: input.expiryDate ? new Date(input.expiryDate) : undefined,
        tx,
      })
    }

    return product
  })
}

export const createProducts = async (
  products: CreateProductInput[],
  organizationId: number,
  userId: number,
  branchId?: number
) => {
  const existingProducts = await prisma.product.findMany({
    where: {
      organizationId,
      batchNumber: {
        in: products.map((p) => p.batchNumber),
      },
    },
    select: {
      batchNumber: true,
      name: true,
    },
  })

  if (existingProducts.length > 0) {
    const duplicateBatchNumbers = existingProducts.map(p => p.batchNumber).join(', ')
    const duplicateCount = existingProducts.length

    throw {
      message: duplicateCount === 1
        ? `Product with batch number "${duplicateBatchNumbers}" already exists`
        : `${duplicateCount} products with batch numbers already exist: ${duplicateBatchNumbers}`,
      duplicates: existingProducts.map(p => ({
        batchNumber: p.batchNumber,
        name: p.name,
      })),
    }
  }

  return await prisma.$transaction(async (tx) => {
    await tx.product.createMany({
      data: products.map((product, index) => {
        const fiscalConfig = getCategoryFiscalConfig(product.category)
        return {
          name: product.name,
          sku: normalizeOptionalText(product.sku),
          itemCode: generateItemCode(organizationId) + `-${index}`,
          itemClassCode: fiscalConfig.itemClsCd,
          taxTyCd: fiscalConfig.taxTyCd,
          packageUnitCode: fiscalConfig.pkgUnitCd,
          quantityUnitCode: product.unitOfMeasure || fiscalConfig.qtyUnitCd,
          batchNumber: product.batchNumber,
          quantity: product.quantity,
          unitPrice: product.unitPrice,
          category: product.category,
          description: product.description,
          imageUrl: product.imageUrl,
          minStock: product.minStock,
          taxCategory: fiscalConfig.taxTyCd === 'A' ? 'EXEMPT' : 'STANDARD',
          barcode: normalizeOptionalText(product.barcode),
          organizationId,
          expiryDate: product.expiryDate ? new Date(product.expiryDate) : null,
        }
      }),
    })

    const createdProducts = await tx.product.findMany({
      where: {
        organizationId,
        batchNumber: {
          in: products.map((p) => p.batchNumber),
        },
      },
    })

    for (const product of createdProducts) {
      if (product.quantity > 0) {
        await ledgerAddStock({
          organizationId,
          productId: product.id,
          userId,
          quantity: product.quantity,
          movementType: 'INITIAL_STOCK',
          branchId: branchId || 0,
          reference: `INIT-${product.id}`,
          referenceType: 'INITIAL_STOCK',
          note: 'Initial stock from bulk import',
          batchNumber: product.batchNumber || undefined,
          expiryDate: product.expiryDate || undefined,
          tx,
        })
      }
    }

    return createdProducts
  })
}

export interface UpdateProductInput {
  name?: string
  sku?: string
  itemCode?: string
  itemClassCode?: string
  packageUnitCode?: string
  quantityUnitCode?: string
  batchNumber?: string
  quantity?: number
  unitPrice?: number
  imageUrl?: string
  expiryDate?: string | null
  category?: string
  description?: string
  minStock?: number
  taxCategory?: TaxCategory
  barcode?: string
}

export const updateProduct = async (
  id: number,
  organizationId: number,
  updateData: UpdateProductInput
) => {
  const existingProduct = await prisma.product.findFirst({
    where: { id, organizationId, deletedAt: null },
  })

  if (!existingProduct) {
    throw new Error("Product not found")
  }

  if (updateData.expiryDate && new Date(updateData.expiryDate) < new Date()) {
    throw new Error("Expiry date cannot be in the past")
  }

  const normalizedData: any = { ...updateData }

  if (updateData.sku !== undefined) {
    normalizedData.sku = normalizeOptionalText(updateData.sku)
  }
  if (updateData.barcode !== undefined) {
    normalizedData.barcode = normalizeOptionalText(updateData.barcode)
  }
  if (updateData.expiryDate !== undefined) {
    normalizedData.expiryDate = updateData.expiryDate ? new Date(updateData.expiryDate) : null
  }

  return prisma.product.update({
    where: { id },
    data: normalizedData,
  })
}

export const deleteProduct = async (id: number, organizationId: number) => {
  const existingProduct = await prisma.product.findFirst({
    where: { id, organizationId, deletedAt: null },
  })

  if (!existingProduct) {
    throw new Error("Product not found")
  }

  return prisma.product.update({
    where: { id },
    data: { isActive: false, deletedAt: new Date() }
  })
}

export const getExpiringProducts = async (
  organizationId: number,
  branchId: number | undefined,
  days: number = 30,
  limit: number = 10,
  page: number = 1
) => {
  const where: any = {
    organizationId,
    deletedAt: null,
    expiryDate: {
      not: null,
      gte: new Date(),
      lte: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
    },
  }

  if (branchId) {
    where.batches = {
      some: {
        branchId
      }
    }
  }

  const skip = (page - 1) * limit

  const [products, totalCount] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { expiryDate: "asc" },
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ])

  return {
    data: products,
    pagination: {
      totalItems: totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      limit,
    },
  }
}

export const getExpiredProducts = async (
  organizationId: number,
  branchId: number | undefined,
  limit: number = 10,
  page: number = 1
) => {
  const where: any = {
    organizationId,
    deletedAt: null,
    expiryDate: {
      not: null,
      lt: new Date(),
    },
  }

  if (branchId) {
    where.batches = {
      some: {
        branchId
      }
    }
  }

  const skip = (page - 1) * limit

  const [products, totalCount] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { expiryDate: "desc" },
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ])

  return {
    data: products,
    pagination: {
      totalItems: totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      limit,
    },
  }
}

export interface LowStockFilterParams {
  organizationId: number
  branchId?: number
  search?: string
  status?: string
  limit?: number
  page?: number
}

export const getLowStockProducts = async (params: LowStockFilterParams) => {
  const { organizationId, branchId, search, status, limit = 10, page = 1 } = params

  const baselineProduct = await prisma.product.findFirst({
    where: {
      organizationId,
      deletedAt: null,
      ...(branchId ? { batches: { some: { branchId } } } : {})
    },
    select: { minStock: true },
  })

  const baseMinStock = baselineProduct?.minStock || 10

  const where: any = {
    organizationId,
    deletedAt: null,
    quantity: {
      lt: baseMinStock,
    },
  }

  if (branchId) {
    where.batches = {
      some: {
        branchId
      }
    }
  }

  if (search && search.trim()) {
    where.OR = [
      { name: { contains: search.trim(), mode: 'insensitive' } },
      { sku: { contains: search.trim(), mode: 'insensitive' } },
      { batchNumber: { contains: search.trim(), mode: 'insensitive' } },
    ]
  }

  if (status && status !== 'all') {
    const statusFilter = status.toLowerCase()
    if (statusFilter === 'critical') {
      where.quantity = {
        ...where.quantity,
        lte: Math.floor(baseMinStock * 0.25),
      }
    } else if (statusFilter === 'low') {
      where.AND = [
        { quantity: { gt: Math.floor(baseMinStock * 0.25) } },
        { quantity: { lte: Math.floor(baseMinStock * 0.5) } },
      ]
      delete where.quantity
    } else if (statusFilter === 'warning') {
      where.AND = [
        { quantity: { gt: Math.floor(baseMinStock * 0.5) } },
        { quantity: { lt: baseMinStock } },
      ]
      delete where.quantity
    }
  }

  const skip = (page - 1) * limit

  const [products, totalCount] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { quantity: "asc" },
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ])

  return {
    data: products,
    pagination: {
      totalItems: totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      limit,
    },
  }
}

export const getLowStockProductsCount = async (organizationId: number, branchId?: number) => {
  const baselineProduct = await prisma.product.findFirst({
    where: {
      organizationId,
      deletedAt: null,
    },
    select: { minStock: true },
  })
  const baseMinStock = baselineProduct?.minStock || 10

  const where: any = {
    organizationId,
    deletedAt: null,
    quantity: { lte: baseMinStock },
  }

  if (branchId) {
    where.batches = { some: { branchId } }
  }

  return prisma.product.count({ where })
}

export const getExpiredProductsCount = async (organizationId: number, branchId?: number) => {
  const where: any = {
    organizationId,
    deletedAt: null,
    expiryDate: { not: null, lt: new Date() },
  }

  if (branchId) {
    where.batches = { some: { branchId } }
  }

  return prisma.product.count({ where })
}

export const adjustStock = async (
  productId: number,
  organizationId: number,
  userId: number,
  quantity: number,
  branchId: number | undefined,
  note?: string
) => {
  const product = await prisma.product.findFirst({
    where: { id: productId, organizationId, deletedAt: null },
  })

  if (!product) {
    throw new Error("Product not found")
  }

  return ledgerAdjustStock({
    organizationId,
    productId,
    userId,
    quantity,
    branchId: branchId ?? null,
    reference: `ADJ-${productId}-${Date.now()}`,
    referenceType: 'ADJUSTMENT',
    note: note || "Manual adjustment",
  })
}

export const markAsDamage = async (
  productId: number,
  organizationId: number,
  userId: number,
  quantity: number,
  branchId: number | undefined,
  note?: string
) => {
  const product = await prisma.product.findFirst({
    where: { id: productId, organizationId, deletedAt: null },
  })

  if (!product) {
    throw new Error("Product not found")
  }

  if (quantity > product.quantity) {
    throw new Error("Damage quantity exceeds current stock")
  }

  return ledgerRemoveStock({
    organizationId,
    productId,
    userId,
    quantity,
    movementType: 'DAMAGE',
    branchId: branchId ?? null,
    reference: `DAMAGE-${productId}-${Date.now()}`,
    referenceType: 'DAMAGE',
    note: note || "Marked as damage",
  })
}

export const processExpiredStock = async (
  productId: number,
  organizationId: number,
  userId: number,
  quantity: number | undefined,
  branchId: number | undefined,
  note?: string
) => {
  const product = await prisma.product.findFirst({
    where: { id: productId, organizationId, deletedAt: null },
  })

  if (!product) {
    throw new Error("Product not found")
  }

  const qtyToRemove = quantity || product.quantity

  return ledgerRemoveStock({
    organizationId,
    productId,
    userId,
    quantity: qtyToRemove,
    movementType: 'EXPIRED',
    branchId: branchId ?? null,
    reference: `EXPIRED-${productId}-${Date.now()}`,
    referenceType: 'EXPIRED',
    note: note || "Processed expired stock",
  })
}

export const InventoryService = {
  getProducts,
  getProductById,
  createProduct,
  createProducts,
  updateProduct,
  deleteProduct,
  getExpiringProducts,
  getExpiredProducts,
  getLowStockProducts,
  getLowStockProductsCount,
  getExpiredProductsCount,
  adjustStock,
  markAsDamage,
  processExpiredStock,
}
/**
 * Category Fiscal Mapping Configuration
 * 
 * Maps user-friendly product categories to VSDC/RRA fiscal metadata.
 * Users select a category, and the backend auto-generates all required fiscal fields.
 */

export interface CategoryFiscalConfig {
  /** User-friendly category name */
  name: string;
  /** VSDC item classification code (itemClsCd) */
  itemClsCd: string;
  /** VSDC tax type code (taxTyCd) - A = exempt, B = 18%, etc. */
  taxTyCd: string;
  /** Default quantity unit code (qtyUnitCd) */
  qtyUnitCd: string;
  /** Default package unit code (pkgUnitCd) */
  pkgUnitCd: string;
}

/**
 * Default category configurations
 * These can be extended or modified via database configuration
 */
export const DEFAULT_CATEGORY_FISCAL_MAPPING: Record<string, CategoryFiscalConfig> = {
  // Food & Bakery
  'Bread': {
    name: 'Bread',
    itemClsCd: '1905900000',
    taxTyCd: 'B',
    qtyUnitCd: 'U',
    pkgUnitCd: 'BA',
  },
  'Bakery': {
    name: 'Bakery',
    itemClsCd: '1905900000',
    taxTyCd: 'B',
    qtyUnitCd: 'U',
    pkgUnitCd: 'BA',
  },
  'Cakes': {
    name: 'Cakes',
    itemClsCd: '1905900000',
    taxTyCd: 'B',
    qtyUnitCd: 'U',
    pkgUnitCd: 'BA',
  },
  
  // Beverages
  'Water': {
    name: 'Water',
    itemClsCd: '2202990000',
    taxTyCd: 'B',
    qtyUnitCd: 'U',
    pkgUnitCd: 'PC',
  },
  'Soft Drinks': {
    name: 'Soft Drinks',
    itemClsCd: '2202990000',
    taxTyCd: 'B',
    qtyUnitCd: 'U',
    pkgUnitCd: 'PC',
  },
  'Juice': {
    name: 'Juice',
    itemClsCd: '2202990000',
    taxTyCd: 'B',
    qtyUnitCd: 'U',
    pkgUnitCd: 'PC',
  },
  'Milk': {
    name: 'Milk',
    itemClsCd: '0402990000',
    taxTyCd: 'B',
    qtyUnitCd: 'U',
    pkgUnitCd: 'PC',
  },
  
  // Dairy
  'Cheese': {
    name: 'Cheese',
    itemClsCd: '0406990000',
    taxTyCd: 'B',
    qtyUnitCd: 'U',
    pkgUnitCd: 'PC',
  },
  'Yogurt': {
    name: 'Yogurt',
    itemClsCd: '0403200000',
    taxTyCd: 'B',
    qtyUnitCd: 'U',
    pkgUnitCd: 'PC',
  },
  'Butter': {
    name: 'Butter',
    itemClsCd: '0405900000',
    taxTyCd: 'B',
    qtyUnitCd: 'U',
    pkgUnitCd: 'PC',
  },
  
  // Snacks
  'Chips': {
    name: 'Chips',
    itemClsCd: '1905900000',
    taxTyCd: 'B',
    qtyUnitCd: 'U',
    pkgUnitCd: 'PC',
  },
  'Biscuits': {
    name: 'Biscuits',
    itemClsCd: '1905900000',
    taxTyCd: 'B',
    qtyUnitCd: 'U',
    pkgUnitCd: 'PC',
  },
  'Chocolate': {
    name: 'Chocolate',
    itemClsCd: '1806320000',
    taxTyCd: 'B',
    qtyUnitCd: 'U',
    pkgUnitCd: 'PC',
  },
  'Sweets': {
    name: 'Sweets',
    itemClsCd: '1704900000',
    taxTyCd: 'B',
    qtyUnitCd: 'U',
    pkgUnitCd: 'PC',
  },
  
  // Stationery
  'Notebook': {
    name: 'Notebook',
    itemClsCd: '4820100000',
    taxTyCd: 'B',
    qtyUnitCd: 'U',
    pkgUnitCd: 'PK',
  },
  'Pen': {
    name: 'Pen',
    itemClsCd: '9608100000',
    taxTyCd: 'B',
    qtyUnitCd: 'U',
    pkgUnitCd: 'DZ',
  },
  'Pencil': {
    name: 'Pencil',
    itemClsCd: '9609100000',
    taxTyCd: 'B',
    qtyUnitCd: 'U',
    pkgUnitCd: 'DZ',
  },
  'Paper': {
    name: 'Paper',
    itemClsCd: '4802560000',
    taxTyCd: 'B',
    qtyUnitCd: 'RM',
    pkgUnitCd: 'RM',
  },
  
  // Utilities
  ' Soap': {
    name: ' Soap',
    itemClsCd: '3401190000',
    taxTyCd: 'B',
    qtyUnitCd: 'U',
    pkgUnitCd: 'PC',
  },
  'Toilet Paper': {
    name: 'Toilet Paper',
    itemClsCd: '4818100000',
    taxTyCd: 'B',
    qtyUnitCd: 'RM',
    pkgUnitCd: 'PK',
  },
  'Tissues': {
    name: 'Tissues',
    itemClsCd: '4818200000',
    taxTyCd: 'B',
    qtyUnitCd: 'U',
    pkgUnitCd: 'PK',
  },
  
  // Electronics
  'Phone Credit': {
    name: 'Phone Credit',
    itemClsCd: '4121000000',
    taxTyCd: 'A',
    qtyUnitCd: 'U',
    pkgUnitCd: 'PC',
  },
  
  //Medicines (Medical supplies)
  'Medicine': {
    name: 'Medicine',
    itemClsCd: '3004900000',
    taxTyCd: 'A',
    qtyUnitCd: 'U',
    pkgUnitCd: 'PC',
  },
  'First Aid': {
    name: 'First Aid',
    itemClsCd: '3006100000',
    taxTyCd: 'A',
    qtyUnitCd: 'U',
    pkgUnitCd: 'PC',
  },
  
  // Exempt category - Zero rated
  'Fresh Produce': {
    name: 'Fresh Produce',
    itemClsCd: '0701000000',
    taxTyCd: 'A',
    qtyUnitCd: 'KG',
    pkgUnitCd: 'KG',
  },
  'Fruits': {
    name: 'Fruits',
    itemClsCd: '0800000000',
    taxTyCd: 'A',
    qtyUnitCd: 'KG',
    pkgUnitCd: 'KG',
  },
  'Vegetables': {
    name: 'Vegetables',
    itemClsCd: '0701000000',
    taxTyCd: 'A',
    qtyUnitCd: 'KG',
    pkgUnitCd: 'KG',
  },
  
  // Default fallback
  'General': {
    name: 'General',
    itemClsCd: '9999999999',
    taxTyCd: 'B',
    qtyUnitCd: 'U',
    pkgUnitCd: 'PC',
  },
};

/**
 * Get fiscal config for a category
 */
export function getCategoryFiscalConfig(categoryName: string): CategoryFiscalConfig {
  const normalizedCategory = categoryName.trim();
  
  // Direct match
  if (DEFAULT_CATEGORY_FISCAL_MAPPING[normalizedCategory]) {
    return DEFAULT_CATEGORY_FISCAL_MAPPING[normalizedCategory];
  }
  
  // Case-insensitive partial match
  const categoryKey = Object.keys(DEFAULT_CATEGORY_FISCAL_MAPPING).find(
    key => key.toLowerCase() === normalizedCategory.toLowerCase()
  );
  
  if (categoryKey) {
    return DEFAULT_CATEGORY_FISCAL_MAPPING[categoryKey];
  }
  
  // Default to General
  return DEFAULT_CATEGORY_FISCAL_MAPPING['General'];
}

/**
 * Generate unique item code
 */
let itemCodeCounter = 0;
export function generateItemCode(orgId: number): string {
  itemCodeCounter++;
  return `ITEM-${String(orgId).slice(-2)}${String(itemCodeCounter).padStart(4, '0')}`;
}

/**
 * Get all available categories
 */
export function getAvailableCategories(): string[] {
  return Object.keys(DEFAULT_CATEGORY_FISCAL_MAPPING);
}

/**
 * Tax type codes explanation
 */
export const TAX_TYPE_CODES = {
  A: { name: 'Zero Rated / Exempt', rate: 0 },
  B: { name: 'VAT 18%', rate: 18 },
  C: { name: 'VAT 10%', rate: 10 },
  D: { name: 'VAT 8%', rate: 8 },
};

/**
 * Quantity unit codes
 */
export const QUANTITY_UNIT_CODES = {
  U: { name: 'Unit', abbreviated: 'pc' },
  KG: { name: 'Kilogram', abbreviated: 'kg' },
  GM: { name: 'Gram', abbreviated: 'g' },
  L: { name: 'Liter', abbreviated: 'l' },
  ML: { name: 'Milliliter', abbreviated: 'ml' },
  RM: { name: 'Ream', abbreviated: 'rm' },
  DZ: { name: 'Dozen', abbreviated: 'dz' },
  PC: { name: 'Pack', abbreviated: 'pk' },
};

/**
 * Package unit codes
 */
export const PACKAGE_UNIT_CODES = {
  BA: { name: 'Bag', abbreviated: 'bag' },
  BO: { name: 'Bottle', abbreviated: 'btl' },
  BX: { name: 'Box', abbreviated: 'box' },
  CA: { name: 'Carton', abbreviated: 'ctn' },
  PC: { name: 'Piece', abbreviated: 'pc' },
  PK: { name: 'Pack', abbreviated: 'pk' },
  KG: { name: 'Kilogram', abbreviated: 'kg' },
  DZ: { name: 'Dozen', abbreviated: 'dz' },
  RM: { name: 'Ream', abbreviated: 'rm' },
};

export const CategoryFiscalConfig = {
  DEFAULT_CATEGORY_FISCAL_MAPPING,
  getCategoryFiscalConfig,
  generateItemCode,
  getAvailableCategories,
  TAX_TYPE_CODES,
  QUANTITY_UNIT_CODES,
  PACKAGE_UNIT_CODES,
};
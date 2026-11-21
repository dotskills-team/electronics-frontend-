/**
 * `GET /companies/:companyId/pos/*` (verified `PosInsightsService`). Deliberately
 * carries no cost, price, revenue or profit — these endpoints are open to a
 * Cashier, who has no report access.
 */
export interface PosStockSummary {
  totalItems: number;
  lowStockCount: number;
  outOfStockCount: number;
}

export interface PosStockItem {
  productId: string;
  variantId: string | null;
  /** "T-Shirt — Red / S" for a variant, plain product name otherwise. */
  name: string;
  sku: string;
  /** Decimal serialised as a string, in the product's base unit. */
  quantity: string;
  reorderLevel: string;
  unitCode: string | null;
  unitName: string | null;
  isLow: boolean;
  isOutOfStock: boolean;
}

export interface PosTopSellingItem {
  rank: number;
  productId: string;
  variantId: string | null;
  name: string;
  sku: string;
  /** Quantity sold in the product's BASE unit (2 dozen + 5 pieces = 29). */
  soldQuantity: string;
  saleCount: number;
  unitCode: string | null;
  unitName: string | null;
}

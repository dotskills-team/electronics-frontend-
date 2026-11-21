export type ProductStatus = "ACTIVE" | "INACTIVE";

/** Label printed on the receipt — behaviorally identical, only the wording differs. */
export type WarrantyType = "WARRANTY" | "GUARANTEE";

/** `GET /companies/:companyId/products` item (verified `PRODUCT_SELECT` in product.service.ts). */
export interface Product {
  id: string;
  sku: string;
  barcode: string | null;
  name: string;
  categoryId: string | null;
  baseUnitId: string;
  costPrice: string;
  salePrice: string;
  reorderLevel: string;
  sellByWeight: boolean;
  hasVariants: boolean;
  /** Default warranty/guarantee length in months, copied onto each sale line. Both null = no warranty. */
  warrantyMonths: number | null;
  warrantyType: WarrantyType | null;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
}

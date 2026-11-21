import type { ProductFormValues } from "@/features/product/schemas/product.schema";

export interface ProductMutationPayload {
  sku?: string;
  name: string;
  categoryId?: string;
  baseUnitId: string;
  barcode?: string;
  costPrice?: number;
  salePrice?: number;
  reorderLevel?: number;
  sellByWeight: boolean;
  /** `null` (not undefined) so an Edit can explicitly clear an existing warranty; the backend treats null/0 as "no warranty". */
  warrantyMonths: number | null;
  warrantyType: "WARRANTY" | "GUARANTEE" | null;
}

export function toProductPayload(values: ProductFormValues): ProductMutationPayload {
  const warrantyMonths = values.warrantyMonths ? Number(values.warrantyMonths) : 0;
  return {
    sku: values.sku.trim(),
    name: values.name.trim(),
    categoryId: values.categoryId || undefined,
    baseUnitId: values.baseUnitId,
    barcode: values.barcode?.trim() || undefined,
    costPrice: values.costPrice ? Number(values.costPrice) : undefined,
    salePrice: values.salePrice ? Number(values.salePrice) : undefined,
    reorderLevel: values.reorderLevel ? Number(values.reorderLevel) : undefined,
    sellByWeight: values.sellByWeight,
    warrantyMonths: warrantyMonths > 0 ? warrantyMonths : null,
    warrantyType: warrantyMonths > 0 ? (values.warrantyType ?? "WARRANTY") : null,
  };
}

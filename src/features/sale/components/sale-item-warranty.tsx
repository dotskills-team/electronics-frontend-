"use client";

import { useTranslations } from "next-intl";

import { formatDate } from "@/lib/formatters/date";
import type { SaleItem } from "@/types/sale";

/**
 * One-line "Warranty 12 months — valid until 19 Nov 2027" note for a sale
 * line, shared by the sale detail page and the printed receipt. Renders
 * nothing for a line sold without a warranty (all three snapshot columns
 * null — see `SaleItem`), so callers can drop it in unconditionally.
 */
export function SaleItemWarranty({ item, className }: { item: SaleItem; className?: string }) {
  const t = useTranslations("sales");

  if (!item.warrantyMonths || item.warrantyMonths <= 0) return null;

  return (
    <div className={className}>
      {t("receipt.warrantyLine", {
        type: t(item.warrantyType === "GUARANTEE" ? "receipt.guaranteeLabel" : "receipt.warrantyLabel"),
        months: item.warrantyMonths,
        date: formatDate(item.warrantyExpiresAt),
      })}
    </div>
  );
}

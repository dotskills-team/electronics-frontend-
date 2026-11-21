/**
 * Stock/sold quantities arrive as Decimal strings ("24", "5.5", "304.8000").
 * Shown with grouping and no trailing zeros, up to 3 decimals — enough for
 * weight/length units without cluttering whole-number stock. Latin digits and
 * Bangladeshi grouping, matching the money formatting elsewhere on the POS.
 */
export function formatQuantity(value: string | number): string {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString("en-BD", { maximumFractionDigits: 3 });
}

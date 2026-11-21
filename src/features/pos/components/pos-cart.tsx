"use client";

import { useTranslations } from "next-intl";
import { Inbox, Minus, Plus, ShieldCheck, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import type { CartLine } from "@/features/pos/hooks/use-cart";
import type { Unit } from "@/types/unit";

const BASE_UNIT_VALUE = "__base__";

interface PosCartProps {
  lines: CartLine[];
  units: Unit[];
  onUpdateQuantity: (index: number, quantity: number) => void;
  onUpdateDiscount: (index: number, discountAmount: number) => void;
  onUpdateSerialNote: (index: number, serialNote: string) => void;
  onUpdateWarrantyMonths: (index: number, warrantyMonths: number) => void;
  onUpdateUnit: (index: number, unit: { id: string; name: string; conversionFactor: number } | undefined) => void;
  onRemove: (index: number) => void;
}

/**
 * Dense cart: one product = one short row (name + SKU on a single line, then
 * unit / serial / warranty as small inline controls under it) instead of a
 * tall stack — a laptop screen shows many lines at once. The list scrolls
 * inside its own box (sticky header) so the totals/payment column beside it
 * never leaves the screen. The table keeps a minimum width and scrolls
 * sideways on a phone rather than squashing the inputs.
 */
export function PosCart({
  lines,
  units,
  onUpdateQuantity,
  onUpdateDiscount,
  onUpdateSerialNote,
  onUpdateWarrantyMonths,
  onUpdateUnit,
  onRemove,
}: PosCartProps) {
  const t = useTranslations("pos");

  if (lines.length === 0) {
    return (
      <div className="flex flex-col items-center gap-1.5 rounded-lg border border-dashed border-border py-8 text-center">
        <Inbox className="size-6 text-muted-foreground" aria-hidden="true" />
        <p className="text-xs text-muted-foreground">{t("cartEmpty")}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="max-h-[60dvh] overflow-auto lg:max-h-[calc(100dvh-14.5rem)]">
        <Table className="min-w-[38rem] table-fixed text-xs lg:min-w-0">
          <TableHeader className="sticky top-0 z-10">
            <TableRow>
              <TableHead className="h-8 px-1.5 text-xs">{t("cart.product")}</TableHead>
              <TableHead className="h-8 w-[6.5rem] px-1.5 text-xs">{t("cart.quantity")}</TableHead>
              <TableHead className="h-8 w-[4.25rem] px-1.5 text-right text-xs">{t("cart.unitPriceShort")}</TableHead>
              <TableHead className="h-8 w-[4.25rem] px-1.5 text-xs">{t("cart.discountShort")}</TableHead>
              <TableHead className="h-8 w-20 px-1.5 text-right text-xs">{t("cart.subtotal")}</TableHead>
              <TableHead className="h-8 w-8 px-1" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {lines.map((line, index) => {
              const subtotal = line.quantity * line.unitPrice - line.discountAmount;
              const derivedUnits = units.filter((u) => u.baseUnitId === line.baseUnitId);
              // Show the real unit name ("Piece") rather than a generic "Base unit" — shorter and clearer.
              const baseUnitName = units.find((u) => u.id === line.baseUnitId)?.name ?? t("cart.baseUnitOption");
              return (
                <TableRow key={`${line.productId}-${index}`}>
                  <TableCell className="px-1.5 py-1.5 align-top whitespace-normal">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0">
                      <span className="text-[13px] leading-tight font-medium text-foreground">
                        {line.productName}
                        {line.variantLabel && <span className="text-muted-foreground"> — {line.variantLabel}</span>}
                      </span>
                      <span className="text-[11px] text-muted-foreground">{line.sku}</span>
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      {derivedUnits.length > 0 && (
                        <Select
                          value={line.unitId ?? BASE_UNIT_VALUE}
                          onValueChange={(value) =>
                            onUpdateUnit(
                              index,
                              value === BASE_UNIT_VALUE
                                ? undefined
                                : (() => {
                                    const unit = derivedUnits.find((u) => u.id === value)!;
                                    return { id: unit.id, name: unit.name, conversionFactor: Number(unit.conversionFactor) };
                                  })(),
                            )
                          }
                        >
                          <SelectTrigger className="h-6 w-[5.5rem] px-2 text-[11px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={BASE_UNIT_VALUE}>{baseUnitName}</SelectItem>
                            {derivedUnits.map((unit) => (
                              <SelectItem key={unit.id} value={unit.id}>
                                {unit.name} ({unit.conversionFactor}x)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      <Input
                        value={line.serialNote ?? ""}
                        onChange={(event) => onUpdateSerialNote(index, event.target.value)}
                        placeholder={t("cart.serialShort")}
                        aria-label={t("cart.serialNotePlaceholder")}
                        className="h-6 min-w-[4.5rem] flex-1 px-2 text-[11px] md:text-[11px]"
                      />
                      <div
                        className="flex items-center gap-1"
                        title={
                          line.warrantyMonths > 0
                            ? `${line.warrantyMonths} ${t(line.warrantyType === "GUARANTEE" ? "cart.guaranteeMonths" : "cart.warrantyMonths")}`
                            : t("cart.noWarranty")
                        }
                      >
                        <ShieldCheck
                          className={`size-3.5 shrink-0 ${line.warrantyMonths > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground/60"}`}
                          aria-hidden="true"
                        />
                        <Input
                          type="number"
                          step="1"
                          min="0"
                          max="240"
                          value={line.warrantyMonths}
                          onChange={(event) =>
                            onUpdateWarrantyMonths(index, Math.max(0, Math.floor(Number(event.target.value) || 0)))
                          }
                          aria-label={t("cart.warrantyMonthsLabel")}
                          className="h-6 w-10 px-1 text-center text-[11px] md:text-[11px]"
                        />
                        <span className="text-[11px] text-muted-foreground">{t("cart.monthsShort")}</span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="px-1.5 py-1.5 align-top">
                    {line.sellByWeight ? (
                      <Input
                        type="number"
                        step="1"
                        min="0"
                        value={line.quantity}
                        onChange={(event) => onUpdateQuantity(index, Number(event.target.value))}
                        className="h-7 w-20 text-xs md:text-xs"
                      />
                    ) : (
                      <div className="flex items-center gap-0.5">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon-xs"
                          onClick={() => onUpdateQuantity(index, Math.max(1, line.quantity - 1))}
                          aria-label={t("cart.decrease")}
                        >
                          <Minus aria-hidden="true" />
                        </Button>
                        <Input
                          type="number"
                          step="1"
                          min="1"
                          value={line.quantity}
                          onChange={(event) => onUpdateQuantity(index, Number(event.target.value))}
                          className="h-6 w-10 px-1 text-center text-xs md:text-xs"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon-xs"
                          onClick={() => onUpdateQuantity(index, line.quantity + 1)}
                          aria-label={t("cart.increase")}
                        >
                          <Plus aria-hidden="true" />
                        </Button>
                      </div>
                    )}
                  </TableCell>

                  <TableCell className="px-1.5 py-1.5 text-right align-top text-xs tabular-nums">
                    ৳ {line.unitPrice.toLocaleString("en-BD")}
                  </TableCell>

                  <TableCell className="px-1.5 py-1.5 align-top">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={line.discountAmount}
                      onChange={(event) => onUpdateDiscount(index, Number(event.target.value))}
                      aria-label={t("cart.discount")}
                      className="h-6 w-14 px-1.5 text-xs md:text-xs"
                    />
                  </TableCell>

                  <TableCell className="px-1.5 py-1.5 text-right align-top text-[13px] font-medium tabular-nums">
                    ৳ {subtotal.toLocaleString("en-BD")}
                  </TableCell>

                  <TableCell className="px-1 py-1.5 align-top">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => onRemove(index)}
                      aria-label={t("cart.remove")}
                    >
                      <Trash2 aria-hidden="true" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

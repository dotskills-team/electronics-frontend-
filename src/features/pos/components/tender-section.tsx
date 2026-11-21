"use client";

import { useTranslations } from "next-intl";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { TenderLine } from "@/features/pos/hooks/use-tender";
import type { SalePaymentMethod } from "@/types/sale";

const PAYMENT_METHODS: SalePaymentMethod[] = ["CASH", "CARD", "BKASH", "NAGAD", "DUE"];

interface TenderSectionProps {
  lines: TenderLine[];
  total: number;
  entered: number;
  onAddLine: () => void;
  onUpdateMethod: (id: string, method: SalePaymentMethod) => void;
  onUpdateAmount: (id: string, amount: number) => void;
  onRemoveLine: (id: string) => void;
}

export function TenderSection({
  lines,
  total,
  entered,
  onAddLine,
  onUpdateMethod,
  onUpdateAmount,
  onRemoveLine,
}: TenderSectionProps) {
  const t = useTranslations("pos");
  const remaining = total - entered;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold">{t("tender.title")}</span>
        <Button type="button" variant="outline" size="xs" onClick={onAddLine}>
          <Plus aria-hidden="true" />
          {t("tender.addMethod")}
        </Button>
      </div>

      <div className="space-y-1.5">
        {lines.map((line) => (
          <div key={line.id} className="grid grid-cols-[5.25rem_minmax(0,1fr)_auto_auto] items-center gap-1.5">
            <Select value={line.method} onValueChange={(value) => onUpdateMethod(line.id, value as SalePaymentMethod)}>
              <SelectTrigger className="h-8 w-full px-2 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((method) => (
                  <SelectItem key={method} value={method}>
                    {t(`paymentMethod.${method}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="relative w-full min-w-0">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">৳</span>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={line.amount}
                onChange={(event) => onUpdateAmount(line.id, Number(event.target.value))}
                className="h-8 w-full min-w-0 pl-6 text-xs md:text-xs"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 px-2 text-xs whitespace-nowrap"
              title={t("tender.fillRemaining")}
              aria-label={t("tender.fillRemaining")}
              onClick={() => onUpdateAmount(line.id, Math.max(0, remaining + line.amount))}
            >
              {t("tender.fillShort")}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => onRemoveLine(line.id)}
              disabled={lines.length <= 1}
              aria-label={t("tender.remove")}
            >
              <Trash2 aria-hidden="true" />
            </Button>
          </div>
        ))}
      </div>

      <div className="space-y-0.5 border-t border-border pt-1.5 text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t("tender.total")}</span>
          <span className="tabular-nums">৳ {total.toLocaleString("en-BD")}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t("tender.entered")}</span>
          <span className="tabular-nums">৳ {entered.toLocaleString("en-BD")}</span>
        </div>
        <div className="flex justify-between text-[13px] font-semibold">
          <span>{t("tender.remaining")}</span>
          <span className={`tabular-nums ${Math.abs(remaining) < 0.01 ? "text-success" : "text-warning"}`}>
            ৳ {remaining.toLocaleString("en-BD")}
          </span>
        </div>
      </div>
    </div>
  );
}

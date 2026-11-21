"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ShoppingBag, TrendingUp } from "lucide-react";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { cn } from "@/lib/utils";

import { resolvePresetRange } from "@/features/dashboard/lib/date-presets";
import { useListPosTopSellingQuery } from "@/features/pos/api/pos-insights.api";
import { formatQuantity } from "@/features/pos/lib/format-quantity";
import type { PosTopSellingItem } from "@/types/pos-insights";

type Period = "today" | "last7Days" | "thisMonth";
const PERIODS: Period[] = ["today", "last7Days", "thisMonth"];
const TOP_N = 10;

interface PosTopSellingDialogProps {
  companyId: string;
  locationId: string;
  locationName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Best sellers at the current Location, ranked by quantity sold (base unit, completed sales only). Mounts its body only while open so the period resets and nothing loads in the background. */
export function PosTopSellingDialog({ open, onOpenChange, ...rest }: PosTopSellingDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[88dvh] w-[calc(100%-1rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-xl">
        {open && <PosTopSellingBody {...rest} />}
      </DialogContent>
    </Dialog>
  );
}

function PosTopSellingBody({ companyId, locationId, locationName }: Omit<PosTopSellingDialogProps, "open" | "onOpenChange">) {
  const t = useTranslations("pos");
  const [period, setPeriod] = useState<Period>("today");
  const range = useMemo(() => resolvePresetRange(period), [period]);

  const { data, isLoading, isFetching, error, refetch } = useListPosTopSellingQuery(
    { companyId, locationId, dateFrom: range?.dateFrom ?? "", dateTo: range?.dateTo ?? "", limit: TOP_N },
    { skip: !range, refetchOnMountOrArgChange: true },
  );

  const items = data ?? [];
  const maxSold = items.reduce((max, item) => Math.max(max, Number(item.soldQuantity)), 0);

  return (
    <>
      <DialogHeader className="space-y-1.5 border-b border-border px-4 py-4 pr-12 sm:px-5">
        <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="size-4" aria-hidden="true" />
          </span>
          {t("insights.top.title")}
        </DialogTitle>
        <DialogDescription>{t("insights.top.description", { location: locationName })}</DialogDescription>

        <Tabs value={period} onValueChange={(value) => setPeriod(value as Period)} className="pt-1">
          <TabsList className="w-full sm:w-fit">
            {PERIODS.map((p) => (
              <TabsTrigger key={p} value={p} className="flex-1 sm:flex-none">
                {t(`insights.top.periods.${p}`)}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </DialogHeader>

      <div className="min-h-0 flex-1 overflow-y-auto" aria-busy={isFetching}>
        {isLoading ? (
          <TopSellingSkeleton />
        ) : error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : items.length === 0 ? (
          <EmptyState icon={ShoppingBag} title={t("insights.top.empty")} />
        ) : (
          <ol className={cn("divide-y divide-border transition-opacity", isFetching && "opacity-60")}>
            {items.map((item) => (
              <TopSellingRow key={`${item.productId}:${item.variantId ?? ""}`} item={item} maxSold={maxSold} />
            ))}
          </ol>
        )}
      </div>
    </>
  );
}

const RANK_STYLES: Record<number, string> = {
  1: "bg-amber-400/20 text-amber-700 dark:text-amber-300",
  2: "bg-slate-400/20 text-slate-600 dark:text-slate-300",
  3: "bg-orange-500/15 text-orange-700 dark:text-orange-300",
};

function TopSellingRow({ item, maxSold }: { item: PosTopSellingItem; maxSold: number }) {
  const t = useTranslations("pos");
  const sold = Number(item.soldQuantity);
  const share = maxSold > 0 ? Math.max(4, (sold / maxSold) * 100) : 0;

  return (
    <li className="flex items-center gap-3 px-4 py-3 sm:px-5">
      <span
        className={cn(
          "grid size-8 shrink-0 place-items-center rounded-full text-sm font-semibold tabular-nums",
          RANK_STYLES[item.rank] ?? "bg-muted text-muted-foreground",
        )}
        aria-label={t("insights.top.rank", { rank: item.rank })}
      >
        {item.rank}
      </span>

      <div className="min-w-0 flex-1">
        <p className="break-words text-sm font-medium leading-snug">{item.name}</p>
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted" role="presentation">
          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${share}%` }} />
        </div>
      </div>

      <div className="shrink-0 text-right">
        <p className="text-base font-semibold tabular-nums leading-tight">
          {formatQuantity(item.soldQuantity)}
          {item.unitCode && <span className="ml-1 text-xs font-normal text-muted-foreground">{item.unitCode}</span>}
        </p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">{t("insights.top.sales", { count: item.saleCount })}</p>
      </div>
    </li>
  );
}

function TopSellingSkeleton() {
  return (
    <ol className="divide-y divide-border" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, i) => (
        <li key={i} className="flex items-center gap-3 px-4 py-3 sm:px-5">
          <Skeleton className="size-8 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-1.5 w-full" />
          </div>
          <Skeleton className="h-8 w-14" />
        </li>
      ))}
    </ol>
  );
}

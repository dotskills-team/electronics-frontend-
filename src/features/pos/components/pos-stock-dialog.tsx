"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle, Boxes, ChevronLeft, ChevronRight, PackageCheck, PackageSearch, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { cn } from "@/lib/utils";

import { useGetPosStockSummaryQuery, useListPosStockQuery } from "@/features/pos/api/pos-insights.api";
import { formatQuantity } from "@/features/pos/lib/format-quantity";
import type { PosStockItem } from "@/types/pos-insights";

export type PosStockMode = "low" | "all";

const PAGE_SIZE = 20;

interface PosStockDialogProps {
  companyId: string;
  locationId: string;
  locationName: string;
  mode: PosStockMode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Two views of the same data: "low" = items below their reorder level (most
 * urgent first), "all" = every active product A-Z. The body only mounts while
 * the dialog is open, so closing it resets search/page and nothing is fetched
 * in the background.
 */
export function PosStockDialog({ open, onOpenChange, ...rest }: PosStockDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[88dvh] w-[calc(100%-1rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        {open && <PosStockDialogBody {...rest} />}
      </DialogContent>
    </Dialog>
  );
}

function PosStockDialogBody({ companyId, locationId, locationName, mode }: Omit<PosStockDialogProps, "open" | "onOpenChange">) {
  const t = useTranslations("pos");
  const isLow = mode === "low";

  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput.trim(), 300);
  const [page, setPage] = useState(1);

  const { data: summary } = useGetPosStockSummaryQuery({ companyId, locationId });
  const { data, isLoading, isFetching, error, refetch } = useListPosStockQuery(
    { companyId, locationId, lowOnly: isLow, search, page, limit: PAGE_SIZE },
    { refetchOnMountOrArgChange: true },
  );

  const items = data?.items ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = Math.max(1, data?.meta?.totalPages ?? 1);
  const TitleIcon = isLow ? AlertTriangle : Boxes;

  return (
    <>
      <DialogHeader className="space-y-1.5 border-b border-border px-4 py-4 pr-12 sm:px-5">
        <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
          <span
            className={cn(
              "grid size-8 shrink-0 place-items-center rounded-lg",
              isLow ? "bg-amber-500/15 text-amber-600 dark:text-amber-400" : "bg-primary/10 text-primary",
            )}
          >
            <TitleIcon className="size-4" aria-hidden="true" />
          </span>
          {isLow ? t("insights.stock.lowTitle") : t("insights.stock.allTitle")}
        </DialogTitle>
        <DialogDescription>{t("insights.stock.description", { location: locationName })}</DialogDescription>

        {summary && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            <Badge variant="secondary">{t("insights.stock.chipItems", { count: summary.totalItems })}</Badge>
            <Badge
              variant={summary.lowStockCount > 0 ? "outline" : "secondary"}
              className={summary.lowStockCount > 0 ? "border-amber-500/40 text-amber-700 dark:text-amber-400" : undefined}
            >
              {t("insights.stock.chipLow", { count: summary.lowStockCount })}
            </Badge>
            <Badge variant={summary.outOfStockCount > 0 ? "destructive" : "secondary"}>
              {t("insights.stock.chipOut", { count: summary.outOfStockCount })}
            </Badge>
          </div>
        )}
      </DialogHeader>

      <div className="border-b border-border px-4 py-3 sm:px-5">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            value={searchInput}
            onChange={(event) => {
              setSearchInput(event.target.value);
              setPage(1);
            }}
            placeholder={t("insights.stock.searchPlaceholder")}
            aria-label={t("insights.stock.searchPlaceholder")}
            className="pl-9"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto" aria-busy={isFetching}>
        {isLoading ? (
          <StockListSkeleton />
        ) : error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : items.length === 0 ? (
          search ? (
            <EmptyState icon={PackageSearch} title={t("insights.stock.emptySearch", { term: search })} />
          ) : (
            <EmptyState
              icon={isLow ? PackageCheck : PackageSearch}
              title={isLow ? t("insights.stock.emptyLow") : t("insights.stock.empty")}
            />
          )
        ) : (
          <ul className={cn("divide-y divide-border transition-opacity", isFetching && "opacity-60")}>
            {items.map((item) => (
              <StockRow key={`${item.productId}:${item.variantId ?? ""}`} item={item} showBar={isLow} />
            ))}
          </ul>
        )}
      </div>

      {!error && total > 0 && (
        <div className="flex items-center justify-between gap-2 border-t border-border bg-muted/30 px-4 py-2.5 sm:px-5">
          <p className="text-xs text-muted-foreground">
            {t("insights.stock.pageOf", { page, totalPages })} · {t("insights.stock.totalResults", { count: total })}
          </p>
          <div className="flex gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1 || isFetching}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              aria-label={t("insights.stock.previous")}
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">{t("insights.stock.previous")}</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= totalPages || isFetching}
              onClick={() => setPage((p) => p + 1)}
              aria-label={t("insights.stock.next")}
            >
              <span className="hidden sm:inline">{t("insights.stock.next")}</span>
              <ChevronRight className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

function StockRow({ item, showBar }: { item: PosStockItem; showBar: boolean }) {
  const t = useTranslations("pos");
  const quantity = Number(item.quantity);
  const reorderLevel = Number(item.reorderLevel);
  // How full the shelf is relative to where it should be restocked — only
  // meaningful (and only drawn) in the low-stock list.
  const fill = reorderLevel > 0 ? Math.min(100, Math.max(0, (quantity / reorderLevel) * 100)) : 0;

  return (
    <li className="flex items-center gap-3 px-4 py-3 sm:px-5">
      <div className="min-w-0 flex-1">
        <p className="break-words text-sm font-medium leading-snug">{item.name}</p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{t("insights.stock.sku", { sku: item.sku })}</p>
        {showBar && (
          <div
            className="mt-2 h-1.5 w-full max-w-[11rem] overflow-hidden rounded-full bg-muted"
            role="presentation"
          >
            <div
              className={cn("h-full rounded-full", item.isOutOfStock ? "bg-destructive" : "bg-amber-500")}
              style={{ width: `${Math.max(fill, item.isOutOfStock ? 0 : 4)}%` }}
            />
          </div>
        )}
      </div>

      <div className="shrink-0 text-right">
        <p
          className={cn(
            "text-base font-semibold tabular-nums leading-tight",
            item.isOutOfStock && "text-destructive",
            !item.isOutOfStock && item.isLow && "text-amber-600 dark:text-amber-400",
          )}
        >
          {formatQuantity(item.quantity)}
          {item.unitCode && <span className="ml-1 text-xs font-normal text-muted-foreground">{item.unitCode}</span>}
        </p>
        <div className="mt-1 flex justify-end">
          {item.isOutOfStock ? (
            <Badge variant="destructive">{t("insights.stock.outOfStock")}</Badge>
          ) : item.isLow ? (
            <Badge variant="outline" className="border-amber-500/40 text-amber-700 dark:text-amber-400">
              {t("insights.stock.low")}
            </Badge>
          ) : (
            <span className="text-[11px] text-muted-foreground">
              {t("insights.stock.reorderAt", { level: formatQuantity(item.reorderLevel) })}
            </span>
          )}
        </div>
        {(item.isLow || item.isOutOfStock) && (
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {t("insights.stock.reorderAt", { level: formatQuantity(item.reorderLevel) })}
          </p>
        )}
      </div>
    </li>
  );
}

function StockListSkeleton() {
  return (
    <ul className="divide-y divide-border" aria-hidden="true">
      {Array.from({ length: 6 }).map((_, i) => (
        <li key={i} className="flex items-center gap-3 px-4 py-3 sm:px-5">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <div className="space-y-2">
            <Skeleton className="ml-auto h-5 w-14" />
            <Skeleton className="ml-auto h-4 w-16" />
          </div>
        </li>
      ))}
    </ul>
  );
}

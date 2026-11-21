"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle, Boxes, TrendingUp, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

import { useGetPosStockSummaryQuery } from "@/features/pos/api/pos-insights.api";
import { PosStockDialog, type PosStockMode } from "@/features/pos/components/pos-stock-dialog";
import { PosTopSellingDialog } from "@/features/pos/components/pos-top-selling-dialog";

type OpenDialog = "low" | "all" | "top" | null;

interface PosInsightsBarProps {
  companyId: string;
  locationId: string;
  locationName: string;
}

/**
 * Three quick-look buttons on the POS screen — Low stock, Total stock, Top
 * selling — each opening a modal for the Location currently selected. The
 * badges come from one tiny summary query; the lists themselves only load
 * when a modal is opened. Three equal columns on a phone (icon above label),
 * icon-beside-label on wider screens.
 */
export function PosInsightsBar({ companyId, locationId, locationName }: PosInsightsBarProps) {
  const t = useTranslations("pos");
  const [open, setOpen] = useState<OpenDialog>(null);
  const { data: summary } = useGetPosStockSummaryQuery({ companyId, locationId });

  const low = summary?.lowStockCount ?? 0;

  return (
    <>
      <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:flex lg:min-w-0 lg:flex-wrap lg:justify-end lg:gap-1.5" role="group" aria-label={t("insights.groupLabel")}>
        <InsightButton
          icon={AlertTriangle}
          label={t("insights.lowStock")}
          hint={summary ? (low > 0 ? t("insights.lowStockHint", { count: low }) : t("insights.lowStockAllGood")) : "…"}
          count={summary ? low : undefined}
          tone={low > 0 ? "warning" : "success"}
          alert={low > 0}
          onClick={() => setOpen("low")}
        />
        <InsightButton
          icon={Boxes}
          label={t("insights.totalStock")}
          hint={summary ? t("insights.totalStockHint", { count: summary.totalItems }) : "…"}
          count={summary?.totalItems}
          tone="primary"
          onClick={() => setOpen("all")}
        />
        <InsightButton
          icon={TrendingUp}
          label={t("insights.topSelling")}
          hint={t("insights.topSellingHint")}
          tone="success"
          onClick={() => setOpen("top")}
        />
      </div>

      <PosStockDialog
        companyId={companyId}
        locationId={locationId}
        locationName={locationName}
        mode={(open === "all" ? "all" : "low") satisfies PosStockMode}
        open={open === "low" || open === "all"}
        onOpenChange={(next) => !next && setOpen(null)}
      />
      <PosTopSellingDialog
        companyId={companyId}
        locationId={locationId}
        locationName={locationName}
        open={open === "top"}
        onOpenChange={(next) => !next && setOpen(null)}
      />
    </>
  );
}

const TONES = {
  primary: "bg-primary/10 text-primary",
  warning: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  success: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
} as const;

function InsightButton({
  icon: Icon,
  label,
  hint,
  count,
  tone,
  alert = false,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  hint: string;
  count?: number;
  tone: keyof typeof TONES;
  /** Draws attention (amber ring + count) — used when something needs restocking. */
  alert?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex min-w-0 flex-col items-center gap-1.5 rounded-xl border bg-card p-2.5 text-center shadow-xs transition-colors",
        "hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
        "sm:flex-row sm:gap-3 sm:p-3 sm:text-left",
        "lg:gap-2 lg:px-2 lg:py-1.5 lg:pr-2.5",
        alert ? "border-amber-500/40" : "border-border",
      )}
    >
      <span className={cn("grid size-9 shrink-0 place-items-center rounded-lg sm:size-10 lg:size-7", TONES[tone])}>
        <Icon className="size-[18px] sm:size-5 lg:size-4" aria-hidden="true" />
      </span>

      <span className="min-w-0 sm:flex-1">
        <span className="block truncate text-xs font-semibold sm:text-sm lg:text-xs">{label}</span>
        <span className="hidden truncate text-xs text-muted-foreground sm:block lg:hidden">{hint}</span>
      </span>

      {count !== undefined && (
        <span
          className={cn(
            "absolute right-1.5 top-1.5 grid min-w-5 place-items-center rounded-full px-1.5 text-[11px] font-semibold tabular-nums leading-5",
            "sm:static sm:min-w-6 sm:text-xs",
            alert ? "bg-amber-500 text-white" : "bg-muted text-muted-foreground",
          )}
          aria-hidden="true"
        >
          {count}
        </span>
      )}
    </button>
  );
}

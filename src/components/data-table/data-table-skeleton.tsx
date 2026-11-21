import { Skeleton } from "@/components/ui/skeleton";

export function DataTableSkeleton({ columnCount, rowCount = 6 }: { columnCount: number; rowCount?: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="divide-y divide-border">
        {Array.from({ length: rowCount }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex items-center gap-3 px-3 py-2.5">
            {Array.from({ length: columnCount }).map((__, colIndex) => (
              <Skeleton key={colIndex} className="h-3.5 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

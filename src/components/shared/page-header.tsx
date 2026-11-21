export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 border-b border-border bg-background px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4 lg:py-2.5">
      <div className="min-w-0">
        <h1 className="text-lg font-semibold tracking-tight text-foreground text-balance sm:text-xl">{title}</h1>
        {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

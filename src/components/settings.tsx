import { Link, type LinkProps } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// Building blocks for settings pages, after Cal.com's: a plain header per page and one
// card whose footer holds the save button

export function SettingsNav({
  items,
}: {
  items: ReadonlyArray<{ title: string; to: LinkProps["to"]; exact?: boolean }>;
}) {
  return (
    <nav className="flex gap-1 overflow-x-auto">
      {items.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          activeOptions={{ exact: item.exact }}
          className="shrink-0 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground data-[status=active]:bg-accent data-[status=active]:font-medium data-[status=active]:text-foreground"
        >
          {item.title}
        </Link>
      ))}
    </nav>
  );
}

export function SettingsHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4 border-b pb-6">
      <div>
        <h1 className="text-xl font-semibold">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {actions}
    </div>
  );
}

// Bordered card; pass `footer` for forms that save, leave it off for instant settings
export function SettingsCard({
  children,
  footer,
  className,
}: {
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("overflow-hidden rounded-xl border bg-card", className)}>
      <div className="space-y-6 p-6">{children}</div>
      {footer && (
        <div className="flex items-center justify-between gap-4 border-t bg-muted/40 px-6 py-3">
          {footer}
        </div>
      )}
    </div>
  );
}

// Hint on the left, Discard + Update on the right; Update stays put and enables when dirty
export function SaveFooter({
  hint,
  dirty,
  pending,
  onSave,
  onDiscard,
}: {
  hint?: React.ReactNode;
  dirty: boolean;
  pending: boolean;
  onSave: () => void;
  onDiscard: () => void;
}) {
  return (
    <>
      <p className="text-sm text-muted-foreground">{hint}</p>
      <div className="flex shrink-0 gap-2">
        {dirty && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDiscard}
            disabled={pending}
          >
            Discard
          </Button>
        )}
        <Button size="sm" onClick={onSave} disabled={!dirty || pending}>
          {pending && <Loader2 className="animate-spin" />}
          Update
        </Button>
      </div>
    </>
  );
}

export function Field({
  htmlFor,
  label,
  hint,
  children,
  className,
}: {
  htmlFor?: string;
  label: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

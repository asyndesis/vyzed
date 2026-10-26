import { Link, useMatchRoute, type LinkProps } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Field as FieldRoot,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field";

// Building blocks for settings pages, after Cal.com's: a plain header per page and one
// card whose footer holds the save button

export function SettingsNav({
  items,
}: {
  items: ReadonlyArray<{ title: string; to: LinkProps["to"]; exact?: boolean }>;
}) {
  const matchRoute = useMatchRoute();
  return (
    <nav className="flex gap-1 overflow-x-auto">
      {items.map((item) => (
        <Button
          key={item.to}
          variant={
            matchRoute({ to: item.to, fuzzy: !item.exact })
              ? "secondary"
              : "ghost"
          }
          size="sm"
          render={<Link to={item.to} />}
          nativeButton={false}
        >
          {item.title}
        </Button>
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
    <FieldRoot className={className}>
      <FieldLabel htmlFor={htmlFor}>{label}</FieldLabel>
      {children}
      {hint && <FieldDescription>{hint}</FieldDescription>}
    </FieldRoot>
  );
}

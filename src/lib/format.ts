import { format, isToday, isTomorrow } from "date-fns";

export type Person = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  lastInitial?: string | null;
  image?: string | null;
};

// Full last name when we have it (yourself), otherwise the public initial
export const fullName = (p?: Person | null) =>
  [p?.firstName, p?.lastName ?? (p?.lastInitial && `${p.lastInitial}.`)]
    .filter(Boolean)
    .join(" ") || "Unnamed";

export const initials = (p?: Person | null) =>
  `${p?.firstName?.[0] ?? ""}${(p?.lastName ?? p?.lastInitial)?.[0] ?? ""}`.toUpperCase() ||
  "?";

// Prices are stored in cents; 0 means free (returns null)
export const formatPrice = (cents: number, currency = "EUR") =>
  cents
    ? new Intl.NumberFormat(undefined, {
        style: "currency",
        currency,
        maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
      }).format(cents / 100)
    : null;

export const friendlyDay = (date: string | Date) => {
  const d = new Date(date);
  if (isToday(d)) return "Today";
  if (isTomorrow(d)) return "Tomorrow";
  return format(d, "EEE, MMM d");
};

export const timeRange = (start: string | Date, end: string | Date) =>
  `${format(new Date(start), "HH:mm")}–${format(new Date(end), "HH:mm")}`;

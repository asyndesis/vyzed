import { format, isToday, isTomorrow, isPast } from "date-fns";

export const fullName = (u) =>
  [u?.firstName, u?.lastName ?? u?.lastInitial].filter(Boolean).join(" ") ||
  "Unnamed";

export const initials = (u) =>
  `${u?.firstName?.[0] ?? ""}${(u?.lastName ?? u?.lastInitial)?.[0] ?? ""}`.toUpperCase() ||
  "?";

// Prices are stored in cents
export const formatPrice = (amount, currency = "EUR") =>
  amount
    ? new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: currency || "EUR",
        maximumFractionDigits: amount % 100 === 0 ? 0 : 2,
      }).format(amount / 100)
    : null;

export const friendlyDay = (date) => {
  const d = new Date(date);
  if (isToday(d)) return "Today";
  if (isTomorrow(d)) return "Tomorrow";
  return format(d, "EEE, MMM d");
};

export const timeRange = (start, end) =>
  `${format(new Date(start), "HH:mm")}–${format(new Date(end), "HH:mm")}`;

export const isPastDate = (date) => isPast(new Date(date));

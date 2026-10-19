export function formatPrice(cents: number, currency: string) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(cents / 100);
}

export const minutesToTime = (m: number) =>
  `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

export function timeToMinutes(value: string) {
  const [h = 0, m = 0] = value.split(":").map(Number);
  return h * 60 + m;
}

export const browserTimeZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

/** Local calendar-day key (YYYY-MM-DD) in the viewer's time zone. */
export const dayKey = (d: Date) =>
  new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit" }).format(d);

export const formatDay = (d: Date) =>
  d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });

export const formatTime = (d: Date) =>
  d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

export const formatDateTime = (d: Date) =>
  d.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

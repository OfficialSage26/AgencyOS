// Philippines-based formatting defaults. Using an explicit locale + timezone
// keeps dates, times, and money consistent no matter where the app is deployed.
export const PH_LOCALE = "en-PH";
export const PH_TIMEZONE = "Asia/Manila";
export const PH_CURRENCY = "PHP";

export function formatDate(date: Date): string {
  return date.toLocaleDateString(PH_LOCALE, {
    timeZone: PH_TIMEZONE,
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString(PH_LOCALE, {
    timeZone: PH_TIMEZONE,
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatDateTime(date: Date): string {
  return `${formatDate(date)} · ${formatTime(date)}`;
}

export function formatMonth(date: Date): string {
  return date.toLocaleString(PH_LOCALE, { timeZone: PH_TIMEZONE, month: "short" });
}

// Produce the "YYYY-MM-DDTHH:mm" value a datetime-local input expects, rendered
// in Manila time so edit forms show the correct local wall-clock anywhere.
export function toDateTimeLocalManila(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: PH_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

// Day-of-month and short month respecting Manila time (for date chips).
export function manilaDayParts(date: Date): { month: string; day: string } {
  const month = date
    .toLocaleString(PH_LOCALE, { timeZone: PH_TIMEZONE, month: "short" })
    .toUpperCase();
  const day = date.toLocaleString(PH_LOCALE, { timeZone: PH_TIMEZONE, day: "numeric" });
  return { month, day };
}

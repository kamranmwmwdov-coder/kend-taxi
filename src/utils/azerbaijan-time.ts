const AZERBAIJAN_OFFSET_MINUTES = 4 * 60;

export function azerbaijanDateTimeLocalToUtcIso(value: string) {
  if (/[zZ]|[+-]\d{2}:\d{2}$/.test(value)) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) throw new Error("Invalid advertisement date");
    return date.toISOString();
  }

  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (!match) throw new Error("Invalid advertisement date");

  const [, year, month, day, hour, minute, second = "0"] = match;
  const utcMs =
    Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second)) -
    AZERBAIJAN_OFFSET_MINUTES * 60 * 1000;

  return new Date(utcMs).toISOString();
}

export function nowUtcIso() {
  return new Date().toISOString();
}

export function formatAzerbaijanDateTime(value: string) {
  return new Intl.DateTimeFormat("az-AZ", {
    timeZone: "Asia/Baku",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

const WEEKDAY_LABEL_AZ: Record<number, string> = {
  0: "Bazar",
  1: "Bazar ertəsi",
  2: "Çərşənbə axşamı",
  3: "Çərşənbə",
  4: "Cümə axşamı",
  5: "Cümə",
  6: "Şənbə",
};

/**
 * Formats a plain "date" column (e.g. Postgres `date`, no time/timezone component,
 * such as baku_trip_orders.trip_date) as "Həftə günü, GG.AA.YYYY". Parses the
 * YYYY-MM-DD string directly as UTC to avoid off-by-one-day shifts from the
 * viewer's local timezone.
 */
export function formatTripDateWithWeekday(dateOnly: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateOnly ?? "");
  if (!match) return dateOnly;
  const [, year, month, day] = match;
  const utcDate = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  const weekday = WEEKDAY_LABEL_AZ[utcDate.getUTCDay()];
  return `${weekday}, ${day}.${month}.${year}`;
}

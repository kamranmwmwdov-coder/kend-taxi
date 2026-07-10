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

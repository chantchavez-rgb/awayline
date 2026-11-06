export function isValidTimeZone(timeZone: string): boolean {
  try {
    Intl.DateTimeFormat("en-US", { timeZone });
    return true;
  } catch {
    return false;
  }
}

function zonedParts(date: Date, timeZone: string): Record<string, string> {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date);
  const map: Record<string, string> = {};
  for (const part of parts) {
    if (part.type !== "literal") map[part.type] = part.value;
  }
  return map;
}

function offsetMinutes(date: Date, timeZone: string): number {
  const map = zonedParts(date, timeZone);
  const asUtc = Date.UTC(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    Number(map.hour),
    Number(map.minute),
    Number(map.second),
  );
  return (asUtc - date.getTime()) / 60000;
}

export function zonedDateTimeToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string,
): Date {
  let utc = Date.UTC(year, month - 1, day, hour, minute, 0);
  for (let pass = 0; pass < 2; pass += 1) {
    const offset = offsetMinutes(new Date(utc), timeZone);
    utc = Date.UTC(year, month - 1, day, hour, minute, 0) - offset * 60000;
  }
  return new Date(utc);
}

export function endOfDayIso(now: Date, timeZone: string): string {
  const zone = isValidTimeZone(timeZone) ? timeZone : "UTC";
  const parts = zonedParts(now, zone);
  return zonedDateTimeToUtc(
    Number(parts.year),
    Number(parts.month),
    Number(parts.day),
    23,
    59,
    zone,
  ).toISOString();
}

export function formatUntil(iso: string, timeZone: string, now = new Date()): string {
  const date = new Date(iso);
  const zone = isValidTimeZone(timeZone) ? timeZone : "UTC";
  const day = new Intl.DateTimeFormat("en-US", {
    timeZone: zone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const sameDay = day.format(date) === day.format(now);
  if (sameDay) {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: zone,
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    }).format(date);
  }
  return new Intl.DateTimeFormat("en-US", {
    timeZone: zone,
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(date);
}

export function formatUpdated(iso: string, now = Date.now()): string {
  const delta = Math.max(0, now - new Date(iso).getTime());
  const minutes = Math.round(delta / 60000);
  if (minutes < 1) return "Updated just now";
  if (minutes < 60) return `Updated ${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `Updated ${hours} hr ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return "Updated 1 day ago";
  return `Updated ${days} days ago`;
}

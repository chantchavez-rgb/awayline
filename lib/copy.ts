import { formatUntil, isValidTimeZone } from "./time";

export const REASONS = [
  { id: "driving", label: "Driving", line: "I'm driving and can't answer right now." },
  { id: "meeting", label: "In a meeting", line: "I'm in a meeting and can't answer right now." },
  { id: "work", label: "At work", line: "I'm at work and can't answer right now." },
  { id: "sleeping", label: "Sleeping", line: "I'm sleeping. I'll reply when I'm up." },
  { id: "vacation", label: "Away", line: "I'm away from my phone." },
  { id: "busy", label: "Busy", line: "I'm tied up and can't answer right now." },
  { id: "custom", label: "Custom", line: "" },
] as const;

export type ReasonId = (typeof REASONS)[number]["id"];

export const COOLDOWNS = [
  { minutes: 15, label: "15 minutes" },
  { minutes: 60, label: "1 hour" },
  { minutes: 360, label: "6 hours" },
  { minutes: 1440, label: "24 hours" },
] as const;

export type CooldownMinutes = (typeof COOLDOWNS)[number]["minutes"];

export type StatusInput = {
  active: boolean;
  reason: ReasonId;
  note: string;
  until: string | null;
  timeZone: string;
  name: string;
};

export function reasonById(id: string) {
  return REASONS.find((reason) => reason.id === id);
}

export function asReason(id: string): ReasonId {
  return reasonById(id)?.id ?? "busy";
}

export function asCooldown(minutes: number): CooldownMinutes {
  const match = COOLDOWNS.find((item) => item.minutes === minutes);
  return match?.minutes ?? 360;
}

type Parts = { base: string; until: string | null; signature: string | null };

export function composeParts(status: StatusInput, now = Date.now()): Parts | null {
  if (!status.active) return null;
  const reason = reasonById(status.reason);
  if (!reason) return null;
  if (status.until) {
    const ends = new Date(status.until).getTime();
    if (Number.isNaN(ends) || ends <= now) return null;
  }
  const note = status.note.trim();
  const base = note || reason.line;
  if (!base) return null;
  const until =
    status.until && isValidTimeZone(status.timeZone)
      ? formatUntil(status.until, status.timeZone, new Date(now))
      : status.until
        ? formatUntil(status.until, "UTC", new Date(now))
        : null;
  const signature = status.name.trim() || null;
  return { base, until, signature };
}

export function joinReply(parts: Parts): string {
  return [parts.base, parts.until ? `Back ${parts.until}.` : "", parts.signature ? `— ${parts.signature}` : ""]
    .filter(Boolean)
    .join(" ");
}

export function composeReply(status: StatusInput, now = Date.now()): string | null {
  const parts = composeParts(status, now);
  if (!parts) return null;
  return joinReply(parts);
}

export function present(status: StatusInput, now = Date.now()) {
  const parts = composeParts(status, now);
  if (!parts) {
    return {
      live: false as const,
      label: "Reachable",
      base: "No away status on this number.",
      untilLabel: null as string | null,
      reply: null as string | null,
    };
  }
  const label = status.reason === "custom" ? "Away" : (reasonById(status.reason)?.label ?? "Away");
  return {
    live: true as const,
    label,
    base: parts.base,
    untilLabel: parts.until,
    reply: joinReply(parts),
  };
}

const YEAR_MS = 366 * 24 * 60 * 60 * 1000;

export function validateStatus(status: StatusInput, now = Date.now()): string | null {
  if (!isValidTimeZone(status.timeZone)) return "That timezone isn't recognized.";
  if (status.name.trim().length > 40) return "Keep the name under 40 characters.";
  if (status.note.trim().length > 240) return "Keep the note under 240 characters.";
  if (!reasonById(status.reason)) return "Pick a reason.";
  if (status.active && !status.note.trim() && !reasonById(status.reason)?.line) {
    return "Write a note for a custom status.";
  }
  if (status.until) {
    const ends = new Date(status.until).getTime();
    if (Number.isNaN(ends)) return "That end time isn't valid.";
    if (status.active && ends < now - 60_000) return "That end time has already passed.";
    if (ends > now + YEAR_MS) return "Pick an end time within a year.";
  }
  return null;
}

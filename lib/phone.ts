export function normalizePhone(input: string): string | null {
  const raw = input.trim().replace(/^tel:/i, "");
  if (!raw) return null;
  const hasPlus = raw.startsWith("+");
  const digits = raw.replace(/\D/g, "");
  if (hasPlus) {
    if (digits.length < 8 || digits.length > 15) return null;
    return `+${digits}`;
  }
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return null;
}

export function phoneDigits(e164: string): string {
  return e164.replace(/\D/g, "");
}

export function phoneFromParam(param: string): string | null {
  let decoded = param;
  try {
    decoded = decodeURIComponent(param);
  } catch {
    decoded = param;
  }
  const digits = decoded.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length >= 8 && digits.length <= 15) return `+${digits}`;
  return null;
}

export function formatPhone(e164: string): string {
  const digits = phoneDigits(e164);
  if (digits.length === 11 && digits.startsWith("1")) {
    const national = digits.slice(1);
    return `+1 (${national.slice(0, 3)}) ${national.slice(3, 6)}-${national.slice(6)}`;
  }
  return `+${digits}`;
}

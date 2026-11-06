import "server-only";

import { cookies, headers } from "next/headers";
import { cache } from "react";
import { userForSession, type UserRow } from "./db";

export const SESSION_COOKIE = "awayline";

export const currentUser = cache(async (): Promise<UserRow | null> => {
  const jar = await cookies();
  return userForSession(jar.get(SESSION_COOKIE)?.value);
});

export async function requestOrigin(): Promise<string> {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  return `${proto}://${host}`;
}

export function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  const host = req.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function readJson(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    return null;
  }
}

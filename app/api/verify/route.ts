import { verifyCode } from "@/lib/db";
import { readJson, sameOrigin, SESSION_COOKIE } from "@/lib/http";
import { normalizePhone } from "@/lib/phone";
import { cookies } from "next/headers";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  phone: z.string().min(7).max(32),
  code: z.string().regex(/^\d{6}$/),
  name: z.string().max(40).optional(),
});

export async function POST(req: Request) {
  if (!sameOrigin(req)) return Response.json({ error: "Bad origin." }, { status: 403 });
  const parsed = schema.safeParse(await readJson(req));
  if (!parsed.success) return Response.json({ error: "Enter the 6-digit code." }, { status: 400 });
  const phone = normalizePhone(parsed.data.phone);
  if (!phone) return Response.json({ error: "Enter a phone number with area code." }, { status: 400 });

  try {
    const result = await verifyCode(phone, parsed.data.code, parsed.data.name ?? "");
    if ("error" in result) return Response.json({ error: result.error }, { status: 401 });
    const jar = await cookies();
    jar.set(SESSION_COOKIE, result.session, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return Response.json({ ok: true });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Couldn't verify that code. Try again." }, { status: 500 });
  }
}

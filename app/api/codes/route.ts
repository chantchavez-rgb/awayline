import { issueCode } from "@/lib/db";
import { readJson, sameOrigin } from "@/lib/http";
import { formatPhone, normalizePhone } from "@/lib/phone";
import { sendLoginCode, smsReady } from "@/lib/sms";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({ phone: z.string().min(7).max(32) });

export async function POST(req: Request) {
  if (!sameOrigin(req)) return Response.json({ error: "Bad origin." }, { status: 403 });
  const parsed = schema.safeParse(await readJson(req));
  if (!parsed.success) return Response.json({ error: "Enter a phone number with area code." }, { status: 400 });
  const phone = normalizePhone(parsed.data.phone);
  if (!phone) return Response.json({ error: "Enter a phone number with area code." }, { status: 400 });

  if (process.env.NODE_ENV === "production" && !smsReady()) {
    return Response.json({ error: "Texting isn't set up on this server yet." }, { status: 503 });
  }

  try {
    const issued = await issueCode(phone);
    if ("error" in issued) return Response.json({ error: issued.error }, { status: 429 });

    if (!smsReady()) {
      return Response.json({ ok: true, formatted: formatPhone(phone), devCode: issued.code });
    }

    const sent = await sendLoginCode(phone, issued.code);
    if (sent.error) return Response.json({ error: sent.error }, { status: 502 });
    return Response.json({ ok: true, formatted: formatPhone(phone) });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Couldn't send the code. Try again." }, { status: 500 });
  }
}

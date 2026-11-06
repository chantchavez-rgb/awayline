import { updateStatus } from "@/lib/db";
import { currentUser, readJson, sameOrigin } from "@/lib/http";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  name: z.string().max(40),
  active: z.boolean(),
  reason: z.enum(["driving", "meeting", "work", "sleeping", "vacation", "busy", "custom"]),
  note: z.string().max(240),
  until: z.string().datetime().nullable(),
  timeZone: z.string().min(1).max(80),
  cooldownMinutes: z.union([z.literal(15), z.literal(60), z.literal(360), z.literal(1440)]),
});

export async function PUT(req: Request) {
  if (!sameOrigin(req)) return Response.json({ error: "Bad origin." }, { status: 403 });
  const user = await currentUser();
  if (!user) return Response.json({ error: "Sign in again." }, { status: 401 });
  const parsed = schema.safeParse(await readJson(req));
  if (!parsed.success) return Response.json({ error: "Check the status and try again." }, { status: 400 });

  try {
    const saved = await updateStatus(user.phone, parsed.data);
    if ("error" in saved) return Response.json({ error: saved.error }, { status: 400 });
    return Response.json({ ok: true, active: saved.active });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Couldn't save that status." }, { status: 500 });
  }
}

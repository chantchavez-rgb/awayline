import { rotateToken } from "@/lib/db";
import { currentUser, sameOrigin } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return Response.json({ error: "Bad origin." }, { status: 403 });
  const user = await currentUser();
  if (!user) return Response.json({ error: "Sign in again." }, { status: 401 });
  try {
    await rotateToken(user.phone);
    return Response.json({ ok: true });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Couldn't rotate the link." }, { status: 500 });
  }
}

import { takeReply } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function text(body: string) {
  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function tokenFrom(req: Request, url: URL): string {
  const header = req.headers.get("authorization");
  if (header?.toLowerCase().startsWith("bearer ")) return header.slice(7).trim();
  return url.searchParams.get("token") ?? "";
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  try {
    const reply = await takeReply(tokenFrom(req, url), url.searchParams.get("from") ?? "", url.searchParams.get("body") ?? "");
    return text(reply ?? "");
  } catch (error) {
    console.error(error);
    return text("");
  }
}

export async function POST(req: Request) {
  const url = new URL(req.url);
  let from = url.searchParams.get("from") ?? "";
  let body = url.searchParams.get("body") ?? "";
  let token = tokenFrom(req, url);
  try {
    const json = (await req.json().catch(() => null)) as { token?: string; from?: string; body?: string } | null;
    if (json && typeof json === "object") {
      if (typeof json.token === "string") token = json.token;
      if (typeof json.from === "string") from = json.from;
      if (typeof json.body === "string") body = json.body;
    }
    return text((await takeReply(token, from, body)) ?? "");
  } catch (error) {
    console.error(error);
    return text("");
  }
}

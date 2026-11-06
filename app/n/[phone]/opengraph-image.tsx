import { ImageResponse } from "next/og";
import { publicView } from "@/lib/db";
import { phoneFromParam } from "@/lib/phone";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const alt = "Awayline status";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage({ params }: { params: Promise<{ phone: string }> }) {
  const { phone } = await params;
  const e164 = phoneFromParam(phone);
  const view = e164 ? await publicView(e164) : null;
  const label = view?.live ? view.label : "Reachable";
  const detail = view ? (view.live ? view.base : view.base) : "That link is not a phone number.";
  const until = view?.live && view.untilLabel ? `Back ${view.untilLabel}` : "";
  const who = view?.formatted ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: view?.live ? "#f8efe8" : "#e7e1d4",
          color: "#1b1914",
          padding: "72px",
        }}
      >
        <div style={{ display: "flex", fontSize: 28, letterSpacing: 4 }}>AWAYLINE</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 84, fontWeight: 600, lineHeight: 1 }}>{label}</div>
          <div style={{ display: "flex", fontSize: 36, marginTop: 18, maxWidth: 980 }}>{detail.slice(0, 180)}</div>
          <div style={{ display: "flex", fontSize: 32, marginTop: 12 }}>{until || " "}</div>
        </div>
        <div style={{ display: "flex", fontSize: 30 }}>{who}</div>
      </div>
    ),
    { ...size },
  );
}

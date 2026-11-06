import type { Metadata } from "next";
import { publicView } from "@/lib/db";
import { requestOrigin } from "@/lib/http";
import { phoneFromParam } from "@/lib/phone";
import { formatUpdated } from "@/lib/time";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ phone: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { phone } = await params;
  const e164 = phoneFromParam(phone);
  if (!e164) return { title: "Not a number" };
  const view = await publicView(e164);
  const description = view.live
    ? [view.base, view.untilLabel ? `Back ${view.untilLabel}.` : ""].filter(Boolean).join(" ")
    : view.base;
  return {
    metadataBase: new URL(await requestOrigin()),
    title: view.live ? view.label : "Reachable",
    description,
    openGraph: { title: view.live ? view.label : "Reachable", description },
  };
}

export default async function StatusPage({ params }: Props) {
  const { phone } = await params;
  const e164 = phoneFromParam(phone);
  if (!e164) {
    return (
      <main className="public">
        <h1>That link is not a phone number.</h1>
      </main>
    );
  }

  const view = await publicView(e164);
  return (
    <main className={view.live ? "public sign away" : "public sign ok"}>
      <p className="sign-kicker">
        <span className="lamp" aria-hidden="true" />
        {view.live ? "On the line" : "Status"}
      </p>
      <h1>{view.label}</h1>
      {view.name ? <p className="until">{view.name}</p> : null}
      <p className="meta">{view.formatted}</p>
      <p className="lead">{view.base}</p>
      {view.untilLabel ? <p className="until">Back {view.untilLabel}</p> : null}
      {view.live && view.updatedAt ? <p className="meta">{formatUpdated(view.updatedAt)}</p> : null}
      <p className="meta">
        <a href="/">Put a status on your own number</a>
      </p>
    </main>
  );
}

import { StatusBoard } from "@/components/status-board";
import { ClaimForm } from "@/components/claim-form";
import { currentUser, requestOrigin } from "@/lib/http";
import { formatPhone, phoneDigits } from "@/lib/phone";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await currentUser();
  if (!user) {
    return (
      <section className="hero">
        <div>
          <p className="kicker">On your number</p>
          <h1>Leave the reason on your number.</h1>
          <p className="lead">
            When you can&apos;t answer, Awayline tells people why. One reply in Messages, and a link that shows the
            same reason.
          </p>
          <ol className="points">
            <li>
              <span className="num">1</span>
              <span>Verify the number you already use.</span>
            </li>
            <li>
              <span className="num">2</span>
              <span>Set the reason, a note, and when you&apos;ll be back.</span>
            </li>
            <li>
              <span className="num">3</span>
              <span>Add a Shortcut on your iPhone so the reply sends while you&apos;re away.</span>
            </li>
          </ol>
        </div>
        <ClaimForm />
      </section>
    );
  }

  const origin = await requestOrigin();
  return (
    <StatusBoard
      phoneFormatted={formatPhone(user.phone)}
      name={user.name}
      active={user.active}
      reason={user.reason}
      note={user.note}
      until={user.until}
      timeZone={user.timeZone}
      cooldownMinutes={user.cooldownMinutes}
      shareUrl={`${origin}/n/${phoneDigits(user.phone)}`}
      updatedAtStamp={user.updatedAt ?? "new"}
    />
  );
}

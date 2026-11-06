import { CopyField } from "@/components/copy-field";
import { RotateLink } from "@/components/rotate-link";
import { currentUser, requestOrigin } from "@/lib/http";
import { phoneDigits } from "@/lib/phone";

export const dynamic = "force-dynamic";

export const metadata = { title: "Connect Messages" };

export default async function ConnectPage() {
  const user = await currentUser();
  const origin = await requestOrigin();
  const replyUrl = user ? `${origin}/api/reply?token=${encodeURIComponent(user.token)}&from=` : "";
  const shareUrl = user ? `${origin}/n/${phoneDigits(user.phone)}` : "";

  return (
    <main className="narrow">
      <p className="kicker">iPhone</p>
      <h1>Connect Messages.</h1>
      <p className="lead">
        iMessage won&apos;t let another app stamp a status on your number. Awayline stays on the number you already
        use. A Shortcut on your iPhone sends one reply in the thread, and the link shows the same reason.
      </p>

      {user ? (
        <section className="card">
          <h2>Your reply link</h2>
          <p className="meta">This link is a secret. Rotate it if you share it by mistake.</p>
          <CopyField value={replyUrl} label="Messages reply link" />
          <RotateLink />
          <h2>Your status link</h2>
          <CopyField value={shareUrl} label="Status link" />
          <p className="meta">
            iMessage can preview this link once the site is on a public address. Localhost will open, but it
            won&apos;t unfurl inside a text.
          </p>
        </section>
      ) : (
        <p>
          <a href="/#claim">Verify your number</a> first. Then come back for the reply link.
        </p>
      )}

      <h2>Shortcut</h2>
      <ol className="steps">
        <li>
          <span className="num">1</span>
          <span>On your iPhone, open Shortcuts. Create an automation for when you receive a message.</span>
        </li>
        <li>
          <span className="num">2</span>
          <span>Leave the sender as Anyone. Turn on Run Immediately.</span>
        </li>
        <li>
          <span className="num">3</span>
          <span>
            Add Get Contents of URL. Use GET. Paste your reply link, then insert the Sender variable right after
            from=.
          </span>
        </li>
        <li>
          <span className="num">4</span>
          <span>Add If. Set it to Contents of URL has any value.</span>
        </li>
        <li>
          <span className="num">5</span>
          <span>Inside If, add Send Message. The message is Contents of URL. The recipient is Sender.</span>
        </li>
        <li>
          <span className="num">6</span>
          <span>
            Allow Shortcuts to send messages when the phone asks. Text yourself from another phone. You should get
            one reply, then quiet until the quiet period ends.
          </span>
        </li>
      </ol>
      <p className="meta">
        The quiet period also stops two away statuses from answering each other all afternoon. Android won&apos;t run
        this Shortcut. The status link still works if you paste it.
      </p>
    </main>
  );
}

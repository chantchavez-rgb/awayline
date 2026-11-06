import { currentUser } from "@/lib/http";
import { formatPhone } from "@/lib/phone";
import { Wordmark } from "./wordmark";

export async function Header() {
  const user = await currentUser();
  return (
    <header className="top">
      <Wordmark />
      {user ? (
        <div className="top-actions">
          <a className="who" href="/connect">
            Messages
          </a>
          <span className="who phone">{formatPhone(user.phone)}</span>
          <form action="/api/logout" method="post">
            <button className="texty" type="submit">
              Sign out
            </button>
          </form>
        </div>
      ) : (
        <a className="who" href="/#claim">
          Set a status
        </a>
      )}
    </header>
  );
}

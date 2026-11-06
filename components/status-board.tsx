"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { CopyField } from "./copy-field";
import {
  COOLDOWNS,
  REASONS,
  present,
  validateStatus,
  type CooldownMinutes,
  type ReasonId,
  type StatusInput,
} from "@/lib/copy";
import { endOfDayIso, formatUntil } from "@/lib/time";

type Choice = "1h" | "4h" | "tonight" | "open" | "pick";

type BoardProps = {
  phoneFormatted: string;
  name: string;
  active: boolean;
  reason: ReasonId;
  note: string;
  until: string | null;
  timeZone: string;
  cooldownMinutes: CooldownMinutes;
  shareUrl: string;
  updatedAtStamp: string;
};

function sameInstant(a: string | null, b: string | null): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return new Date(a).getTime() === new Date(b).getTime();
}

export function StatusBoard(props: BoardProps) {
  const router = useRouter();
  const [name, setName] = useState(props.name);
  const [reason, setReason] = useState<ReasonId>(props.reason);
  const [note, setNote] = useState(props.note);
  const [until, setUntil] = useState<string | null>(props.until);
  const [timeZone, setTimeZone] = useState(props.timeZone);
  const [cooldownMinutes, setCooldownMinutes] = useState<CooldownMinutes>(props.cooldownMinutes);
  const [choice, setChoice] = useState<Choice>(props.until ? "pick" : "open");
  const [savedActive, setSavedActive] = useState(props.active);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setName(props.name);
    setReason(props.reason);
    setNote(props.note);
    setUntil(props.until);
    setTimeZone(props.timeZone);
    setCooldownMinutes(props.cooldownMinutes);
    setSavedActive(props.active);
  }, [
    props.updatedAtStamp,
    props.active,
    props.note,
    props.until,
    props.reason,
    props.name,
    props.cooldownMinutes,
    props.timeZone,
  ]);

  const draft: StatusInput = { active: true, reason, note, until, timeZone, name };
  const preview = present(draft);
  const problem = validateStatus(draft);
  const dirty =
    name !== props.name ||
    reason !== props.reason ||
    note !== props.note ||
    !sameInstant(until, props.until) ||
    cooldownMinutes !== props.cooldownMinutes;

  function applyChoice(next: Choice) {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    setChoice(next);
    setTimeZone(zone);
    setMessage(null);
    if (next === "open") setUntil(null);
    if (next === "1h") setUntil(new Date(Date.now() + 60 * 60 * 1000).toISOString());
    if (next === "4h") setUntil(new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString());
    if (next === "tonight") setUntil(endOfDayIso(new Date(), zone));
    if (next === "pick") {
      setUntil((current) => current ?? new Date(Date.now() + 60 * 60 * 1000).toISOString());
    }
  }

  function save(active: boolean) {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone || timeZone;
    const input: StatusInput = { active, reason, note, until, timeZone: zone, name };
    const invalid = validateStatus(input);
    if (invalid) {
      setError(invalid);
      setMessage(null);
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...input, cooldownMinutes }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Couldn't save that status.");
        return;
      }
      setSavedActive(active);
      setTimeZone(zone);
      setMessage(active ? "Status is on your number." : "Status cleared. You're reachable.");
      router.refresh();
    });
  }

  return (
    <div>
      <div className="split">
        <section className={preview.live ? "sign away" : "sign ok"} aria-live="polite">
          <p className="sign-kicker">
            <span className="lamp" aria-hidden="true" />
            {props.phoneFormatted}
          </p>
          <h1 className="sign-title">{preview.live ? preview.label : "Reachable"}</h1>
          <p>
            {preview.live
              ? preview.base
              : problem ?? "Nothing goes out until this status has a reason."}
          </p>
          {preview.untilLabel ? <p className="until">Back {preview.untilLabel}</p> : null}
          <div className="bubble">
            <p className="meta">Text they receive</p>
            <p>{preview.reply ?? "No auto-reply while this status is off."}</p>
          </div>
          <p className="meta">
            {dirty ? "Preview. Not saved yet." : savedActive ? "Live on your number." : "Not on your number yet."}
          </p>
        </section>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            save(true);
          }}
        >
          <fieldset disabled={pending}>
            <div className="field">
              <span className="group-label" id="reason-label">
                Reason
              </span>
              <div className="chips" role="group" aria-labelledby="reason-label">
                {REASONS.map((item) => (
                  <button
                    key={item.id}
                    className="chip"
                    type="button"
                    aria-pressed={reason === item.id}
                    onClick={() => {
                      setReason(item.id);
                      setMessage(null);
                      setError(null);
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <label className="field">
              <span>{reason === "custom" ? "What should people read?" : "Add a line, optional"}</span>
              <textarea
                value={note}
                maxLength={240}
                onChange={(event) => {
                  setNote(event.target.value);
                  setMessage(null);
                }}
              />
              <span className="meta">{note.length}/240</span>
            </label>

            <div className="field">
              <span className="group-label" id="until-label">
                Back
              </span>
              <div className="choice" role="group" aria-labelledby="until-label">
                {(
                  [
                    ["1h", "1 hour"],
                    ["4h", "4 hours"],
                    ["tonight", "End of today"],
                    ["open", "Until I clear it"],
                    ["pick", "Pick a time"],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    className="chip"
                    type="button"
                    aria-pressed={choice === id}
                    onClick={() => applyChoice(id)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {choice === "pick" ? (
                mounted ? (
                  <input
                    type="datetime-local"
                    aria-label="End time"
                    value={until ? toLocalInput(until) : ""}
                    onChange={(event) => {
                      const value = event.target.value;
                      setMessage(null);
                      if (!value) {
                        setUntil(null);
                        return;
                      }
                      const date = new Date(value);
                      if (!Number.isNaN(date.getTime())) {
                        setUntil(date.toISOString());
                        setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone || timeZone);
                      }
                    }}
                  />
                ) : (
                  <p className="meta">{until ? `Ends ${formatUntil(until, timeZone)}` : "Pick a time"}</p>
                )
              ) : null}
            </div>

            <label className="field">
              <span>Quiet period</span>
              <select
                value={cooldownMinutes}
                onChange={(event) => {
                  setCooldownMinutes(Number(event.target.value) as CooldownMinutes);
                  setMessage(null);
                }}
              >
                {COOLDOWNS.map((item) => (
                  <option key={item.minutes} value={item.minutes}>
                    {item.label}
                  </option>
                ))}
              </select>
              <span className="meta">Each person gets one text, then this long of quiet.</span>
            </label>

            <label className="field">
              <span>Name on the reply</span>
              <input
                value={name}
                maxLength={40}
                autoComplete="name"
                onChange={(event) => {
                  setName(event.target.value);
                  setMessage(null);
                }}
              />
            </label>

            {error ? (
              <p className="error" role="alert">
                {error}
              </p>
            ) : null}
            {message ? (
              <p className="meta" role="status">
                {message}
              </p>
            ) : null}

            <div className="actions">
              <button className="primary" type="submit">
                {pending ? "Saving…" : "Set status"}
              </button>
              {savedActive ? (
                <button className="ghost" type="button" onClick={() => save(false)}>
                  Clear status
                </button>
              ) : null}
            </div>
          </fieldset>
        </form>
      </div>

      <div className="links">
        <p className="meta">Status link. Paste it in a chat, or leave it where people can open it.</p>
        <CopyField value={props.shareUrl} label="Status link" />
        <p className="meta">
          <a href="/connect">Connect Messages</a> so your iPhone sends the reply for you.
        </p>
      </div>
    </div>
  );
}

function toLocalInput(iso: string): string {
  const date = new Date(iso);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

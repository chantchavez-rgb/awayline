"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function ClaimForm() {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [sentTo, setSentTo] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function requestCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; devCode?: string; formatted?: string };
      if (!res.ok) {
        setError(data.error ?? "Couldn't send the code.");
        return;
      }
      setSentTo(data.formatted ?? phone);
      setDevCode(typeof data.devCode === "string" ? data.devCode : null);
      setStep("code");
    });
  }

  function verify(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code, name }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Couldn't verify that code.");
        return;
      }
      router.refresh();
    });
  }

  if (step === "code") {
    return (
      <form id="claim" className="card" onSubmit={verify}>
        <h2>Enter the code</h2>
        <p className="meta">Sent to {sentTo}.</p>
        {devCode ? (
          <p className="dev">
            No texting service is configured, so the code is <strong>{devCode}</strong>.
          </p>
        ) : null}
        <label className="field">
          <span>6-digit code</span>
          <input
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            required
          />
        </label>
        <label className="field">
          <span>Name on the status, optional</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="name"
            maxLength={40}
          />
        </label>
        {error ? (
          <p className="error" role="alert">
            {error}
          </p>
        ) : null}
        <div className="actions">
          <button className="primary" type="submit" disabled={pending || code.length !== 6}>
            {pending ? "Checking…" : "Attach this number"}
          </button>
          <button
            className="ghost"
            type="button"
            onClick={() => {
              setStep("phone");
              setCode("");
              setError(null);
            }}
          >
            Use a different number
          </button>
        </div>
      </form>
    );
  }

  return (
    <form id="claim" className="card" onSubmit={requestCode}>
      <h2>Your number</h2>
      <label className="field">
        <span>Phone number</span>
        <input
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          type="tel"
          autoComplete="tel"
          placeholder="(415) 555-0134"
          required
        />
      </label>
      <p className="meta">US numbers can be 10 digits. For other countries, include the + and country code.</p>
      {error ? (
        <p className="error" role="alert">
          {error}
        </p>
      ) : null}
      <div className="actions">
        <button className="primary" type="submit" disabled={pending || phone.trim().length < 7}>
          {pending ? "Sending…" : "Text me a code"}
        </button>
      </div>
    </form>
  );
}

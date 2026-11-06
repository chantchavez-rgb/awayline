"use client";

import { useState } from "react";

export function CopyField({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="copyline">
      <input
        readOnly
        value={value}
        aria-label={label}
        spellCheck={false}
        onFocus={(event) => event.currentTarget.select()}
      />
      <button
        className="secondary"
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1500);
          } catch {
            setCopied(false);
          }
        }}
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

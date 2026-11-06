"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function RotateLink() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      className="ghost"
      type="button"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          const res = await fetch("/api/token", { method: "POST" });
          if (!res.ok) return;
          router.refresh();
        });
      }}
    >
      {pending ? "Rotating…" : "Rotate link"}
    </button>
  );
}

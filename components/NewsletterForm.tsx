"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";

/**
 * Newsletter signup.
 *
 * The previous markup was a bare <form> with no submit handler, so pressing
 * Subscribe reloaded the page and nothing was ever recorded. Anyone who signed
 * up was lost.
 *
 * Subscribers are stored through the CMS so the gallery can export them.
 */

const API = process.env.NEXT_PUBLIC_API_URL || "https://uchaanarts.com/api";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return setError("Please enter a valid email address.");
    }

    setState("sending");
    try {
      const res = await fetch(`${API}/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) {
        throw new Error(data?.error?.message ?? "Could not sign you up.");
      }
      setState("done");
      setEmail("");
    } catch (err) {
      setState("idle");
      setError(err instanceof Error ? err.message : "Could not sign you up.");
    }
  };

  if (state === "done") {
    return (
      <p className="mt-4 flex items-center gap-2 text-[13px] text-signal">
        <Check size={16} />
        Thank you — you are on the list.
      </p>
    );
  }

  return (
    <div className="mt-4 max-w-sm">
      <form onSubmit={submit} className="flex">
        <label htmlFor="subscribe" className="sr-only">
          Email address
        </label>
        <input
          id="subscribe"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError(null);
          }}
          placeholder="Enter your email"
          className="min-w-0 flex-1 border border-line bg-card px-3.5 py-3 text-[13px] outline-none focus:border-ink"
        />
        <button
          type="submit"
          disabled={state === "sending"}
          className="btn-accent flex shrink-0 items-center gap-2 px-6 py-3 text-[13px] disabled:opacity-60"
        >
          {state === "sending" && <Loader2 size={13} className="animate-spin" />}
          {state === "sending" ? "…" : "Subscribe"}
        </button>
      </form>

      {error && <p className="mt-2 text-[12px] text-signal">{error}</p>}
    </div>
  );
}

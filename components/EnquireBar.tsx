"use client";

import { useState } from "react";
import { MessageCircle, Mail, Check, Loader2 } from "lucide-react";
import type { Artwork } from "@/lib/data";
import { formatArtworkPrice } from "@/lib/data";

/**
 * Enquiry actions for an artwork.
 *
 * WhatsApp is the gallery's primary sales channel, so it leads. The form is
 * the fallback for anyone who would rather not hand over a phone number, and
 * it posts to the CMS so enquiries land in the existing Inquiries admin
 * screen rather than an inbox nobody watches.
 */

const WHATSAPP_NUMBER = "918860277388";
const API = process.env.NEXT_PUBLIC_API_URL || "https://uchaanarts.com/api";

export default function EnquireBar({
  artwork,
  artistName,
}: {
  artwork: Artwork;
  artistName: string;
}) {
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", mobile: "", message: "" });

  const waText = encodeURIComponent(
    `Hello Uchaan Arts, I'd like to know more about "${artwork.title}"` +
      (artistName ? ` by ${artistName}` : "") +
      ` (${formatArtworkPrice(artwork)}).`
  );
  const waHref = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${waText}`;

  const submit = async () => {
    setError(null);

    if (!form.name.trim()) return setError("Please enter your name.");
    if (!form.email.trim() && !form.mobile.trim()) {
      return setError("Please leave an email address or a phone number.");
    }

    setSending(true);
    try {
      const res = await fetch(`${API}/enquiry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          mobile: form.mobile.trim(),
          message:
            form.message.trim() ||
            `Enquiry about "${artwork.title}"${artistName ? ` by ${artistName}` : ""}.`,
          item_id: artwork.itemId,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) {
        throw new Error(data?.error?.message ?? "Could not send your enquiry.");
      }
      setSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send your enquiry.");
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="flex items-center gap-3 border border-line bg-signal/5 p-4 text-sm">
        <Check size={18} className="shrink-0 text-signal" />
        <p className="text-muted">
          Thank you. A curator will be in touch shortly.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 items-center justify-center gap-2 bg-ink px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-paper transition-colors hover:bg-signal"
        >
          <MessageCircle size={16} />
          WhatsApp a curator
        </a>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex flex-1 items-center justify-center gap-2 border border-line px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] transition-colors hover:border-signal hover:text-signal"
        >
          <Mail size={16} />
          Enquire
        </button>
      </div>

      {open && (
        <div className="mt-4 space-y-3 border border-line p-4">
          <p className="text-xs text-muted">
            Ask about price, provenance, framing or shipping. We reply within one
            working day.
          </p>

          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Your name"
            aria-label="Your name"
            className="w-full border-b border-line bg-transparent py-2 text-sm outline-none focus:border-signal"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Email"
              aria-label="Email address"
              className="w-full border-b border-line bg-transparent py-2 text-sm outline-none focus:border-signal"
            />
            <input
              type="tel"
              value={form.mobile}
              onChange={(e) => setForm({ ...form, mobile: e.target.value })}
              placeholder="Phone"
              aria-label="Phone number"
              className="w-full border-b border-line bg-transparent py-2 text-sm outline-none focus:border-signal"
            />
          </div>
          <textarea
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            placeholder="Your message (optional)"
            aria-label="Your message"
            rows={3}
            className="w-full resize-none border-b border-line bg-transparent py-2 text-sm outline-none focus:border-signal"
          />

          {error && <p className="text-xs text-signal">{error}</p>}

          <button
            type="button"
            onClick={submit}
            disabled={sending}
            className="flex w-full items-center justify-center gap-2 bg-signal px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:bg-signal-dark disabled:opacity-60"
          >
            {sending && <Loader2 size={14} className="animate-spin" />}
            {sending ? "Sending" : "Send enquiry"}
          </button>
        </div>
      )}
    </div>
  );
}

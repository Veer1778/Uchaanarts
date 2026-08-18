"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageCircle, Check, Loader2 } from "lucide-react";

/**
 * /enquire — the general enquiry form behind the header button.
 *
 * The CMS files enquiries by `type`, and its admin has a separate report per
 * type. Those values are fixed by the existing data, so the options below map
 * onto them rather than inventing new ones:
 *
 *   ""                 -> Artwork Inquiry report
 *   "CONTACT"          -> Contact Inquiry report
 *   "ARTIST-COMMISSION"-> Artist Commission report
 *
 * Anything without its own report is filed as CONTACT with the subject named
 * in the message body, so nothing is lost.
 */

const WHATSAPP_NUMBER = "918860277388";
const API = process.env.NEXT_PUBLIC_API_URL || "https://uchaanarts.com/api";

type Option = { id: string; label: string; blurb: string; cmsType: string };

const OPTIONS: Option[] = [
  {
    id: "artwork",
    label: "About an artwork",
    blurb: "Price, availability, provenance or framing for a specific work.",
    cmsType: "",
  },
  {
    id: "commission",
    label: "Commission an artist",
    blurb: "A new work made to your brief, size and setting.",
    cmsType: "ARTIST-COMMISSION",
  },
  {
    id: "advisory",
    label: "Art advisory",
    blurb: "Guidance on building or placing a collection.",
    cmsType: "CONTACT",
  },
  {
    id: "corporate",
    label: "Corporate & hospitality",
    blurb: "Art for offices, hotels, installations and architect projects.",
    cmsType: "CONTACT",
  },
  {
    id: "visit",
    label: "Visit the gallery",
    blurb: "Appointments, directions and opening hours.",
    cmsType: "CONTACT",
  },
  {
    id: "other",
    label: "Something else",
    blurb: "Press, partnerships or general questions.",
    cmsType: "CONTACT",
  },
];

export default function EnquirePage() {
  const [choice, setChoice] = useState<Option>(OPTIONS[0]);
  const [form, setForm] = useState({ name: "", email: "", mobile: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);

    if (!form.name.trim()) return setError("Please enter your name.");
    if (!form.email.trim() && !form.mobile.trim()) {
      return setError("Please leave an email address or a phone number.");
    }
    if (!form.message.trim()) return setError("Please tell us how we can help.");

    setSending(true);
    try {
      const res = await fetch(`${API}/enquiry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          mobile: form.mobile.trim(),
          // The subject is prefixed into the message so it survives in reports
          // that share a type.
          message: `[${choice.label}] ${form.message.trim()}`,
          enquiry_type: choice.cmsType,
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

  const waHref = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(
    `Hello Uchaan Arts, I'd like to enquire about: ${choice.label}.`
  )}`;

  if (sent) {
    return (
      <main className="mx-auto max-w-2xl px-5 py-24 text-center">
        <Check size={40} className="mx-auto text-signal" />
        <h1 className="mt-6 font-display text-4xl">Thank you</h1>
        <p className="mt-3 text-sm text-muted">
          Your enquiry has reached us. A curator will be in touch within one
          working day.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link
            href="/art-gallery"
            className="border border-line px-6 py-3 text-xs uppercase tracking-[0.16em] transition-colors hover:border-signal hover:text-signal"
          >
            Continue browsing
          </Link>
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-ink px-6 py-3 text-xs uppercase tracking-[0.16em] text-paper transition-colors hover:bg-signal"
          >
            Message on WhatsApp
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-5 py-16">
      <p className="text-[11px] uppercase tracking-[0.3em] text-signal">
        Get in touch
      </p>
      <h1 className="mt-3 font-display text-4xl sm:text-5xl">
        How can we <span className="text-signal">help?</span>
      </h1>
      <p className="mt-4 max-w-xl text-sm text-muted">
        Tell us what you are looking for and the right person will reply. For
        anything urgent, WhatsApp is fastest.
      </p>

      <fieldset className="mt-10">
        <legend className="mb-4 text-[11px] uppercase tracking-[0.2em] text-muted">
          What is this about?
        </legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {OPTIONS.map((o) => {
            const active = o.id === choice.id;
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => setChoice(o)}
                aria-pressed={active}
                className={`border p-4 text-left transition-colors ${
                  active
                    ? "border-signal bg-signal/5"
                    : "border-line hover:border-signal"
                }`}
              >
                <span className="block text-sm font-medium">{o.label}</span>
                <span className="mt-1 block text-xs text-muted">{o.blurb}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-10 space-y-5">
        <div>
          <label htmlFor="name" className="text-xs text-muted">
            Your name
          </label>
          <input
            id="name"
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="mt-1 w-full border-b border-line bg-transparent py-2 text-sm outline-none focus:border-signal"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="email" className="text-xs text-muted">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-1 w-full border-b border-line bg-transparent py-2 text-sm outline-none focus:border-signal"
            />
          </div>
          <div>
            <label htmlFor="mobile" className="text-xs text-muted">
              Phone
            </label>
            <input
              id="mobile"
              type="tel"
              value={form.mobile}
              onChange={(e) => setForm({ ...form, mobile: e.target.value })}
              className="mt-1 w-full border-b border-line bg-transparent py-2 text-sm outline-none focus:border-signal"
            />
          </div>
        </div>

        <div>
          <label htmlFor="message" className="text-xs text-muted">
            Your message
          </label>
          <textarea
            id="message"
            rows={5}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            placeholder={
              choice.id === "artwork"
                ? "Which work are you interested in?"
                : "A few lines about what you need."
            }
            className="mt-1 w-full resize-none border-b border-line bg-transparent py-2 text-sm outline-none placeholder:text-faint focus:border-signal"
          />
        </div>

        {error && <p className="text-sm text-signal">{error}</p>}

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="button"
            onClick={submit}
            disabled={sending}
            className="flex items-center justify-center gap-2 bg-signal px-8 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:bg-signal-dark disabled:opacity-60"
          >
            {sending && <Loader2 size={14} className="animate-spin" />}
            {sending ? "Sending" : "Send enquiry"}
          </button>
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 border border-line px-8 py-3 text-xs font-semibold uppercase tracking-[0.16em] transition-colors hover:border-signal hover:text-signal"
          >
            <MessageCircle size={16} />
            WhatsApp instead
          </a>
        </div>
      </div>
    </main>
  );
}

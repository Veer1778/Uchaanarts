"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Upload, X, Check, Loader2, ArrowLeft, ArrowRight } from "lucide-react";
import { api, type Filters } from "@/lib/api";

/**
 * Art Advisory.
 *
 * Restructured as a form. The previous version put a live shortlist beside the
 * questions, which competed for attention and turned a consultation request
 * into a browsing page. This asks one thing at a time and ends with a single
 * submit, so the page has one job.
 *
 * The brief and photograph reach the curatorial team through the existing
 * Inquiries screen. No automated image analysis: a curator does the
 * recommending, and the copy says so.
 */

const API = process.env.NEXT_PUBLIC_API_URL || "https://uchaanarts.com/api";

const ROOMS = [
  "Living room",
  "Bedroom",
  "Dining room",
  "Entrance / hallway",
  "Office",
  "Hotel / restaurant",
];

const WALL_SIZES = [
  { label: "Small wall", hint: "under 3 ft" },
  { label: "Medium wall", hint: "3 – 6 ft" },
  { label: "Large wall", hint: "over 6 ft" },
];

const BUDGETS = [
  "Under ₹25,000",
  "₹25,000 – ₹50,000",
  "₹50,000 – ₹1,00,000",
  "Over ₹1,00,000",
  "Not sure yet",
];

const STEPS = ["Your space", "Your taste", "Your details"] as const;

export default function AdvisoryPage() {
  const [step, setStep] = useState(0);
  const [filters, setFilters] = useState<Filters | null>(null);

  const [room, setRoom] = useState("");
  const [wall, setWall] = useState("");
  const [style, setStyle] = useState("");
  const [budget, setBudget] = useState("");

  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [form, setForm] = useState({ name: "", email: "", mobile: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Style options come from the catalogue, so they always match what can
  // actually be recommended.
  useEffect(() => {
    api.filters().then(setFilters).catch(() => setFilters(null));
  }, []);

  useEffect(() => {
    if (!photo) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(photo);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  const pickPhoto = (file: File | null) => {
    setError(null);
    if (!file) return;
    if (!/^image\/(jpeg|jpg|png|webp)$/.test(file.type)) {
      return setError("Please choose a JPG, PNG or WebP image.");
    }
    if (file.size > 8 * 1024 * 1024) {
      return setError("Please choose a photo under 8MB.");
    }
    setPhoto(file);
  };

  const submit = async () => {
    // Re-check every step: someone can go back, clear a field and return.
    for (let i = 0; i < STEPS.length; i++) {
      const problem = stepError(i);
      if (problem) {
        setStep(i);
        setError(problem);
        return;
      }
    }
    setError(null);

    setSending(true);
    try {
      const body = new FormData();
      body.append("name", form.name.trim());
      body.append("email", form.email.trim());
      body.append("mobile", form.mobile.trim());
      body.append("message", form.message.trim() || "Art advisory request.");
      if (room) body.append("room", room);
      if (wall) body.append("wall_size", wall);
      if (style) body.append("style", style);
      if (budget) body.append("budget", budget);
      if (photo) body.append("photo", photo);

      const res = await fetch(`${API}/advisory`, { method: "POST", body });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) {
        throw new Error(data?.error?.message ?? "Could not send your request.");
      }
      setSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send your request.");
    } finally {
      setSending(false);
    }
  };

  /**
   * Each step must be complete before moving on. Without this a visitor could
   * click through to the end and send a brief with nothing in it, which wastes
   * the curator's time and the visitor's.
   */
  const stepError = (n: number): string | null => {
    if (n === 0) {
      if (!room) return "Please choose which room this is for.";
      if (!wall) return "Please choose roughly how big the wall is.";
    }
    if (n === 1) {
      if (!budget) return "Please pick a budget range so we can suggest works in range.";
    }
    if (n === 2) {
      if (!form.name.trim()) return "Please enter your name.";
      if (!form.email.trim() && !form.mobile.trim()) {
        return "Please leave an email address or a phone number.";
      }
      if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
        return "That email address does not look right.";
      }
    }
    return null;
  };

  const next = () => {
    const problem = stepError(step);
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    setStep(step + 1);
  };

  const chip = (active: boolean) =>
    `border px-4 py-2.5 text-sm transition-colors ${
      active ? "border-signal bg-signal/5 text-ink" : "border-line hover:border-signal"
    }`;

  const field =
    "w-full border-b border-line bg-transparent py-2 text-sm outline-none focus:border-signal";

  if (sent) {
    return (
      <main className="mx-auto max-w-2xl px-5 py-24 text-center">
        <Check size={40} className="mx-auto text-signal" />
        <h1 className="mt-6 font-display text-4xl">Thank you</h1>
        <p className="mt-3 text-sm text-muted">
          A curator will review your space and come back with a selection within
          one working day.
        </p>
        <Link
          href="/art-gallery"
          className="mt-8 inline-block border border-line px-6 py-3 text-xs uppercase tracking-[0.16em] transition-colors hover:border-signal hover:text-signal"
        >
          Browse the gallery
        </Link>
      </main>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-16 sm:px-8 lg:px-10">
      {/* Top section kept as it was */}
      <p className="font-display text-xl">Art Advisory</p>
      <h1 className="mt-4 max-w-2xl font-display text-4xl leading-[1.12] sm:text-5xl">
        Art can be personal.
        <br />
        <em className="italic">Choosing it should be too.</em>
      </h1>
      <p className="mt-6 max-w-xl text-sm leading-relaxed text-muted">
        Tell us about your space and one of our curators will put together a
        selection for you, with guidance on scale, framing and placement.
      </p>

      <ol className="mt-10 grid gap-6 border-y border-line py-8 sm:grid-cols-3">
        {[
          ["01", "Share your space", "A photo and a few preferences are enough to start."],
          ["02", "Receive a selection", "Matched to your wall, light and budget by a curator."],
          ["03", "Leave the details to us", "Framing, delivery and installation handled end to end."],
        ].map(([n, title, body]) => (
          <li key={n}>
            <p className="text-xs text-faint">{n}</p>
            <p className="mt-2 font-display text-lg leading-snug">{title}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted">{body}</p>
          </li>
        ))}
      </ol>

      {/* The form */}
      <div className="mx-auto mt-14 max-w-2xl">
        {/* Progress */}
        <div className="mb-10 flex gap-2">
          {STEPS.map((label, i) => (
            <div key={label} className="flex-1">
              <div
                className={`h-0.5 transition-colors ${
                  i <= step ? "bg-signal" : "bg-line"
                }`}
              />
              <p
                className={`mt-2 text-[11px] uppercase tracking-[0.14em] ${
                  i <= step ? "text-ink" : "text-faint"
                }`}
              >
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* Step 1 */}
        {step === 0 && (
          <div className="space-y-9">
            <fieldset>
              <legend className="mb-3 text-sm">
                A photograph of the wall
                <span className="ml-2 text-xs text-faint">optional</span>
              </legend>

              {preview ? (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={preview}
                    alt="Your room"
                    className="aspect-[4/3] w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setPhoto(null)}
                    aria-label="Remove photo"
                    className="absolute right-3 top-3 grid h-8 w-8 place-items-center bg-paper/90 transition-colors hover:text-signal"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex aspect-[16/9] w-full flex-col items-center justify-center gap-2 border border-dashed border-line transition-colors hover:border-signal"
                >
                  <Upload size={20} className="text-muted" />
                  <span className="text-sm text-muted">Upload a photo</span>
                  <span className="text-xs text-faint">JPG, PNG or WebP, up to 8MB</span>
                </button>
              )}

              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => pickPhoto(e.target.files?.[0] ?? null)}
              />
            </fieldset>

            <fieldset>
              <legend className="mb-3 text-sm">Which room is it for?</legend>
              <div className="flex flex-wrap gap-2">
                {ROOMS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => { setRoom(room === r ? "" : r); setError(null); }}
                    className={chip(room === r)}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="mb-3 text-sm">How big is the wall?</legend>
              <div className="flex flex-wrap gap-2">
                {WALL_SIZES.map((w) => (
                  <button
                    key={w.label}
                    type="button"
                    onClick={() => { setWall(wall === w.label ? "" : w.label); setError(null); }}
                    className={chip(wall === w.label)}
                  >
                    {w.label}
                    <span className="ml-2 text-xs text-faint">{w.hint}</span>
                  </button>
                ))}
              </div>
            </fieldset>
          </div>
        )}

        {/* Step 2 */}
        {step === 1 && (
          <div className="space-y-9">
            {filters && filters.styles.length > 0 && (
              <fieldset>
                <legend className="mb-3 text-sm">A style you are drawn to</legend>
                <div className="flex flex-wrap gap-2">
                  {filters.styles.slice(0, 12).map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setStyle(style === s.name ? "" : s.name)}
                      className={chip(style === s.name)}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}

            <fieldset>
              <legend className="mb-3 text-sm">Budget</legend>
              <div className="flex flex-wrap gap-2">
                {BUDGETS.map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => { setBudget(budget === b ? "" : b); setError(null); }}
                    className={chip(budget === b)}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </fieldset>

            <div>
              <label htmlFor="msg" className="mb-2 block text-sm">
                Anything else we should know?
              </label>
              <textarea
                id="msg"
                rows={4}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Colours to avoid, pieces you already own, deadlines."
                className="w-full resize-none border border-line bg-transparent p-3 text-sm outline-none placeholder:text-faint focus:border-signal"
              />
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <label htmlFor="nm" className="text-xs text-muted">Your name</label>
              <input
                id="nm"
                className={field}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="em" className="text-xs text-muted">Email</label>
                <input
                  id="em"
                  type="email"
                  className={field}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="ph" className="text-xs text-muted">Phone</label>
                <input
                  id="ph"
                  type="tel"
                  className={field}
                  value={form.mobile}
                  onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                />
              </div>
            </div>

            {/* A summary, so nobody submits without seeing what they chose. */}
            {(room || wall || style || budget || photo) && (
              <dl className="mt-8 space-y-1.5 border border-line p-4 text-sm">
                {[
                  ["Room", room],
                  ["Wall", wall],
                  ["Style", style],
                  ["Budget", budget],
                  ["Photo", photo ? "Attached" : ""],
                ]
                  .filter(([, v]) => v)
                  .map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-4">
                      <dt className="text-muted">{k}</dt>
                      <dd>{v}</dd>
                    </div>
                  ))}
              </dl>
            )}
          </div>
        )}

        {error && <p className="mt-6 text-sm text-signal">{error}</p>}

        {/* Navigation */}
        <div className="mt-10 flex items-center justify-between gap-4 border-t border-line pt-6">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-2 text-sm text-muted transition-colors hover:text-ink"
            >
              <ArrowLeft size={15} /> Back
            </button>
          ) : (
            <span />
          )}

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={next}
              // Not disabled: a greyed-out button gives no reason. The click
              // says what is missing instead.
              className={`flex items-center gap-2 px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.16em] text-white transition-colors ${
                stepError(step)
                  ? "bg-signal/45 hover:bg-signal/60"
                  : "bg-signal hover:bg-signal-dark"
              }`}
            >
              Continue <ArrowRight size={15} />
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={sending}
              className="flex items-center gap-2 bg-signal px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:bg-signal-dark disabled:opacity-60"
            >
              {sending && <Loader2 size={14} className="animate-spin" />}
              {sending ? "Sending" : "Send to a curator"}
            </button>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-muted">
          No obligation. A curator reads every request personally.
        </p>
      </div>
    </div>
  );
}

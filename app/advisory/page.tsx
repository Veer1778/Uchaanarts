"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Upload, X, Check, Loader2, ImageIcon } from "lucide-react";
import { api, formatPrice, type Artwork, type Filters } from "@/lib/api";

/**
 * Art Advisory.
 *
 * The visitor describes their space and optionally uploads a photograph of the
 * wall. Two things then happen:
 *
 *  1. An immediate shortlist is drawn from the live catalogue using their
 *     answers, so the page is useful before anyone replies.
 *  2. The photo and brief are sent to the curatorial team, who do the actual
 *     recommending.
 *
 * The page does not claim to analyse the photograph. A curator reads it, and
 * the copy says so.
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
  { label: "Small wall", hint: "under 3 ft", sizeFilter: "small" },
  { label: "Medium wall", hint: "3 – 6 ft", sizeFilter: "medium" },
  { label: "Large wall", hint: "over 6 ft", sizeFilter: "large" },
];

const BUDGETS = [
  { label: "Under ₹25,000", band: 2 },
  { label: "₹25,000 – ₹50,000", band: 3 },
  { label: "₹50,000 – ₹1,00,000", band: 5 },
  { label: "Over ₹1,00,000", band: 6 },
];

export default function AdvisoryPage() {
  const [filters, setFilters] = useState<Filters | null>(null);
  const [room, setRoom] = useState("");
  const [wall, setWall] = useState<(typeof WALL_SIZES)[number] | null>(null);
  const [style, setStyle] = useState("");
  const [budget, setBudget] = useState<(typeof BUDGETS)[number] | null>(null);

  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [form, setForm] = useState({ name: "", email: "", mobile: "", message: "" });
  const [matches, setMatches] = useState<Artwork[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Style options come from the catalogue rather than a hardcoded list, so
  // they always match what can actually be recommended.
  useEffect(() => {
    api.filters().then(setFilters).catch(() => setFilters(null));
  }, []);

  // Revoke the object URL when the photo changes, or it leaks.
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

  const findMatches = useCallback(async () => {
    setLoadingMatches(true);
    try {
      const styleId = filters?.styles.find((s) => s.name === style)?.id;
      const sizeId = wall
        ? filters?.sizes.find((s) =>
            s.name.toLowerCase().includes(wall.sizeFilter)
          )?.id
        : undefined;

      const { items } = await api.artworks({
        per_page: 8,
        sort: "new_old",
        styles: styleId ? [styleId] : undefined,
        sizes: sizeId ? [sizeId] : undefined,
        price: budget?.band,
      });

      // If the combination is too narrow, fall back to a broader set rather
      // than showing an empty shortlist.
      if (items.length === 0) {
        const fallback = await api.artworks({ per_page: 8, featured: true });
        setMatches(fallback.items);
      } else {
        setMatches(items);
      }
    } catch {
      setMatches([]);
    } finally {
      setLoadingMatches(false);
    }
  }, [filters, style, wall, budget]);

  // Refresh the shortlist as choices are made.
  useEffect(() => {
    if (room || wall || style || budget) findMatches();
  }, [room, wall, style, budget, findMatches]);

  const submit = async () => {
    setError(null);
    if (!form.name.trim()) return setError("Please enter your name.");
    if (!form.email.trim() && !form.mobile.trim()) {
      return setError("Please leave an email address or a phone number.");
    }

    setSending(true);
    try {
      // multipart, because of the photograph
      const body = new FormData();
      body.append("name", form.name.trim());
      body.append("email", form.email.trim());
      body.append("mobile", form.mobile.trim());
      body.append("message", form.message.trim() || "Art advisory request.");
      if (room) body.append("room", room);
      if (wall) body.append("wall_size", `${wall.label} (${wall.hint})`);
      if (style) body.append("style", style);
      if (budget) body.append("budget", budget.label);
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

  if (sent) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-24 text-center">
        <Check size={40} className="mx-auto text-signal" />
        <h1 className="mt-6 font-display text-4xl">Thank you</h1>
        <p className="mt-3 text-sm text-muted">
          A curator will review your space and come back with a shortlist within
          one working day.
        </p>
        <Link
          href="/art-gallery"
          className="mt-8 inline-block border border-line px-6 py-3 text-xs uppercase tracking-[0.16em] transition-colors hover:border-signal hover:text-signal"
        >
          Browse the gallery
        </Link>
      </div>
    );
  }

  const chip = (active: boolean) =>
    `border px-4 py-2.5 text-sm transition-colors ${
      active ? "border-signal bg-signal/5 text-ink" : "border-line hover:border-signal"
    }`;

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-16 sm:px-8 lg:px-10">
      <p className="font-display text-xl">Art Advisory</p>
      <h1 className="mt-4 max-w-2xl font-display text-4xl leading-[1.12] sm:text-5xl">
        Art can be personal.
        <br />
        <em className="italic">Choosing it should be too.</em>
      </h1>
      <p className="mt-6 max-w-xl text-sm leading-relaxed text-muted">
        Show us your wall and tell us a little about your taste. You will see a
        shortlist straight away, and one of our curators will follow up with
        recommendations on scale, framing and placement.
      </p>

      <div className="mt-14 grid gap-14 border-t border-line pt-12 lg:grid-cols-[1fr_1fr]">
        {/* ---------------- Left: the brief ---------------- */}
        <div>
          <h2 className="font-display text-2xl">Your space</h2>

          {/* Photo */}
          <div className="mt-6">
            <p className="mb-3 text-[11px] uppercase tracking-[0.18em] text-muted">
              Photograph of the room or wall
            </p>

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
                className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-3 border border-dashed border-line transition-colors hover:border-signal"
              >
                <Upload size={22} className="text-muted" />
                <span className="text-sm text-muted">
                  Upload a photo of your wall
                </span>
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
          </div>

          {/* Room */}
          <fieldset className="mt-8">
            <legend className="mb-3 text-[11px] uppercase tracking-[0.18em] text-muted">
              Which room?
            </legend>
            <div className="flex flex-wrap gap-2">
              {ROOMS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRoom(room === r ? "" : r)}
                  className={chip(room === r)}
                >
                  {r}
                </button>
              ))}
            </div>
          </fieldset>

          {/* Wall size */}
          <fieldset className="mt-8">
            <legend className="mb-3 text-[11px] uppercase tracking-[0.18em] text-muted">
              How big is the wall?
            </legend>
            <div className="flex flex-wrap gap-2">
              {WALL_SIZES.map((w) => (
                <button
                  key={w.label}
                  type="button"
                  onClick={() => setWall(wall?.label === w.label ? null : w)}
                  className={chip(wall?.label === w.label)}
                >
                  {w.label}
                  <span className="ml-2 text-xs text-faint">{w.hint}</span>
                </button>
              ))}
            </div>
          </fieldset>

          {/* Style, from the live catalogue */}
          {filters && filters.styles.length > 0 && (
            <fieldset className="mt-8">
              <legend className="mb-3 text-[11px] uppercase tracking-[0.18em] text-muted">
                A style you are drawn to
              </legend>
              <div className="flex flex-wrap gap-2">
                {filters.styles.slice(0, 10).map((s) => (
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

          {/* Budget */}
          <fieldset className="mt-8">
            <legend className="mb-3 text-[11px] uppercase tracking-[0.18em] text-muted">
              Budget
            </legend>
            <div className="flex flex-wrap gap-2">
              {BUDGETS.map((b) => (
                <button
                  key={b.label}
                  type="button"
                  onClick={() => setBudget(budget?.label === b.label ? null : b)}
                  className={chip(budget?.label === b.label)}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </fieldset>

          {/* Contact */}
          <div className="mt-12 border-t border-line pt-8">
            <h2 className="font-display text-2xl">Where to reach you</h2>
            <div className="mt-5 space-y-4">
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your name"
                aria-label="Your name"
                className="w-full border-b border-line bg-transparent py-2 text-sm outline-none focus:border-signal"
              />
              <div className="grid gap-4 sm:grid-cols-2">
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
                rows={3}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Anything else we should know? Colours to avoid, existing pieces, deadlines."
                aria-label="Your message"
                className="w-full resize-none border-b border-line bg-transparent py-2 text-sm outline-none placeholder:text-faint focus:border-signal"
              />
            </div>

            {error && <p className="mt-4 text-sm text-signal">{error}</p>}

            <button
              type="button"
              onClick={submit}
              disabled={sending}
              className="mt-6 flex items-center justify-center gap-2 bg-signal px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:bg-signal-dark disabled:opacity-60"
            >
              {sending && <Loader2 size={14} className="animate-spin" />}
              {sending ? "Sending" : "Send to a curator"}
            </button>
          </div>
        </div>

        {/* ---------------- Right: live shortlist ---------------- */}
        <div>
          <h2 className="font-display text-2xl">A first shortlist</h2>
          <p className="mt-2 text-sm text-muted">
            Drawn from the collection as you answer. A curator will refine this
            once they have seen your space.
          </p>

          <div className="mt-6 min-h-[240px]">
            {matches.length === 0 && !loadingMatches && (
              <div className="flex aspect-[4/3] flex-col items-center justify-center gap-3 border border-dashed border-line">
                <ImageIcon size={22} className="text-faint" />
                <p className="max-w-xs text-center text-sm text-muted">
                  Choose a room, wall size or style and suggestions will appear
                  here.
                </p>
              </div>
            )}

            {loadingMatches && matches.length === 0 && (
              <div className="flex aspect-[4/3] items-center justify-center border border-line">
                <Loader2 size={20} className="animate-spin text-muted" />
              </div>
            )}

            {matches.length > 0 && (
              <div
                className={`grid grid-cols-2 gap-4 transition-opacity ${
                  loadingMatches ? "opacity-50" : ""
                }`}
              >
                {matches.map((w) => (
                  <Link key={w.id} href={`/art/${w.slug}`} className="group">
                    <div className="relative aspect-[3/4] overflow-hidden bg-wash">
                      {w.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={w.image}
                          alt={w.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      )}
                    </div>
                    <p className="mt-2 truncate text-sm group-hover:text-signal">
                      {w.name}
                    </p>
                    <p className="truncate text-xs text-muted">{w.artist_name}</p>
                    <p className="text-xs text-signal">{formatPrice(w)}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <ol className="mt-12 space-y-6 border-t border-line pt-8">
            {[
              ["01", "Share your space", "A photo and a few preferences are enough to start."],
              ["02", "Receive a personal selection", "A curator matches works to your wall, light and budget."],
              ["03", "Leave the details to us", "Framing, delivery and installation handled end to end."],
            ].map(([n, title, body]) => (
              <li key={n} className="flex gap-4">
                <span className="text-xs text-faint">{n}</span>
                <div>
                  <p className="font-display text-lg leading-snug">{title}</p>
                  <p className="mt-1 text-sm text-muted">{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

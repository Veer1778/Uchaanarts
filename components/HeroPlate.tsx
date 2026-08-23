"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Artwork } from "@/lib/data";

/**
 * Hero plate — the artwork beside the masthead copy, with a credit line and
 * dot pagination beneath it, as in the reference. Advances on a timer and
 * pauses on hover.
 */
export default function HeroPlate({
  works,
  names,
}: {
  works: Artwork[];
  names: Record<string, string>;
}) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || works.length < 2) return;
    const t = setInterval(() => setI((v) => (v + 1) % works.length), 6000);
    return () => clearInterval(t);
  }, [paused, works.length]);

  if (works.length === 0) return null;
  const w = works[i];

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <Link
        href={`/art/${w.slug}`}
        className="relative block h-[210px] overflow-hidden bg-wash sm:h-[340px] lg:h-[420px]"
      >
        {works.map((piece, idx) => (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            key={piece.slug}
            src={piece.image}
            alt={piece.title}
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
            style={{ opacity: idx === i ? 1 : 0 }}
          />
        ))}

        {/* Soft fade into the page colour, so the plate reads as part of the
            layout rather than a pasted-in rectangle. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-paper to-transparent"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-paper/70 to-transparent sm:w-24"
        />
      </Link>

      <div className="mt-3 flex items-center justify-between gap-4">
        <p className="truncate text-[12px] text-muted">
          {names[w.artist] ? `${names[w.artist]}, ` : ""}
          <span className="italic">{w.title}</span>
          {w.medium ? `, ${w.medium}` : ""}
          {w.size ? `, ${w.size}` : ""}
        </p>
        <div className="flex shrink-0 items-center gap-2">
          {works.map((piece, idx) => (
            <button
              key={piece.slug}
              type="button"
              onClick={() => setI(idx)}
              aria-label={`Show ${piece.title}`}
              aria-current={idx === i}
              className={`h-1.5 w-1.5 rounded-full transition-colors ${
                idx === i ? "bg-ink" : "bg-line"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

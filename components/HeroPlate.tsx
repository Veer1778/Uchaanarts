"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Artwork } from "@/lib/data";

/**
 * Hero plate — the large artwork beside the masthead copy, with its credit
 * line and dot pagination beneath, as in the reference. Advances on a timer,
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
      className="flex h-full flex-col"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <Link href={`/art/${w.slug}`} className="relative block flex-1 overflow-hidden bg-wash">
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
      </Link>

      <div className="flex items-center justify-between gap-4 px-5 py-2.5 sm:px-8 lg:px-10">
        <p className="truncate text-[10px] text-muted sm:text-[11px]">
          {names[w.artist] ? `${names[w.artist]}, ` : ""}
          <span className="italic">{w.title}</span>
          {w.medium ? `, ${w.medium}` : ""}
          {w.size ? `, ${w.size}` : ""}
        </p>
        <div className="flex shrink-0 items-center gap-1.5">
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

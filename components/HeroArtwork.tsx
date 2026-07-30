"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Artwork } from "@/lib/data";

/**
 * Hero artwork carousel — the large plate on the right of the masthead, with
 * a credit line beneath and dot pagination, as in the reference. Advances on a
 * timer and pauses on hover; dots allow direct selection.
 */
export default function HeroArtwork({
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
  const artist = names[w.artist] ?? "";

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <Link href={`/art/${w.slug}`} className="block">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-wash sm:aspect-[16/11]">
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
        </div>
      </Link>

      <div className="mt-3 flex items-center justify-between gap-4">
        <p className="text-[11px] text-muted">
          {artist && <span>{artist}, </span>}
          <span className="italic">{w.title}</span>
          {w.medium && <span>, {w.medium}</span>}
          {w.size && <span>, {w.size}</span>}
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

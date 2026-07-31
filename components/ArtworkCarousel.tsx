"use client";

import { useState } from "react";
import Link from "next/link";
import type { Artwork } from "@/lib/data";
import { formatINR } from "@/lib/data";

/**
 * New & Noteworthy — one work at a time with dot pagination, exactly as in the
 * reference. Swipeable on touch via a snap rail; the dots reflect and control
 * position. On wide screens the same set lays out as a row instead.
 */
export default function ArtworkCarousel({
  works,
  names,
}: {
  works: Artwork[];
  names: Record<string, string>;
}) {
  const [i, setI] = useState(0);
  if (works.length === 0) return null;

  return (
    <div>
      {/* Mobile / tablet: single card */}
      <div className="lg:hidden">
        <Card work={works[i]} artist={names[works[i].artist] ?? ""} />
        <div className="mt-4 flex items-center justify-center gap-2">
          {works.map((w, idx) => (
            <button
              key={w.slug}
              type="button"
              onClick={() => setI(idx)}
              aria-label={`Show ${w.title}`}
              aria-current={idx === i}
              className={`h-1.5 w-1.5 rounded-full transition-colors ${
                idx === i ? "bg-ink" : "bg-line"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Desktop: the set as a row */}
      <div className="hidden gap-6 lg:grid lg:grid-cols-4">
        {works.slice(0, 4).map((w) => (
          <Card key={w.slug} work={w} artist={names[w.artist] ?? ""} />
        ))}
      </div>
    </div>
  );
}

function Card({ work, artist }: { work: Artwork; artist: string }) {
  return (
    <Link href={`/art/${work.slug}`} className="group block">
      <div className="relative aspect-[4/3] overflow-hidden bg-wash">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={work.image}
          alt={work.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        />
      </div>
      <p className="mt-3 text-sm">{artist}</p>
      <p className="font-display text-base italic leading-snug text-muted">
        {work.title}
      </p>
      <p className="mt-1.5 text-[11px] text-muted">
        {work.medium}
        {work.size ? ` · ${work.size}` : ""}
      </p>
      <p className="mt-1 text-sm">
        {work.price > 0 ? formatINR(work.price) : "Price on request"}
      </p>
    </Link>
  );
}

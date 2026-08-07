"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Artwork } from "@/lib/data";
import ArtworkCard from "./ArtworkCard";

/**
 * Masonry of product cards via CSS multi-column flow, so each card keeps its
 * natural image height with no cropping.
 *
 * Renders in batches. The previous version put all ~2,500 artworks in the DOM
 * at once, each wrapped in a motion element with its own viewport observer.
 * That meant thousands of IntersectionObservers plus a full multi-column
 * reflow on every scroll tick, which is what made scrolling stutter.
 *
 * Now: one observer on a sentinel at the bottom, and a plain CSS fade-in
 * instead of per-item motion components.
 *
 * `names` is a plain slug -> artist name map. We deliberately avoid passing a
 * function here: Server Components can't hand functions to Client Components.
 */
export default function MasonryCards({
  items,
  names,
  columnsClass = "columns-2 lg:columns-3",
  batchSize = 48,
}: {
  items: Artwork[];
  names?: Record<string, string>;
  columnsClass?: string;
  /** How many cards to add each time the sentinel comes into view. */
  batchSize?: number;
}) {
  const [visible, setVisible] = useState(batchSize);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Filters changing swaps the whole list, so start from the top again.
  // Keyed on length plus the first slug: cheap, and correct for our cases.
  const listKey = `${items.length}:${items[0]?.slug ?? ""}`;
  useEffect(() => {
    setVisible(batchSize);
  }, [listKey, batchSize]);

  const shown = useMemo(() => items.slice(0, visible), [items, visible]);
  const hasMore = visible < items.length;

  useEffect(() => {
    if (!hasMore) return;
    const node = sentinelRef.current;
    if (!node) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          // rAF keeps the state update off the observer callback, which
          // avoids a layout thrash mid-scroll.
          requestAnimationFrame(() =>
            setVisible((v) => Math.min(v + batchSize, items.length))
          );
        }
      },
      // Start loading before the sentinel is actually on screen so the next
      // batch is painted by the time the reader gets there.
      { rootMargin: "1200px 0px" }
    );

    io.observe(node);
    return () => io.disconnect();
  }, [hasMore, batchSize, items.length]);

  return (
    <>
      <div className={`${columnsClass} gap-3 sm:gap-6 [column-fill:_balance]`}>
        {shown.map((w) => (
          <div
            key={w.slug}
            className="masonry-item mb-3 break-inside-avoid sm:mb-6"
          >
            <ArtworkCard artwork={w} artistName={names?.[w.artist]} />
          </div>
        ))}
      </div>

      {hasMore && (
        <div
          ref={sentinelRef}
          aria-hidden
          className="flex h-24 items-center justify-center"
        >
          <span className="text-xs tracking-[0.2em] text-muted">
            LOADING MORE
          </span>
        </div>
      )}

      {!hasMore && items.length > batchSize && (
        <p className="py-10 text-center text-xs tracking-[0.2em] text-muted">
          {items.length} ARTWORKS
        </p>
      )}

      {/* Local styles: a CSS fade costs nothing per item, unlike a motion
          component with its own observer and animation loop. */}
      <style jsx>{`
        .masonry-item {
          animation: masonry-fade 0.4s ease-out both;
        }
        @keyframes masonry-fade {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: none;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .masonry-item {
            animation: none;
          }
        }
      `}</style>
    </>
  );
}

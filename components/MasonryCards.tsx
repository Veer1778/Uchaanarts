"use client";

import { motion } from "motion/react";
import type { Artwork } from "@/lib/data";
import ArtworkCard from "./ArtworkCard";

/**
 * Masonry of product cards (Mojarto-style) via CSS multi-column flow so each
 * card keeps its natural image height with zero cropping.
 *
 * Two columns from the smallest breakpoint up, so phones show cards side by
 * side rather than one giant card per row.
 *
 * `names` is a plain slug -> artist name map. We deliberately avoid passing a
 * function here: Server Components can't hand functions to Client Components.
 */
export default function MasonryCards({
  items,
  names,
  columnsClass = "columns-2 lg:columns-3",
}: {
  items: Artwork[];
  names?: Record<string, string>;
  columnsClass?: string;
}) {
  return (
    <div className={`${columnsClass} gap-3 sm:gap-6 [column-fill:_balance]`}>
      {items.map((w, i) => (
        <motion.div
          key={w.slug}
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          /* Fire as soon as any sliver enters, with a margin so cards are
             already settled by the time they're actually on screen. */
          viewport={{ once: true, amount: 0, margin: "0px 0px -8% 0px" }}
          transition={{ duration: 0.4, delay: (i % 4) * 0.04 }}
          className="mb-3 break-inside-avoid sm:mb-6"
        >
          <ArtworkCard artwork={w} artistName={names?.[w.artist]} />
        </motion.div>
      ))}
    </div>
  );
}

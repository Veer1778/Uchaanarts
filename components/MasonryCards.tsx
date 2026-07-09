"use client";

import { motion } from "motion/react";
import type { Artwork } from "@/lib/data";
import ArtworkCard from "./ArtworkCard";

/**
 * Masonry of product cards (Mojarto-style) via CSS multi-column flow so each
 * card keeps its natural image height with zero cropping.
 *
 * `names` is a plain slug -> artist name map. We deliberately avoid passing a
 * function here: Server Components can't hand functions to Client Components.
 */
export default function MasonryCards({
  items,
  names,
  columnsClass = "columns-1 sm:columns-2 lg:columns-3",
}: {
  items: Artwork[];
  names?: Record<string, string>;
  columnsClass?: string;
}) {
  return (
    <div className={`${columnsClass} gap-6 [column-fill:_balance]`}>
      {items.map((w, i) => (
        <motion.div
          key={w.slug}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.5, delay: (i % 6) * 0.05 }}
          className="mb-6 break-inside-avoid"
        >
          <ArtworkCard artwork={w} artistName={names?.[w.artist]} />
        </motion.div>
      ))}
    </div>
  );
}

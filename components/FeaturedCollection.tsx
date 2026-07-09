"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Artwork } from "@/lib/data";
import MasonryCards from "./MasonryCards";

const tabs = ["Latest", "Popular", "Curated"] as const;
type Tab = (typeof tabs)[number];

export default function FeaturedCollection({ artworks }: { artworks: Artwork[] }) {
  const [tab, setTab] = useState<Tab>("Latest");

  // Tagged items first, then pad with the rest so every tab has ≥ 8 (2+ rows).
  const tagged = artworks.filter((w) => (w.tag ?? "Latest") === tab);
  const rest = artworks.filter((w) => !tagged.includes(w));
  const list = [...tagged, ...rest].slice(0, Math.max(8, tagged.length));

  return (
    <div>
      <div
        className="mb-10 flex flex-wrap gap-4"
        role="tablist"
        aria-label="Featured collection filters"
      >
        {tabs.map((t) => {
          const active = t === tab;
          return (
            <button
              key={t}
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t)}
              className={`rounded-xl border px-8 py-2 text-sm transition-colors ${
                active
                  ? "border-signal bg-signal text-white"
                  : "border-signal/50 text-ink hover:border-signal"
              }`}
            >
              {t}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
        >
          <MasonryCards items={list} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

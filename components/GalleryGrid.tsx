"use client";

import { useMemo, useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Artwork, Artist } from "@/lib/data";
import { categories } from "@/lib/data";
import MasonryCards from "./MasonryCards";
import FilterSidebar, { defaultFilters, type Filters } from "./FilterSidebar";

type Sort = "newest" | "price-asc" | "price-desc";

function orientationOf(w: Artwork): "Portrait" | "Landscape" | "Square" {
  const m = w.size.match(/(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)/i);
  if (!m) return "Square";
  const ratio = parseFloat(m[2]) / parseFloat(m[1]);
  if (ratio > 1.15) return "Portrait";
  if (ratio < 0.85) return "Landscape";
  return "Square";
}

function sizeBucket(w: Artwork): "S" | "M" | "L" {
  const m = w.size.match(/(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)/i);
  if (!m) return "M";
  const longest = Math.max(parseFloat(m[1]), parseFloat(m[2]));
  if (longest < 24) return "S";
  if (longest <= 48) return "M";
  return "L";
}

export default function GalleryGrid({
  artworks,
  artists,
  initialCategory,
  initialPriceBand,
}: {
  artworks: Artwork[];
  artists: Artist[];
  initialCategory?: string;
  initialPriceBand?: number;
}) {
  const [filters, setFilters] = useState<Filters>({
    ...defaultFilters,
    category: initialCategory ?? "All",
  });
  const [sort, setSort] = useState<Sort>("newest");

  useEffect(() => {
    if (initialPriceBand === undefined) return;
    const bands = [
      [0, 10000],
      [10000, 25000],
      [25000, 50000],
      [50000, 75000],
      [75000, 100000],
      [100000, 1000000],
    ];
    const b = bands[initialPriceBand];
    if (b) setFilters((f) => ({ ...f, priceMin: b[0], priceMax: b[1] }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const names = Object.fromEntries(artists.map((a) => [a.slug, a.name]));

  const filtered = useMemo(() => {
    let list = artworks.filter((w) => {
      if (filters.category !== "All" && w.category !== filters.category) return false;
      if (filters.artist !== "All" && w.artist !== filters.artist) return false;
      if (w.price < filters.priceMin || w.price > filters.priceMax) return false;
      if (filters.size && sizeBucket(w) !== filters.size) return false;
      if (filters.orientation && orientationOf(w) !== filters.orientation) return false;
      return true;
    });
    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [artworks, filters, sort]);

  return (
    <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
      <div>
        <FilterSidebar
          filters={filters}
          setFilters={setFilters}
          categories={[...categories]}
          artists={artists.map((a) => ({ slug: a.slug, name: a.name }))}
          onReset={() => setFilters(defaultFilters)}
        />
      </div>

      <div>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted" aria-live="polite">
            {filtered.length} artwork{filtered.length === 1 ? "" : "s"}
          </p>
          <label className="flex items-center gap-2 text-sm">
            <span className="text-muted">Sort</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="border border-line bg-paper px-3 py-2 text-sm focus:border-signal focus:outline-none"
            >
              <option value="newest">Newest first</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
            </select>
          </label>
        </div>

        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            <motion.p
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-16 text-center text-muted"
            >
              No artworks match these filters. Try widening the price range, or{" "}
              <a
                href="https://api.whatsapp.com/send?phone=918860277388"
                className="text-signal underline"
              >
                ask our curators
              </a>{" "}
              for a commission.
            </motion.p>
          ) : (
            <MasonryCards
              key={`${filters.category}-${filters.artist}-${sort}`}
              items={filtered}
              names={names}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Artwork, Artist } from "@/lib/data";
import MasonryCards from "./MasonryCards";
import FilterSidebar, {
  defaultFilters,
  activeFilterCount,
  type Filters,
} from "./FilterSidebar";
import { SlidersHorizontal, X, SearchX } from "lucide-react";
import EmptyState from "./ui/EmptyState";

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
  // Mobile: filters live in a slide-over sheet instead of stacking above the
  // grid, which pushed the artworks off the first screen entirely.
  const [sheetOpen, setSheetOpen] = useState(false);
  const activeCount = activeFilterCount(filters);

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

  // Filter options come from what is actually in the catalogue. The old
  // hardcoded lists in lib/data.ts were seeded from the demo set, so several
  // options matched nothing and returned an empty grid.
  const uniq = (vals: (string | undefined)[]) =>
    Array.from(new Set(vals.filter((v): v is string => !!v && v.trim() !== "")))
      .sort((a, b) => a.localeCompare(b));

  const options = useMemo(
    () => ({
      categories: uniq(artworks.map((w) => w.category as string)),
      styles: uniq(artworks.map((w) => w.style)),
      themes: uniq(artworks.map((w) => w.theme)),
      mediums: uniq(artworks.map((w) => w.mediumTerm)),
      materials: uniq(artworks.map((w) => w.material)),
      folkForms: uniq(artworks.map((w) => w.folkForm)),
    }),
    [artworks]
  );

  // Only artists who actually have work in the catalogue.
  const artistsWithWork = useMemo(() => {
    const present = new Set(artworks.map((w) => w.artist));
    return artists.filter((a) => present.has(a.slug));
  }, [artworks, artists]);

  const filtered = useMemo(() => {
    let list = artworks.filter((w) => {
      if (filters.category !== "All" && w.category !== filters.category) return false;
      if (filters.artist !== "All" && w.artist !== filters.artist) return false;
      // Price-on-request pieces have price 0. Only exclude them once the
      // buyer has actually narrowed the price range, otherwise a fifth of
      // the catalogue vanishes by default.
      const priceFiltered =
        filters.priceMin !== defaultFilters.priceMin ||
        filters.priceMax !== defaultFilters.priceMax;
      if (priceFiltered) {
        if (w.priceOnRequest) return false;
        if (w.price < filters.priceMin || w.price > filters.priceMax) return false;
      }
      if (filters.size && sizeBucket(w) !== filters.size) return false;
      if (filters.orientation && orientationOf(w) !== filters.orientation) return false;
      if (filters.style !== "All" && w.style !== filters.style) return false;
      if (filters.theme !== "All" && w.theme !== filters.theme) return false;
      if (filters.mediumTerm !== "All" && w.mediumTerm !== filters.mediumTerm) return false;
      if (filters.material !== "All" && w.material !== filters.material) return false;
      if (filters.folkForm !== "All" && w.folkForm !== filters.folkForm) return false;
      return true;
    });
    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [artworks, filters, sort]);

  const sidebar = (
    <FilterSidebar
      filters={filters}
      setFilters={setFilters}
      categories={options.categories}
      artists={artistsWithWork.map((a) => ({ slug: a.slug, name: a.name }))}
      styles={options.styles}
      themes={options.themes}
      mediums={options.mediums}
      materials={options.materials}
      folkForms={options.folkForms}
      onReset={() => setFilters(defaultFilters)}
    />
  );

  return (
    <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
      {/* Desktop sidebar. Sticks to the viewport and scrolls internally, so
          the artwork grid is the only thing that moves with the page. */}
      <div className="hidden lg:block">
        <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-2">
          {sidebar}
        </div>
      </div>

      {/* Mobile slide-over */}
      <AnimatePresence>
        {sheetOpen && (
          <>
            <motion.div
              key="scrim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSheetOpen(false)}
              className="fixed inset-0 z-50 bg-ink/40 lg:hidden"
            />
            <motion.aside
              key="sheet"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.28, ease: "easeOut" }}
              role="dialog"
              aria-modal="true"
              aria-label="Filters"
              className="fixed inset-y-0 left-0 z-50 flex w-[86%] max-w-sm flex-col bg-paper shadow-2xl lg:hidden"
            >
              <div className="flex items-center justify-between border-b border-line px-5 py-4">
                <p className="font-display text-2xl">Filters</p>
                <button
                  type="button"
                  onClick={() => setSheetOpen(false)}
                  aria-label="Close filters"
                  className="text-muted hover:text-ink"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-4">{sidebar}</div>
              <div className="border-t border-line px-5 py-4">
                <button
                  type="button"
                  onClick={() => setSheetOpen(false)}
                  className="w-full bg-ink px-5 py-3 text-xs tracking-[0.15em] text-paper"
                >
                  Show {filtered.length} artwork{filtered.length === 1 ? "" : "s"}
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Mobile trigger */}
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              className="flex items-center gap-2 border border-line px-3 py-2 text-sm lg:hidden"
            >
              <SlidersHorizontal size={15} />
              Filters
              {activeCount > 0 && (
                <span className="grid h-5 w-5 place-items-center rounded-full bg-signal text-[10px] text-paper">
                  {activeCount}
                </span>
              )}
            </button>
            <p className="text-sm text-muted" aria-live="polite">
              {filtered.length} artwork{filtered.length === 1 ? "" : "s"}
            </p>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <span className="text-muted">Sort</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="border border-line bg-paper px-3 py-2 text-sm focus:border-signal focus:outline-none"
            >
              <option value="newest">New to Old</option>
              <option value="price-asc">Low to High</option>
              <option value="price-desc">High to Low</option>
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
              key={`${filters.category}-${filters.artist}-${filters.style}-${filters.folkForm}-${sort}`}
              items={filtered}
              names={names}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

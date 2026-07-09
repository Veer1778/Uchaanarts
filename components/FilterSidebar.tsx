"use client";

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";

function Section({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-line py-4">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="text-sm font-medium">{title}</span>
        <span aria-hidden className="text-lg leading-none text-muted">
          {open ? "–" : "+"}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="pt-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export type Filters = {
  category: string;
  artist: string;
  priceMin: number;
  priceMax: number;
  size: "" | "S" | "M" | "L";
  orientation: "" | "Portrait" | "Landscape" | "Square";
};

export const defaultFilters: Filters = {
  category: "All",
  artist: "All",
  priceMin: 0,
  priceMax: 1000000,
  size: "",
  orientation: "",
};

export default function FilterSidebar({
  filters,
  setFilters,
  categories,
  artists,
  onReset,
}: {
  filters: Filters;
  setFilters: (f: Filters) => void;
  categories: string[];
  artists: { slug: string; name: string }[];
  onReset: () => void;
}) {
  const setField = <K extends keyof Filters>(k: K, v: Filters[K]) =>
    setFilters({ ...filters, [k]: v });

  return (
    <aside aria-label="Filter artworks" className="w-full">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="font-display text-2xl">Filters</h2>
        <button
          onClick={onReset}
          className="text-[11px] uppercase tracking-[0.14em] text-signal hover:underline"
        >
          Reset
        </button>
      </div>

      <Section title="Price" defaultOpen>
        <div className="space-y-3">
          <div className="relative h-1 rounded bg-line">
            <div
              className="absolute inset-y-0 rounded bg-signal"
              style={{
                left: `${(filters.priceMin / 1000000) * 100}%`,
                right: `${100 - (filters.priceMax / 1000000) * 100}%`,
              }}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={filters.priceMin}
              onChange={(e) => setField("priceMin", Number(e.target.value) || 0)}
              className="w-full border border-line px-2 py-1.5 text-sm focus:border-signal focus:outline-none"
              aria-label="Minimum price"
              min={0}
            />
            <span className="text-muted">–</span>
            <input
              type="number"
              value={filters.priceMax}
              onChange={(e) => setField("priceMax", Number(e.target.value) || 0)}
              className="w-full border border-line px-2 py-1.5 text-sm focus:border-signal focus:outline-none"
              aria-label="Maximum price"
              min={0}
            />
          </div>
        </div>
      </Section>

      <Section title="Size" defaultOpen>
        <div className="grid grid-cols-3 gap-2">
          {(["S", "M", "L"] as const).map((s) => {
            const active = filters.size === s;
            const range = s === "S" ? "< 24 in" : s === "M" ? "25 – 48 in" : "> 48 in";
            return (
              <button
                key={s}
                onClick={() => setField("size", active ? "" : s)}
                aria-pressed={active}
                className={`flex flex-col items-center gap-1 border px-2 py-3 transition-colors ${
                  active ? "border-signal bg-signal/5" : "border-line hover:border-signal"
                }`}
              >
                <span className="font-display text-lg">{s}</span>
                <span className="text-[10px] text-muted">{range}</span>
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Orientation">
        <div className="flex flex-wrap gap-2">
          {(["Portrait", "Landscape", "Square"] as const).map((o) => {
            const active = filters.orientation === o;
            return (
              <button
                key={o}
                onClick={() => setField("orientation", active ? "" : o)}
                aria-pressed={active}
                className={`border px-3 py-1.5 text-xs transition-colors ${
                  active ? "border-signal bg-signal/5" : "border-line hover:border-signal"
                }`}
              >
                {o}
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Medium / Category" defaultOpen>
        <div className="space-y-2">
          {["All", ...categories].map((c) => (
            <label key={c} className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="radio"
                name="category"
                checked={filters.category === c}
                onChange={() => setField("category", c)}
                className="accent-signal"
              />
              <span>{c}</span>
            </label>
          ))}
        </div>
      </Section>

      <Section title="Artist">
        <div className="space-y-2">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="radio"
              name="artist"
              checked={filters.artist === "All"}
              onChange={() => setField("artist", "All")}
              className="accent-signal"
            />
            <span>All artists</span>
          </label>
          {artists.map((a) => (
            <label
              key={a.slug}
              className="flex cursor-pointer items-center gap-2 text-sm"
            >
              <input
                type="radio"
                name="artist"
                checked={filters.artist === a.slug}
                onChange={() => setField("artist", a.slug)}
                className="accent-signal"
              />
              <span>{a.name}</span>
            </label>
          ))}
        </div>
      </Section>

      <Section title="Uchaan Picks">
        <p className="text-xs text-muted">
          Curator-selected works, updated monthly. Coming soon.
        </p>
      </Section>
    </aside>
  );
}

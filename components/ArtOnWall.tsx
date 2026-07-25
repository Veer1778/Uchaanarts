"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { X, Frame } from "lucide-react";

/**
 * Art on Wall — shows a work at true scale against a reference wall.
 *
 * The wall is 10 ft (120 in) floor to ceiling, so a 30 in painting occupies a
 * quarter of that height. Dimensions are parsed from the artwork's `size`
 * string, which may be two- or three-axis and in inches or centimetres:
 *
 *   "30 x 30 in"        -> 30 × 30 inches
 *   "17 x 19 x 5 in"    -> 17 × 19 inches (depth ignored for a wall view)
 *   "76 x 76 cm"        -> converted to inches
 *
 * A human silhouette can be toggled for a second scale cue, and the wall tone
 * can be switched so buyers can judge the work against their own room.
 */

const WALL_HEIGHT_IN = 120; // 10 ft

type Parsed = { w: number; h: number };

function parseSize(size: string): Parsed | null {
  if (!size) return null;
  const isCm = /cm/i.test(size);
  const nums = size.match(/[\d.]+/g);
  if (!nums || nums.length < 2) return null;
  // Width × height; a third value is depth and irrelevant on a wall.
  let w = parseFloat(nums[0]);
  let h = parseFloat(nums[1]);
  if (!Number.isFinite(w) || !Number.isFinite(h)) return null;
  if (isCm) {
    w /= 2.54;
    h /= 2.54;
  }
  return { w, h };
}

const walls = [
  { id: "white", label: "White", bg: "#ffffff" },
  { id: "beige", label: "Beige", bg: "#f4f1ea" },
  { id: "grey", label: "Grey", bg: "#d9d6d0" },
  { id: "charcoal", label: "Charcoal", bg: "#2b2a27" },
] as const;

export default function ArtOnWall({
  open,
  onClose,
  image,
  title,
  artistName,
  size,
}: {
  open: boolean;
  onClose: () => void;
  image: string;
  title: string;
  artistName?: string;
  size: string;
}) {
  const [wall, setWall] = useState<(typeof walls)[number]["id"]>("white");
  const [showFigure, setShowFigure] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const dims = useMemo(() => parseSize(size), [size]);

  if (!mounted || !open) return null;

  const wallTone = walls.find((w) => w.id === wall)!;
  const dark = wall === "charcoal";

  // Artwork height as a percentage of the 10 ft wall.
  const heightPct = dims ? (dims.h / WALL_HEIGHT_IN) * 100 : 25;
  const aspect = dims ? dims.w / dims.h : 1;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex flex-col bg-paper">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-line px-5 py-4 sm:px-8">
        <div className="flex items-center gap-2.5">
          <Frame size={16} />
          <p className="text-sm">
            Art on Wall
            <span className="ml-2 text-muted">
              — {title}
              {artistName ? ` · ${artistName}` : ""}
            </span>
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close preview"
          className="text-muted transition-colors hover:text-ink"
        >
          <X size={20} />
        </button>
      </div>

      {/* Scene */}
      <div
        className="relative flex-1 overflow-hidden transition-colors duration-300"
        style={{ background: wallTone.bg }}
      >
        {/* Floor */}
        <div
          className="absolute inset-x-0 bottom-0 h-[14%] border-t"
          style={{
            background: dark ? "#232220" : "#e8e4dc",
            borderColor: dark ? "#3a3835" : "#d8d3c9",
          }}
        />

        {/* 10 ft scale marker */}
        <div className="absolute bottom-[14%] left-6 top-8 hidden w-px sm:block"
             style={{ background: dark ? "#6b6862" : "#c9c4b8" }}>
          <span
            className="absolute -left-1.5 top-0 block h-px w-4"
            style={{ background: dark ? "#6b6862" : "#c9c4b8" }}
          />
          <span
            className="absolute -left-1.5 bottom-0 block h-px w-4"
            style={{ background: dark ? "#6b6862" : "#c9c4b8" }}
          />
          <span
            className={`absolute left-3 top-1/2 -translate-y-1/2 whitespace-nowrap text-[10px] tracking-[0.14em] ${
              dark ? "text-paper/60" : "text-muted"
            }`}
            style={{ writingMode: "vertical-rl" }}
          >
            10 ft ceiling
          </span>
        </div>

        {/* Wall content: figure + artwork share the floor line */}
        <div className="absolute inset-x-0 bottom-[14%] top-8 flex items-end justify-center gap-10 px-8 sm:gap-16">
          {showFigure && (
            <Figure
              // 5 ft 7 in average height as a share of the 10 ft wall
              heightPct={(67 / WALL_HEIGHT_IN) * 100}
              dark={dark}
            />
          )}

          {/* The work, hung with its centre at eye level (57 in) */}
          <div
            className="relative"
            style={{
              height: `${heightPct}%`,
              aspectRatio: `${aspect}`,
              marginBottom: `${((57 - (dims?.h ?? 30) / 2) / WALL_HEIGHT_IN) * 100}%`,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt={title}
              className="h-full w-full object-cover shadow-[0_18px_40px_-18px_rgba(0,0,0,0.45)]"
            />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="border-t border-line px-5 py-4 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs text-muted">Wall</span>
            {walls.map((w) => (
              <button
                key={w.id}
                type="button"
                onClick={() => setWall(w.id)}
                aria-label={`${w.label} wall`}
                aria-pressed={wall === w.id}
                className={`h-7 w-7 border transition-transform ${
                  wall === w.id ? "border-ink scale-110" : "border-line"
                }`}
                style={{ background: w.bg }}
              />
            ))}
          </div>

          <label className="flex items-center gap-2 text-xs text-muted">
            <input
              type="checkbox"
              checked={showFigure}
              onChange={(e) => setShowFigure(e.target.checked)}
              className="h-3.5 w-3.5 accent-black"
            />
            Show figure for scale
          </label>

          <p className="text-xs text-muted">
            {dims
              ? `${round(dims.w)} × ${round(dims.h)} in · ${round(
                  dims.w * 2.54
                )} × ${round(dims.h * 2.54)} cm`
              : size}
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}

const round = (n: number) => Math.round(n * 10) / 10;

/** Simple silhouette — a scale cue, not a character. */
function Figure({ heightPct, dark }: { heightPct: number; dark: boolean }) {
  const fill = dark ? "#4a4844" : "#cfcabf";
  return (
    <svg
      viewBox="0 0 40 160"
      style={{ height: `${heightPct}%` }}
      className="w-auto shrink-0"
      aria-hidden
    >
      <circle cx="20" cy="14" r="10" fill={fill} />
      <path
        d="M20 26c-9 0-14 6-14 14v34c0 3 2 5 4 5l1 33c0 3 2 5 4 5h10c2 0 4-2 4-5l1-33c2 0 4-2 4-5V40c0-8-5-14-14-14z"
        fill={fill}
      />
    </svg>
  );
}

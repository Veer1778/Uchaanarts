"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { X, Frame as FrameIcon } from "lucide-react";

/**
 * Art on Wall — a generic interior with a scale rule, in the manner of the
 * room previews used across art marketplaces.
 *
 * The scene is drawn rather than photographed, which matters for accuracy: it
 * is constructed on a measurement grid (90 units = 1 ft, wall 10 ft floor to
 * ceiling), so every element sits at its true size and the artwork can be
 * placed exactly. A photograph would need per-image calibration to achieve the
 * same thing, and would still distort with the lens used.
 *
 * The work hangs with its centre at 57 in — the museum standard eye level.
 *
 * Sizes are read from the artwork's `size` string, two- or three-axis, in
 * inches or centimetres: "30 x 30 in" · "17 x 19 x 5 in" · "76 x 76 cm".
 */

const PPF = 90; // units per foot
const FLOOR_Y = 900; // wall/floor junction
const SCENE_W = 1600;
const SCENE_H = 1010;
const EYE_LEVEL_IN = 57;

const ft = (f: number) => f * PPF;
const inch = (i: number) => (i / 12) * PPF;

type Parsed = { w: number; h: number };

function parseSize(size: string): Parsed | null {
  if (!size) return null;
  const isCm = /cm/i.test(size);
  const nums = size.match(/[\d.]+/g);
  if (!nums || nums.length < 2) return null;
  let w = parseFloat(nums[0]);
  let h = parseFloat(nums[1]);
  if (!Number.isFinite(w) || !Number.isFinite(h)) return null;
  if (isCm) {
    w /= 2.54;
    h /= 2.54;
  }
  return { w, h };
}

const round = (n: number) => Math.round(n * 10) / 10;

const walls = [
  { id: "white", label: "White", a: "#fbfaf7", b: "#eeece6" },
  { id: "beige", label: "Beige", a: "#f6f2e9", b: "#e7e1d3" },
  { id: "grey", label: "Grey", a: "#dedbd5", b: "#cbc8c1" },
  { id: "charcoal", label: "Charcoal", a: "#35342f", b: "#242320" },
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
  const [wallId, setWallId] = useState<(typeof walls)[number]["id"]>("white");
  const [framed, setFramed] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

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

  const tone = walls.find((w) => w.id === wallId)!;
  const dark = wallId === "charcoal";

  const art = dims ?? { w: 30, h: 30 };
  const artW = inch(art.w);
  const artH = inch(art.h);
  const artCx = SCENE_W * 0.52;
  const artCy = FLOOR_Y - inch(EYE_LEVEL_IN);
  const frameW = framed ? Math.max(artW * 0.03, 5) : 0;

  // Neutral furniture tones that sit inside the site palette.
  const solid = dark ? "#46443f" : "#c9c4b9";
  const shade = dark ? "#3a3833" : "#b6b0a3";
  const light = dark ? "#57544d" : "#dcd7cc";
  const ruleColor = dark ? "#8b877f" : "#57534a";

  return createPortal(
    <div className="fixed inset-0 z-[100] flex flex-col bg-paper">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4 sm:px-8">
        <div className="flex min-w-0 items-center gap-2.5">
          <FrameIcon size={16} className="shrink-0" />
          <p className="truncate text-sm">
            {title}
            {artistName && <span className="text-muted"> · {artistName}</span>}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close preview"
          className="shrink-0 text-muted transition-colors hover:text-ink"
        >
          <X size={20} />
        </button>
      </div>

      {/* Scene */}
      <div className="relative flex-1 overflow-hidden bg-wash">
        <svg
          viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}
          preserveAspectRatio="xMidYMid slice"
          className="h-full w-full"
          role="img"
          aria-label={`${title} shown to scale against a ten foot wall`}
        >
          <defs>
            <linearGradient id="aowWall" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={tone.a} />
              <stop offset="100%" stopColor={tone.b} />
            </linearGradient>
            <linearGradient id="aowFloor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={dark ? "#2b2a26" : "#cfc6b4"} />
              <stop offset="100%" stopColor={dark ? "#1d1c1a" : "#bdb29c"} />
            </linearGradient>
            <radialGradient id="aowLight" cx="52%" cy="2%" r="62%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity={dark ? 0.12 : 0.6} />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="aowCurtain" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={light} />
              <stop offset="50%" stopColor={solid} />
              <stop offset="100%" stopColor={shade} />
            </linearGradient>
            <filter id="aowArtShadow" x="-40%" y="-40%" width="180%" height="200%">
              <feDropShadow
                dx="0"
                dy="9"
                stdDeviation="13"
                floodColor="#000"
                floodOpacity={dark ? 0.55 : 0.3}
              />
            </filter>
            <filter id="aowSoft" x="-40%" y="-40%" width="180%" height="180%">
              <feDropShadow dx="0" dy="7" stdDeviation="11" floodColor="#000" floodOpacity="0.14" />
            </filter>
          </defs>

          {/* ---- Wall ---- */}
          <rect x="0" y="0" width={SCENE_W} height={FLOOR_Y} fill="url(#aowWall)" />
          <rect x="0" y="0" width={SCENE_W} height={FLOOR_Y} fill="url(#aowLight)" />

          {/* Panel seams, as in a rendered interior */}
          {[0.3, 0.62].map((t) => (
            <line
              key={t}
              x1="0"
              x2={SCENE_W}
              y1={FLOOR_Y * t}
              y2={FLOOR_Y * t}
              stroke={dark ? "#000" : "#000"}
              strokeOpacity={dark ? 0.22 : 0.05}
              strokeWidth="2"
            />
          ))}

          {/* ---- Floor ---- */}
          <rect x="0" y={FLOOR_Y} width={SCENE_W} height={SCENE_H - FLOOR_Y} fill="url(#aowFloor)" />
          {[0.25, 0.55, 0.85].map((t) => (
            <line
              key={t}
              x1="0"
              x2={SCENE_W}
              y1={FLOOR_Y + (SCENE_H - FLOOR_Y) * t}
              y2={FLOOR_Y + (SCENE_H - FLOOR_Y) * t}
              stroke="#000"
              strokeOpacity="0.09"
              strokeWidth="2"
            />
          ))}
          {/* plank joins */}
          {[220, 640, 1080, 1440].map((x, i) => (
            <line
              key={x}
              x1={x}
              x2={x}
              y1={FLOOR_Y + (i % 2 ? 30 : 0)}
              y2={FLOOR_Y + (i % 2 ? 78 : 42)}
              stroke="#000"
              strokeOpacity="0.08"
              strokeWidth="2"
            />
          ))}

          {/* Skirting */}
          <rect x="0" y={FLOOR_Y - 24} width={SCENE_W} height="24" fill={dark ? "#2e2d29" : "#f3f1ea"} />
          <line x1="0" x2={SCENE_W} y1={FLOOR_Y - 24} y2={FLOOR_Y - 24} stroke="#000" strokeOpacity="0.12" strokeWidth="2" />

          {/* ---- Curtain, far right ---- */}
          <g>
            <rect x={SCENE_W - ft(2.6)} y="0" width={ft(2.6)} height={FLOOR_Y} fill="url(#aowCurtain)" opacity="0.9" />
            {[0.18, 0.42, 0.68, 0.9].map((t) => (
              <line
                key={t}
                x1={SCENE_W - ft(2.6) + ft(2.6) * t}
                x2={SCENE_W - ft(2.6) + ft(2.6) * t}
                y1="0"
                y2={FLOOR_Y}
                stroke="#000"
                strokeOpacity="0.07"
                strokeWidth="6"
              />
            ))}
          </g>

          {/* ---- Armchair (3 ft wide, 2 ft 8 tall) ---- */}
          <g filter="url(#aowSoft)">
            <rect x={ft(11.6)} y={FLOOR_Y - ft(2.65)} width={ft(3)} height={ft(2.35)} rx="16" fill={solid} />
            <rect x={ft(11.85)} y={FLOOR_Y - ft(1.55)} width={ft(2.5)} height={ft(1.25)} rx="12" fill={light} />
            <rect x={ft(11.6)} y={FLOOR_Y - ft(1.75)} width={ft(0.42)} height={ft(1.45)} rx="10" fill={shade} />
            <rect x={ft(14.18)} y={FLOOR_Y - ft(1.75)} width={ft(0.42)} height={ft(1.45)} rx="10" fill={shade} />
            <rect x={ft(11.95)} y={FLOOR_Y - ft(0.3)} width="13" height={ft(0.3)} fill={shade} />
            <rect x={ft(14.05)} y={FLOOR_Y - ft(0.3)} width="13" height={ft(0.3)} fill={shade} />
            {/* throw */}
            <path
              d={`M ${ft(13.6)} ${FLOOR_Y - ft(2.55)} q ${ft(0.7)} ${ft(0.9)} ${ft(0.25)} ${ft(1.9)} l ${-ft(0.5)} 0 q ${ft(0.35)} ${-ft(1)} ${-ft(0.3)} ${-ft(1.85)} Z`}
              fill={light}
              opacity="0.95"
            />
          </g>

          {/* ---- Floor lamp (5 ft 6) ---- */}
          <g filter="url(#aowSoft)">
            <ellipse cx={ft(15.75)} cy={FLOOR_Y - ft(0.06)} rx={ft(0.44)} ry={ft(0.1)} fill={shade} />
            <rect x={ft(15.71)} y={FLOOR_Y - ft(5.4)} width="7" height={ft(5.35)} fill={shade} />
            <path
              d={`M ${ft(15.25)} ${FLOOR_Y - ft(5.4)} L ${ft(16.3)} ${FLOOR_Y - ft(5.4)} L ${ft(16.08)} ${FLOOR_Y - ft(4.78)} L ${ft(15.47)} ${FLOOR_Y - ft(4.78)} Z`}
              fill={dark ? "#6a675f" : "#e9e4d8"}
            />
          </g>

          {/* ---- Plant (3 ft 8) ---- */}
          <g filter="url(#aowSoft)">
            <path
              d={`M ${ft(9.5)} ${FLOOR_Y - ft(0.92)} L ${ft(10.32)} ${FLOOR_Y - ft(0.92)} L ${ft(10.12)} ${FLOOR_Y - ft(0.04)} L ${ft(9.7)} ${FLOOR_Y - ft(0.04)} Z`}
              fill={dark ? "#54514a" : "#e4dfd3"}
            />
            {[-0.85, -0.35, 0.15, 0.6].map((lean, i) => (
              <path
                key={i}
                d={`M ${ft(9.91)} ${FLOOR_Y - ft(0.92)} Q ${ft(9.91 + lean * 0.5)} ${FLOOR_Y - ft(2.2)} ${ft(9.91 + lean)} ${FLOOR_Y - ft(3.5 - Math.abs(lean) * 0.45)}`}
                stroke={solid}
                strokeWidth="10"
                fill="none"
                strokeLinecap="round"
              />
            ))}
          </g>

          {/* ---- The artwork ---- */}
          <g filter="url(#aowArtShadow)">
            {framed && (
              <rect
                x={artCx - artW / 2 - frameW}
                y={artCy - artH / 2 - frameW}
                width={artW + frameW * 2}
                height={artH + frameW * 2}
                fill={dark ? "#e9e5db" : "#23221e"}
              />
            )}
            <image
              href={image}
              x={artCx - artW / 2}
              y={artCy - artH / 2}
              width={artW}
              height={artH}
              preserveAspectRatio="xMidYMid slice"
            />
          </g>

          {/* ---- 10 FT scale rule ---- */}
          <g stroke={ruleColor} strokeWidth="2.5" fill="none">
            <line x1={ft(4.6)} x2={ft(4.6)} y1="18" y2={FLOOR_Y} />
            <line x1={ft(4.35)} x2={ft(4.85)} y1="18" y2="18" />
            <line x1={ft(4.35)} x2={ft(4.85)} y1={FLOOR_Y} y2={FLOOR_Y} />
            {/* foot ticks */}
            {Array.from({ length: 9 }, (_, i) => i + 1).map((f) => (
              <line
                key={f}
                x1={ft(4.6)}
                x2={ft(4.78)}
                y1={FLOOR_Y - ft(f)}
                y2={FLOOR_Y - ft(f)}
                strokeWidth="1.5"
                strokeOpacity="0.65"
              />
            ))}
          </g>
          <text
            x={ft(4.28)}
            y={FLOOR_Y / 2}
            fill={ruleColor}
            fontSize="30"
            letterSpacing="4"
            textAnchor="middle"
            transform={`rotate(-90 ${ft(4.28)} ${FLOOR_Y / 2})`}
          >
            10 FT
          </text>
        </svg>
      </div>

      {/* Controls */}
      <div className="border-t border-line px-5 py-4 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3">
          <div className="flex items-center gap-2">
            <span className="mr-1 text-xs text-muted">Wall</span>
            {walls.map((w) => (
              <button
                key={w.id}
                type="button"
                onClick={() => setWallId(w.id)}
                aria-label={`${w.label} wall`}
                aria-pressed={wallId === w.id}
                className={`h-7 w-7 border transition-transform ${
                  wallId === w.id ? "scale-110 border-ink" : "border-line"
                }`}
                style={{ background: w.a }}
              />
            ))}
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-xs text-muted">
            <input
              type="checkbox"
              checked={framed}
              onChange={(e) => setFramed(e.target.checked)}
              className="h-3.5 w-3.5 accent-black"
            />
            Framed
          </label>

          <p className="text-xs text-muted">
            {dims
              ? `${round(dims.w)} × ${round(dims.h)} in · ${round(dims.w * 2.54)} × ${round(
                  dims.h * 2.54
                )} cm · hung at ${EYE_LEVEL_IN} in`
              : size}
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}

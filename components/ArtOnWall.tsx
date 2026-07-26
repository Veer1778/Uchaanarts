"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { X, Frame as FrameIcon } from "lucide-react";

/**
 * Art on Wall — a to-scale room view.
 *
 * The scene is drawn in SVG on a real measurement grid: the wall is 10 ft from
 * floor to ceiling and 90 user units = 1 ft, so every element (sofa, lamp,
 * plant, figure) sits at its true size and the artwork can be compared against
 * them honestly. The work hangs with its centre at 57 in, the museum standard
 * eye level.
 *
 * Dimensions come from the artwork's `size` string, which may be two- or
 * three-axis and in inches or centimetres:
 *   "30 x 30 in" · "17 x 19 x 5 in" · "76 x 76 cm"
 */

const PPF = 90; // pixels (user units) per foot
const FLOOR_Y = 900; // wall/floor junction
const SCENE_W = 1600;
const SCENE_H = 1010;
const EYE_LEVEL_IN = 57;

const ft = (feet: number) => feet * PPF;
const inches = (i: number) => (i / 12) * PPF;

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

const walls = [
  { id: "white", label: "White", top: "#ffffff", bottom: "#f1efe9" },
  { id: "beige", label: "Beige", top: "#f7f4ec", bottom: "#eae5d8" },
  { id: "grey", label: "Grey", top: "#dcd9d3", bottom: "#cbc7c0" },
  { id: "charcoal", label: "Charcoal", top: "#33322e", bottom: "#232220" },
] as const;

type WallId = (typeof walls)[number]["id"];

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
  const [wall, setWall] = useState<WallId>("white");
  const [framed, setFramed] = useState(true);
  const [furnished, setFurnished] = useState(true);
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

  const tone = walls.find((w) => w.id === wall)!;
  const dark = wall === "charcoal";

  // Artwork geometry in scene units
  const artW = inches(dims?.w ?? 30);
  const artH = inches(dims?.h ?? 30);
  const artCx = SCENE_W / 2;
  const artCy = FLOOR_Y - inches(EYE_LEVEL_IN);
  const frameW = framed ? Math.max(artW * 0.035, 6) : 0;

  const furnitureFill = dark ? "#3f3e3a" : "#cbc6ba";
  const furnitureDeep = dark ? "#4a4844" : "#bdb7a9";
  const floorTop = dark ? "#2a2926" : "#d8d2c5";
  const floorBottom = dark ? "#1f1e1c" : "#c8c1b1";

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
          aria-label={`${title} shown to scale on a ten foot wall`}
        >
          <defs>
            <linearGradient id="wallGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={tone.top} />
              <stop offset="100%" stopColor={tone.bottom} />
            </linearGradient>
            <linearGradient id="floorGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={floorTop} />
              <stop offset="100%" stopColor={floorBottom} />
            </linearGradient>
            {/* Pool of light from above, so the wall isn't flat */}
            <radialGradient id="lightPool" cx="50%" cy="0%" r="70%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity={dark ? 0.13 : 0.55} />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>
            <filter id="artShadow" x="-30%" y="-30%" width="160%" height="180%">
              <feDropShadow
                dx="0"
                dy="10"
                stdDeviation="14"
                floodColor="#000000"
                floodOpacity={dark ? 0.5 : 0.28}
              />
            </filter>
            <filter id="softShadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="6" stdDeviation="9" floodColor="#000000" floodOpacity="0.13" />
            </filter>
          </defs>

          {/* Wall */}
          <rect x="0" y="0" width={SCENE_W} height={FLOOR_Y} fill="url(#wallGrad)" />
          <rect x="0" y="0" width={SCENE_W} height={FLOOR_Y} fill="url(#lightPool)" />

          {/* Floor */}
          <rect x="0" y={FLOOR_Y} width={SCENE_W} height={SCENE_H - FLOOR_Y} fill="url(#floorGrad)" />
          {/* Board seams, receding */}
          {[0.18, 0.42, 0.7].map((t) => (
            <line
              key={t}
              x1="0"
              x2={SCENE_W}
              y1={FLOOR_Y + (SCENE_H - FLOOR_Y) * t}
              y2={FLOOR_Y + (SCENE_H - FLOOR_Y) * t}
              stroke={dark ? "#000000" : "#b9b2a1"}
              strokeOpacity="0.35"
              strokeWidth="1.5"
            />
          ))}

          {/* Skirting board */}
          <rect
            x="0"
            y={FLOOR_Y - 26}
            width={SCENE_W}
            height="26"
            fill={dark ? "#2c2b28" : "#efece4"}
          />
          <line
            x1="0"
            x2={SCENE_W}
            y1={FLOOR_Y - 26}
            y2={FLOOR_Y - 26}
            stroke={dark ? "#000000" : "#cfc9bb"}
            strokeWidth="2"
          />

          {furnished && (
            <g>
              {/* Sofa — 7 ft wide, 2 ft 6 in tall */}
              <g filter="url(#softShadow)">
                <rect
                  x={ft(1.1)}
                  y={FLOOR_Y - ft(2.4)}
                  width={ft(7)}
                  height={ft(2.1)}
                  rx="14"
                  fill={furnitureFill}
                />
                <rect
                  x={ft(1.1)}
                  y={FLOOR_Y - ft(1.35)}
                  width={ft(7)}
                  height={ft(1.05)}
                  rx="12"
                  fill={furnitureDeep}
                />
                {/* legs */}
                <rect x={ft(1.5)} y={FLOOR_Y - ft(0.32)} width="14" height={ft(0.32)} fill={furnitureDeep} />
                <rect x={ft(7.6)} y={FLOOR_Y - ft(0.32)} width="14" height={ft(0.32)} fill={furnitureDeep} />
                {/* cushions */}
                <line
                  x1={ft(3.4)}
                  x2={ft(3.4)}
                  y1={FLOOR_Y - ft(2.3)}
                  y2={FLOOR_Y - ft(1.4)}
                  stroke={furnitureDeep}
                  strokeWidth="3"
                />
                <line
                  x1={ft(5.8)}
                  x2={ft(5.8)}
                  y1={FLOOR_Y - ft(2.3)}
                  y2={FLOOR_Y - ft(1.4)}
                  stroke={furnitureDeep}
                  strokeWidth="3"
                />
              </g>

              {/* Floor lamp — 5 ft 6 in */}
              <g filter="url(#softShadow)">
                <rect x={ft(15.2)} y={FLOOR_Y - ft(5.5)} width="6" height={ft(5.2)} fill={furnitureDeep} />
                <path
                  d={`M ${ft(14.75)} ${FLOOR_Y - ft(5.5)} L ${ft(15.9)} ${FLOOR_Y - ft(5.5)} L ${ft(
                    15.65
                  )} ${FLOOR_Y - ft(4.85)} L ${ft(15.0)} ${FLOOR_Y - ft(4.85)} Z`}
                  fill={dark ? "#5a5852" : "#e6e1d4"}
                />
                <ellipse cx={ft(15.35)} cy={FLOOR_Y - ft(0.28)} rx={ft(0.5)} ry={ft(0.12)} fill={furnitureDeep} />
              </g>

              {/* Plant — 4 ft */}
              <g filter="url(#softShadow)">
                <path
                  d={`M ${ft(10.4)} ${FLOOR_Y - ft(0.95)} L ${ft(11.25)} ${FLOOR_Y - ft(0.95)} L ${ft(
                    11.05
                  )} ${FLOOR_Y - ft(0.05)} L ${ft(10.6)} ${FLOOR_Y - ft(0.05)} Z`}
                  fill={furnitureDeep}
                />
                {[-1, -0.45, 0.1, 0.6].map((lean, i) => (
                  <path
                    key={i}
                    d={`M ${ft(10.82)} ${FLOOR_Y - ft(0.95)} Q ${ft(10.82 + lean * 0.55)} ${
                      FLOOR_Y - ft(2.4)
                    } ${ft(10.82 + lean)} ${FLOOR_Y - ft(3.6 - Math.abs(lean) * 0.5)}`}
                    stroke={furnitureFill}
                    strokeWidth="9"
                    fill="none"
                    strokeLinecap="round"
                  />
                ))}
              </g>
            </g>
          )}

          {/* Human figure — 5 ft 7 in, for scale */}
          <g opacity={dark ? 0.5 : 0.42}>
            <circle cx={ft(12.9)} cy={FLOOR_Y - ft(5.25)} r={ft(0.36)} fill={furnitureDeep} />
            <path
              d={`M ${ft(12.9)} ${FLOOR_Y - ft(4.85)}
                  c ${-ft(0.55)} 0 ${-ft(0.8)} ${ft(0.4)} ${-ft(0.8)} ${ft(0.95)}
                  l 0 ${ft(1.5)}
                  c 0 ${ft(0.2)} ${ft(0.12)} ${ft(0.3)} ${ft(0.26)} ${ft(0.3)}
                  l ${ft(0.06)} ${ft(2.05)}
                  c 0 ${ft(0.2)} ${ft(0.14)} ${ft(0.3)} ${ft(0.28)} ${ft(0.3)}
                  l ${ft(0.42)} 0
                  c ${ft(0.14)} 0 ${ft(0.28)} ${-ft(0.1)} ${ft(0.28)} ${-ft(0.3)}
                  l ${ft(0.06)} ${-ft(2.05)}
                  c ${ft(0.14)} 0 ${ft(0.26)} ${-ft(0.1)} ${ft(0.26)} ${-ft(0.3)}
                  l 0 ${-ft(1.5)}
                  c 0 ${-ft(0.55)} ${-ft(0.25)} ${-ft(0.95)} ${-ft(0.8)} ${-ft(0.95)} Z`}
              fill={furnitureDeep}
            />
          </g>

          {/* The artwork */}
          <g filter="url(#artShadow)">
            {framed && (
              <rect
                x={artCx - artW / 2 - frameW}
                y={artCy - artH / 2 - frameW}
                width={artW + frameW * 2}
                height={artH + frameW * 2}
                fill={dark ? "#e8e4da" : "#26251f"}
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

          {/* Ceiling-height dimension line */}
          <g stroke={dark ? "#7a7770" : "#a8a196"} strokeWidth="2">
            <line x1={ft(0.55)} x2={ft(0.55)} y1="14" y2={FLOOR_Y} />
            <line x1={ft(0.3)} x2={ft(0.8)} y1="14" y2="14" />
            <line x1={ft(0.3)} x2={ft(0.8)} y1={FLOOR_Y} y2={FLOOR_Y} />
          </g>
          <text
            x={ft(0.95)}
            y={FLOOR_Y / 2}
            fill={dark ? "#9a968e" : "#6f6b61"}
            fontSize="26"
            letterSpacing="3"
            dominantBaseline="middle"
          >
            10 ft
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
                onClick={() => setWall(w.id)}
                aria-label={`${w.label} wall`}
                aria-pressed={wall === w.id}
                className={`h-7 w-7 border transition-transform ${
                  wall === w.id ? "scale-110 border-ink" : "border-line"
                }`}
                style={{ background: w.top }}
              />
            ))}
          </div>

          <div className="flex items-center gap-5 text-xs text-muted">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={framed}
                onChange={(e) => setFramed(e.target.checked)}
                className="h-3.5 w-3.5 accent-black"
              />
              Framed
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={furnished}
                onChange={(e) => setFurnished(e.target.checked)}
                className="h-3.5 w-3.5 accent-black"
              />
              Furniture
            </label>
          </div>

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

const round = (n: number) => Math.round(n * 10) / 10;

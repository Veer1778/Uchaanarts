"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";

/**
 * Hero — scattered collage with mouse-move depth parallax and a text SHIELD.
 *
 * The shield is geometric, not CSS: the headline block's rectangle is measured
 * (plus padding), and every artwork's rectangle is kept fully outside it —
 * at rest, on resize, and on every parallax frame. If a piece's target
 * position would intersect the shield, it is pushed out along the axis of
 * least penetration before the eased setter receives it. Images can drift
 * around the text but can never cover it or slide beneath it.
 */

const U = "https://www.uchaanarts.com/uploaded_files";

/** Padding around the measured text block, in px. */
const SHIELD_PAD = 28;

type Piece = {
  src: string;
  slug: string;
  title: string;
  /** desktop absolute position + WIDTH only (height is natural, uncropped) */
  pos: string;
  /** parallax travel in px at full cursor deflection */
  depth: number;
  /** placeholder repeat — shown in the desktop collage, skipped on mobile */
  placeholder?: boolean;
};

/* ArteFACT spacing: pieces fill the whole field — corners, rails, and a few
   sitting beside the text — at moderate sizes. */
const pieces: Piece[] = [
  { src: `${U}/slider/1728130444_ganesha_series_36x54_oil_on_linen_canvas_300000_-_copy.jpg`, slug: "ganesha-series", title: "Ganesha Series", pos: "left-[9%] top-[2%] w-40", depth: 18 },
  { src: `${U}/itempic/thumbmain/1741109721_su.jpg`, slug: "maya", title: "Maya", pos: "left-[28%] -top-[2%] w-48", depth: 34 },
  { src: `${U}/itempic/thumbmain/1732105315_raghu_neware_search_of_eternity-1203__36x36_oil_on_canvas_180000.jpg`, slug: "search-of-eternity", title: "Search of Eternity", pos: "left-[49%] top-[9%] w-40", depth: 28 },
  { src: `${U}/itempic/thumbmain/1747563640_horse_resonance_1.JPG`, slug: "horse-resonance-1", title: "Horse, Resonance", pos: "right-[23%] top-[2%] w-44", depth: 48 },
  { src: `${U}/itempic/thumbmain/1740229981_pankaj_bawadekar.jpg`, slug: "procession", title: "Procession", pos: "right-[3%] top-[7%] w-48", depth: 30 },
  { src: `${U}/itempic/thumbmain/1744531634_whatsapp_image_2025-04-12_at_190101_5eb25f3e.jpg`, slug: "market-hustle", title: "Market Hustle", pos: "left-[2%] top-[28%] w-44", depth: 26 },
  { src: `${U}/itempic/thumbmain/1726310195_agomoni_17x19x5_bronze_140000.jpg`, slug: "agomoni", title: "Agomoni", pos: "left-[14%] top-[32%] w-40", depth: 44 },
  { src: `${U}/slider/1764488212_untitled_design_2.png`, slug: "cosmos-within", title: "Cosmos Within", pos: "right-[17%] top-[30%] w-36", depth: 24 },
  { src: `${U}/itempic/thumbmain/1780502416_vijay_nandi_2.jpeg`, slug: "divine-harmony", title: "Divine Harmony", pos: "right-[7%] top-[44%] w-44", depth: 36 },
  { src: `${U}/slider/1724254173_wash_copy.jpg`, slug: "monsoon-wash", title: "Monsoon Wash", pos: "left-[7%] top-[62%] w-44", depth: 42 },
  { src: `${U}/itempic/thumbmain/1763810405_whatsapp_image_2025-11-22_at_160530.jpeg`, slug: "posing-on-a-boat", title: "Posing on a Boat", pos: "left-[27%] top-[64%] w-48", depth: 22 },

  /* -- Placeholder repeats to fill remaining gaps (desktop collage only). --
     Swap these for real artworks whenever; `placeholder: true` keeps them out
     of the mobile masonry so nothing shows twice there. */
  { src: `${U}/slider/1762953059_untitled_design_2.jpg`, slug: "posing-on-a-boat", title: "Banaras", pos: "right-[2%] top-[64%] w-52", depth: 26, placeholder: true },
  { src: `${U}/itempic/thumbmain/1744531634_whatsapp_image_2025-04-12_at_190101_5eb25f3e.jpg`, slug: "market-hustle", title: "Market Hustle", pos: "right-[19%] top-[68%] w-40", depth: 38, placeholder: true },
  { src: `${U}/itempic/thumbmain/1741109721_su.jpg`, slug: "maya", title: "Maya", pos: "left-[48%] top-[74%] w-40", depth: 30, placeholder: true },
  { src: `${U}/itempic/thumbmain/1726310195_agomoni_17x19x5_bronze_140000.jpg`, slug: "agomoni", title: "Agomoni", pos: "right-[26%] top-[52%] w-36", depth: 44, placeholder: true },
];

type Rect = { l: number; t: number; r: number; b: number };

/** Minimal (dx, dy) that moves `rect` fully outside `shield`; 0,0 if clear. */
function pushOut(rect: Rect, shield: Rect): { dx: number; dy: number } {
  const overlapX = Math.min(rect.r, shield.r) - Math.max(rect.l, shield.l);
  const overlapY = Math.min(rect.b, shield.b) - Math.max(rect.t, shield.t);
  if (overlapX <= 0 || overlapY <= 0) return { dx: 0, dy: 0 };

  // Push along the axis of least penetration, toward the nearer side.
  const rectCx = (rect.l + rect.r) / 2;
  const rectCy = (rect.t + rect.b) / 2;
  const shieldCx = (shield.l + shield.r) / 2;
  const shieldCy = (shield.t + shield.b) / 2;

  if (overlapX < overlapY) {
    return { dx: rectCx < shieldCx ? -overlapX : overlapX, dy: 0 };
  }
  return { dx: 0, dy: rectCy < shieldCy ? -overlapY : overlapY };
}

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const shieldRef = useRef<HTMLDivElement>(null);
  const pieceRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      // Entrance: opacity/scale only, so it never fights the parallax x/y.
      gsap.from(".hero-word", { yPercent: 115, duration: 1, stagger: 0.12, ease: "power4.out" });
      gsap.from(".hero-piece", {
        opacity: 0,
        scale: 0.85,
        duration: 0.7,
        stagger: 0.06,
        ease: "back.out(1.6)",
        delay: 0.5,
      });
      gsap.from(".hero-sub", { opacity: 0, y: 16, duration: 0.7, delay: 0.9, ease: "power3.out" });
    }, root);

    // ---- Parallax + shield (desktop pointers only) ----
    const fine = window.matchMedia("(pointer: fine)").matches;
    let onMove: ((e: MouseEvent) => void) | null = null;
    let onResize: (() => void) | null = null;
    let onLoad: (() => void) | null = null;
    let io: IntersectionObserver | null = null;
    let timeoutId: number | null = null;

    if (fine) {
      const els = pieceRefs.current.filter((el): el is HTMLDivElement => Boolean(el));

      const setters = els.map((el, i) => ({
        el,
        x: gsap.quickTo(el, "x", { duration: 1.1, ease: "power3.out" }),
        y: gsap.quickTo(el, "y", { duration: 1.1, ease: "power3.out" }),
        depth: pieces[i]?.depth ?? 24,
      }));

      /** Measure the padded shield rect in canvas coordinates. */
      const shieldRect = (): Rect | null => {
        const s = shieldRef.current;
        if (!s) return null;
        return {
          l: s.offsetLeft - SHIELD_PAD,
          t: s.offsetTop - SHIELD_PAD,
          r: s.offsetLeft + s.offsetWidth + SHIELD_PAD,
          b: s.offsetTop + s.offsetHeight + SHIELD_PAD,
        };
      };

      let last = { nx: 0, ny: 0 };

      // Stable per-piece base offset that resolves any REST overlap with the
      // shield. Computed once per layout (load/resize), never per frame — a
      // per-frame min-axis resolution flips direction as the piece moves,
      // which teleported one image between two spots.
      const bases = setters.map(() => ({ dx: 0, dy: 0 }));

      const measureBases = () => {
        const shield = shieldRect();
        if (!shield) return;
        setters.forEach((s, i) => {
          const { el } = s;
          const rect: Rect = {
            l: el.offsetLeft,
            t: el.offsetTop,
            r: el.offsetLeft + el.offsetWidth,
            b: el.offsetTop + el.offsetHeight,
          };
          bases[i] = pushOut(rect, shield);
        });
      };

      /** Apply parallax on top of the stable base, clamped outside the shield. */
      const apply = () => {
        const shield = shieldRect();
        setters.forEach((s, i) => {
          let tx = bases[i].dx - last.nx * s.depth;
          let ty = bases[i].dy - last.ny * s.depth;
          if (shield) {
            const { el } = s;
            const rect: Rect = {
              l: el.offsetLeft + tx,
              t: el.offsetTop + ty,
              r: el.offsetLeft + el.offsetWidth + tx,
              b: el.offsetTop + el.offsetHeight + ty,
            };
            // Residual graze only (bounded by depth), so the axis is stable
            // and the piece slides along the shield edge instead of jumping.
            const { dx, dy } = pushOut(rect, shield);
            tx += dx;
            ty += dy;
          }
          s.x(tx);
          s.y(ty);
        });
      };

      // Active only while ≥25% of the hero is visible; ease home otherwise.
      let active = false;
      io = new IntersectionObserver(
        ([entry]) => {
          const nowActive = entry.isIntersecting && entry.intersectionRatio >= 0.25;
          if (active && !nowActive) {
            last = { nx: 0, ny: 0 };
            apply(); // returns to rest, still shield-corrected
          }
          active = nowActive;
        },
        { threshold: [0, 0.25, 0.5] }
      );
      if (root.current) io.observe(root.current);

      onMove = (e: MouseEvent) => {
        if (!active) return;
        last = {
          nx: (e.clientX / window.innerWidth) * 2 - 1,
          ny: (e.clientY / window.innerHeight) * 2 - 1,
        };
        apply();
      };
      window.addEventListener("mousemove", onMove, { passive: true });

      // Rest-state correction: once images have loaded (heights known) and on
      // resize, push any piece that intersects the shield out of it.
      const remeasure = () => {
        measureBases();
        apply();
      };
      onLoad = remeasure;
      onResize = remeasure;
      if (document.readyState === "complete") remeasure();
      else window.addEventListener("load", onLoad);
      window.addEventListener("resize", onResize);
      // Also run shortly after mount for cached images.
      timeoutId = window.setTimeout(remeasure, 300);
    }

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
      if (onMove) window.removeEventListener("mousemove", onMove);
      if (onLoad) window.removeEventListener("load", onLoad);
      if (onResize) window.removeEventListener("resize", onResize);
      if (io) io.disconnect();
      ctx.revert();
    };
  }, []);

  return (
    <section ref={root} className="relative overflow-hidden" aria-label="Introduction">
      <div className="aura left-1/2 top-10 h-72 w-72 -translate-x-1/2 opacity-60" />

      {/* Desktop: scattered collage with parallax */}
      <div ref={canvasRef} className="relative mx-auto hidden h-[880px] max-w-7xl px-5 lg:block">
        {pieces.map((p, i) => (
          <div
            key={`${p.slug}-${i}`}
            ref={(el) => {
              pieceRefs.current[i] = el;
            }}
            className={`absolute ${p.pos} will-change-transform`}
          >
            <Link
              href={`/art/${p.slug}`}
              aria-label={`View ${p.title}`}
              className="hero-piece block overflow-hidden shadow-[0_16px_44px_-18px_rgba(0,0,0,0.42)] transition-transform duration-300 hover:-translate-y-1"
            >
              {/* Natural aspect — no crop, square corners */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.src}
                alt={p.title}
                className="block h-auto w-full"
                loading={i < 5 ? "eager" : "lazy"}
              />
            </Link>
          </div>
        ))}

        {/* Centered text column — the shield rect is measured from this div */}
        <div
          ref={shieldRef}
          className="pointer-events-none absolute inset-x-0 top-[32%] z-10 mx-auto max-w-xl text-center"
        >
          <h1 className="font-display leading-[0.95] text-ink">
            <span className="block overflow-hidden">
              <span className="hero-word block text-[5rem] xl:text-[6.5rem]">
                Uchaan <span className="text-signal">Art</span>
              </span>
            </span>
            <span className="block overflow-hidden">
              <span className="hero-word block text-[5rem] xl:text-[6.5rem]">Gallery</span>
            </span>
          </h1>
          <p className="hero-sub mx-auto mt-8 max-w-md text-sm leading-relaxed text-muted">
            A contemporary art gallery since 2009, Uchaan has invited artists
            from across India and beyond to show at its Delhi and Gurgaon spaces.
          </p>
          <Link
            href="/art-gallery"
            className="hero-sub pointer-events-auto mt-6 inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.3em]"
          >
            Explore artworks
            <span aria-hidden className="text-signal">→</span>
          </Link>
        </div>
      </div>

      {/* Mobile: stacked headline + uncropped masonry (no parallax — no cursor) */}
      <div className="mx-auto max-w-6xl px-5 py-12 lg:hidden">
        <h1 className="font-display text-center leading-[0.98] text-ink">
          <span className="block text-5xl sm:text-7xl">
            Uchaan <span className="text-signal">Art</span>
          </span>
          <span className="block text-5xl sm:text-7xl">Gallery</span>
        </h1>
        <p className="mx-auto mt-5 max-w-md text-center text-sm leading-relaxed text-muted">
          A contemporary art gallery since 2009, Uchaan has invited artists from
          across India and beyond to show at its Delhi and Gurgaon spaces.
        </p>
        <div className="mt-8 columns-2 gap-3 sm:columns-3 [column-fill:_balance]">
          {pieces.filter((p) => !p.placeholder).map((p) => (
            <Link
              key={p.slug}
              href={`/art/${p.slug}`}
              className="mb-3 block break-inside-avoid overflow-hidden"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.src} alt={p.title} className="block h-auto w-full" loading="lazy" />
            </Link>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link
            href="/art-gallery"
            className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.3em]"
          >
            Explore artworks <span className="text-signal">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

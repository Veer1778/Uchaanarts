"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";

/**
 * Hero — scattered collage with mouse-move depth parallax (ArteFACT style).
 *
 * Cursor deflection drives each artwork opposite to the mouse, scaled by a
 * per-piece `depth`, via lazy gsap.quickTo setters (eased, floaty trail).
 * The headline, subtitle and Explore button stay fixed.
 *
 * The effect is gated by an IntersectionObserver with thresholds: it runs only
 * while at least a quarter of the hero is visible. Scroll below that and the
 * parallax stops and every image eases back to rest — no work is done on
 * mousemove for the remainder of the page.
 */

const U = "https://www.uchaanarts.com/uploaded_files";

type Piece = {
  src: string;
  slug: string;
  title: string;
  /** desktop absolute position + WIDTH only (height is natural, uncropped) */
  pos: string;
  /** parallax travel in px at full cursor deflection */
  depth: number;
};

/* Positions hug the edges; the centre band stays clear of the text. */
const pieces: Piece[] = [
  { src: `${U}/itempic/thumbmain/1741109721_su.jpg`, slug: "maya", title: "Maya", pos: "left-[1%] top-[2%] w-64", depth: 34 },
  { src: `${U}/slider/1728130444_ganesha_series_36x54_oil_on_linen_canvas_300000_-_copy.jpg`, slug: "ganesha-series", title: "Ganesha Series", pos: "right-[1%] top-[3%] w-56", depth: 18 },
  { src: `${U}/itempic/thumbmain/1726310195_agomoni_17x19x5_bronze_140000.jpg`, slug: "agomoni", title: "Agomoni", pos: "left-[21%] top-[1%] w-52", depth: 44 },
  { src: `${U}/itempic/thumbmain/1732105315_raghu_neware_search_of_eternity-1203__36x36_oil_on_canvas_180000.jpg`, slug: "search-of-eternity", title: "Search of Eternity", pos: "right-[20%] top-[2%] w-48", depth: 28 },
  { src: `${U}/itempic/thumbmain/1744531634_whatsapp_image_2025-04-12_at_190101_5eb25f3e.jpg`, slug: "market-hustle", title: "Market Hustle", pos: "-left-[2%] top-[40%] w-72", depth: 26 },
  { src: `${U}/itempic/thumbmain/1740229981_pankaj_bawadekar.jpg`, slug: "procession", title: "Procession", pos: "-right-[2%] top-[38%] w-72", depth: 30 },
  { src: `${U}/slider/1724254173_wash_copy.jpg`, slug: "monsoon-wash", title: "Monsoon Wash", pos: "left-[3%] top-[76%] w-64", depth: 42 },
  { src: `${U}/itempic/thumbmain/1747563640_horse_resonance_1.JPG`, slug: "horse-resonance-1", title: "Horse, Resonance", pos: "right-[3%] top-[74%] w-56", depth: 48 },
  { src: `${U}/itempic/thumbmain/1763810405_whatsapp_image_2025-11-22_at_160530.jpeg`, slug: "posing-on-a-boat", title: "Posing on a Boat", pos: "left-[30%] top-[82%] w-64", depth: 22 },
  { src: `${U}/itempic/thumbmain/1780502416_vijay_nandi_2.jpeg`, slug: "divine-harmony", title: "Divine Harmony", pos: "right-[26%] top-[84%] w-52", depth: 36 },
];

export default function Hero() {
  const root = useRef<HTMLElement>(null);
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

    // ---- Mouse-move depth parallax (desktop pointers only) ----
    const fine = window.matchMedia("(pointer: fine)").matches;
    let onMove: ((e: MouseEvent) => void) | null = null;
    let io: IntersectionObserver | null = null;

    if (fine) {
      // One eased setter pair per image; lazy so they retarget mid-tween.
      const setters = pieceRefs.current
        .filter((el): el is HTMLDivElement => Boolean(el))
        .map((el, i) => ({
          x: gsap.quickTo(el, "x", { duration: 1.1, ease: "power3.out" }),
          y: gsap.quickTo(el, "y", { duration: 1.1, ease: "power3.out" }),
          depth: pieces[i]?.depth ?? 24,
        }));

      // Active only while ≥25% of the hero is visible. Scrolling below the
      // hero drops the ratio under the threshold -> parallax stops and all
      // pieces ease back to rest.
      let active = false;
      io = new IntersectionObserver(
        ([entry]) => {
          const nowActive = entry.isIntersecting && entry.intersectionRatio >= 0.25;
          if (active && !nowActive) {
            setters.forEach((s) => {
              s.x(0);
              s.y(0);
            });
          }
          active = nowActive;
        },
        { threshold: [0, 0.25, 0.5] }
      );
      if (root.current) io.observe(root.current);

      onMove = (e: MouseEvent) => {
        if (!active) return;
        // Cursor deflection from viewport centre, in [-1, 1].
        const nx = (e.clientX / window.innerWidth) * 2 - 1;
        const ny = (e.clientY / window.innerHeight) * 2 - 1;
        setters.forEach((s) => {
          // Drift opposite the cursor, scaled by the piece's depth.
          s.x(-nx * s.depth);
          s.y(-ny * s.depth);
        });
      };
      window.addEventListener("mousemove", onMove, { passive: true });
    }

    return () => {
      if (onMove) window.removeEventListener("mousemove", onMove);
      io?.disconnect();
      ctx.revert();
    };
  }, []);

  return (
    <section ref={root} className="relative overflow-hidden" aria-label="Introduction">
      <div className="aura left-1/2 top-10 h-72 w-72 -translate-x-1/2 opacity-60" />

      {/* Desktop: scattered collage with parallax */}
      <div className="relative mx-auto hidden h-[1020px] max-w-7xl px-5 lg:block">
        {pieces.map((p, i) => (
          <div
            key={p.slug}
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

        {/* Centered text column — fixed, does not parallax */}
        <div className="pointer-events-none absolute inset-x-0 top-[24%] mx-auto max-w-xl text-center">
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
          {pieces.map((p) => (
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

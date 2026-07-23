"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";

/**
 * Hero — scattered collage with mouse-move depth parallax (ArteFACT style).
 *
 * As the cursor moves, every artwork drifts opposite to it, each by its own
 * `depth` factor, so near images travel further than far ones and the collage
 * reads as a 3D plane. The headline, subtitle and Explore button stay fixed.
 *
 * Implementation notes:
 *  • gsap.quickTo per image (x and y) — updates are lazy and eased
 *    (power3, 1.1s), which produces the floaty trail in the reference rather
 *    than a rigid 1:1 track.
 *  • The entrance animation animates `opacity`/`scale` only, so it never
 *    fights the parallax's `x`/`y` on the same elements.
 *  • Parallax listens on window mousemove but only when the hero is on
 *    screen, is desktop-only (the mobile grid has no cursor), and respects
 *    prefers-reduced-motion.
 */

const U = "https://www.uchaanarts.com/uploaded_files";

type Piece = {
  src: string;
  slug: string;
  title: string;
  /** desktop absolute position + WIDTH only (height is natural, uncropped) */
  pos: string;
  /** parallax travel in px at full cursor deflection; sign = direction */
  depth: number;
};

const pieces: Piece[] = [
  { src: `${U}/itempic/thumbmain/1741109721_su.jpg`, slug: "maya", title: "Maya", pos: "left-[4%] top-[5%] w-56", depth: 34 },
  { src: `${U}/slider/1728130444_ganesha_series_36x54_oil_on_linen_canvas_300000_-_copy.jpg`, slug: "ganesha-series", title: "Ganesha Series", pos: "right-[4%] top-[6%] w-44", depth: 18 },
  { src: `${U}/itempic/thumbmain/1744531634_whatsapp_image_2025-04-12_at_190101_5eb25f3e.jpg`, slug: "market-hustle", title: "Market Hustle", pos: "left-[0%] top-[40%] w-60", depth: 26 },
  { src: `${U}/slider/1724254173_wash_copy.jpg`, slug: "monsoon-wash", title: "Monsoon Wash", pos: "left-[7%] top-[74%] w-56", depth: 42 },
  { src: `${U}/itempic/thumbmain/1740229981_pankaj_bawadekar.jpg`, slug: "procession", title: "Procession", pos: "right-[2%] top-[42%] w-60", depth: 30 },
  { src: `${U}/itempic/thumbmain/1747563640_horse_resonance_1.JPG`, slug: "horse-resonance-1", title: "Horse, Resonance", pos: "right-[8%] top-[74%] w-40", depth: 48 },
  { src: `${U}/slider/1762953059_untitled_design_2.jpg`, slug: "posing-on-a-boat", title: "Banaras", pos: "left-[40%] top-[80%] w-60", depth: 22 },
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
        stagger: 0.08,
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

      let active = false;
      io = new IntersectionObserver(([entry]) => {
        active = entry.isIntersecting;
        if (!active) setters.forEach((s) => { s.x(0); s.y(0); });
      });
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
      <div className="relative mx-auto hidden h-[900px] max-w-6xl px-5 lg:block">
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
                loading={i < 4 ? "eager" : "lazy"}
              />
            </Link>
          </div>
        ))}

        {/* Centered text column — fixed, does not parallax */}
        <div className="pointer-events-none absolute inset-x-0 top-[18%] mx-auto max-w-xl text-center">
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

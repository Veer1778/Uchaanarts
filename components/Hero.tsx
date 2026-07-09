"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";

/**
 * Hero — scattered-collage layout. Larger uncropped artworks sit in the
 * left/right edge bands and corners, keeping the centered headline + subtitle
 * clear. Square corners (radius 0), no labels. Each image links to its store
 * page.
 */

const U = "https://www.uchaanarts.com/uploaded_files";

type Piece = {
  src: string;
  slug: string;
  title: string;
  /** desktop absolute position + WIDTH only (height is natural, uncropped) */
  pos: string;
};

const pieces: Piece[] = [
  { src: `${U}/itempic/thumbmain/1741109721_su.jpg`, slug: "maya", title: "Maya", pos: "left-[4%] top-[5%] w-56" },
  { src: `${U}/slider/1728130444_ganesha_series_36x54_oil_on_linen_canvas_300000_-_copy.jpg`, slug: "ganesha-series", title: "Ganesha Series", pos: "right-[4%] top-[6%] w-44" },
  { src: `${U}/itempic/thumbmain/1744531634_whatsapp_image_2025-04-12_at_190101_5eb25f3e.jpg`, slug: "market-hustle", title: "Market Hustle", pos: "left-[0%] top-[40%] w-60" },
  { src: `${U}/slider/1724254173_wash_copy.jpg`, slug: "monsoon-wash", title: "Monsoon Wash", pos: "left-[7%] top-[74%] w-56" },
  { src: `${U}/itempic/thumbmain/1740229981_pankaj_bawadekar.jpg`, slug: "procession", title: "Procession", pos: "right-[2%] top-[42%] w-60" },
  { src: `${U}/itempic/thumbmain/1747563640_horse_resonance_1.JPG`, slug: "horse-resonance-1", title: "Horse, Resonance", pos: "right-[8%] top-[74%] w-40" },
  { src: `${U}/slider/1762953059_untitled_design_2.jpg`, slug: "posing-on-a-boat", title: "Banaras", pos: "left-[40%] top-[80%] w-60" },
];

function PieceImg({ p, priority }: { p: Piece; priority?: boolean }) {
  return (
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
        loading={priority ? "eager" : "lazy"}
      />
    </Link>
  );
}

export default function Hero() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
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
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="relative overflow-hidden" aria-label="Introduction">
      <div className="aura left-1/2 top-10 h-72 w-72 -translate-x-1/2 opacity-60" />

      {/* Desktop: scattered collage */}
      <div className="relative mx-auto hidden h-[900px] max-w-6xl px-5 lg:block">
        {pieces.map((p, i) => (
          <div key={p.slug} className={`absolute ${p.pos}`}>
            <PieceImg p={p} priority={i < 4} />
          </div>
        ))}

        {/* Centered text column — images are kept out of this band */}
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

      {/* Mobile: stacked headline + uncropped masonry */}
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

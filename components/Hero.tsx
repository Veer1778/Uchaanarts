"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import RotatingBadge from "./RotatingBadge";

/**
 * Hero — editorial modular grid.
 *
 * Left: the masthead headline with a red highlight block and a dated
 * exhibition listing. Right: a ruled grid of cells mixing artwork, a pull
 * quote, the founding year and a featured-artist band.
 *
 * The scattered parallax is retained in a quieter form: images drift a few
 * pixels *inside* their cells (which clip), so the grid stays rigid while the
 * artwork still feels alive under the cursor.
 */

const U = "https://www.uchaanarts.com/uploaded_files";

const cells = [
  {
    src: `${U}/itempic/thumbmain/1740229981_pankaj_bawadekar.jpg`,
    slug: "procession",
    title: "Procession",
    depth: 14,
  },
  {
    src: `${U}/itempic/thumbmain/1747563640_horse_resonance_1.JPG`,
    slug: "horse-resonance-1",
    title: "Horse, Resonance",
    depth: 10,
  },
];

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.from(".hero-line", {
        yPercent: 108,
        duration: 0.95,
        stagger: 0.1,
        ease: "power4.out",
      });
      gsap.from(".hero-fade", {
        opacity: 0,
        y: 14,
        duration: 0.7,
        stagger: 0.08,
        delay: 0.5,
        ease: "power3.out",
      });
      gsap.from(".hero-cell", {
        opacity: 0,
        duration: 0.7,
        stagger: 0.09,
        delay: 0.35,
        ease: "power2.out",
      });
    }, root);

    // Contained parallax: images drift within their (clipping) cells.
    const fine = window.matchMedia("(pointer: fine)").matches;
    let onMove: ((e: MouseEvent) => void) | null = null;
    let io: IntersectionObserver | null = null;

    if (fine) {
      const setters = imgRefs.current
        .filter((el): el is HTMLImageElement => Boolean(el))
        .map((el, i) => ({
          x: gsap.quickTo(el, "x", { duration: 1.2, ease: "power3.out" }),
          y: gsap.quickTo(el, "y", { duration: 1.2, ease: "power3.out" }),
          depth: cells[i]?.depth ?? 12,
        }));

      let active = false;
      io = new IntersectionObserver(
        ([entry]) => {
          const now = entry.isIntersecting && entry.intersectionRatio >= 0.2;
          if (active && !now) setters.forEach((s) => { s.x(0); s.y(0); });
          active = now;
        },
        { threshold: [0, 0.2, 0.5] }
      );
      if (root.current) io.observe(root.current);

      onMove = (e: MouseEvent) => {
        if (!active) return;
        const nx = (e.clientX / window.innerWidth) * 2 - 1;
        const ny = (e.clientY / window.innerHeight) * 2 - 1;
        setters.forEach((s) => {
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
    <section ref={root} aria-label="Introduction" className="border-b border-line">
      <div className="mx-auto max-w-[1400px] border-x border-line">
        <div className="grid lg:grid-cols-[1.08fr_0.92fr]">
          {/* ---------------- Masthead ---------------- */}
          <div className="flex flex-col justify-between border-line px-6 py-12 sm:px-10 lg:border-r lg:py-16">
            <div>
              {/* Diamond rhythm markers */}
              <div className="hero-fade mb-8 flex items-center gap-3">
                <span className="diamond bg-signal" />
                <span className="diamond bg-gold" />
                <span className="diamond bg-gold" />
              </div>

              <h1 className="font-display text-ink">
                <span className="block overflow-hidden">
                  <span className="hero-line block text-[3.4rem] leading-[0.92] sm:text-7xl xl:text-[5.6rem]">
                    UCHAAN
                  </span>
                </span>
                <span className="block overflow-hidden py-1">
                  <span className="hero-line block text-[3.4rem] leading-[0.92] sm:text-7xl xl:text-[5.6rem]">
                    <span className="highlight">ART</span>
                  </span>
                </span>
                <span className="block overflow-hidden">
                  <span className="hero-line block text-[3.4rem] leading-[0.92] sm:text-7xl xl:text-[5.6rem]">
                    GALLERY
                  </span>
                </span>
              </h1>
            </div>

            {/* Dated listing, as in the reference */}
            <div className="mt-14 flex flex-wrap items-end justify-between gap-8">
              <div className="hero-fade flex items-start gap-5">
                <p className="font-display text-3xl leading-none text-ink sm:text-4xl">
                  2009
                </p>
                <span className="mt-4 h-px w-8 bg-ink" />
                <div className="max-w-xs">
                  <p className="text-sm font-semibold uppercase leading-snug tracking-[0.05em] text-ink">
                    Contemporary Indian Art
                    <br />
                    Delhi &amp; Gurgaon
                  </p>
                  <p className="mt-3 font-display text-sm italic leading-relaxed text-muted">
                    A nurturing ground for artists for over fifteen years —
                    painting, sculpture and serigraphy from across India.
                  </p>
                </div>
              </div>

              <div className="hero-fade">
                <RotatingBadge />
              </div>
            </div>
          </div>

          {/* ---------------- Ruled cell grid ---------------- */}
          <div className="grid grid-cols-2 border-t border-line lg:border-t-0">
            {/* Artwork cell */}
            <Link
              href={`/art/${cells[0].slug}`}
              className="hero-cell group relative block aspect-[4/5] overflow-hidden border-b border-r border-line"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={(el) => {
                  imgRefs.current[0] = el;
                }}
                src={cells[0].src}
                alt={cells[0].title}
                className="h-full w-full scale-110 object-cover"
              />
            </Link>

            {/* Pull quote */}
            <div className="hero-cell flex items-center border-b border-line p-6 sm:p-8">
              <p className="font-display text-lg leading-snug text-ink sm:text-xl">
                <span className="font-semibold not-italic">Uchaan Arts</span>{" "}
                <span className="italic">
                  looks beyond the walls of a traditional white cube space
                </span>
              </p>
            </div>

            {/* Featured artist band */}
            <div className="hero-cell col-span-2 flex items-center gap-4 overflow-hidden border-b border-line px-6 py-5 sm:px-8">
              <span className="label shrink-0 text-muted">Featured</span>
              <p className="truncate font-display text-3xl text-signal sm:text-4xl">
                Pankaj Bawdekar
              </p>
            </div>

            {/* Second artwork */}
            <Link
              href={`/art/${cells[1].slug}`}
              className="hero-cell group relative block aspect-square overflow-hidden border-r border-line"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={(el) => {
                  imgRefs.current[1] = el;
                }}
                src={cells[1].src}
                alt={cells[1].title}
                className="h-full w-full scale-110 object-cover"
              />
            </Link>

            {/* Numeral cell */}
            <div className="hero-cell flex flex-col justify-between p-6 sm:p-8">
              <span className="label text-muted">Works</span>
              <p className="font-display text-5xl leading-none text-ink sm:text-6xl">
                200<span className="text-signal">+</span>
              </p>
              <div className="mt-4 flex gap-2">
                <span className="diamond bg-gold" />
                <span className="diamond bg-signal" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Play } from "lucide-react";
import RotatingBadge from "./RotatingBadge";

/**
 * Hero — masthead on the left, gallery film on the right.
 *
 * The right cell is a VIDEO PLACEHOLDER. To drop in the real film, replace the
 * placeholder block marked below with either:
 *
 *   <video className="h-full w-full object-cover" autoPlay muted loop playsInline
 *          poster="/hero-poster.jpg">
 *     <source src="/hero.mp4" type="video/mp4" />
 *   </video>
 *
 * or a YouTube/Vimeo embed:
 *
 *   <iframe className="h-full w-full" src="https://www.youtube.com/embed/VIDEO_ID?autoplay=1&mute=1&loop=1&controls=0"
 *           title="Uchaan Arts" allow="autoplay; encrypted-media" allowFullScreen />
 *
 * Everything around it (sizing, ratio, rounding) stays as-is.
 */
export default function Hero() {
  const root = useRef<HTMLElement>(null);

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
        delay: 0.45,
        ease: "power3.out",
      });
      gsap.from(".hero-film", {
        opacity: 0,
        scale: 0.98,
        duration: 0.9,
        delay: 0.25,
        ease: "power3.out",
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} aria-label="Introduction">
      <div className="mx-auto max-w-[1400px] px-6 py-12 sm:px-10 lg:py-16">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16">
          {/* ---------------- Masthead ---------------- */}
          <div>
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

            <div className="mt-12 flex flex-wrap items-end justify-between gap-8">
              <div className="hero-fade flex items-start gap-5">
                <p className="font-display text-3xl leading-none sm:text-4xl">2009</p>
                <span className="mt-4 h-px w-8 bg-ink" />
                <div className="max-w-xs">
                  <p className="text-sm font-semibold uppercase leading-snug tracking-[0.05em]">
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

          {/* ---------------- Gallery film ---------------- */}
          <div className="hero-film">
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-wash lg:aspect-[3/4] xl:aspect-[4/3]">
              {/* ===== VIDEO PLACEHOLDER — swap this block for <video> or an embed ===== */}
              <div className="absolute inset-0 grid place-items-center">
                <div className="flex flex-col items-center gap-5 text-center">
                  <span className="grid h-16 w-16 place-items-center rounded-full bg-signal text-paper">
                    <Play size={22} fill="currentColor" strokeWidth={0} className="ml-1" />
                  </span>
                  <div>
                    <p className="label text-muted">Gallery film</p>
                    <p className="mt-2 font-display text-xl italic text-ink">
                      A walk through Uchaan
                    </p>
                  </div>
                </div>
              </div>
              {/* Corner marks, so the empty frame still reads as designed */}
              <span className="absolute left-4 top-4 h-4 w-4 border-l border-t border-ink/25" />
              <span className="absolute right-4 top-4 h-4 w-4 border-r border-t border-ink/25" />
              <span className="absolute bottom-4 left-4 h-4 w-4 border-b border-l border-ink/25" />
              <span className="absolute bottom-4 right-4 h-4 w-4 border-b border-r border-ink/25" />
              {/* ===== end placeholder ===== */}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm italic text-muted">
                Inside the Delhi &amp; Gurgaon spaces
              </p>
              <div className="flex gap-2">
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

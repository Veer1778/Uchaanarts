"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import RotatingBadge from "./RotatingBadge";

/**
 * Hero — masthead on the left, gallery film on the right.
 *
 * The film is a 4:5 autoplaying loop with no controls and no frame, so it
 * sits seamlessly on the cream ground. Swapping it is a one-line change to
 * the <source src>. It has no audio track in use (muted), which is also what
 * lets it autoplay on mobile.
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
            {/* Gallery film — 4:5, no chrome, sitting straight on the cream
                ground. Muted + playsInline are required for autoplay to be
                allowed on mobile browsers. */}
            <div className="relative aspect-[4/5] w-full overflow-hidden">
              <video
                className="h-full w-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                aria-label="A walk through the Uchaan galleries"
              >
                <source
                  src="https://res.cloudinary.com/danuvia5o/video/upload/v1784899418/animo-column-drift-1350p_z4ihjg.mp4"
                  type="video/mp4"
                />
              </video>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm italic text-muted">
                Inside the New Delhi &amp; Gurugram spaces
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

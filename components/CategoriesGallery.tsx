"use client";

import { useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { categories } from "@/lib/data";

/**
 * "By category".
 *
 * Desktop (lg+): a curved, draggable strip. The curvature reuses the arc math
 * from React Bits' CircularGallery (R = (H² + B²) / 2B, arc = R − √(R² − x²),
 * rotation = asin(x/R)) applied to DOM nodes, so each card stays a real link
 * and the images load without the CORS constraint WebGL textures impose.
 *
 * Mobile: a plain two-column grid. The arc radius is derived from viewport
 * width, so on a ~390px screen the rotation becomes extreme and cards overlap —
 * a normal section is simply the right answer at that size.
 */

const U = "https://www.uchaanarts.com/uploaded_files";

const categoryImages: Record<string, string> = {
  Painting: `${U}/slider/1762953059_untitled_design_2.jpg`,
  Sculpture: `${U}/itempic/thumbmain/1726310195_agomoni_17x19x5_bronze_140000.jpg`,
  Serigraph: `${U}/slider/1728130444_ganesha_series_36x54_oil_on_linen_canvas_300000_-_copy.jpg`,
  Photography: `${U}/itempic/thumbmain/1780502416_vijay_nandi_2.jpeg`,
  "Digital Art": `${U}/slider/1764488212_untitled_design_2.png`,
  "Folk Art": `${U}/slider/1724254173_wash_copy.jpg`,
};

/** Limit the gallery to six cards. */
const MAX_CARDS = 6;

/** Curvature, in px. Higher = flatter. Mirrors CircularGallery's `bend`. */
const BEND = 260;

const GAP = 24;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export default function CategoriesGallery() {
  const shown = categories.slice(0, MAX_CARDS);
  // Duplicated so the infinite loop never shows a gap, like the original.
  const loop = [...shown, ...shown];

  const viewportRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const scroll = useRef({ current: 0, target: 0 });
  const drag = useRef({ active: false, startX: 0, startScroll: 0, moved: 0 });
  const raf = useRef(0);
  const seeded = useRef(false);

  const render = useCallback(() => {
    const viewport = viewportRef.current;
    const cards = cardRefs.current.filter(Boolean) as HTMLAnchorElement[];
    const W = viewport?.clientWidth ?? 0;

    // W is 0 while the strip is display:none (mobile) — skip until visible.
    if (viewport && cards.length && W > 0) {
      const cardW = cards[0].offsetWidth;
      const step = cardW + GAP;

      if (!seeded.current && cardW > 0) {
        scroll.current.current = scroll.current.target = -step * 1.5;
        seeded.current = true;
      }

      const H = W / 2;
      const total = step * cards.length;
      const R = (H * H + BEND * BEND) / (2 * BEND);

      scroll.current.current = lerp(scroll.current.current, scroll.current.target, 0.08);

      cards.forEach((card, i) => {
        // Position along the strip, wrapped infinitely around the centre.
        let x = i * step - scroll.current.current;
        x = ((x % total) + total) % total;
        if (x > total / 2) x -= total;

        const effectiveX = Math.min(Math.abs(x), H);
        const arc = R - Math.sqrt(Math.max(R * R - effectiveX * effectiveX, 0));
        const rotation =
          Math.sign(x) * Math.asin(Math.min(effectiveX / R, 1)) * (180 / Math.PI);

        // Fade cards furthest from centre so the arc reads cleanly.
        const opacity = Math.max(0, 1 - Math.abs(x) / (W * 0.75));

        card.style.transform = `translate(-50%, -50%) translateX(${x}px) translateY(${arc}px) rotate(${rotation}deg)`;
        card.style.opacity = String(opacity);
        card.style.pointerEvents = opacity < 0.15 ? "none" : "auto";
      });
    }

    raf.current = requestAnimationFrame(render);
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    raf.current = requestAnimationFrame(render);

    const onWheel = (e: WheelEvent) => {
      // Horizontal intent only — never hijack the page's vertical scroll.
      if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) return;
      e.preventDefault();
      scroll.current.target += e.deltaX;
    };

    const onDown = (e: PointerEvent) => {
      drag.current.active = true;
      drag.current.startX = e.clientX;
      drag.current.startScroll = scroll.current.target;
      drag.current.moved = 0;
      // No setPointerCapture: capturing retargets the eventual `click` to the
      // container, which is exactly what made the card links unclickable.
      // Move/up are tracked on window instead so drags survive leaving the strip.
    };

    const onMove = (e: PointerEvent) => {
      if (!drag.current.active) return;
      const dx = e.clientX - drag.current.startX;
      drag.current.moved = Math.abs(dx);
      scroll.current.target = drag.current.startScroll - dx;
    };

    const onUp = () => {
      drag.current.active = false;
    };

    // Suppress the click if the pointer was dragged, so dragging never
    // accidentally navigates.
    const onClickCapture = (e: MouseEvent) => {
      if (drag.current.moved > 6) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    const onKey = (e: KeyboardEvent) => {
      const step = (cardRefs.current[0]?.offsetWidth ?? 240) + GAP;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        scroll.current.target += step;
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        scroll.current.target -= step;
      }
    };

    if (!reduce) {
      viewport.addEventListener("wheel", onWheel, { passive: false });
      viewport.addEventListener("pointerdown", onDown);
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
      viewport.addEventListener("click", onClickCapture, true);
    }
    viewport.addEventListener("keydown", onKey);

    return () => {
      cancelAnimationFrame(raf.current);
      viewport.removeEventListener("wheel", onWheel);
      viewport.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      viewport.removeEventListener("click", onClickCapture, true);
      viewport.removeEventListener("keydown", onKey);
    };
  }, [render]);

  const cardFace = (c: string) => (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={categoryImages[c]}
        alt={c}
        draggable={false}
        loading="lazy"
        className="h-full w-full select-none object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <span className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/15 to-transparent" />
      <span className="absolute bottom-3 left-3 font-display text-base text-white sm:bottom-4 sm:left-4 sm:text-lg">
        {c}
      </span>
    </>
  );

  return (
    <>
      {/* Clear divide between the hero and this section */}
      <div className="mx-auto max-w-6xl px-5">
        <hr className="border-t border-line" />
      </div>

      <section className="pt-12 sm:pt-16" aria-labelledby="categories">
        <div className="mx-auto max-w-6xl px-5">
          <p className="mb-3 text-[11px] uppercase tracking-[0.3em] text-signal">
            Explore our diverse range of art
          </p>
          <h2 id="categories" className="font-display text-4xl leading-tight sm:text-5xl">
            By category
          </h2>
        </div>

        {/* MOBILE / TABLET — plain grid */}
        <div className="mx-auto mt-8 grid max-w-6xl grid-cols-2 gap-4 px-5 sm:grid-cols-3 lg:hidden">
          {shown.map((c) => (
            <Link
              key={c}
              href={`/art-gallery?category=${encodeURIComponent(c)}`}
              aria-label={`Browse ${c}`}
              className="group relative block aspect-[3/4] overflow-hidden rounded-[10px] shadow-[0_10px_30px_-12px_rgba(0,0,0,0.35)]"
            >
              {cardFace(c)}
            </Link>
          ))}
        </div>

        {/* DESKTOP — curved, draggable strip */}
        <div
          ref={viewportRef}
          tabIndex={0}
          role="group"
          aria-label="Browse categories — drag or use arrow keys"
          className="relative mt-10 hidden h-[440px] w-full cursor-grab touch-pan-y overflow-hidden active:cursor-grabbing lg:block"
        >
          {loop.map((c, i) => (
            <Link
              key={`${c}-${i}`}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              href={`/art-gallery?category=${encodeURIComponent(c)}`}
              aria-label={`Browse ${c}`}
              aria-hidden={i >= shown.length}
              tabIndex={i >= shown.length ? -1 : 0}
              draggable={false}
              className="group absolute left-1/2 top-1/2 block h-[340px] w-[240px] overflow-hidden rounded-[10px] opacity-0 shadow-[0_16px_40px_-16px_rgba(0,0,0,0.4)] will-change-transform"
            >
              {cardFace(c)}
            </Link>
          ))}
        </div>

        <p className="mt-6 hidden text-center text-[11px] uppercase tracking-[0.2em] text-faint lg:block">
          Drag to explore
        </p>
      </section>
    </>
  );
}

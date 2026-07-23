"use client";

import { useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { categories } from "@/lib/data";

/**
 * "By category" — a curved, draggable gallery.
 *
 * The curvature reuses the arc math from the React Bits CircularGallery
 * (R = (H² + B²) / 2B, arc = R − √(R² − x²), rotation = asin(x/R)), but it is
 * applied to DOM nodes instead of WebGL planes. That matters here because:
 *   • each card must be a real link (canvas text can't be clicked or crawled)
 *   • WebGL textures need `crossOrigin="anonymous"`, and uchaanarts.com sends
 *     no CORS headers, so the canvas version renders blank
 *
 * Drag, horizontal wheel and arrow keys scroll it; motion is eased with a lerp
 * on rAF and loops infinitely. Respects prefers-reduced-motion.
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

  const render = useCallback(() => {
    const viewport = viewportRef.current;
    const cards = cardRefs.current.filter(Boolean) as HTMLAnchorElement[];

    if (viewport && cards.length) {
      const W = viewport.clientWidth;
      const H = W / 2;
      const step = cards[0].offsetWidth + GAP;
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

    // Start with the strip centred on the first card.
    const first = cardRefs.current[0];
    if (first) {
      const step = first.offsetWidth + GAP;
      scroll.current.current = scroll.current.target = -step * 1.5;
    }

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
      viewport.setPointerCapture(e.pointerId);
    };

    const onMove = (e: PointerEvent) => {
      if (!drag.current.active) return;
      const dx = e.clientX - drag.current.startX;
      drag.current.moved = Math.abs(dx);
      scroll.current.target = drag.current.startScroll - dx;
    };

    const onUp = (e: PointerEvent) => {
      drag.current.active = false;
      try {
        viewport.releasePointerCapture(e.pointerId);
      } catch {
        /* already released */
      }
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
      viewport.addEventListener("pointermove", onMove);
      viewport.addEventListener("pointerup", onUp);
      viewport.addEventListener("pointercancel", onUp);
      viewport.addEventListener("click", onClickCapture, true);
    }
    viewport.addEventListener("keydown", onKey);

    return () => {
      cancelAnimationFrame(raf.current);
      viewport.removeEventListener("wheel", onWheel);
      viewport.removeEventListener("pointerdown", onDown);
      viewport.removeEventListener("pointermove", onMove);
      viewport.removeEventListener("pointerup", onUp);
      viewport.removeEventListener("pointercancel", onUp);
      viewport.removeEventListener("click", onClickCapture, true);
      viewport.removeEventListener("keydown", onKey);
    };
  }, [render]);

  return (
    <>
      {/* Clear divide between the hero and this section */}
      <div className="mx-auto max-w-6xl px-5">
        <hr className="border-t border-line" />
      </div>

      <section className="pt-16" aria-labelledby="categories">
        <div className="mx-auto max-w-6xl px-5">
          <p className="mb-3 text-[11px] uppercase tracking-[0.3em] text-signal">
            Explore our diverse range of art
          </p>
          <h2 id="categories" className="font-display text-4xl leading-tight sm:text-5xl">
            By category
          </h2>
        </div>

        {/* Curved, draggable strip */}
        <div
          ref={viewportRef}
          tabIndex={0}
          role="group"
          aria-label="Browse categories — drag or use arrow keys"
          className="relative mt-10 h-[440px] w-full cursor-grab touch-pan-y overflow-hidden active:cursor-grabbing"
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
              className="group absolute left-1/2 top-1/2 block h-[340px] w-[240px] overflow-hidden rounded-[10px] shadow-[0_16px_40px_-16px_rgba(0,0,0,0.4)] will-change-transform"
            >
              {/* Plain img: no CORS constraint, and the node is transformed
                  every frame, so next/image's wrapper buys nothing here. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={categoryImages[c]}
                alt={c}
                draggable={false}
                loading={i < shown.length ? "eager" : "lazy"}
                className="h-full w-full select-none object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/15 to-transparent" />
              <span className="absolute bottom-4 left-4 font-display text-lg text-white">
                {c}
              </span>
            </Link>
          ))}
        </div>

        <p className="mt-6 text-center text-[11px] uppercase tracking-[0.2em] text-faint">
          Drag to explore
        </p>
      </section>
    </>
  );
}

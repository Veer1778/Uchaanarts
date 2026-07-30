"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { testimonials } from "@/lib/site";

/**
 * Collectors Say — three quotes side by side on desktop, one at a time with
 * arrow controls on mobile, matching the reference.
 */
export default function Testimonials() {
  const [i, setI] = useState(0);
  const go = (d: number) =>
    setI((v) => (v + d + testimonials.length) % testimonials.length);

  return (
    <div>
      {/* Desktop: all three */}
      <div className="hidden gap-8 md:grid md:grid-cols-3">
        {testimonials.map((t) => (
          <blockquote key={t.by}>
            <p className="font-display text-lg italic leading-snug">
              &ldquo;{t.quote}&rdquo;
            </p>
            <footer className="mt-3 text-xs text-muted">— {t.by}</footer>
          </blockquote>
        ))}
      </div>

      {/* Mobile: one at a time */}
      <div className="md:hidden">
        <blockquote>
          <p className="font-display text-lg italic leading-snug">
            &ldquo;{testimonials[i].quote}&rdquo;
          </p>
          <footer className="mt-3 text-xs text-muted">
            — {testimonials[i].by}
          </footer>
        </blockquote>
      </div>

      <div className="mt-6 flex items-center gap-3 md:justify-end">
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Previous quote"
          className="grid h-8 w-8 place-items-center border border-line transition-colors hover:border-ink"
        >
          <ChevronLeft size={15} />
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Next quote"
          className="grid h-8 w-8 place-items-center border border-line transition-colors hover:border-ink"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}

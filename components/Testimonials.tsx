"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { testimonials } from "@/lib/site";

/**
 * Collectors Say — three quotes side by side (they sit inside one half of a
 * paired row, so they stay compact), with arrow controls beneath on the left.
 * On mobile a single quote shows at a time.
 */
export default function Testimonials() {
  const [i, setI] = useState(0);
  const go = (d: number) =>
    setI((v) => (v + d + testimonials.length) % testimonials.length);

  return (
    <div>
      <div className="hidden gap-6 sm:grid sm:grid-cols-3">
        {testimonials.map((t) => (
          <blockquote key={t.by}>
            <p className="font-display text-[14px] italic leading-relaxed">
              &ldquo;{t.quote}&rdquo;
            </p>
            <footer className="mt-3.5 text-[12px] text-muted">— {t.by}</footer>
          </blockquote>
        ))}
      </div>

      <div className="sm:hidden">
        <blockquote>
          <p className="font-display text-[15px] italic leading-relaxed">
            &ldquo;{testimonials[i].quote}&rdquo;
          </p>
          <footer className="mt-3.5 text-[12px] text-muted">
            — {testimonials[i].by}
          </footer>
        </blockquote>
      </div>

      <div className="mt-7 flex items-center gap-2.5">
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Previous quote"
          className="grid h-9 w-9 place-items-center border border-line transition-colors hover:border-ink"
        >
          <ChevronLeft size={15} />
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Next quote"
          className="grid h-9 w-9 place-items-center border border-line transition-colors hover:border-ink"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}

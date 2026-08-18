"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { testimonials as fallbackTestimonials } from "@/lib/site";

/**
 * Collectors Say — three quotes side by side (they sit inside one half of a
 * paired row, so they stay compact), with arrow controls beneath on the left.
 * On mobile a single quote shows at a time.
 *
 * Quotes now come from the CMS. They used to be hardcoded in lib/site.ts,
 * which is why testimonials added in the admin panel never appeared. The
 * hardcoded set remains as a fallback so the section never renders empty.
 */

export type Quote = { quote: string; by: string };

export default function Testimonials({ items }: { items?: Quote[] }) {
  const list = items && items.length > 0 ? items : fallbackTestimonials;

  const [i, setI] = useState(0);
  const go = (d: number) => setI((v) => (v + d + list.length) % list.length);

  if (list.length === 0) return null;

  return (
    <div>
      <div className="hidden gap-6 sm:grid sm:grid-cols-3">
        {list.slice(0, 3).map((t, idx) => (
          <blockquote key={`${t.by}-${idx}`}>
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
            &ldquo;{list[i].quote}&rdquo;
          </p>
          <footer className="mt-3.5 text-[12px] text-muted">— {list[i].by}</footer>
        </blockquote>
      </div>

      {list.length > 1 && (
        <div className="mt-6 flex gap-2">
          <button
            onClick={() => go(-1)}
            aria-label="Previous testimonial"
            className="grid h-8 w-8 place-items-center border border-line transition-colors hover:border-signal hover:text-signal"
          >
            <ChevronLeft size={15} />
          </button>
          <button
            onClick={() => go(1)}
            aria-label="Next testimonial"
            className="grid h-8 w-8 place-items-center border border-line transition-colors hover:border-signal hover:text-signal"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      )}
    </div>
  );
}

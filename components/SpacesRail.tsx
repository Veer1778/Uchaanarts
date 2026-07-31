"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { realSpaces } from "@/lib/site";

/**
 * Art in Real Spaces — a snap rail of four room images with dot pagination,
 * as in the reference. Dots track the scroll position rather than being
 * decorative.
 */
export default function SpacesRail() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const onScroll = () => {
    const el = ref.current;
    if (!el) return;
    const i = Math.round((el.scrollLeft / el.scrollWidth) * realSpaces.length);
    setActive(Math.min(i, realSpaces.length - 1));
  };

  const goTo = (i: number) => {
    const el = ref.current;
    if (!el) return;
    el.scrollTo({ left: (el.scrollWidth / realSpaces.length) * i, behavior: "smooth" });
  };

  return (
    <div>
      <div ref={ref} onScroll={onScroll} className="rail lg:grid lg:grid-cols-4 lg:gap-4">
        {realSpaces.map((s) => (
          <div key={s.label} className="w-[38vw] sm:w-[30vw] lg:w-auto">
            <div className="relative aspect-[4/3] overflow-hidden bg-wash">
              <Image
                src={s.image}
                alt={s.label}
                fill
                sizes="(max-width: 640px) 38vw, 22vw"
                className="object-cover"
              />
            </div>
            <p className="mt-2 text-[11px] sm:text-xs">{s.label}</p>
            <p className="text-[9.5px] leading-snug text-muted sm:text-[11px]">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-center gap-2 lg:hidden">
        {realSpaces.map((s, i) => (
          <button
            key={s.label}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Show ${s.label}`}
            aria-current={i === active}
            className={`h-1.5 w-1.5 rounded-full transition-colors ${
              i === active ? "bg-ink" : "bg-line"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

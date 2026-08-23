"use client";

import { useEffect, useState } from "react";

/**
 * A–Z jump navigation for the artists index.
 *
 * The plain anchor list scrolled away as soon as you moved down the page, so
 * with 257 names you had to scroll all the way back up to jump elsewhere. This
 * sticks below the header, highlights the section you are in, and scrolls on
 * mobile where 20+ letters will not fit across the screen.
 */
export default function AlphabetNav({ letters }: { letters: string[] }) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (letters.length === 0) return;

    const sections = letters
      .map((l) => document.getElementById(`letter-${l}`))
      .filter((el): el is HTMLElement => el !== null);

    // rootMargin pins the trigger line just under the sticky header, so the
    // highlighted letter matches the group actually in view.
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id.replace("letter-", ""));
      },
      { rootMargin: "-140px 0px -70% 0px", threshold: 0 }
    );

    sections.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [letters]);

  if (letters.length === 0) return null;

  return (
    <nav
      aria-label="Jump to letter"
      className="sticky top-[68px] z-20 -mx-5 border-y border-line bg-paper/95 px-5 py-2.5 backdrop-blur sm:top-[76px] sm:mx-0 sm:px-0"
    >
      <div
        style={{ touchAction: "pan-x" }}
        className="flex gap-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {letters.map((l) => (
          <a
            key={l}
            href={`#letter-${l}`}
            onClick={() => setActive(l)}
            className={`grid h-8 w-8 shrink-0 place-items-center rounded text-xs transition-colors ${
              active === l
                ? "bg-signal text-white"
                : "text-muted hover:bg-wash hover:text-signal"
            }`}
          >
            {l}
          </a>
        ))}
      </div>
    </nav>
  );
}

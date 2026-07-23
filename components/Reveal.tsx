"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Fades + lifts children in on scroll (GSAP ScrollTrigger), once only.
 *
 * Two details that matter on mobile:
 *  • ScrollTrigger caches each trigger's start position when it initialises.
 *    Images finish loading afterwards, the page grows, and those cached
 *    positions go stale — which makes reveals fire at the wrong moment. We
 *    refresh once the page has fully loaded (bound a single time, not per
 *    instance) so positions are measured against the final layout.
 *  • `once: true` plus no forced reveal means an element animates exactly one
 *    time; it can never replay when you scroll back to it.
 */

// Bind the load/refresh listener only once for the whole page.
let refreshBound = false;

export default function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Reduced motion: show immediately, no trigger at all.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.style.opacity = "1";
      el.style.transform = "none";
      return;
    }

    const tween = gsap.fromTo(
      el,
      { opacity: 0, y: 24 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        delay,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          // Fires the moment the element's top reaches the viewport bottom,
          // so it's already settled by the time you've scrolled to it.
          start: "top bottom",
          once: true,
        },
      }
    );

    let onLoad: (() => void) | null = null;
    if (!refreshBound) {
      refreshBound = true;
      if (document.readyState === "complete") {
        ScrollTrigger.refresh();
      } else {
        onLoad = () => ScrollTrigger.refresh();
        window.addEventListener("load", onLoad);
      }
    }

    return () => {
      if (onLoad) {
        window.removeEventListener("load", onLoad);
        refreshBound = false;
      }
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [delay]);

  return (
    <div ref={ref} className={`gsap-reveal ${className}`}>
      {children}
    </div>
  );
}

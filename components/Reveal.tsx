"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Fades + lifts children in on scroll (GSAP ScrollTrigger).
 *
 * Children start hidden via the `.gsap-reveal` CSS class, so there are two
 * safety nets against content ever being stuck invisible on a slow phone:
 *   1. the trigger fires at "top 99%", i.e. before the element reaches the
 *      viewport, so it has already settled by the time you scroll to it
 *   2. a failsafe timer reveals the element regardless if GSAP hasn't run
 * Respects prefers-reduced-motion.
 */
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

    const show = () => {
      el.style.opacity = "1";
      el.style.transform = "none";
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      show();
      return;
    }

    const tween = gsap.fromTo(
      el,
      { opacity: 0, y: 28 },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        delay,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 99%", once: true },
      }
    );

    // Failsafe: never leave content invisible if something goes wrong.
    const failsafe = window.setTimeout(show, 2500);

    return () => {
      window.clearTimeout(failsafe);
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

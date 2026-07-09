"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import "./Masonry.css";

/**
 * From reactbits.dev — column-flow masonry with GSAP entrance, hover scale and
 * blur-to-focus. Extended so each item can carry a `caption` (React node) that
 * renders inside the tile, and clicks route via Next.js instead of window.open.
 */

export type MasonryItem = {
  id: string;
  img: string;
  url: string;
  height: number; // desired rendered height in px; the component uses height/2 (React Bits convention)
  caption?: ReactNode;
};

const useMedia = (queries: string[], values: number[], defaultValue: number) => {
  const get = () => values[queries.findIndex((q) => matchMedia(q).matches)] ?? defaultValue;
  const [value, setValue] = useState<number>(defaultValue);

  useEffect(() => {
    setValue(get());
    const handler = () => setValue(get());
    const mqls = queries.map((q) => matchMedia(q));
    mqls.forEach((m) => m.addEventListener("change", handler));
    return () => mqls.forEach((m) => m.removeEventListener("change", handler));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queries.join("|")]);

  return value;
};

const useMeasure = () => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  useLayoutEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, size] as const;
};

const preloadImages = async (urls: string[]) => {
  await Promise.all(
    urls.map(
      (src) =>
        new Promise<void>((resolve) => {
          const img = new Image();
          img.src = src;
          img.onload = () => resolve();
          img.onerror = () => resolve();
        })
    )
  );
};

export default function Masonry({
  items,
  ease = "power3.out",
  duration = 0.6,
  stagger = 0.05,
  animateFrom = "bottom",
  scaleOnHover = true,
  hoverScale = 0.97,
  blurToFocus = true,
  colorShiftOnHover = false,
}: {
  items: MasonryItem[];
  ease?: string;
  duration?: number;
  stagger?: number;
  animateFrom?: "top" | "bottom" | "left" | "right" | "center" | "random";
  scaleOnHover?: boolean;
  hoverScale?: number;
  blurToFocus?: boolean;
  colorShiftOnHover?: boolean;
}) {
  const router = useRouter();
  const columns = useMedia(
    ["(min-width:1500px)", "(min-width:1000px)", "(min-width:600px)", "(min-width:400px)"],
    [4, 3, 3, 2],
    1
  );

  const [containerRef, { width }] = useMeasure();
  const [imagesReady, setImagesReady] = useState(false);

  const getInitialPosition = (item: { x: number; y: number; w: number; h: number }) => {
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return { x: item.x, y: item.y };

    let direction: string = animateFrom;
    if (animateFrom === "random") {
      const dirs = ["top", "bottom", "left", "right"] as const;
      direction = dirs[Math.floor(Math.random() * dirs.length)];
    }

    switch (direction) {
      case "top":
        return { x: item.x, y: -200 };
      case "bottom":
        return { x: item.x, y: window.innerHeight + 200 };
      case "left":
        return { x: -200, y: item.y };
      case "right":
        return { x: window.innerWidth + 200, y: item.y };
      case "center":
        return {
          x: containerRect.width / 2 - item.w / 2,
          y: containerRect.height / 2 - item.h / 2,
        };
      default:
        return { x: item.x, y: item.y + 100 };
    }
  };

  useEffect(() => {
    preloadImages(items.map((i) => i.img)).then(() => setImagesReady(true));
  }, [items]);

  const grid = useMemo(() => {
    if (!width) return [] as (MasonryItem & { x: number; y: number; w: number; h: number })[];
    const colHeights = new Array(columns).fill(0);
    const columnWidth = width / columns;
    return items.map((child) => {
      const col = colHeights.indexOf(Math.min(...colHeights));
      const x = columnWidth * col;
      const height = child.height / 2;
      const y = colHeights[col];
      colHeights[col] += height;
      return { ...child, x, y, w: columnWidth, h: height };
    });
  }, [columns, items, width]);

  const totalHeight = useMemo(
    () => grid.reduce((max, g) => Math.max(max, g.y + g.h), 0),
    [grid]
  );

  const hasMounted = useRef(false);

  useLayoutEffect(() => {
    if (!imagesReady) return;
    grid.forEach((item, index) => {
      const selector = `[data-key="${item.id}"]`;
      const animationProps = { x: item.x, y: item.y, width: item.w, height: item.h };
      if (!hasMounted.current) {
        const initialPos = getInitialPosition(item);
        const initialState = {
          opacity: 0,
          x: initialPos.x,
          y: initialPos.y,
          width: item.w,
          height: item.h,
          ...(blurToFocus && { filter: "blur(10px)" }),
        };
        gsap.fromTo(selector, initialState, {
          opacity: 1,
          ...animationProps,
          ...(blurToFocus && { filter: "blur(0px)" }),
          duration: 0.8,
          ease: "power3.out",
          delay: index * stagger,
        });
      } else {
        gsap.to(selector, {
          ...animationProps,
          duration,
          ease,
          overwrite: "auto",
        });
      }
    });
    hasMounted.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grid, imagesReady]);

  const onEnter = (item: MasonryItem) => {
    if (scaleOnHover) {
      gsap.to(`[data-key="${item.id}"]`, {
        scale: hoverScale,
        duration: 0.3,
        ease: "power2.out",
      });
    }
    if (colorShiftOnHover) {
      gsap.to(`[data-key="${item.id}"] .color-overlay`, { opacity: 0.3, duration: 0.3 });
    }
  };
  const onLeave = (item: MasonryItem) => {
    if (scaleOnHover) {
      gsap.to(`[data-key="${item.id}"]`, {
        scale: 1,
        duration: 0.3,
        ease: "power2.out",
      });
    }
    if (colorShiftOnHover) {
      gsap.to(`[data-key="${item.id}"] .color-overlay`, { opacity: 0, duration: 0.3 });
    }
  };

  return (
    <div ref={containerRef} className="masonry-list" style={{ height: totalHeight || undefined }}>
      {grid.map((item) => (
        <div
          key={item.id}
          data-key={item.id}
          className="masonry-item-wrapper"
          onClick={() => {
            if (item.url.startsWith("/")) router.push(item.url);
            else window.open(item.url, "_blank", "noopener");
          }}
          onMouseEnter={() => onEnter(item)}
          onMouseLeave={() => onLeave(item)}
        >
          <div className="masonry-item-img" style={{ backgroundImage: `url(${item.img})` }}>
            {colorShiftOnHover && <div className="color-overlay" />}
            {item.caption && <div className="masonry-caption">{item.caption}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

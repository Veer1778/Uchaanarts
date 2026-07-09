"use client";

import { useRef, useState, useEffect, useCallback, type ReactNode } from "react";
import { motion, useInView } from "motion/react";
import "./AnimatedList.css";

/**
 * From reactbits.dev. Extended so items may be any ReactNode (not just strings),
 * and the container can size to its parent via className, so we can drop it into
 * blog and exhibitions sections with real cards inside.
 */

const AnimatedItem = ({
  children,
  delay = 0,
  index,
  onMouseEnter,
  onClick,
}: {
  children: ReactNode;
  delay?: number;
  index: number;
  onMouseEnter?: () => void;
  onClick?: () => void;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.5 });
  return (
    <motion.div
      ref={ref}
      data-index={index}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      initial={{ scale: 0.7, opacity: 0 }}
      animate={inView ? { scale: 1, opacity: 1 } : { scale: 0.7, opacity: 0 }}
      transition={{ duration: 0.25, delay }}
      style={{ marginBottom: "1rem", cursor: "pointer" }}
    >
      {children}
    </motion.div>
  );
};

export default function AnimatedList<T = ReactNode>({
  items,
  renderItem,
  onItemSelect,
  showGradients = true,
  enableArrowNavigation = true,
  className = "",
  itemClassName = "",
  displayScrollbar = true,
  initialSelectedIndex = -1,
}: {
  items: T[];
  /** If provided, called per item to render the row's content. Defaults to rendering the item as-is. */
  renderItem?: (item: T, index: number, selected: boolean) => ReactNode;
  onItemSelect?: (item: T, index: number) => void;
  showGradients?: boolean;
  enableArrowNavigation?: boolean;
  className?: string;
  itemClassName?: string;
  displayScrollbar?: boolean;
  initialSelectedIndex?: number;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(initialSelectedIndex);
  const [keyboardNav, setKeyboardNav] = useState(false);
  const [topGradientOpacity, setTopGradientOpacity] = useState(0);
  const [bottomGradientOpacity, setBottomGradientOpacity] = useState(1);

  const handleItemMouseEnter = useCallback((i: number) => setSelectedIndex(i), []);
  const handleItemClick = useCallback(
    (item: T, i: number) => {
      setSelectedIndex(i);
      onItemSelect?.(item, i);
    },
    [onItemSelect]
  );

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    setTopGradientOpacity(Math.min(scrollTop / 50, 1));
    const bottomDistance = scrollHeight - (scrollTop + clientHeight);
    setBottomGradientOpacity(
      scrollHeight <= clientHeight ? 0 : Math.min(bottomDistance / 50, 1)
    );
  }, []);

  useEffect(() => {
    if (!enableArrowNavigation) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setKeyboardNav(true);
        setSelectedIndex((p) => Math.min(p + 1, items.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setKeyboardNav(true);
        setSelectedIndex((p) => Math.max(p - 1, 0));
      } else if (e.key === "Enter" && selectedIndex >= 0 && selectedIndex < items.length) {
        e.preventDefault();
        onItemSelect?.(items[selectedIndex], selectedIndex);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [items, selectedIndex, onItemSelect, enableArrowNavigation]);

  useEffect(() => {
    if (!keyboardNav || selectedIndex < 0 || !listRef.current) return;
    const container = listRef.current;
    const el = container.querySelector<HTMLElement>(`[data-index="${selectedIndex}"]`);
    if (el) {
      const extra = 50;
      const top = el.offsetTop;
      const bottom = top + el.offsetHeight;
      if (top < container.scrollTop + extra) {
        container.scrollTo({ top: top - extra, behavior: "smooth" });
      } else if (bottom > container.scrollTop + container.clientHeight - extra) {
        container.scrollTo({
          top: bottom - container.clientHeight + extra,
          behavior: "smooth",
        });
      }
    }
    setKeyboardNav(false);
  }, [selectedIndex, keyboardNav]);

  return (
    <div className={`scroll-list-container ${className}`}>
      <div
        ref={listRef}
        className={`scroll-list ${!displayScrollbar ? "no-scrollbar" : ""}`}
        onScroll={handleScroll}
      >
        {items.map((item, index) => (
          <AnimatedItem
            key={index}
            delay={0.08}
            index={index}
            onMouseEnter={() => handleItemMouseEnter(index)}
            onClick={() => handleItemClick(item, index)}
          >
            <div
              className={`al-item ${selectedIndex === index ? "selected" : ""} ${itemClassName}`}
            >
              {renderItem
                ? renderItem(item, index, selectedIndex === index)
                : (item as ReactNode)}
            </div>
          </AnimatedItem>
        ))}
      </div>
      {showGradients && (
        <>
          <div className="top-gradient" style={{ opacity: topGradientOpacity }} />
          <div className="bottom-gradient" style={{ opacity: bottomGradientOpacity }} />
        </>
      )}
    </div>
  );
}

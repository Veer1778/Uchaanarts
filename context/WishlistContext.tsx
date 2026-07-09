"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type WishItem = {
  slug: string;
  title: string;
  artistName: string;
  image: string;
  price: number;
  medium: string;
  category: string;
  size: string;
  wooId?: number;
};

type WishlistState = {
  items: WishItem[];
  count: number;
  has: (slug: string) => boolean;
  toggle: (item: WishItem) => void;
  remove: (slug: string) => void;
};

const WishlistContext = createContext<WishlistState | null>(null);
const STORAGE_KEY = "uchaan-wishlist";

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishItem[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setItems(JSON.parse(saved));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items]);

  const has = useCallback((slug: string) => items.some((i) => i.slug === slug), [items]);

  const toggle = useCallback((item: WishItem) => {
    setItems((prev) =>
      prev.some((i) => i.slug === item.slug)
        ? prev.filter((i) => i.slug !== item.slug)
        : [...prev, item]
    );
  }, []);

  const remove = useCallback((slug: string) => {
    setItems((prev) => prev.filter((i) => i.slug !== slug));
  }, []);

  const value = useMemo<WishlistState>(
    () => ({ items, count: items.length, has, toggle, remove }),
    [items, has, toggle, remove]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAuthOptional } from "./AuthContext";
import { artworks as allArtworks, artists as allArtists } from "@/lib/data";

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

/**
 * Wishlist state.
 *
 * When the user is signed in, the source of truth is the server
 * (/api/account/wishlist). The client keeps a local mirror so the UI stays
 * snappy, and every mutation writes through to the server and localStorage.
 *
 * When signed out, we use localStorage only. Signing in triggers a merge:
 * any local slugs are pushed up, then the server list is pulled down and
 * overrides local. Signing out keeps the local copy.
 */
export function WishlistProvider({ children }: { children: ReactNode }) {
  // Optional: this provider is mounted on every page including 404s that
  // aren't wrapped in AuthProvider during prerender.
  const auth = useAuthOptional();
  const user = auth?.user ?? null;
  const loading = auth?.loading ?? false;
  const [items, setItems] = useState<WishItem[]>([]);
  const hydrated = useRef(false);
  const syncing = useRef(false);

  // Look up a full WishItem from a slug, using the local dataset. Server
  // storage only holds slugs, since the catalog can change independently.
  const rehydrate = useCallback((slugs: string[]): WishItem[] => {
    const out: WishItem[] = [];
    for (const slug of slugs) {
      const w = allArtworks.find((a) => a.slug === slug);
      if (!w) continue;
      const artist = allArtists.find((a) => a.slug === w.artist);
      out.push({
        slug: w.slug,
        title: w.title,
        artistName: artist?.name ?? "",
        image: w.image,
        price: w.price,
        medium: w.medium,
        category: w.category,
        size: w.size,
        wooId: w.wooId,
      });
    }
    return out;
  }, []);

  // Local restore on mount.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setItems(JSON.parse(saved));
    } catch {
      /* ignore */
    }
    hydrated.current = true;
  }, []);

  // Persist to localStorage always.
  useEffect(() => {
    if (!hydrated.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items]);

  // On sign-in: merge local up, then pull server down.
  useEffect(() => {
    if (loading || !user) return;
    if (syncing.current) return;
    syncing.current = true;

    (async () => {
      try {
        const localSlugs = items.map((i) => i.slug);
        const remoteRes = await fetch("/api/account/wishlist");
        const remoteData = await remoteRes.json();
        const remoteSlugs: string[] = Array.isArray(remoteData.slugs)
          ? remoteData.slugs
          : [];
        const merged = Array.from(new Set([...remoteSlugs, ...localSlugs]));

        if (merged.length !== remoteSlugs.length) {
          await fetch("/api/account/wishlist", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ slugs: merged }),
          });
        }
        setItems(rehydrate(merged));
      } catch {
        /* keep local */
      } finally {
        syncing.current = false;
      }
    })();
    // Only run on sign-in transitions.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading]);

  const pushServer = useCallback(
    (next: WishItem[]) => {
      if (!user) return;
      fetch("/api/account/wishlist", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slugs: next.map((i) => i.slug) }),
      }).catch(() => {
        /* offline: local copy is still authoritative */
      });
    },
    [user]
  );

  const has = useCallback((slug: string) => items.some((i) => i.slug === slug), [items]);

  const toggle = useCallback(
    (item: WishItem) => {
      setItems((prev) => {
        const next = prev.some((i) => i.slug === item.slug)
          ? prev.filter((i) => i.slug !== item.slug)
          : [...prev, item];
        pushServer(next);
        return next;
      });
    },
    [pushServer]
  );

  const remove = useCallback(
    (slug: string) => {
      setItems((prev) => {
        const next = prev.filter((i) => i.slug !== slug);
        pushServer(next);
        return next;
      });
    },
    [pushServer]
  );

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

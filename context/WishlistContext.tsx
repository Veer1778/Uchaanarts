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
import { api } from "@/lib/api";

export type WishItem = {
  slug: string;
  title: string;
  artistName: string;
  image: string;
  price: number;
  medium: string;
  category: string;
  size: string;
  /** tbl_item.item_id. Required to add the work to the cart. */
  itemId?: number;
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
 * any local slugs are pushed up, then the server list is pulled down.
 * Signing out keeps the local copy.
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

  /**
   * Turns a list of slugs into full items.
   *
   * Server storage only holds slugs, so the details have to be recovered from
   * somewhere. In order of preference:
   *
   *   1. what is already in local state, which is the fastest and covers
   *      anything saved on this device
   *   2. the live API, for slugs saved on another device
   *   3. the demo dataset, as a last resort
   *
   * The previous version consulted only the demo dataset, so every live
   * artwork failed the lookup and was silently dropped — signing in wiped the
   * wishlist.
   */
  const rehydrate = useCallback(
    async (slugs: string[], known: WishItem[]): Promise<WishItem[]> => {
      const byLocal = new Map(known.map((i) => [i.slug, i]));
      const out: WishItem[] = [];
      const missing: string[] = [];

      for (const slug of slugs) {
        const local = byLocal.get(slug);
        if (local) {
          out.push(local);
          continue;
        }

        const demo = allArtworks.find((a) => a.slug === slug);
        if (demo) {
          const artist = allArtists.find((a) => a.slug === demo.artist);
          out.push({
            slug: demo.slug,
            title: demo.title,
            artistName: artist?.name ?? "",
            image: demo.image,
            price: demo.price,
            medium: demo.medium,
            category: demo.category,
            size: demo.size,
            itemId: demo.itemId,
          });
          continue;
        }

        missing.push(slug);
      }

      // Anything left was saved on another device. Fetch in parallel, and
      // simply skip a work that has since been removed from the catalogue.
      if (missing.length > 0) {
        const fetched = await Promise.all(
          missing.slice(0, 40).map(async (slug) => {
            try {
              const w = await api.artwork(slug);
              return {
                slug: w.slug,
                title: w.name,
                artistName: w.artist_name ?? "",
                image: w.image ?? "/placeholder.svg",
                price: w.price ?? 0,
                medium: w.medium ?? "",
                category: "",
                size: w.size_label ?? "",
                itemId: w.id,
              } as WishItem;
            } catch {
              return null;
            }
          })
        );
        for (const w of fetched) {
          if (w) out.push(w);
        }
      }

      return out;
    },
    []
  );

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
        const localItems = items;
        const localSlugs = localItems.map((i) => i.slug);

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

        const restored = await rehydrate(merged, localItems);

        // Never let a sync replace a populated wishlist with an empty one.
        // A failed lookup should lose nothing.
        if (restored.length > 0 || merged.length === 0) {
          setItems(restored);
        }
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

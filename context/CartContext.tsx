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
import { useRouter } from "next/navigation";

/**
 * Cart state.
 *
 * Prices held here are for display only. Every total that matters is computed
 * server-side from tbl_item at checkout, so a tampered cart cannot change what
 * a buyer is charged.
 *
 * `itemId` replaces the old `wooId`: WooCommerce is gone and the CMS is the
 * source of truth.
 */

export type CartItem = {
  slug: string;
  title: string;
  artistName: string;
  image: string;
  price: number;
  quantity: number;
  /** tbl_item.item_id — required for checkout. */
  itemId?: number;
};

export type CartTotals = {
  subtotal: number;
  gst: number;
  shipping: number;
  net: number;
};

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  count: number;
  /** Local sum, for the badge. Authoritative totals live in `totals`. */
  total: number;
  totals: CartTotals | null;
  quoting: boolean;
  quoteError: string | null;
  checkingOut: boolean;
  add: (item: Omit<CartItem, "quantity">) => void;
  remove: (slug: string) => void;
  setQuantity: (slug: string, quantity: number) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
  /** Sends the buyer to the checkout page. */
  checkout: () => Promise<void>;
  refreshQuote: () => Promise<void>;
};

const CartContext = createContext<CartState | null>(null);

const STORAGE_KEY = "uchaan-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [totals, setTotals] = useState<CartTotals | null>(null);
  const [quoting, setQuoting] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setItems(JSON.parse(saved));
    } catch {
      /* corrupted or unavailable storage is not worth surfacing */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items]);

  /**
   * Asks the server what this cart actually costs.
   *
   * Also acts as an availability check: the API refuses works that are sold,
   * withdrawn or price-on-request, so a piece bought by someone else while
   * this cart sat open surfaces here rather than at payment.
   */
  const refreshQuote = useCallback(async () => {
    const priced = items.filter((i) => i.itemId);
    if (priced.length === 0) {
      setTotals(null);
      setQuoteError(null);
      return;
    }

    setQuoting(true);
    setQuoteError(null);
    try {
      const res = await fetch("/api/checkout/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: priced.map((i) => ({ item_id: i.itemId, qty: i.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setTotals(null);
        setQuoteError(data?.error ?? "Could not price your cart.");
        return;
      }
      setTotals({
        subtotal: data.subtotal,
        gst: data.gst,
        shipping: data.shipping,
        net: data.net,
      });
    } catch {
      setTotals(null);
      setQuoteError("Could not reach the server.");
    } finally {
      setQuoting(false);
    }
  }, [items]);

  // Re-price whenever the contents change.
  useEffect(() => {
    refreshQuote();
  }, [refreshQuote]);

  const add = useCallback((item: Omit<CartItem, "quantity">) => {
    setItems((prev) => {
      // Originals are unique, so a repeat add opens the drawer rather than
      // incrementing to a quantity that could never be fulfilled.
      if (prev.some((i) => i.slug === item.slug)) return prev;
      return [...prev, { ...item, quantity: 1 }];
    });
    setIsOpen(true);
  }, []);

  const remove = useCallback((slug: string) => {
    setItems((prev) => prev.filter((i) => i.slug !== slug));
  }, []);

  const setQuantity = useCallback((slug: string, quantity: number) => {
    setItems((prev) =>
      quantity <= 0 ? prev.filter((i) => i.slug !== slug) : prev
    );
  }, []);

  const clear = useCallback(() => {
    setItems([]);
    setTotals(null);
  }, []);

  const checkout = useCallback(async () => {
    if (items.length === 0) return;
    setCheckingOut(true);
    setIsOpen(false);
    router.push("/checkout");
    setCheckingOut(false);
  }, [items, router]);

  const value = useMemo<CartState>(
    () => ({
      items,
      isOpen,
      checkingOut,
      totals,
      quoting,
      quoteError,
      count: items.length,
      total: items.reduce((n, i) => n + i.price * i.quantity, 0),
      add,
      remove,
      setQuantity,
      clear,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      checkout,
      refreshQuote,
    }),
    [
      items,
      isOpen,
      checkingOut,
      totals,
      quoting,
      quoteError,
      add,
      remove,
      setQuantity,
      clear,
      checkout,
      refreshQuote,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

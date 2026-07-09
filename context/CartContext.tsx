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

export type CartItem = {
  slug: string;
  title: string;
  artistName: string;
  image: string;
  price: number;
  quantity: number;
  wooId?: number;
};

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  count: number;
  total: number;
  checkingOut: boolean;
  add: (item: Omit<CartItem, "quantity">) => void;
  remove: (slug: string) => void;
  setQuantity: (slug: string, quantity: number) => void;
  open: () => void;
  close: () => void;
  checkout: () => Promise<void>;
};

const CartContext = createContext<CartState | null>(null);

const STORAGE_KEY = "uchaan-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  // hydrate from localStorage
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

  const add = useCallback((item: Omit<CartItem, "quantity">) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.slug === item.slug);
      if (existing) {
        return prev.map((i) =>
          i.slug === item.slug ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    setIsOpen(true);
  }, []);

  const remove = useCallback((slug: string) => {
    setItems((prev) => prev.filter((i) => i.slug !== slug));
  }, []);

  const setQuantity = useCallback((slug: string, quantity: number) => {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((i) => i.slug !== slug)
        : prev.map((i) => (i.slug === slug ? { ...i, quantity } : i))
    );
  }, []);

  const checkout = useCallback(async () => {
    if (items.length === 0) return;
    setCheckingOut(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lines: items.map((i) => ({
            wooId: i.wooId,
            quantity: i.quantity,
            title: `${i.title} — ${i.artistName}`,
          })),
        }),
      });
      const data = await res.json();
      if (data.checkoutUrl) window.location.href = data.checkoutUrl;
    } finally {
      setCheckingOut(false);
    }
  }, [items]);

  const value = useMemo<CartState>(
    () => ({
      items,
      isOpen,
      checkingOut,
      count: items.reduce((n, i) => n + i.quantity, 0),
      total: items.reduce((n, i) => n + i.price * i.quantity, 0),
      add,
      remove,
      setQuantity,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      checkout,
    }),
    [items, isOpen, checkingOut, add, remove, setQuantity, checkout]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

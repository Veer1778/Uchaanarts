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
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { Check, AlertCircle, Info, X } from "lucide-react";

/**
 * Toast notifications.
 *
 * Usage anywhere under <ToastProvider>:
 *   const { toast } = useToast();
 *   toast.success("Added to your wishlist");
 *   toast.error("That didn't work");
 *
 * Toasts stack bottom-right on desktop and bottom-centre on mobile, auto-
 * dismiss after 4s, and are announced to screen readers via a polite live
 * region.
 */

type Variant = "success" | "error" | "info";
type Item = { id: number; message: string; variant: Variant };

type ToastApi = {
  success: (m: string) => void;
  error: (m: string) => void;
  info: (m: string) => void;
};

const ToastContext = createContext<{ toast: ToastApi } | null>(null);

const icons = { success: Check, error: AlertCircle, info: Info };

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Item[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const push = useCallback((message: string, variant: Variant) => {
    const id = Date.now() + Math.random();
    setItems((v) => [...v, { id, message, variant }]);
    setTimeout(() => setItems((v) => v.filter((t) => t.id !== id)), 4000);
  }, []);

  const toast = useMemo<ToastApi>(
    () => ({
      success: (m) => push(m, "success"),
      error: (m) => push(m, "error"),
      info: (m) => push(m, "info"),
    }),
    [push]
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {mounted &&
        createPortal(
          <div
            role="status"
            aria-live="polite"
            className="pointer-events-none fixed bottom-5 left-1/2 z-[200] flex w-[calc(100%-2.5rem)] max-w-sm -translate-x-1/2 flex-col gap-2 sm:left-auto sm:right-6 sm:translate-x-0"
          >
            <AnimatePresence initial={false}>
              {items.map((t) => {
                const Icon = icons[t.variant];
                return (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, y: 12, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    className="pointer-events-auto flex items-start gap-3 border border-line bg-card px-4 py-3 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.28)]"
                  >
                    <Icon
                      size={16}
                      strokeWidth={1.6}
                      className={`mt-0.5 shrink-0 ${
                        t.variant === "error" ? "text-signal" : "text-ink"
                      }`}
                    />
                    <p className="flex-1 text-[13px] leading-snug">{t.message}</p>
                    <button
                      type="button"
                      onClick={() => setItems((v) => v.filter((x) => x.id !== t.id))}
                      aria-label="Dismiss"
                      className="shrink-0 text-faint transition-colors hover:text-ink"
                    >
                      <X size={14} />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  );
}

/** Returns a no-op API when no provider is present, so components that render
 *  on prerendered pages (404 and friends) never throw. */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (ctx) return ctx;
  const noop = () => {};
  return { toast: { success: noop, error: noop, info: noop } };
}

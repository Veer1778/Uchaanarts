"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { useCart } from "@/context/CartContext";
import { formatINR } from "@/lib/data";

export default function CartDrawer() {
  const {
    items,
    isOpen,
    close,
    remove,
    total,
    totals,
    quoteError,
    checkout,
    checkingOut,
  } =
    useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 z-50 bg-ink/40"
            aria-hidden
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 flex h-dvh w-full max-w-md flex-col bg-paper shadow-2xl"
            role="dialog"
            aria-label="Shopping cart"
          >
            <div className="flex items-center justify-between border-b border-line px-6 py-5">
              <h2 className="font-display text-xl">Your collection</h2>
              <button onClick={close} className="text-sm text-muted hover:text-ink">
                Close
              </button>
            </div>

            <div className="drawer-scroll flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <p className="pt-10 text-center text-sm text-muted">
                  Your cart is empty. Browse the{" "}
                  <a href="/art-gallery" className="text-signal underline">
                    art gallery
                  </a>{" "}
                  to find a piece that speaks to you.
                </p>
              ) : (
                <ul className="divide-y divide-line">
                  {items.map((item) => (
                    <li key={item.slug} className="flex gap-4 py-4">
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded bg-wash">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex flex-1 flex-col">
                        <p className="font-display text-base leading-tight">{item.title}</p>
                        <p className="text-xs text-muted">by {item.artistName}</p>
                        <div className="mt-auto flex items-center justify-between">
                          {/* No quantity stepper: every work is a unique
                              original, so the only quantity is one. */}
                          <p className="text-xs text-muted">Original, 1 of 1</p>
                          <p className="text-sm font-medium">{formatINR(item.price)}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => remove(item.slug)}
                        className="self-start text-xs text-muted hover:text-signal"
                        aria-label={`Remove ${item.title}`}
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-line px-6 py-5">
                {/* Totals come from the server so tax and delivery are shown
                    before the buyer commits. `total` is only a fallback while
                    the quote is in flight. */}
                <dl className="mb-4 space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted">Subtotal</dt>
                    <dd>{formatINR(totals?.subtotal ?? total)}</dd>
                  </div>
                  {totals && (
                    <>
                      <div className="flex justify-between">
                        <dt className="text-muted">GST</dt>
                        <dd>{formatINR(totals.gst)}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted">Delivery</dt>
                        <dd>
                          {totals.shipping === 0 ? "Free" : formatINR(totals.shipping)}
                        </dd>
                      </div>
                      <div className="flex justify-between border-t border-line pt-2">
                        <dt>Total</dt>
                        <dd className="font-display text-xl">{formatINR(totals.net)}</dd>
                      </div>
                    </>
                  )}
                </dl>

                {quoteError && (
                  <p className="mb-3 text-xs text-signal">{quoteError}</p>
                )}
                <button
                  onClick={checkout}
                  disabled={checkingOut}
                  className="w-full bg-signal py-3.5 text-xs font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-signal-dark disabled:opacity-60"
                >
                  {checkingOut ? "Preparing checkout…" : "Checkout"}
                </button>
                <p className="mt-3 text-center text-[11px] text-muted">
                  Secure checkout · Razorpay, UPI &amp; cards accepted
                </p>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

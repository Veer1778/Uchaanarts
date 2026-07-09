"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Heart, ShoppingCart, X } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { formatINR } from "@/lib/data";

export default function WishlistView() {
  const { items, remove } = useWishlist();
  const { add } = useCart();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <Heart size={40} className="text-line" />
        <p className="text-sm text-muted">
          Nothing saved yet. Tap the heart on any artwork to keep it here.
        </p>
        <Link
          href="/art-gallery"
          className="mt-2 border border-ink px-8 py-3 text-[11px] uppercase tracking-[0.2em] hover:border-signal hover:text-signal"
        >
          Browse the gallery
        </Link>
      </div>
    );
  }

  return (
    <div className="columns-1 gap-6 sm:columns-2 lg:columns-3 [column-fill:_balance]">
      <AnimatePresence>
        {items.map((w) => (
          <motion.div
            key={w.slug}
            layout
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="mb-6 break-inside-avoid border border-line bg-paper"
          >
            <div className="relative overflow-hidden bg-wash">
              <Link href={`/art/${w.slug}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={w.image} alt={w.title} className="h-auto w-full" loading="lazy" />
              </Link>
              <button
                onClick={() => remove(w.slug)}
                aria-label={`Remove ${w.title} from wishlist`}
                className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-paper/90 text-ink shadow hover:text-signal"
              >
                <X size={15} />
              </button>
            </div>
            <div className="p-4">
              <Link href={`/art/${w.slug}`}>
                <h3 className="font-display text-lg leading-snug hover:text-signal">{w.title}</h3>
              </Link>
              <p className="text-xs text-muted">By {w.artistName}</p>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-signal">{formatINR(w.price)}</p>
                <button
                  onClick={() =>
                    add({
                      slug: w.slug,
                      title: w.title,
                      artistName: w.artistName,
                      image: w.image,
                      price: w.price,
                      wooId: w.wooId,
                    })
                  }
                  className="flex items-center gap-2 border border-line px-3 py-2 text-xs text-muted transition-colors hover:border-signal hover:bg-signal hover:text-white"
                >
                  <ShoppingCart size={14} /> Add
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

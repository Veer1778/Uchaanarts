"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Heart, Eye, Share2, ShoppingCart, Mail } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import type { Artwork } from "@/lib/data";
import { formatArtworkPrice, isPurchasable } from "@/lib/data";

/**
 * Purchase and save actions for a single artwork.
 *
 * The "Art on Wall" preview has been removed at the client's request.
 *
 * Action hierarchy: one primary button (Buy Now, or the price for
 * price-on-request works), then quiet secondary icons. The enquiry actions sit
 * below this bar in EnquireBar, so this component deliberately does not
 * compete with them.
 */
export default function ProductBuyBar({
  artwork,
  artistName,
  views,
}: {
  artwork: Artwork;
  artistName: string;
  views: number;
}) {
  const { add, checkout, checkingOut } = useCart();
  const { has, toggle } = useWishlist();
  const [shared, setShared] = useState(false);
  const wished = has(artwork.slug);
  const buyable = isPurchasable(artwork);

  const cartItem = {
    slug: artwork.slug,
    title: artwork.title,
    artistName,
    image: artwork.image,
    price: artwork.price,
    itemId: artwork.itemId,
  };

  const share = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) {
        await navigator.share({ title: artwork.title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setShared(true);
      setTimeout(() => setShared(false), 1800);
    } catch {
      /* dismissed by the user, nothing to report */
    }
  };

  const iconBtn =
    "grid h-11 w-11 place-items-center border border-line text-muted transition-colors hover:border-signal hover:text-signal";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={() => toggle(artwork.slug)}
        aria-label={wished ? "Remove from saved works" : "Save this work"}
        aria-pressed={wished}
        className={iconBtn}
      >
        <Heart size={15} className={wished ? "fill-signal text-signal" : ""} />
      </button>

      <span
        className="grid h-11 place-items-center gap-1.5 border border-line px-3 text-xs text-muted"
        title={`${views} people viewed this work`}
      >
        <span className="flex items-center gap-1.5">
          <Eye size={14} /> {views}
        </span>
      </span>

      <button onClick={share} aria-label="Share this work" className={iconBtn}>
        <Share2 size={15} />
      </button>
      {shared && <span className="text-xs text-muted">Link copied</span>}

      {buyable ? (
        <>
          <button
            onClick={() => add(cartItem)}
            aria-label="Add to cart"
            className={iconBtn}
          >
            <ShoppingCart size={15} />
          </button>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={async () => {
              add(cartItem);
              await checkout();
            }}
            disabled={checkingOut}
            className="flex items-center gap-2 bg-signal px-8 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:bg-signal-dark disabled:opacity-60"
          >
            {checkingOut ? "…" : "Buy Now"}
          </motion.button>
        </>
      ) : (
        // Price-on-request or sold. Checkout would create a zero-rupee order,
        // so the enquiry path below is the only sensible action.
        <span className="flex items-center gap-2 border border-line px-5 py-3 text-xs uppercase tracking-[0.14em] text-muted">
          <Mail size={14} />
          {formatArtworkPrice(artwork)}
        </span>
      )}
    </div>
  );
}

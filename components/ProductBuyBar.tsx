"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Frame, Heart, Eye, Share2, ShoppingCart, Mail } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import type { Artwork } from "@/lib/data";
import { formatArtworkPrice, isPurchasable } from "@/lib/data";
import ArtOnWall from "./ArtOnWall";

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
  const [wallOpen, setWallOpen] = useState(false);
  const wished = has(artwork.slug);
  const buyable = isPurchasable(artwork);

  const cartItem = {
    slug: artwork.slug,
    title: artwork.title,
    artistName,
    image: artwork.image,
    price: artwork.price,
    wooId: artwork.wooId,
  };

  const wishItem = {
    slug: artwork.slug,
    title: artwork.title,
    artistName,
    image: artwork.image,
    price: artwork.price,
    medium: artwork.medium,
    category: artwork.category,
    size: artwork.size,
    wooId: artwork.wooId,
  };

  const onShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) await navigator.share({ title: artwork.title, url });
      else {
        await navigator.clipboard.writeText(url);
        setShared(true);
        setTimeout(() => setShared(false), 1500);
      }
    } catch {
      /* user dismissed */
    }
  };

  const iconBtn =
    "flex items-center gap-1.5 border border-line px-3 py-2.5 text-sm text-muted transition-colors hover:border-signal hover:text-signal";

  return (
    <>
    <div className="flex flex-wrap items-center gap-2.5">
      <button
        type="button"
        onClick={() => setWallOpen(true)}
        className={iconBtn}
      >
        <Frame size={15} /> Art on Wall
      </button>

      <button
        onClick={() => toggle(wishItem)}
        aria-pressed={wished}
        aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
        className={`${iconBtn} ${wished ? "border-signal text-signal" : ""}`}
      >
        <Heart size={15} fill={wished ? "currentColor" : "none"} />
        {views + (wished ? 1 : 0)}
      </button>

      <span className={`${iconBtn} cursor-default hover:border-line hover:text-muted`}>
        <Eye size={15} /> {views}
      </span>

      <button onClick={onShare} className={iconBtn} aria-label="Share">
        <Share2 size={15} /> {shared ? "Copied" : ""}
      </button>

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
            className="flex items-center gap-2 bg-signal px-7 py-2.5 text-xs font-semibold tracking-[0.16em] text-white transition-colors hover:bg-signal-dark disabled:opacity-60"
          >
            {checkingOut ? "…" : "Buy Now"}
          </motion.button>
        </>
      ) : (
        // Price-on-request or already sold. Checkout would produce a
        // zero-rupee order, so route the buyer to an enquiry instead.
        <>
          <span className="px-1 text-xs font-semibold tracking-[0.1em] text-muted">
            {formatArtworkPrice(artwork)}
          </span>
          <a
            href={`mailto:info@uchaanarts.com?subject=${encodeURIComponent(
              `Enquiry: ${artwork.title}`
            )}&body=${encodeURIComponent(
              `I'd like to enquire about "${artwork.title}" by ${artistName}.`
            )}`}
            className="flex items-center gap-2 bg-signal px-7 py-2.5 text-xs font-semibold tracking-[0.16em] text-white transition-colors hover:bg-signal-dark"
          >
            <Mail size={15} /> Enquire
          </a>
        </>
      )}
    </div>

      <ArtOnWall
        open={wallOpen}
        onClose={() => setWallOpen(false)}
        image={artwork.image}
        title={artwork.title}
        artistName={artistName}
        size={artwork.size}
      />
    </>
  );
}

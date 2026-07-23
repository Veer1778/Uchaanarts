"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, ShoppingCart } from "lucide-react";
import type { Artwork } from "@/lib/data";
import { formatINR, artistBySlug } from "@/lib/data";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

export default function ArtworkCard({
  artwork,
  artistName,
}: {
  artwork: Artwork;
  artistName?: string;
}) {
  const name = artistName ?? artistBySlug(artwork.artist)?.name ?? artwork.artist;
  const router = useRouter();
  const { add } = useCart();
  const { has, toggle } = useWishlist();
  const wished = has(artwork.slug);
  const href = `/art/${artwork.slug}`;

  const stop = (fn: () => void) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    fn();
  };

  return (
    // The whole card is a link to the store page. Buttons inside stop propagation.
    <div
      onClick={() => router.push(href)}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") router.push(href);
      }}
      className="group flex cursor-pointer flex-col border border-line bg-paper transition-shadow duration-300 hover:shadow-[0_18px_50px_-20px_rgba(235,0,0,0.28)]"
    >
      <div className="overflow-hidden bg-wash">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={artwork.image}
          alt={`${artwork.title} by ${name}`}
          loading="lazy"
          className="h-auto w-full transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
      </div>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <h3 className="font-display text-base font-medium leading-snug text-ink group-hover:text-signal sm:text-lg">
          {artwork.title}
        </h3>
        <Link
          href={`/artists/${artwork.artist}`}
          onClick={(e) => e.stopPropagation()}
          className="w-fit text-xs text-muted hover:text-signal"
        >
          By {name}
        </Link>

        <div className="mt-3 space-y-0.5 text-[11px] text-muted sm:mt-4 sm:text-xs">
          <p className="text-ink">{artwork.category}</p>
          <p>{artwork.medium}</p>
        </div>

        <div className="mt-2 flex items-end justify-between gap-2">
          <p className="text-[11px] text-muted sm:text-xs">{artwork.size}</p>
          <p className="whitespace-nowrap text-xs font-semibold text-signal sm:text-sm">
            {formatINR(artwork.price)}
          </p>
        </div>

        <div className="mt-3 flex gap-2 sm:mt-4">
          <button
            onClick={stop(() =>
              toggle({
                slug: artwork.slug,
                title: artwork.title,
                artistName: name,
                image: artwork.image,
                price: artwork.price,
                medium: artwork.medium,
                category: artwork.category,
                size: artwork.size,
                wooId: artwork.wooId,
              })
            )}
            aria-pressed={wished}
            aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
            className={`flex flex-1 items-center justify-center border py-2 transition-colors sm:py-2.5 ${
              wished
                ? "border-signal bg-signal/5 text-signal"
                : "border-line text-muted hover:border-signal hover:text-signal"
            }`}
          >
            <Heart size={16} fill={wished ? "currentColor" : "none"} />
          </button>
          <button
            onClick={stop(() =>
              add({
                slug: artwork.slug,
                title: artwork.title,
                artistName: name,
                image: artwork.image,
                price: artwork.price,
                wooId: artwork.wooId,
              })
            )}
            aria-label={`Add ${artwork.title} to cart`}
            className="flex flex-1 items-center justify-center border border-line py-2.5 text-muted transition-colors hover:border-signal hover:bg-signal hover:text-white"
          >
            <ShoppingCart size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

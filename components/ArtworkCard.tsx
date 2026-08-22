"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, ShoppingCart, Mail } from "lucide-react";
import type { Artwork } from "@/lib/data";
import { formatArtworkPrice, isPurchasable, artistBySlug } from "@/lib/data";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

export default function ArtworkCard({
  artwork,
  artistName,
}: {
  artwork: Artwork;
  artistName?: string;
}) {
  // Prefer the explicit prop, then the name the API resolved, then the demo
  // lookup. Without the middle case, live artworks fall back to showing the
  // raw slug because they are not in the demo artists array.
  const name =
    artistName ??
    artwork.artistName ??
    artistBySlug(artwork.artist)?.name ??
    artwork.artist;

  const router = useRouter();
  const { add } = useCart();
  const { has, toggle } = useWishlist();
  const wished = has(artwork.slug);
  const href = `/art/${artwork.slug}`;
  const buyable = isPurchasable(artwork);

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
          {/* Size can be empty when the CMS has no dimensions, so the row
              collapses rather than leaving a stray gap before the price. */}
          {artwork.size && (
            <p className="text-[11px] text-muted sm:text-xs">{artwork.size}</p>
          )}
          <p
            className={`ml-auto whitespace-nowrap text-xs font-semibold sm:text-sm ${
              buyable ? "text-signal" : "text-muted"
            }`}
          >
            {formatArtworkPrice(artwork)}
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
          {buyable ? (
            <button
              onClick={stop(() =>
                add({
                  slug: artwork.slug,
                  title: artwork.title,
                  artistName: name,
                  image: artwork.image,
                  price: artwork.price,
                  // tbl_item.item_id. Checkout sends this to the server, which
                  // then prices the order itself — the price above is display
                  // only and is never trusted.
                  itemId: artwork.itemId,
                })
              )}
              aria-label={`Add ${artwork.title} to cart`}
              className="flex flex-1 items-center justify-center border border-line py-2.5 text-muted transition-colors hover:border-signal hover:bg-signal hover:text-white"
            >
              <ShoppingCart size={16} />
            </button>
          ) : (
            // Price-on-request or sold. Adding it to the cart would create a
            // zero-rupee line item, so send the buyer to the enquiry form.
            <button
              onClick={stop(() => router.push(href))}
              aria-label={`Enquire about ${artwork.title}`}
              className="flex flex-1 items-center justify-center border border-line py-2.5 text-muted transition-colors hover:border-signal hover:bg-signal hover:text-white"
            >
              <Mail size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

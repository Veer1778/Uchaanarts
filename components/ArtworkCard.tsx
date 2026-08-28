"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, ShoppingCart, Mail } from "lucide-react";
import type { Artwork } from "@/lib/data";
import { formatArtworkPrice, isPurchasable, artistBySlug } from "@/lib/data";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

/**
 * Artwork card, following the gallery's reference:
 *
 *   Series Winged Jewels
 *   By nin taneja
 *
 *   Painting
 *   Watercolour On Paper
 *   15 X 11 In              ₹ 31,500
 *   [ heart ] [ cart ]
 *
 * Title leads, artist credited beneath in the accent colour, then category,
 * medium, and size with the price aligned right. Anything the CMS has not
 * filled in collapses rather than leaving an empty line.
 */
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
      className="group flex cursor-pointer flex-col overflow-hidden rounded-md border border-line bg-paper transition-shadow duration-300 hover:shadow-[0_18px_50px_-20px_rgba(0,0,0,0.25)]"
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

      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-[15px] font-semibold leading-snug text-ink group-hover:text-signal">
          {artwork.title}
        </h3>

        <Link
          href={`/artists/${artwork.artist}`}
          onClick={(e) => e.stopPropagation()}
          className="mt-1 w-fit text-[13px] text-signal hover:underline"
        >
          By {name}
        </Link>

        <div className="mt-4 space-y-1 text-[13px] text-muted">
          {artwork.category && <p>{artwork.category}</p>}
          {artwork.medium && <p>{artwork.medium}</p>}
        </div>

        <div className="mt-2 flex items-baseline justify-between gap-3">
          {/* Size can be empty when the CMS has no dimensions; the price still
              sits right rather than jumping left. */}
          <p className="text-[13px] text-muted">{artwork.size ?? ""}</p>
          <p
            className={`whitespace-nowrap text-[15px] font-semibold ${
              buyable ? "text-signal" : "text-muted"
            }`}
          >
            {formatArtworkPrice(artwork)}
          </p>
        </div>

        <div className="mt-4 flex gap-3">
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
                itemId: artwork.itemId,
              })
            )}
            aria-pressed={wished}
            aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
            className={`flex flex-1 items-center justify-center rounded border py-2.5 transition-colors ${
              wished
                ? "border-signal bg-signal/5 text-signal"
                : "border-line text-ink hover:border-signal hover:text-signal"
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
                  itemId: artwork.itemId,
                })
              )}
              aria-label={`Add ${artwork.title} to cart`}
              className="flex flex-1 items-center justify-center rounded border border-line py-2.5 text-ink transition-colors hover:border-signal hover:bg-signal hover:text-white"
            >
              <ShoppingCart size={16} />
            </button>
          ) : (
            // Price-on-request or sold. Adding it to the cart would create a
            // zero-rupee line item, so send the buyer to the enquiry form.
            <button
              onClick={stop(() => router.push(href))}
              aria-label={`Enquire about ${artwork.title}`}
              className="flex flex-1 items-center justify-center rounded border border-line py-2.5 text-ink transition-colors hover:border-signal hover:bg-signal hover:text-white"
            >
              <Mail size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

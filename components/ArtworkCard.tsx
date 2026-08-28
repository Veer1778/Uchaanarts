"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, ShoppingCart, Mail, ArrowUpRight } from "lucide-react";
import type { Artwork } from "@/lib/data";
import { formatArtworkPrice, isPurchasable, artistBySlug } from "@/lib/data";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

/**
 * Artwork card.
 *
 * Caption follows the gallery's reference exactly:
 *
 *   "Octhopuses"  Painting
 *   Josep Moncada, Spain
 *   Oil on Canvas • 110 × 110 in
 *
 * Title leads, in quotes, with the category beside it. Artist and country
 * next. Material and dimensions last, separated by a bullet. Any part the CMS
 * has not filled in is dropped rather than leaving stray punctuation.
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

  // Line 2: "Josep Moncada, Spain" — or just the name when no country is set.
  const credit = [name, artwork.artistCountry].filter(Boolean).join(", ");

  // Line 3: "Oil on Canvas • 110 × 110 in". `medium` is the CMS's free-text
  // description of the support, which is what the reference shows here.
  const detail = [artwork.medium, artwork.size].filter(Boolean).join(" • ");

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
      className="group flex cursor-pointer flex-col border border-line bg-paper transition-shadow duration-300 hover:shadow-[0_18px_50px_-20px_rgba(0,0,0,0.28)]"
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
        {/* Line 1: title in quotes, category alongside, open-link icon right */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-display text-base leading-snug text-ink group-hover:text-signal sm:text-lg">
              &ldquo;{artwork.title}&rdquo;
              {artwork.category && (
                <span className="ml-2 align-middle text-[11px] uppercase tracking-[0.12em] text-muted sm:text-xs">
                  {artwork.category}
                </span>
              )}
            </h3>
          </div>

          <ArrowUpRight
            size={16}
            aria-hidden
            className="mt-1 shrink-0 text-muted transition-colors group-hover:text-signal"
          />
        </div>

        {/* Line 2: artist, country */}
        <Link
          href={`/artists/${artwork.artist}`}
          onClick={(e) => e.stopPropagation()}
          className="mt-1.5 w-fit text-xs text-ink hover:text-signal sm:text-[13px]"
        >
          {credit}
        </Link>

        {/* Line 3: material and dimensions */}
        {detail && (
          <p className="mt-1 text-[11px] text-muted sm:text-xs">{detail}</p>
        )}

        <p
          className={`mt-3 text-xs font-semibold sm:text-sm ${
            buyable ? "text-signal" : "text-muted"
          }`}
        >
          {formatArtworkPrice(artwork)}
        </p>

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
                itemId: artwork.itemId,
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

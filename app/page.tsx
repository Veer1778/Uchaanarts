import Link from "next/link";
import GalleryGrid from "@/components/GalleryGrid";
import { getArtworks, getArtists } from "@/lib/cms";
import { categories } from "@/lib/data";

/**
 * Home — the shop.
 *
 * No hero: the catalogue is the landing experience. A slim masthead states
 * what this is in one line, category links sit immediately beneath it, and the
 * full filterable grid begins above the fold. Nothing stands between arriving
 * and browsing work.
 */
export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; price?: string }>;
}) {
  const params = await searchParams;
  const [artworks, artists] = await Promise.all([getArtworks(), getArtists()]);

  return (
    <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-10">
      {/* Slim masthead — one line, no scrolling required to reach the work */}
      <section className="border-b border-line py-7 sm:py-9">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <div>
            <h1 className="font-display text-3xl leading-tight sm:text-4xl">
              Original contemporary Indian art
            </h1>
            <p className="mt-2 text-sm text-muted">
              Painting, sculpture and works on paper. Delhi &amp; Gurgaon, since
              2009. Shipped worldwide.
            </p>
          </div>

          <dl className="flex gap-8 text-sm">
            <div>
              <dt className="text-xs text-faint">Artists</dt>
              <dd className="font-display text-xl">{artists.length}</dd>
            </div>
            <div>
              <dt className="text-xs text-faint">Works</dt>
              <dd className="font-display text-xl">{artworks.length}</dd>
            </div>
          </dl>
        </div>

        {/* Category shortcuts, immediately actionable */}
        <nav
          aria-label="Shop by category"
          className="mt-6 flex flex-wrap gap-2"
        >
          <Link
            href="/"
            className={`border px-3.5 py-1.5 text-sm transition-colors ${
              !params.category
                ? "border-ink bg-ink text-paper"
                : "border-line hover:border-ink"
            }`}
          >
            All
          </Link>
          {categories.map((c) => (
            <Link
              key={c}
              href={`/?category=${encodeURIComponent(c)}`}
              className={`border px-3.5 py-1.5 text-sm transition-colors ${
                params.category === c
                  ? "border-ink bg-ink text-paper"
                  : "border-line hover:border-ink"
              }`}
            >
              {c}
            </Link>
          ))}
        </nav>
      </section>

      {/* The catalogue */}
      <section className="py-8">
        <GalleryGrid
          artworks={artworks}
          artists={artists}
          initialCategory={params.category}
          initialPriceBand={
            params.price !== undefined ? Number(params.price) : undefined
          }
        />
      </section>
    </div>
  );
}

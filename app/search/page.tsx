import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { api, formatPrice } from "@/lib/api";

export const metadata: Metadata = {
  title: "Search",
  description: "Search artworks and artists at Uchaan Arts.",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  if (query.length < 2) {
    return (
      <main className="mx-auto max-w-[1400px] px-5 py-20 sm:px-8 lg:px-10">
        <h1 className="font-display text-4xl">Search</h1>
        <p className="mt-4 text-sm text-muted">
          Enter at least two characters to search the collection.
        </p>
      </main>
    );
  }

  // Artworks come from the filtered listing rather than /search so the result
  // set is paginated and complete, not capped at the quick-search preview.
  const [works, quick] = await Promise.all([
    api.artworks({ q: query, per_page: 60 }).catch(() => ({
      items: [],
      meta: { page: 1, per_page: 60, total: 0, total_pages: 0 },
    })),
    api.search(query, 12).catch(() => ({ query, artworks: [], artists: [] })),
  ]);

  const artists = quick.artists;
  const total = works.meta.total;

  return (
    <main className="mx-auto max-w-[1400px] px-5 py-16 sm:px-8 lg:px-10">
      <h1 className="font-display text-4xl sm:text-5xl">
        Results for <span className="text-signal">{query}</span>
      </h1>
      <p className="mt-3 text-sm text-muted">
        {total} artwork{total === 1 ? "" : "s"}
        {artists.length > 0 &&
          `, ${artists.length} artist${artists.length === 1 ? "" : "s"}`}
      </p>

      {artists.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-[11px] uppercase tracking-[0.18em] text-muted">
            Artists
          </h2>
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {artists.map((a) => (
              <Link key={a.id} href={`/artists/${a.slug}`} className="group">
                <div className="relative aspect-square overflow-hidden bg-line">
                  {a.image && (
                    <Image
                      src={a.image}
                      alt={a.name}
                      fill
                      sizes="(max-width: 640px) 33vw, 16vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                </div>
                <p className="mt-2 text-sm group-hover:text-signal">
                  {a.name.trim()}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mt-14">
        <h2 className="mb-4 text-[11px] uppercase tracking-[0.18em] text-muted">
          Artworks
        </h2>

        {works.items.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted">
            No artworks matched that search.{" "}
            <Link href="/art-gallery" className="text-signal hover:underline">
              Browse the full gallery
            </Link>
            .
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {works.items.map((w) => (
              <Link key={w.id} href={`/art/${w.slug}`} className="group">
                <div className="relative aspect-[3/4] overflow-hidden bg-line">
                  {w.image && (
                    <Image
                      src={w.image}
                      alt={w.name}
                      fill
                      sizes="(max-width: 640px) 50vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                </div>
                <p className="mt-2 text-sm group-hover:text-signal">{w.name}</p>
                <p className="text-xs text-muted">{w.artist_name}</p>
                <p className="text-xs text-signal">{formatPrice(w)}</p>
              </Link>
            ))}
          </div>
        )}

        {total > works.items.length && (
          <p className="mt-10 text-center text-xs tracking-[0.18em] text-muted">
            SHOWING {works.items.length} OF {total}.{" "}
            <Link href="/art-gallery" className="text-signal hover:underline">
              REFINE IN THE GALLERY
            </Link>
          </p>
        )}
      </section>
    </main>
  );
}

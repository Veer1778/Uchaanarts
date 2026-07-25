import Link from "next/link";
import Image from "next/image";
import GalleryGrid from "@/components/GalleryGrid";
import Reveal from "@/components/Reveal";
import { getArtworks, getArtists, getPosts, getExhibitions } from "@/lib/cms";
import { categories } from "@/lib/data";
import { ShieldCheck, Truck, BadgeCheck, Headset } from "lucide-react";

/**
 * Home — the shop.
 *
 * The catalogue is the landing experience: a one-line masthead, category
 * shortcuts, then the filterable grid. Editorial content (exhibitions,
 * journal) and the buyer-assurance cards sit below the fold, so they support
 * the sale without standing in front of it.
 */

const assurances = [
  {
    icon: BadgeCheck,
    title: "Certificate of authenticity",
    body: "Every work ships with signed provenance from the gallery.",
  },
  {
    icon: Truck,
    title: "Worldwide shipping",
    body: "Insured, custom-crated and tracked to your door.",
  },
  {
    icon: ShieldCheck,
    title: "Secure payment",
    body: "UPI, cards and net banking, handled over encrypted checkout.",
  },
  {
    icon: Headset,
    title: "Advisory on request",
    body: "Speak to the gallery about sizing, framing and placement.",
  },
];

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; price?: string }>;
}) {
  const params = await searchParams;
  const [artworks, artists, posts, exhibitions] = await Promise.all([
    getArtworks(),
    getArtists(),
    getPosts(),
    getExhibitions(),
  ]);

  const journal = posts.slice(0, 3);
  const showing = exhibitions.slice(0, 2);

  return (
    <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-10">
      {/* Masthead */}
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

        <nav aria-label="Shop by category" className="mt-6 flex flex-wrap gap-2">
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

      {/* Catalogue.
          `key` forces a remount when the category changes: GalleryGrid seeds
          its filter state from props via useState, which is read once, so
          without this a category link from one shop URL to another leaves the
          old filter in place. */}
      <section className="py-8">
        <GalleryGrid
          key={params.category ?? "all"}
          artworks={artworks}
          artists={artists}
          initialCategory={params.category}
          initialPriceBand={
            params.price !== undefined ? Number(params.price) : undefined
          }
        />
      </section>

      {/* Buyer assurance */}
      <Reveal>
        <section className="border-t border-line py-14">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {assurances.map(({ icon: Icon, title, body }) => (
              <div key={title}>
                <Icon size={20} strokeWidth={1.4} />
                <p className="mt-4 font-display text-lg leading-snug">{title}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      {/* Currently showing */}
      {showing.length > 0 && (
        <Reveal>
          <section className="border-t border-line py-14">
            <div className="mb-8 flex items-end justify-between gap-6">
              <h2 className="font-display text-3xl sm:text-4xl">
                Currently showing
              </h2>
              <Link
                href="/exhibitions"
                className="shrink-0 text-sm text-muted underline underline-offset-4 hover:text-ink"
              >
                All exhibitions
              </Link>
            </div>

            <div className="grid gap-8 sm:grid-cols-2">
              {showing.map((e) => (
                <Link key={e.slug} href="/exhibitions" className="group block">
                  <div className="relative aspect-[16/10] overflow-hidden bg-wash">
                    {e.image && (
                      <Image
                        src={e.image}
                        alt={e.title}
                        fill
                        sizes="(max-width: 640px) 100vw, 50vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      />
                    )}
                  </div>
                  <p className="mt-4 font-display text-xl">{e.title}</p>
                  <p className="mt-1 text-sm text-muted">
                    {e.venue}
                    {e.start ? ` · ${e.start}` : ""}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        </Reveal>
      )}

      {/* Journal */}
      {journal.length > 0 && (
        <Reveal>
          <section className="border-t border-line py-14">
            <div className="mb-8 flex items-end justify-between gap-6">
              <h2 className="font-display text-3xl sm:text-4xl">From the journal</h2>
              <Link
                href="/blog"
                className="shrink-0 text-sm text-muted underline underline-offset-4 hover:text-ink"
              >
                All writing
              </Link>
            </div>

            <div className="grid gap-8 sm:grid-cols-3">
              {journal.map((p) => (
                <Link key={p.slug} href={`/blog/${p.slug}`} className="group block">
                  <div className="relative aspect-[4/3] overflow-hidden bg-wash">
                    {p.image && (
                      <Image
                        src={p.image}
                        alt={p.title}
                        fill
                        sizes="(max-width: 640px) 100vw, 33vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      />
                    )}
                  </div>
                  <p className="mt-4 text-xs text-faint">{p.category}</p>
                  <p className="mt-1 font-display text-lg leading-snug">{p.title}</p>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">
                    {p.excerpt}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        </Reveal>
      )}
    </div>
  );
}

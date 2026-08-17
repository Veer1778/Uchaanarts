import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BadgeCheck } from "lucide-react";
import Reveal from "@/components/Reveal";
import MasonryCards from "@/components/MasonryCards";
import ProductBuyBar from "@/components/ProductBuyBar";
import EnquireBar from "@/components/EnquireBar";
import { getArtwork, getArtworks, getArtist, getArtists } from "@/lib/cms";
import { formatArtworkPrice, namesMap } from "@/lib/data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const artwork = await getArtwork(slug);
  if (!artwork) return {};
  return {
    title: artwork.title,
    description: artwork.description,
    openGraph: { images: [artwork.image] },
  };
}

// stable pseudo-view count from the slug
const viewsFor = (slug: string) =>
  20 + ([...slug].reduce((a, c) => a + c.charCodeAt(0), 0) % 180);

/**
 * Adds a centimetre equivalent to an inches measurement.
 * Returns the input untouched when it isn't a parseable "W x H" string, which
 * is common: the CMS stores plenty of free-text sizes.
 */
function sizeWithCm(size: string) {
  const m = size.match(/(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)/i);
  if (!m) return size;
  const cm = (n: number) => (n * 2.54).toFixed(1);
  return `${size} | ${cm(parseFloat(m[1]))} × ${cm(parseFloat(m[2]))} cm`;
}

export default async function ArtworkPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const artwork = await getArtwork(slug);
  if (!artwork) notFound();

  const [artist, all, artists] = await Promise.all([
    getArtist(artwork.artist),
    getArtworks(),
    getArtists(),
  ]);
  const artistName = artist?.name ?? artwork.artistName ?? artwork.artist;
  const names = namesMap(artists);

  const fromArtist = all.filter(
    (w) => w.artist === artwork.artist && w.slug !== artwork.slug
  );
  const related = (
    fromArtist.length >= 3
      ? fromArtist
      : all.filter((w) => w.slug !== artwork.slug && w.category === artwork.category)
  ).slice(0, 6);

  /**
   * Specifications, built only from values the CMS actually holds.
   *
   * The previous version hardcoded Style as "Contemporary", Created In as
   * "2024", and generated a fake Lot No from the slug, so every artwork
   * displayed the same details regardless of what it was. Anything missing is
   * now omitted rather than invented.
   */
  const specs: [string, string][] = [];
  const add = (label: string, value?: string | number | null) => {
    const v = value === null || value === undefined ? "" : String(value).trim();
    if (v) specs.push([label, v]);
  };

  add("Size", artwork.size ? sizeWithCm(artwork.size) : "");
  add("Medium", artwork.mediumTerm ?? artwork.medium);
  add("Material", artwork.material);
  add("Style", artwork.style);
  add("Theme", artwork.theme);
  add("Created in", artwork.year);
  add("Reference", artwork.code);
  add("Surface", artwork.surface);
  add("Availability", artwork.available === false ? "Sold" : "Available");
  add("International shipping", "Yes");

  const gallery =
    artwork.gallery && artwork.gallery.length > 0 ? artwork.gallery : [artwork.image];

  return (
    <>
      <section className="relative mx-auto max-w-5xl px-5 pt-8">
        <div className="aura -left-32 top-10 h-72 w-72" />

        <nav aria-label="Breadcrumb" className="mb-6 text-xs text-muted">
          <Link href="/" className="hover:text-signal">
            Home
          </Link>
          {" / "}
          <Link href="/art-gallery" className="hover:text-signal">
            Art Gallery
          </Link>
          {" / "}
          <span className="text-ink">{artwork.title}</span>
        </nav>

        {/* Centered image, uncropped */}
        <Reveal>
          <div className="mx-auto flex max-w-2xl items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={artwork.image}
              alt={`${artwork.title} by ${artistName}`}
              className="max-h-[68vh] w-auto max-w-full object-contain shadow-[0_24px_70px_-28px_rgba(0,0,0,0.4)]"
            />
          </div>
        </Reveal>

        {/* Additional views, only when the CMS has more than the main image */}
        {gallery.length > 1 && (
          <Reveal delay={0.05}>
            <div className="mx-auto mt-4 flex max-w-2xl flex-wrap justify-center gap-3">
              {gallery.slice(0, 6).map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={src}
                  src={src}
                  alt={`${artwork.title}, view ${i + 1}`}
                  className="h-20 w-20 object-cover"
                />
              ))}
            </div>
          </Reveal>
        )}

        <div className="mt-12 grid gap-10 lg:grid-cols-[1.45fr_1fr]">
          <Reveal>
            <div>
              <h1 className="font-display text-3xl leading-tight sm:text-4xl">
                {artwork.title}
              </h1>

              {/* Artist attribution belongs next to the title, not only in the
                  sidebar card, which is where buyers look for it. */}
              <p className="mt-1 text-sm text-muted">
                by{" "}
                {artist ? (
                  <Link
                    href={`/artists/${artist.slug}`}
                    className="text-ink underline underline-offset-4 hover:text-signal"
                  >
                    {artistName}
                  </Link>
                ) : (
                  <span className="text-ink">{artistName}</span>
                )}
                {artwork.year ? `, ${artwork.year}` : ""}
              </p>

              {/* Key facts up front, so they are legible before any scrolling */}
              <p className="mt-3 text-sm text-muted">
                {[artwork.mediumTerm ?? artwork.medium, artwork.size]
                  .filter(Boolean)
                  .join(" · ")}
              </p>

              <div className="mt-4 flex flex-wrap items-baseline gap-3">
                <p className="text-2xl text-signal">{formatArtworkPrice(artwork)}</p>
                {artwork.available === false && (
                  <span className="border border-line px-2 py-1 text-[11px] uppercase tracking-[0.14em] text-muted">
                    Sold
                  </span>
                )}
              </div>

              <div className="mt-5">
                <ProductBuyBar
                  artwork={artwork}
                  artistName={artistName}
                  views={viewsFor(slug)}
                />
              </div>

              {/* Direct line to the gallery. Most sales here start as a
                  conversation rather than a checkout. */}
              <div className="mt-4">
                <EnquireBar artwork={artwork} artistName={artistName} />
              </div>

              {specs.length > 0 && (
                <>
                  <h2 className="mt-10 font-medium">Specifications</h2>
                  <dl className="mt-3 space-y-2.5 text-sm">
                    {specs.map(([k, v]) => (
                      <div key={k} className="flex gap-4">
                        <dt className="w-44 shrink-0 text-muted">{k}</dt>
                        <dd className="text-ink">{v}</dd>
                      </div>
                    ))}
                  </dl>
                </>
              )}
            </div>
          </Reveal>

          {/* Artist card */}
          <Reveal delay={0.1}>
            {artist && (
              <div className="rounded-lg border border-line p-6">
                <div className="flex items-center gap-4">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-wash">
                    <Image
                      src={artist.image}
                      alt={artist.name}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium">{artist.name}</p>
                    {artist.location && (
                      <p className="text-xs text-muted">{artist.location}</p>
                    )}
                    <Link
                      href={`/artists/${artist.slug}`}
                      className="text-xs text-signal hover:underline"
                    >
                      View Profile
                    </Link>
                  </div>
                </div>

                {artist.bio && (
                  <>
                    <h3 className="mt-5 text-sm font-medium">About the artist</h3>
                    <p className="mt-2 line-clamp-[10] text-[13px] leading-relaxed text-muted">
                      {artist.bio}
                    </p>
                  </>
                )}

                <div className="mt-5 flex items-center gap-3 rounded-md bg-signal/5 p-3">
                  <BadgeCheck size={26} className="shrink-0 text-signal" />
                  <p className="text-[13px] text-muted">
                    Accompanied by an{" "}
                    <span className="font-medium text-ink">
                      Authentication Certificate
                    </span>
                  </p>
                </div>
              </div>
            )}
          </Reveal>
        </div>

        {artwork.description && (
          <div className="mt-14 border-t border-line pt-8">
            <h2 className="font-display text-2xl">Description</h2>
            <p className="mt-3 max-w-3xl text-sm leading-loose text-muted">
              {artwork.description}
            </p>
          </div>
        )}
      </section>

      {related.length > 0 && (
        <section className="mx-auto max-w-6xl px-5 pt-16" aria-labelledby="more">
          <Reveal>
            <h2 id="more" className="mb-8 font-display text-2xl sm:text-3xl">
              {fromArtist.length >= 3 ? "More from " + artistName : "You may also love"}
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <MasonryCards items={related} names={names} />
          </Reveal>
        </section>
      )}
    </>
  );
}

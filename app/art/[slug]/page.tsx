import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BadgeCheck } from "lucide-react";
import Reveal from "@/components/Reveal";
import MasonryCards from "@/components/MasonryCards";
import ProductBuyBar from "@/components/ProductBuyBar";
import { getArtwork, getArtworks, getArtist, getArtists } from "@/lib/cms";
import { formatINR, namesMap } from "@/lib/data";

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

function orientationOf(size: string) {
  const m = size.match(/(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)/i);
  if (!m) return "Square";
  const ratio = parseFloat(m[2]) / parseFloat(m[1]);
  if (ratio > 1.15) return "Portrait";
  if (ratio < 0.85) return "Landscape";
  return "Square";
}

// stable pseudo-view count from the slug
const viewsFor = (slug: string) =>
  20 + ([...slug].reduce((a, c) => a + c.charCodeAt(0), 0) % 180);

// inches -> cm for the size line, e.g. "46 x 36 in" -> "116.8 x 91.4 Cm"
function sizeWithCm(size: string) {
  const m = size.match(/(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)/i);
  if (!m) return size;
  const cm = (n: number) => (n * 2.54).toFixed(1);
  return `${size} | ${cm(parseFloat(m[1]))} x ${cm(parseFloat(m[2]))} Cm`;
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
  const artistName = artist?.name ?? artwork.artist;
  const names = namesMap(artists);

  const fromArtist = all.filter((w) => w.artist === artwork.artist && w.slug !== artwork.slug);
  const related = (fromArtist.length >= 3
    ? fromArtist
    : all.filter((w) => w.slug !== artwork.slug && w.category === artwork.category)
  ).slice(0, 6);

  const lotNo = "MA" + (100000 + (viewsFor(slug) * 137) % 900000);

  const specs: [string, string][] = [
    ["International Shipping", "Yes"],
    ["Size", sizeWithCm(artwork.size)],
    ["Medium", artwork.medium],
    ["Style", orientationOf(artwork.size) === "Landscape" ? "Contemporary" : "Contemporary"],
    ["Created In", "2024"],
    ["Surface", "Shipped Rolled Unless Rolling Not Possible"],
    ["Lot No", lotNo],
    ["Domestic Ships Within", "7 – 10 business days"],
    ["International Ships Within", "15 – 18 business days"],
  ];

  return (
    <>
      <section className="relative mx-auto max-w-5xl px-5 pt-8">
        <div className="aura -left-32 top-10 h-72 w-72" />

        <nav aria-label="Breadcrumb" className="mb-6 text-xs text-muted">
          <Link href="/" className="hover:text-signal">Home</Link>
          {" / "}
          <Link href="/art-gallery" className="hover:text-signal">Art Gallery</Link>
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

        {/* Title / price / actions + artist card */}
        <div className="mt-12 grid gap-10 lg:grid-cols-[1.45fr_1fr]">
          <Reveal>
            <div>
              <h1 className="font-display text-3xl leading-tight sm:text-4xl">{artwork.title}</h1>
              <p className="mt-2 text-2xl text-signal">{formatINR(artwork.price)}</p>

              <div className="mt-5">
                <ProductBuyBar artwork={artwork} artistName={artistName} views={viewsFor(slug)} />
              </div>

              {/* Tabs */}
              <div className="mt-8 flex gap-6 border-b border-line text-sm">
                <span className="border-b-2 border-signal pb-2 font-medium">Original Artwork</span>
                <span className="pb-2 text-faint">Print Not Available</span>
              </div>

              {/* Specifications */}
              <h2 className="mt-6 font-medium">Specifications</h2>
              <dl className="mt-3 space-y-2.5 text-sm">
                {specs.map(([k, v]) => (
                  <div key={k} className="flex gap-4">
                    <dt className="w-44 shrink-0 text-muted">{k} :</dt>
                    <dd className="text-ink">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </Reveal>

          {/* Artist card */}
          <Reveal delay={0.1}>
            {artist && (
              <div className="rounded-lg border border-line p-6">
                <div className="flex items-center gap-4">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-wash">
                    <Image src={artist.image} alt={artist.name} fill sizes="56px" className="object-cover" />
                  </div>
                  <div>
                    <p className="font-medium">{artist.name}</p>
                    <p className="text-xs text-muted">{artist.location}, India</p>
                    <Link href={`/artists/${artist.slug}`} className="text-xs text-signal hover:underline">
                      View Profile
                    </Link>
                  </div>
                </div>

                <h3 className="mt-5 text-sm font-medium">About Artist</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-muted">{artist.bio}</p>

                <div className="mt-5 flex items-center gap-3 rounded-md bg-signal/5 p-3">
                  <BadgeCheck size={26} className="shrink-0 text-signal" />
                  <p className="text-[13px] text-muted">
                    Accompanied by an <span className="font-medium text-ink">Authentication Certificate</span>
                  </p>
                </div>

                <Link href="/blog" className="mt-4 inline-block text-[13px] text-ink underline underline-offset-4 hover:text-signal">
                  Read an insightful article →
                </Link>
              </div>
            )}
          </Reveal>
        </div>

        {/* Description */}
        <div className="mt-14 border-t border-line pt-8">
          <h2 className="font-display text-2xl">Description</h2>
          <p className="mt-3 max-w-3xl text-sm leading-loose text-muted">{artwork.description}</p>
        </div>
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

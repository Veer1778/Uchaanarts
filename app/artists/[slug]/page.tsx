import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import MasonryCards from "@/components/MasonryCards";
import { getArtist, getArtworks } from "@/lib/cms";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const artist = await getArtist(slug);
  if (!artist) return {};
  return { title: artist.name, description: artist.bio };
}

export default async function ArtistPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const artist = await getArtist(slug);
  if (!artist) notFound();

  const works = (await getArtworks()).filter((w) => w.artist === slug);

  return (
    <>
      <section className="relative mx-auto max-w-6xl px-5 pt-14">
        <div className="aura -left-32 top-0 h-80 w-80" />
        <div className="grid items-center gap-10 md:grid-cols-[1fr_1.4fr]">
          <Reveal>
            <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-wash">
              <Image
                src={artist.image}
                alt={`Artwork by ${artist.name}`}
                fill
                sizes="(max-width: 768px) 100vw, 40vw"
                className="object-cover"
                priority
              />
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mb-2 text-[11px] uppercase tracking-[0.3em] text-signal">
              {artist.location}
            </p>
            <h1 className="font-display text-5xl sm:text-6xl">{artist.name}</h1>
            <p className="mt-6 max-w-xl text-sm leading-relaxed text-muted">
              {artist.bio}
            </p>
            <a
              href={`https://api.whatsapp.com/send?phone=918860277388&text=${encodeURIComponent(
                `Hi, I would like to know more about works by ${artist.name}.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-block border border-ink px-8 py-3 text-[11px] uppercase tracking-[0.2em] transition-colors hover:border-signal hover:text-signal"
            >
              Enquire about commissions
            </a>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pt-24" aria-labelledby="works">
        <Reveal>
          <h2 id="works" className="mb-10 font-display text-3xl sm:text-4xl">
            Available <span className="text-signal">works</span>
          </h2>
        </Reveal>
        {works.length === 0 ? (
          <p className="text-sm text-muted">
            No works currently listed — contact the gallery for this artist&apos;s
            latest availability.
          </p>
        ) : (
          <Reveal delay={0.1}>
            <MasonryCards items={works} names={{ [artist.slug]: artist.name }} />
          </Reveal>
        )}
      </section>
    </>
  );
}

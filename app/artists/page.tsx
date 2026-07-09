import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import { getArtists } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Artists",
  description:
    "Masters and emerging contemporary artists from across India, represented by Uchaan Arts.",
};

export default async function ArtistsPage() {
  const artists = await getArtists();

  return (
    <section className="relative mx-auto max-w-6xl px-5 pt-14">
      <div className="aura -right-40 top-0 h-80 w-80" />
      <Reveal>
        <h1 className="mb-3 font-display text-5xl sm:text-6xl">
          Our <span className="text-signal">artists</span>
        </h1>
        <p className="mb-12 max-w-xl text-sm text-muted">
          A repertoire of not just the masters of art but an impeccable range
          of contemporary artists from all parts of the country.
        </p>
      </Reveal>

      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
        {artists.map((a, i) => (
          <Reveal key={a.slug} delay={(i % 4) * 0.05}>
            <Link href={`/artists/${a.slug}`} className="group block">
              <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-wash">
                <Image
                  src={a.image}
                  alt={`Artwork by ${a.name}`}
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {a.featured && (
                  <span className="absolute left-3 top-3 bg-signal px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-white">
                    Featured
                  </span>
                )}
              </div>
              <h2 className="mt-3 font-display text-xl group-hover:underline">{a.name}</h2>
              <p className="text-xs text-muted">{a.location}</p>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

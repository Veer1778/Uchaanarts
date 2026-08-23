import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import { getArtists } from "@/lib/cms";
import AlphabetNav from "@/components/AlphabetNav";

export const metadata: Metadata = {
  title: "Artists",
  description:
    "Masters and emerging contemporary artists from across India, represented by Uchaan Arts.",
};

export default async function ArtistsPage() {
  const artists = await getArtists();

  // getArtists() returns featured first, then A-Z. Split them so the page can
  // lead with the gallery's headline names instead of burying them in a
  // 257-name grid.
  const featured = artists.filter((a) => a.featured);
  const rest = artists.filter((a) => !a.featured);

  // A-Z jump strip, built only from letters that actually have artists.
  const letters = Array.from(
    new Set(rest.map((a) => a.name.charAt(0).toUpperCase()).filter((c) => /[A-Z]/.test(c)))
  ).sort();

  const grid = (list: typeof artists) => (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
      {list.map((a, i) => (
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
            {a.location && <p className="text-xs text-muted">{a.location}</p>}
          </Link>
        </Reveal>
      ))}
    </div>
  );

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

      {featured.length > 0 && (
        <>
          <h2 className="mb-6 text-[11px] uppercase tracking-[0.2em] text-signal">
            Featured artists
          </h2>
          {grid(featured)}
          <hr className="my-14 border-line" />
        </>
      )}

      <h2 className="mb-4 text-[11px] uppercase tracking-[0.2em] text-muted">
        All artists A–Z
        <span className="ml-2 normal-case tracking-normal text-faint">
          ({rest.length})
        </span>
      </h2>

      {/* Sticky, so you can jump between letters from anywhere in a list of
          257 rather than scrolling back to the top each time. */}
      <AlphabetNav letters={letters} />

      {letters.map((letter) => {
        const group = rest.filter(
          (a) => a.name.charAt(0).toUpperCase() === letter
        );
        return (
          <div key={letter} id={`letter-${letter}`} className="mb-12 scroll-mt-32 pt-6">
            <h3 className="mb-4 font-display text-2xl text-muted">
              {letter}
              <span className="ml-2 text-sm text-faint">{group.length}</span>
            </h3>
            {grid(group)}
          </div>
        );
      })}
    </section>
  );
}

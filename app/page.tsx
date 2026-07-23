import Image from "next/image";
import Link from "next/link";
import Hero from "@/components/Hero";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import FeaturedCollection from "@/components/FeaturedCollection";
import CategoriesGallery from "@/components/CategoriesGallery";
import { getFeaturedArtworks, getExhibitions, getPosts } from "@/lib/cms";
import { priceBands } from "@/lib/data";

export default async function HomePage() {
  const [featured, exhibitions, posts] = await Promise.all([
    getFeaturedArtworks(),
    getExhibitions(),
    getPosts(),
  ]);

  const upcoming = exhibitions.filter((e) => new Date(e.end) >= new Date()).slice(0, 2);
  const latestPosts = posts.slice(0, 3);

  return (
    <>
      <Hero />

      {/* Categories — curved gallery, directly below the hero */}
      <CategoriesGallery />

      {/* Featured collection */}
      <section className="relative mx-auto max-w-6xl px-5 pt-24" aria-labelledby="featured">
        <div className="aura -right-40 top-0 h-96 w-96" />
        <Reveal>
          <h2 id="featured" className="mb-10 font-display text-4xl sm:text-6xl">
            Featured collection
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <FeaturedCollection artworks={featured} />
        </Reveal>
        <Reveal delay={0.1} className="mt-10 text-center">
          <Link
            href="/art-gallery"
            className="inline-block border border-ink px-10 py-3 text-[11px] uppercase tracking-[0.2em] transition-colors hover:border-signal hover:bg-signal hover:text-white"
          >
            View all artworks
          </Link>
        </Reveal>
      </section>

      {/* By price */}
      <section className="mx-auto max-w-6xl px-5 pt-24" aria-labelledby="price">
        <Reveal>
          <SectionHeading kicker="Find art within your budget" title="By price" />
        </Reveal>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {priceBands.map((band, i) => (
            <Reveal key={band.label} delay={i * 0.04}>
              <Link
                href={`/art-gallery?price=${i}`}
                className="group flex h-full flex-col justify-between border border-line p-5 transition-colors hover:border-signal"
              >
                <span className="font-display text-lg leading-snug">{band.label}</span>
                <span
                  aria-hidden
                  className="mt-6 text-signal opacity-0 transition-opacity group-hover:opacity-100"
                >
                  →
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Exhibitions */}
      {upcoming.length > 0 && (
        <section className="relative mx-auto max-w-6xl px-5 pt-24" aria-labelledby="exhibitions">
          <div className="aura -left-40 top-24 h-96 w-96" />
          <Reveal>
            <SectionHeading kicker="At the gallery" title="Upcoming exhibitions" />
          </Reveal>
          <div className="grid gap-6 md:grid-cols-2">
            {upcoming.map((e, i) => (
              <Reveal key={e.slug} delay={i * 0.08}>
                <Link
                  href="/exhibitions"
                  className="group relative block aspect-[16/9] overflow-hidden rounded-lg"
                >
                  <Image
                    src={e.image}
                    alt={e.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-transparent" />
                  <span className="absolute bottom-0 left-0 p-6 text-white">
                    <span className="block text-[11px] uppercase tracking-[0.2em] text-white/70">
                      {new Date(e.start).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}{" "}
                      –{" "}
                      {new Date(e.end).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}{" "}
                      · {e.venue}
                    </span>
                    <span className="mt-2 block font-display text-2xl">{e.title}</span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Blog */}
      <section className="mx-auto max-w-6xl px-5 pt-24" aria-labelledby="journal">
        <Reveal>
          <SectionHeading kicker="To the world of art, through our eyes" title="From the journal" />
        </Reveal>
        <div className="grid gap-6 md:grid-cols-3">
          {latestPosts.map((p, i) => (
            <Reveal key={p.slug} delay={i * 0.06}>
              <Link href={`/blog/${p.slug}`} className="group block">
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-wash">
                  <Image
                    src={p.image}
                    alt={p.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <p className="mt-4 text-[11px] uppercase tracking-[0.2em] text-signal">
                  {p.category}
                </p>
                <h3 className="mt-2 font-display text-xl leading-snug group-hover:underline">
                  {p.title}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm text-muted">{p.excerpt}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Trust badges */}
      <section className="mx-auto max-w-6xl px-5 pt-24" aria-label="Why buy from Uchaan Arts">
        <Reveal>
          <div className="grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "Worldwide shipping", copy: "Safe, insured delivery to your doorstep, anywhere." },
              { title: "Support, daily", copy: "Open every day, 7 am – 10 pm IST. Real people." },
              { title: "Expert curation", copy: "Guidance from gallerists to find your artwork." },
              { title: "Secure payment", copy: "Cards, UPI and netbanking, fully protected." },
            ].map((b) => (
              <div key={b.title} className="bg-paper p-7">
                <span aria-hidden className="mb-4 block h-1 w-8 bg-signal" />
                <h3 className="font-display text-lg">{b.title}</h3>
                <p className="mt-2 text-sm text-muted">{b.copy}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>
    </>
  );
}

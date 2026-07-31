import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ChevronRight,
  IndianRupee,
  Frame,
  Sprout,
  LayoutGrid,
  BadgeCheck,
  MessageSquare,
  Truck,
  Clock,
  MapPin,
  Globe,
  UserRound,
  ClipboardCheck,
  PackageCheck,
} from "lucide-react";
import ArtworkCarousel from "@/components/ArtworkCarousel";
import SpacesRail from "@/components/SpacesRail";
import Testimonials from "@/components/Testimonials";
import { getArtworks, getArtists, getPosts, getExhibitions } from "@/lib/cms";
import { curatedPaths, advisorySteps, assurances } from "@/lib/site";

/**
 * Home — built to the client's mobile reference, section for section.
 *
 * Order: hero (text left, artwork bleeding right) · trust strip · New &
 * Noteworthy · Curated Paths · Artist Focus · Art Advisory · Art in Real
 * Spaces · At the Gallery · assurances · Collectors Say · From the Journal ·
 * Visit the Gallery · Stay Inspired (terracotta band) · footer.
 *
 * The mockup is mobile, so that is the source of truth; wider screens keep the
 * same structure with more room rather than a different layout.
 */

const pathIcons = { rupee: IndianRupee, frame: Frame, sprout: Sprout, grid: LayoutGrid };
const assuranceIcons = { certificate: BadgeCheck, guidance: MessageSquare, delivery: Truck };
const stepIcons = [UserRound, ClipboardCheck, PackageCheck];

/** Heading with a right-aligned link — used throughout the reference. */
function Head({ title, href, cta }: { title: string; href: string; cta: string }) {
  return (
    <div className="mb-5 flex items-baseline justify-between gap-4">
      <h2 className="font-display text-[1.35rem] leading-none sm:text-2xl">{title}</h2>
      <Link
        href={href}
        className="inline-flex shrink-0 items-center gap-1 text-[11px] text-muted transition-colors hover:text-ink"
      >
        {cta} <ArrowRight size={11} />
      </Link>
    </div>
  );
}

export default async function HomePage() {
  const [artworks, artists, posts, exhibitions] = await Promise.all([
    getArtworks(),
    getArtists(),
    getPosts(),
    getExhibitions(),
  ]);

  const names: Record<string, string> = {};
  artists.forEach((a) => (names[a.slug] = a.name));

  const hero = artworks[0];
  const noteworthy = artworks.slice(0, 4);
  const focusArtist = artists.find((a) => a.featured) ?? artists[0];
  const focusWorks = artworks.filter((w) => w.artist === focusArtist?.slug).slice(0, 2);
  const current = exhibitions[0];
  const others = exhibitions.slice(1, 3);
  const journal = posts.slice(0, 3);

  return (
    <>
      {/* ───────── Hero — text on cream, artwork bleeding off the right ───────── */}
      <section className="relative overflow-hidden border-b border-line">
        <div className="mx-auto grid max-w-[1400px] grid-cols-[1fr_0.95fr] items-center lg:grid-cols-[1fr_1.15fr]">
          <div className="py-10 pl-5 pr-3 sm:pl-8 sm:pr-6 lg:py-20 lg:pl-10">
            <h1 className="font-display text-[1.75rem] leading-[1.15] sm:text-4xl lg:text-[3.2rem]">
              Contemporary
              <br />
              Indian art,
              <br />
              <em className="italic">thoughtfully</em>
              <br />
              <em className="italic">curated.</em>
            </h1>
            <p className="mt-4 max-w-xs text-[11px] leading-relaxed text-muted sm:text-sm">
              Original works by emerging and established artists, selected for
              homes, collections and meaningful spaces.
            </p>

            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
              <Link
                href="/art-gallery"
                className="btn-accent px-6 py-3 text-center text-xs sm:text-sm"
              >
                Explore Art
              </Link>
              <Link
                href="/advisory"
                className="btn-outline px-6 py-3 text-center text-xs sm:text-sm"
              >
                Speak to a Curator
              </Link>
            </div>
          </div>

          {/* Full-bleed plate: no frame, runs to the top, right and bottom edges */}
          <div className="relative h-full min-h-[320px] self-stretch lg:min-h-[560px]">
            {hero && (
              <Image
                src={hero.image}
                alt={hero.title}
                fill
                priority
                sizes="(max-width: 1024px) 55vw, 50vw"
                className="object-cover"
              />
            )}
          </div>
        </div>
      </section>

      {/* ───────── Trust strip ───────── */}
      <section className="border-b border-line">
        <div className="mx-auto grid max-w-[1400px] grid-cols-3 divide-x divide-line">
          {[
            { Icon: Clock, label: "Curating art\nsince 2009" },
            { Icon: MapPin, label: "Delhi &\nGurugram" },
            { Icon: Globe, label: "Worldwide\ndelivery" },
          ].map(({ Icon, label }) => (
            <div
              key={label}
              className="flex items-center justify-center gap-2.5 px-2 py-4 sm:py-5"
            >
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-line">
                <Icon size={13} strokeWidth={1.4} />
              </span>
              <span className="whitespace-pre-line text-[10px] leading-tight text-muted sm:text-xs">
                {label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ───────── New & Noteworthy ───────── */}
      <section className="border-b border-line">
        <div className="mx-auto max-w-[1400px] px-5 py-9 sm:px-8 lg:px-10 lg:py-14">
          <Head title="New & Noteworthy" href="/art-gallery" cta="View all artworks" />
          <ArtworkCarousel works={noteworthy} names={names} />
        </div>
      </section>

      {/* ───────── Curated Paths ───────── */}
      <section className="border-b border-line bg-wash">
        <div className="mx-auto max-w-[1400px] px-5 py-10 sm:px-8 lg:px-10 lg:py-14">
          <h2 className="text-center font-display text-[1.4rem] leading-snug sm:text-3xl">
            Curated Paths to Begin
            <br className="sm:hidden" /> Your Collection
          </h2>

          <div className="mt-8 grid grid-cols-4 gap-2 sm:gap-6 lg:gap-0">
            {curatedPaths.map((p, i) => {
              const Icon = pathIcons[p.icon];
              return (
                <div
                  key={p.slug}
                  className={`text-center sm:text-left lg:px-7 ${
                    i > 0 ? "lg:border-l lg:border-line" : ""
                  }`}
                >
                  <span className="mx-auto grid h-9 w-9 place-items-center rounded-full border border-line bg-paper sm:mx-0">
                    <Icon size={15} strokeWidth={1.3} />
                  </span>
                  <p className="mt-2.5 font-display text-[0.82rem] leading-tight sm:text-base">
                    {p.title}
                  </p>
                  <p className="mt-1.5 text-[9.5px] leading-snug text-muted sm:text-[11px]">
                    {p.blurb}
                  </p>
                  <Link
                    href={p.href}
                    className="mt-2 inline-flex items-center gap-1 text-[9.5px] transition-colors hover:text-signal sm:text-[11px]"
                  >
                    Explore <ArrowRight size={10} />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───────── Artist Focus ───────── */}
      <section className="border-b border-line">
        <div className="mx-auto max-w-[1400px] px-5 py-9 sm:px-8 lg:px-10 lg:py-14">
          <h2 className="font-display text-[1.35rem] leading-none sm:text-2xl">
            Artist Focus
          </h2>
          <p className="mt-1 font-display text-[1.35rem] italic leading-none text-muted sm:text-2xl">
            {focusArtist?.name}
          </p>

          <div className="mt-5 grid grid-cols-[1.55fr_1fr] gap-2.5 lg:max-w-3xl">
            <div className="relative aspect-[4/5] overflow-hidden bg-wash">
              {focusArtist?.image && (
                <Image
                  src={focusArtist.image}
                  alt={focusArtist.name}
                  fill
                  sizes="(max-width: 1024px) 55vw, 30vw"
                  className="object-cover"
                />
              )}
            </div>
            <div className="grid grid-rows-2 gap-2.5">
              {focusWorks.map((w) => (
                <Link
                  key={w.slug}
                  href={`/art/${w.slug}`}
                  className="relative block overflow-hidden bg-wash"
                >
                  <Image
                    src={w.image}
                    alt={w.title}
                    fill
                    sizes="(max-width: 1024px) 35vw, 18vw"
                    className="object-cover"
                  />
                </Link>
              ))}
            </div>
          </div>

          <p className="mt-4 max-w-md text-[11px] leading-relaxed text-muted sm:text-sm">
            {focusArtist?.bio
              ? `${focusArtist.bio.slice(0, 120).trim()}…`
              : "Exploring memory, landscape and the quiet poetry of everyday moments."}
          </p>
          <Link
            href={`/artists/${focusArtist?.slug ?? ""}`}
            className="mt-3 inline-block border-b border-ink pb-0.5 text-xs transition-opacity hover:opacity-60 sm:text-sm"
          >
            Discover the artist →
          </Link>
        </div>
      </section>

      {/* ───────── Art Advisory ───────── */}
      <section className="border-b border-line">
        <div className="mx-auto max-w-[1400px] px-5 py-9 sm:px-8 lg:px-10 lg:py-14">
          <h2 className="font-display text-[1.35rem] leading-none sm:text-2xl">
            Art Advisory
          </h2>

          <div className="mt-5 grid gap-8 sm:grid-cols-[1fr_auto] sm:gap-12">
            <div>
              <p className="font-display text-[1.3rem] leading-snug sm:text-2xl">
                Art can be personal.
                <br />
                <em className="italic text-muted">Choosing it should be too.</em>
              </p>
              <Link
                href="/advisory"
                className="mt-5 inline-block border-b border-ink pb-0.5 text-xs transition-opacity hover:opacity-60 sm:text-sm"
              >
                Book a Consultation →
              </Link>
            </div>

            <ol className="space-y-4">
              {advisorySteps.map((s, i) => {
                const Icon = stepIcons[i];
                return (
                  <li key={s.n} className="flex items-center gap-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line">
                      <Icon size={13} strokeWidth={1.3} />
                    </span>
                    <p className="text-[11px] leading-snug sm:text-xs">
                      <span className="text-faint">{s.n}</span>{" "}
                      <span className="text-muted">{s.label}</span>
                    </p>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </section>

      {/* ───────── Art in Real Spaces ───────── */}
      <section className="border-b border-line">
        <div className="mx-auto max-w-[1400px] px-5 py-9 sm:px-8 lg:px-10 lg:py-14">
          <Head title="Art in Real Spaces" href="/art-gallery" cta="View more projects" />
          <SpacesRail />
        </div>
      </section>

      {/* ───────── At the Gallery ───────── */}
      <section className="border-b border-line">
        <div className="mx-auto max-w-[1400px] px-5 py-9 sm:px-8 lg:px-10 lg:py-14">
          <Head title="At the Gallery" href="/exhibitions" cta="View all exhibitions" />

          {current && (
            <div className="grid grid-cols-[0.85fr_1fr] gap-4 lg:max-w-3xl lg:gap-8">
              <div className="relative aspect-[3/4] overflow-hidden bg-wash">
                {current.image && (
                  <Image
                    src={current.image}
                    alt={current.title}
                    fill
                    sizes="(max-width: 1024px) 42vw, 22vw"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="self-center">
                <p className="text-[10px] text-muted sm:text-[11px]">Current Exhibition</p>
                <p className="mt-1 font-display text-xl italic leading-tight sm:text-2xl">
                  {current.title}
                </p>
                <p className="mt-2 text-[11px] leading-relaxed text-muted sm:text-sm">
                  {current.blurb
                    ? `${current.blurb.slice(0, 68).trim()}…`
                    : "A group show exploring memory, material and mark."}
                </p>
                <p className="mt-3 text-[10px] text-muted sm:text-[11px]">
                  {current.end ? `Until ${current.end}` : ""}
                  {current.venue ? <><br />{current.venue}</> : null}
                </p>
                <Link
                  href="/exhibitions"
                  className="mt-3 inline-block border-b border-ink pb-0.5 text-[11px] transition-opacity hover:opacity-60 sm:text-sm"
                >
                  Explore Exhibition →
                </Link>
              </div>
            </div>
          )}

          <div className="mt-5 divide-y divide-line border-t border-line lg:max-w-3xl">
            {others.map((e, i) => (
              <Link key={e.slug} href="/exhibitions" className="group flex items-center gap-3.5 py-3">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden bg-wash">
                  {e.image && (
                    <Image src={e.image} alt={e.title} fill sizes="48px" className="object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-muted">{i === 0 ? "Upcoming" : "Past"}</p>
                  <p className="truncate font-display text-base">{e.title}</p>
                  <p className="text-[10px] text-muted">
                    {e.start}
                    {e.end ? ` – ${e.end}` : ""}
                  </p>
                </div>
                <ChevronRight size={15} className="shrink-0 text-faint transition-colors group-hover:text-ink" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── Assurances ───────── */}
      <section className="border-b border-line">
        <div className="mx-auto grid max-w-[1400px] grid-cols-3 gap-3 px-5 py-8 sm:px-8 lg:gap-10 lg:px-10">
          {assurances.map((a) => {
            const Icon = assuranceIcons[a.icon];
            return (
              <div key={a.title} className="text-center">
                <Icon size={20} strokeWidth={1.2} className="mx-auto" />
                <p className="mt-2.5 text-[11px] sm:text-sm">{a.title}</p>
                <p className="mt-1.5 text-[9.5px] leading-snug text-muted sm:text-[11px]">
                  {a.body}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ───────── Collectors Say ───────── */}
      <section className="border-b border-line">
        <div className="mx-auto max-w-[1400px] px-5 py-9 sm:px-8 lg:px-10 lg:py-14">
          <h2 className="mb-5 font-display text-[1.35rem] leading-none sm:text-2xl">
            Collectors Say
          </h2>
          <Testimonials />
        </div>
      </section>

      {/* ───────── From the Journal ───────── */}
      <section className="border-b border-line">
        <div className="mx-auto max-w-[1400px] px-5 py-9 sm:px-8 lg:px-10 lg:py-14">
          <Head title="From the Journal" href="/blog" cta="View all articles" />
          <div className="divide-y divide-line lg:grid lg:max-w-4xl lg:grid-cols-3 lg:gap-6 lg:divide-y-0">
            {journal.map((p) => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                className="group flex items-center gap-3.5 py-3.5 first:pt-0 lg:block lg:py-0"
              >
                <div className="relative h-14 w-20 shrink-0 overflow-hidden bg-wash lg:h-auto lg:w-full lg:aspect-[4/3]">
                  {p.image && (
                    <Image src={p.image} alt={p.title} fill sizes="(max-width:1024px) 80px, 22vw" className="object-cover" />
                  )}
                </div>
                <div className="min-w-0 lg:mt-3">
                  <p className="text-[10px] text-muted">{p.category}</p>
                  <p className="mt-0.5 font-display text-[0.95rem] leading-snug">{p.title}</p>
                </div>
                <ChevronRight size={15} className="ml-auto shrink-0 text-faint lg:hidden" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── Visit the Gallery ───────── */}
      <section className="border-b border-line">
        <div className="mx-auto grid max-w-[1400px] grid-cols-[1fr_0.95fr] items-center gap-5 px-5 py-9 sm:px-8 lg:gap-12 lg:px-10 lg:py-14">
          <div>
            <h2 className="font-display text-[1.35rem] leading-none sm:text-2xl">
              Visit the Gallery
            </h2>
            <p className="mt-2.5 text-[11px] leading-relaxed text-muted sm:text-sm">
              Experience the artwork in person. We&apos;d love to welcome you.
            </p>
            <Link
              href="/visit"
              className="mt-3 inline-block border-b border-ink pb-0.5 text-[11px] transition-opacity hover:opacity-60 sm:text-sm"
            >
              Plan your visit →
            </Link>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden bg-wash">
            <Image
              src="https://www.uchaanarts.com/uploaded_files/slider/1728130444_ganesha_series_36x54_oil_on_linen_canvas_300000_-_copy.jpg"
              alt="Inside the Uchaan gallery"
              fill
              sizes="(max-width: 1024px) 45vw, 30vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* ───────── Stay Inspired — terracotta band ───────── */}
      <section className="bg-signal text-white">
        <div className="mx-auto max-w-[1400px] px-5 py-8 sm:px-8 lg:flex lg:items-center lg:justify-between lg:gap-12 lg:px-10 lg:py-10">
          <div>
            <h2 className="font-display text-[1.35rem] leading-none sm:text-2xl">
              Stay Inspired
            </h2>
            <p className="mt-2 text-[11px] text-white/75 sm:text-sm">
              Curated stories, new works and exhibition updates.
            </p>
          </div>

          <form className="mt-4 flex w-full max-w-md lg:mt-0">
            <label htmlFor="subscribe" className="sr-only">
              Email address
            </label>
            <input
              id="subscribe"
              type="email"
              required
              placeholder="Enter your email"
              className="min-w-0 flex-1 bg-white px-3.5 py-2.5 text-xs text-ink outline-none placeholder:text-faint sm:text-sm"
            />
            <button
              type="submit"
              className="shrink-0 bg-charcoal px-5 py-2.5 text-xs text-white transition-opacity hover:opacity-90 sm:text-sm"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </>
  );
}

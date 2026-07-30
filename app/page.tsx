import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  IndianRupee,
  Frame,
  Sprout,
  LayoutGrid,
  BadgeCheck,
  MessageSquare,
  Users,
  Truck,
  Clock,
  MapPin,
  Globe,
  UserRound,
  ClipboardCheck,
  PackageCheck,
} from "lucide-react";
import HeroArtwork from "@/components/HeroArtwork";
import Testimonials from "@/components/Testimonials";
import { getArtworks, getArtists, getPosts, getExhibitions } from "@/lib/cms";
import { curatedPaths, advisorySteps, realSpaces, assurances } from "@/lib/site";
import { formatINR } from "@/lib/data";

/**
 * Home — built to the client's reference layout.
 *
 * Sections, in order: masthead with artwork carousel and trust strip · New &
 * Noteworthy · Curated Paths · Artist Focus alongside Art Advisory · Art in
 * Real Spaces alongside At the Gallery · assurance bar · Collectors Say
 * alongside From the Journal · Visit and Stay Inspired.
 *
 * Rows that carousel on mobile use `.rail` (a snap-scrolling flex row) and
 * become grids from `lg` upward.
 */

const pathIcons = {
  rupee: IndianRupee,
  frame: Frame,
  sprout: Sprout,
  grid: LayoutGrid,
};

const assuranceIcons = {
  certificate: BadgeCheck,
  guidance: MessageSquare,
  relationships: Users,
  delivery: Truck,
};

const stepIcons = [UserRound, ClipboardCheck, PackageCheck];

export default async function HomePage() {
  const [artworks, artists, posts, exhibitions] = await Promise.all([
    getArtworks(),
    getArtists(),
    getPosts(),
    getExhibitions(),
  ]);

  const names: Record<string, string> = {};
  artists.forEach((a) => (names[a.slug] = a.name));

  const heroWorks = artworks.slice(0, 4);
  const noteworthy = artworks.slice(0, 5);
  const focusArtist = artists.find((a) => a.featured) ?? artists[0];
  const focusWorks = artworks
    .filter((w) => w.artist === focusArtist?.slug)
    .slice(0, 2);
  const current = exhibitions[0];
  const others = exhibitions.slice(1, 3);
  const journal = posts.slice(0, 3);

  return (
    <>
      {/* ───────────── Masthead ───────────── */}
      <section className="border-b border-line">
        <div className="mx-auto max-w-[1400px] px-5 py-12 sm:px-8 lg:px-10 lg:py-16">
          <div className="grid items-center gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16">
            <div>
              <h1 className="font-display text-[2.6rem] leading-[1.1] sm:text-5xl xl:text-[3.4rem]">
                Contemporary Indian art,
                <br />
                <em className="italic">thoughtfully curated.</em>
              </h1>
              <p className="mt-6 max-w-md text-sm leading-relaxed text-muted">
                Original works by emerging and established artists, selected for
                homes, collections and meaningful spaces.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/art-gallery" className="btn-accent px-7 py-3.5 text-sm">
                  Explore Art
                </Link>
                <Link href="/advisory" className="btn-outline px-7 py-3.5 text-sm">
                  Speak to a Curator
                </Link>
              </div>
            </div>

            <HeroArtwork works={heroWorks} names={names} />
          </div>

          {/* Trust strip */}
          <ul className="mt-12 flex flex-wrap gap-x-10 gap-y-4 border-t border-line pt-6 text-xs text-muted">
            {[
              { Icon: Clock, label: "Curating art since 2009" },
              { Icon: MapPin, label: "Delhi & Gurugram" },
              { Icon: Globe, label: "Worldwide delivery" },
            ].map(({ Icon, label }) => (
              <li key={label} className="flex items-center gap-2.5">
                <Icon size={15} strokeWidth={1.4} />
                {label}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ───────────── New & Noteworthy ───────────── */}
      <section className="border-b border-line">
        <div className="mx-auto max-w-[1400px] px-5 py-12 sm:px-8 lg:px-10">
          <SectionHead title="New & Noteworthy" href="/art-gallery" cta="View all artworks" />

          {/* First work larger, then four smaller — a rail on mobile. */}
          <div className="rail lg:grid lg:grid-cols-6 lg:gap-6">
            {noteworthy.map((w, i) => (
              <Link
                key={w.slug}
                href={`/art/${w.slug}`}
                className={`group block w-[78vw] sm:w-[46vw] lg:w-auto ${
                  i === 0 ? "lg:col-span-2" : ""
                }`}
              >
                <div
                  className={`relative overflow-hidden bg-wash ${
                    i === 0 ? "aspect-[4/3]" : "aspect-[3/4]"
                  }`}
                >
                  <Image
                    src={w.image}
                    alt={w.title}
                    fill
                    sizes="(max-width: 1024px) 60vw, 22vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                </div>
                <p className="mt-3 text-xs">{names[w.artist] ?? ""}</p>
                <p className="font-display text-base italic leading-snug">{w.title}</p>
                <p className="mt-1 text-[11px] text-muted">{w.medium}</p>
                <p className="text-[11px] text-muted">{w.size}</p>
                <p className="mt-1.5 text-xs">
                  {w.price > 0 ? formatINR(w.price) : "Price on request"}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── Curated Paths ───────────── */}
      <section className="border-b border-line bg-wash">
        <div className="mx-auto max-w-[1400px] px-5 py-12 sm:px-8 lg:px-10">
          <h2 className="text-center font-display text-2xl sm:text-3xl">
            Curated Paths to Begin Your Collection
          </h2>

          <div className="mt-9 grid grid-cols-2 gap-x-6 gap-y-9 lg:grid-cols-4 lg:gap-0">
            {curatedPaths.map((p, i) => {
              const Icon = pathIcons[p.icon];
              return (
                <div
                  key={p.slug}
                  className={`lg:px-8 ${i > 0 ? "lg:border-l lg:border-line" : ""}`}
                >
                  <div className="flex items-start gap-3.5">
                    <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line bg-paper">
                      <Icon size={16} strokeWidth={1.4} />
                    </span>
                    <div>
                      <p className="font-display text-base leading-snug">{p.title}</p>
                      <p className="mt-1 text-[11px] leading-relaxed text-muted">
                        {p.blurb}
                      </p>
                      <Link
                        href={p.href}
                        className="mt-2.5 inline-flex items-center gap-1.5 text-[11px] transition-colors hover:text-signal"
                      >
                        Explore <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───────────── Artist Focus · Art Advisory ───────────── */}
      <section className="border-b border-line">
        <div className="mx-auto grid max-w-[1400px] lg:grid-cols-2">
          {/* Artist Focus */}
          <div className="border-b border-line px-5 py-12 sm:px-8 lg:border-b-0 lg:border-r lg:px-10">
            <p className="font-display text-xl">Artist Focus</p>
            <p className="font-display text-2xl italic">{focusArtist?.name}</p>

            <div className="mt-7 grid grid-cols-[1.25fr_1fr] gap-3">
              <div className="relative aspect-[3/4] overflow-hidden bg-wash">
                {focusArtist?.image && (
                  <Image
                    src={focusArtist.image}
                    alt={focusArtist.name}
                    fill
                    sizes="(max-width: 1024px) 45vw, 22vw"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="grid gap-3">
                {focusWorks.map((w) => (
                  <Link
                    key={w.slug}
                    href={`/art/${w.slug}`}
                    className="relative block aspect-[4/3] overflow-hidden bg-wash"
                  >
                    <Image
                      src={w.image}
                      alt={w.title}
                      fill
                      sizes="20vw"
                      className="object-cover"
                    />
                  </Link>
                ))}
              </div>
            </div>

            <p className="mt-6 max-w-sm text-sm leading-relaxed text-muted">
              {focusArtist?.bio
                ? focusArtist.bio.slice(0, 150)
                : "Exploring memory, landscape and the quiet poetry of everyday moments."}
            </p>
            <Link
              href={`/artists/${focusArtist?.slug ?? ""}`}
              className="mt-5 inline-block border-b border-ink pb-0.5 text-sm transition-opacity hover:opacity-60"
            >
              Discover the artist →
            </Link>
          </div>

          {/* Art Advisory */}
          <div className="px-5 py-12 sm:px-8 lg:px-10">
            <p className="font-display text-xl">Art Advisory</p>
            <p className="mt-5 font-display text-2xl leading-snug">
              Art can be personal.
              <br />
              <em className="italic">Choosing it should be too.</em>
            </p>

            <div className="mt-7 grid gap-8 sm:grid-cols-[1fr_auto] sm:gap-10">
              <div>
                <p className="max-w-sm text-sm leading-relaxed text-muted">
                  Share your space, preferences and budget with our curatorial
                  team. We&apos;ll recommend original works suited to you.
                </p>
                <Link
                  href="/advisory"
                  className="mt-5 inline-block border-b border-ink pb-0.5 text-sm transition-opacity hover:opacity-60"
                >
                  Book a Consultation →
                </Link>
              </div>

              <ol className="space-y-5 border-t border-line pt-5 sm:border-l sm:border-t-0 sm:pl-8 sm:pt-0">
                {advisorySteps.map((s, i) => {
                  const Icon = stepIcons[i];
                  return (
                    <li key={s.n} className="flex items-start gap-3">
                      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center border border-line">
                        <Icon size={14} strokeWidth={1.4} />
                      </span>
                      <div>
                        <p className="text-[11px] text-faint">{s.n}</p>
                        <p className="max-w-[10rem] text-xs leading-snug">{s.label}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── Art in Real Spaces · At the Gallery ───────────── */}
      <section className="border-b border-line">
        <div className="mx-auto grid max-w-[1400px] lg:grid-cols-2">
          {/* Real spaces */}
          <div className="border-b border-line px-5 py-12 sm:px-8 lg:border-b-0 lg:border-r lg:px-10">
            <SectionHead title="Art in Real Spaces" href="/art-gallery" cta="View more projects" />
            <div className="rail sm:grid sm:grid-cols-4 sm:gap-3">
              {realSpaces.map((s) => (
                <div key={s.label} className="w-[58vw] sm:w-auto">
                  <div className="relative aspect-[4/3] overflow-hidden bg-wash">
                    <Image
                      src={s.image}
                      alt={s.label}
                      fill
                      sizes="(max-width: 640px) 58vw, 14vw"
                      className="object-cover"
                    />
                  </div>
                  <p className="mt-2.5 text-xs">{s.label}</p>
                  <p className="text-[11px] text-muted">{s.sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* At the Gallery */}
          <div className="px-5 py-12 sm:px-8 lg:px-10">
            <SectionHead title="At the Gallery" href="/exhibitions" cta="View all exhibitions" />

            {current && (
              <div className="grid gap-5 sm:grid-cols-[0.85fr_1fr]">
                <div className="relative aspect-[4/5] overflow-hidden bg-wash">
                  {current.image && (
                    <Image
                      src={current.image}
                      alt={current.title}
                      fill
                      sizes="(max-width: 640px) 100vw, 22vw"
                      className="object-cover"
                    />
                  )}
                </div>
                <div>
                  <p className="text-[11px] text-muted">Current Exhibition</p>
                  <p className="mt-1 font-display text-2xl italic">{current.title}</p>
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    {current.blurb?.slice(0, 90) ??
                      "A group show exploring memory, material and mark."}
                  </p>
                  <p className="mt-4 text-[11px] text-muted">
                    {current.end ? `Until ${current.end}` : ""}
                    {current.venue ? ` · ${current.venue}` : ""}
                  </p>
                  <Link
                    href="/exhibitions"
                    className="mt-4 inline-block border-b border-ink pb-0.5 text-sm transition-opacity hover:opacity-60"
                  >
                    Explore Exhibition →
                  </Link>
                </div>
              </div>
            )}

            <div className="mt-6 divide-y divide-line border-t border-line">
              {others.map((e, i) => (
                <Link
                  key={e.slug}
                  href="/exhibitions"
                  className="group flex items-center gap-4 py-3.5"
                >
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden bg-wash">
                    {e.image && (
                      <Image src={e.image} alt={e.title} fill sizes="56px" className="object-cover" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] text-muted">{i === 0 ? "Upcoming" : "Past"}</p>
                    <p className="truncate font-display text-base">{e.title}</p>
                    <p className="text-[11px] text-muted">
                      {e.start}
                      {e.end ? ` – ${e.end}` : ""}
                    </p>
                  </div>
                  <ArrowRight
                    size={15}
                    className="shrink-0 text-faint transition-colors group-hover:text-ink"
                  />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── Assurance bar ───────────── */}
      <section className="border-b border-line">
        <div className="mx-auto max-w-[1400px] px-5 py-10 sm:px-8 lg:px-10">
          <div className="grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-4 lg:gap-0">
            {assurances.map((a, i) => {
              const Icon = assuranceIcons[a.icon];
              return (
                <div
                  key={a.title}
                  className={`flex items-start gap-3.5 lg:px-8 ${
                    i > 0 ? "lg:border-l lg:border-line" : ""
                  }`}
                >
                  <Icon size={20} strokeWidth={1.3} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm">{a.title}</p>
                    <p className="mt-1 text-[11px] leading-relaxed text-muted">{a.body}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───────────── Collectors Say · From the Journal ───────────── */}
      <section className="border-b border-line">
        <div className="mx-auto grid max-w-[1400px] lg:grid-cols-[1fr_1fr]">
          <div className="border-b border-line px-5 py-12 sm:px-8 lg:border-b-0 lg:border-r lg:px-10">
            <p className="mb-7 font-display text-xl">Collectors Say</p>
            <Testimonials />
          </div>

          <div className="px-5 py-12 sm:px-8 lg:px-10">
            <SectionHead title="From the Journal" href="/blog" cta="View all articles" />
            <div className="divide-y divide-line">
              {journal.map((p) => (
                <Link key={p.slug} href={`/blog/${p.slug}`} className="group flex gap-4 py-4 first:pt-0">
                  <div className="relative h-16 w-24 shrink-0 overflow-hidden bg-wash">
                    {p.image && (
                      <Image src={p.image} alt={p.title} fill sizes="96px" className="object-cover" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-muted">{p.category}</p>
                    <p className="mt-0.5 font-display text-base leading-snug">{p.title}</p>
                    <span className="mt-1 inline-flex items-center gap-1 text-[11px] text-muted transition-colors group-hover:text-ink">
                      Read more <ArrowRight size={11} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── Visit · Stay Inspired ───────────── */}
      <section>
        <div className="mx-auto grid max-w-[1400px] items-center gap-8 px-5 py-12 sm:px-8 lg:grid-cols-[1fr_1.1fr_1fr] lg:gap-10 lg:px-10">
          <div>
            <p className="font-display text-xl">Visit the Gallery</p>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Experience the artwork in person. We&apos;d love to welcome you.
            </p>
            <Link
              href="/visit"
              className="mt-4 inline-block border-b border-ink pb-0.5 text-sm transition-opacity hover:opacity-60"
            >
              Plan your visit →
            </Link>
          </div>

          <div className="relative aspect-[16/9] overflow-hidden bg-wash">
            <Image
              src="https://www.uchaanarts.com/uploaded_files/slider/1728130444_ganesha_series_36x54_oil_on_linen_canvas_300000_-_copy.jpg"
              alt="Inside the Uchaan gallery"
              fill
              sizes="(max-width: 1024px) 100vw, 34vw"
              className="object-cover"
            />
          </div>

          <div>
            <p className="font-display text-xl">Stay Inspired</p>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Curated stories, new works and exhibition updates.
            </p>
            <form className="mt-4 flex max-w-sm">
              <label htmlFor="subscribe" className="sr-only">
                Email address
              </label>
              <input
                id="subscribe"
                type="email"
                required
                placeholder="Enter your email"
                className="min-w-0 flex-1 border border-line bg-card px-3.5 py-2.5 text-sm outline-none focus:border-ink"
              />
              <button type="submit" className="btn-accent shrink-0 px-5 py-2.5 text-sm">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}

/** Section heading with a right-aligned link, used across the page. */
function SectionHead({
  title,
  href,
  cta,
}: {
  title: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <h2 className="font-display text-xl sm:text-2xl">{title}</h2>
      <Link
        href={href}
        className="inline-flex shrink-0 items-center gap-1.5 text-[11px] text-muted transition-colors hover:text-ink"
      >
        {cta} <ArrowRight size={12} />
      </Link>
    </div>
  );
}

import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
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
import HeroPlate from "@/components/HeroPlate";
import Testimonials from "@/components/Testimonials";
import { getArtworks, getArtists, getPosts, getExhibitions } from "@/lib/cms";
import { curatedPaths, advisorySteps, realSpaces, assurances } from "@/lib/site";
import { formatINR } from "@/lib/data";

/**
 * Home — built to the client's desktop reference.
 *
 * Full-width bands: hero, New & Noteworthy, Curated Paths, the assurance bar,
 * and the Visit / Stay Inspired strip.
 *
 * Everything from Curated Paths downward that isn't a band is PAIRED into two
 * columns with a vertical rule between them:
 *
 *   Artist Focus        │ Art Advisory
 *   Art in Real Spaces  │ At the Gallery
 *   Collectors Say      │ From the Journal
 *
 * Those pairs stack on mobile, where the rule becomes a horizontal divider.
 */

const pathIcons = { rupee: IndianRupee, frame: Frame, sprout: Sprout, grid: LayoutGrid };
const assuranceIcons = {
  certificate: BadgeCheck,
  guidance: MessageSquare,
  relationships: Users,
  delivery: Truck,
};
const stepIcons = [UserRound, ClipboardCheck, PackageCheck];

/** Section heading with a right-aligned link. */
function Head({ title, href, cta }: { title: string; href: string; cta: string }) {
  return (
    <div className="mb-5 flex items-baseline justify-between gap-4">
      <h2 className="font-display text-xl leading-none sm:text-2xl">{title}</h2>
      <Link
        href={href}
        className="inline-flex shrink-0 items-center gap-1 text-[11px] text-muted transition-colors hover:text-ink"
      >
        {cta} <ArrowRight size={11} />
      </Link>
    </div>
  );
}

/** A paired two-column block with a dividing rule. */
function Pair({ left, right }: { left: React.ReactNode; right: React.ReactNode }) {
  return (
    <section className="border-b border-line">
      <div className="mx-auto grid max-w-[1400px] lg:grid-cols-2">
        <div className="border-b border-line px-5 py-9 sm:px-8 lg:border-b-0 lg:border-r lg:px-10 lg:py-12">
          {left}
        </div>
        <div className="px-5 py-9 sm:px-8 lg:px-10 lg:py-12">{right}</div>
      </div>
    </section>
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

  const heroWorks = artworks.slice(0, 4);
  const noteworthy = artworks.slice(0, 5);
  const focusArtist = artists.find((a) => a.featured) ?? artists[0];
  const focusWorks = artworks.filter((w) => w.artist === focusArtist?.slug).slice(0, 2);
  const current = exhibitions[0];
  const others = exhibitions.slice(1, 3);
  const journal = posts.slice(0, 3);

  return (
    <>
      {/* ───────── Hero ───────── */}
      <section className="border-b border-line">
        <div className="mx-auto grid max-w-[1400px] items-stretch lg:grid-cols-[0.88fr_1.12fr]">
          {/* Copy */}
          <div className="flex flex-col justify-between px-5 pb-7 pt-10 sm:px-8 lg:px-10 lg:pb-8 lg:pt-16">
            <div>
              <h1 className="font-display text-[2rem] leading-[1.16] sm:text-4xl xl:text-[2.9rem]">
                Contemporary Indian art,
                <br />
                <em className="italic">thoughtfully curated.</em>
              </h1>
              <p className="mt-5 max-w-sm text-xs leading-relaxed text-muted sm:text-sm">
                Original works by emerging and established artists,
                <br className="hidden sm:block" />
                selected for homes, collections and meaningful spaces.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/art-gallery" className="btn-accent px-7 py-3 text-xs sm:text-sm">
                  Explore Art
                </Link>
                <Link href="/advisory" className="btn-outline px-7 py-3 text-xs sm:text-sm">
                  Speak to a Curator
                </Link>
              </div>
            </div>

            {/* Trust strip, sitting at the foot of the copy column */}
            <ul className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-[10px] text-muted sm:text-[11px]">
              {[
                { Icon: Clock, label: "Curating art since 2009" },
                { Icon: MapPin, label: "Delhi & Gurugram" },
                { Icon: Globe, label: "Worldwide delivery" },
              ].map(({ Icon, label }) => (
                <li key={label} className="flex items-center gap-2">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-line">
                    <Icon size={11} strokeWidth={1.4} />
                  </span>
                  {label}
                </li>
              ))}
            </ul>
          </div>

          {/* Plate */}
          <div className="min-h-[300px] lg:min-h-[440px]">
            <HeroPlate works={heroWorks} names={names} />
          </div>
        </div>
      </section>

      {/* ───────── New & Noteworthy (full width) ───────── */}
      <section className="border-b border-line">
        <div className="mx-auto max-w-[1400px] px-5 py-9 sm:px-8 lg:px-10 lg:py-12">
          <Head title="New & Noteworthy" href="/art-gallery" cta="View all artworks" />

          {/* First work runs wide, four narrower beside it. */}
          <div className="rail lg:grid lg:grid-cols-[2.5fr_1fr_1fr_1fr_1fr] lg:gap-5">
            {noteworthy.map((w, i) => (
              <Link
                key={w.slug}
                href={`/art/${w.slug}`}
                className={`group block ${i === 0 ? "w-[80vw] sm:w-[52vw]" : "w-[42vw] sm:w-[28vw]"} lg:w-auto`}
              >
                <div className="relative h-[150px] overflow-hidden bg-wash sm:h-[190px] lg:h-[215px]">
                  <Image
                    src={w.image}
                    alt={w.title}
                    fill
                    sizes="(max-width: 1024px) 60vw, 25vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                </div>
                <p className="mt-2.5 text-[11px]">{names[w.artist] ?? ""}</p>
                <p className="text-[11px] italic text-muted">{w.title}</p>
                <p className="mt-1 text-[10px] leading-snug text-muted">{w.medium}</p>
                <p className="text-[10px] text-muted">{w.size}</p>
                <p className="mt-1.5 text-[11px]">
                  {w.price > 0 ? formatINR(w.price) : "Price on request"}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── Curated Paths (full width band) ───────── */}
      <section className="border-b border-line bg-wash">
        <div className="mx-auto max-w-[1400px] px-5 py-10 sm:px-8 lg:px-10 lg:py-12">
          <h2 className="text-center font-display text-xl sm:text-2xl">
            Curated Paths to Begin Your Collection
          </h2>

          <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-4 sm:gap-0">
            {curatedPaths.map((p, i) => {
              const Icon = pathIcons[p.icon];
              return (
                <div
                  key={p.slug}
                  className={`flex items-start gap-3 sm:px-6 ${
                    i > 0 ? "sm:border-l sm:border-line" : ""
                  }`}
                >
                  <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line bg-paper">
                    <Icon size={15} strokeWidth={1.3} />
                  </span>
                  <div>
                    <p className="font-display text-sm leading-snug sm:text-[0.95rem]">
                      {p.title}
                    </p>
                    <p className="mt-1 text-[10px] leading-snug text-muted">{p.blurb}</p>
                    <Link
                      href={p.href}
                      className="mt-2 inline-flex items-center gap-1 text-[10px] transition-colors hover:text-signal"
                    >
                      Explore <ArrowRight size={10} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───────── Artist Focus │ Art Advisory ───────── */}
      <Pair
        left={
          <>
            <h2 className="font-display text-xl leading-none sm:text-2xl">Artist Focus</h2>
            <p className="mt-1 font-display text-xl italic leading-none text-muted sm:text-2xl">
              {focusArtist?.name}
            </p>

            <div className="mt-5 grid grid-cols-[1fr_1.15fr_0.95fr] gap-3">
              <div className="self-center">
                <p className="text-[11px] leading-relaxed text-muted">
                  {focusArtist?.bio
                    ? `${focusArtist.bio.slice(0, 96).trim()}…`
                    : "Exploring memory, landscape and the quiet poetry of everyday moments."}
                </p>
                <Link
                  href={`/artists/${focusArtist?.slug ?? ""}`}
                  className="mt-4 inline-block border-b border-ink pb-0.5 text-[11px] transition-opacity hover:opacity-60"
                >
                  Discover the artist →
                </Link>
              </div>

              <div className="relative aspect-[3/4] overflow-hidden bg-wash">
                {focusArtist?.image && (
                  <Image
                    src={focusArtist.image}
                    alt={focusArtist.name}
                    fill
                    sizes="(max-width: 1024px) 35vw, 16vw"
                    className="object-cover"
                  />
                )}
              </div>

              <div className="grid grid-rows-2 gap-3">
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
                      sizes="(max-width: 1024px) 28vw, 13vw"
                      className="object-cover"
                    />
                  </Link>
                ))}
              </div>
            </div>
          </>
        }
        right={
          <>
            <h2 className="font-display text-xl leading-none sm:text-2xl">Art Advisory</h2>

            <div className="mt-5 grid gap-7 sm:grid-cols-[1fr_auto] sm:gap-8">
              <div>
                <p className="font-display text-lg leading-snug sm:text-xl">
                  Art can be personal.
                  <br />
                  <em className="italic">Choosing it should be too.</em>
                </p>
                <p className="mt-3.5 max-w-xs text-[11px] leading-relaxed text-muted">
                  Share your space, preferences and budget with our curatorial
                  team. We&apos;ll recommend original works suited to you.
                </p>
                <Link
                  href="/advisory"
                  className="mt-4 inline-block border-b border-ink pb-0.5 text-[11px] transition-opacity hover:opacity-60"
                >
                  Book a Consultation →
                </Link>
              </div>

              <ol className="space-y-4 sm:border-l sm:border-line sm:pl-7">
                {advisorySteps.map((s, i) => {
                  const Icon = stepIcons[i];
                  return (
                    <li key={s.n} className="flex items-start gap-3">
                      <span className="grid h-8 w-8 shrink-0 place-items-center border border-line">
                        <Icon size={13} strokeWidth={1.3} />
                      </span>
                      <div>
                        <p className="text-[10px] text-faint">{s.n}</p>
                        <p className="max-w-[8.5rem] text-[11px] leading-snug text-muted">
                          {s.label}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </>
        }
      />

      {/* ───────── Art in Real Spaces │ At the Gallery ───────── */}
      <Pair
        left={
          <>
            <Head title="Art in Real Spaces" href="/art-gallery" cta="View more projects" />
            <div className="rail sm:grid sm:grid-cols-4 sm:gap-3">
              {realSpaces.map((s) => (
                <div key={s.label} className="w-[40vw] sm:w-auto">
                  <div className="relative aspect-[4/3] overflow-hidden bg-wash">
                    <Image
                      src={s.image}
                      alt={s.label}
                      fill
                      sizes="(max-width: 640px) 40vw, 12vw"
                      className="object-cover"
                    />
                  </div>
                  <p className="mt-2 text-[10px]">{s.label}</p>
                  <p className="text-[9.5px] leading-snug text-muted">{s.sub}</p>
                </div>
              ))}
            </div>
          </>
        }
        right={
          <>
            <Head title="At the Gallery" href="/exhibitions" cta="View all exhibitions" />

            <div className="grid gap-4 sm:grid-cols-[0.8fr_1.15fr_0.95fr]">
              {/* Current exhibition plate */}
              <div className="relative aspect-[3/4] overflow-hidden bg-wash">
                {current?.image && (
                  <Image
                    src={current.image}
                    alt={current.title}
                    fill
                    sizes="(max-width: 640px) 100vw, 14vw"
                    className="object-cover"
                  />
                )}
              </div>

              {/* Details */}
              <div className="self-center">
                <p className="text-[10px] text-muted">Current Exhibition</p>
                <p className="mt-0.5 font-display text-lg italic leading-tight">
                  {current?.title}
                </p>
                <p className="mt-2 text-[10px] leading-relaxed text-muted">
                  {current?.blurb
                    ? `${current.blurb.slice(0, 62).trim()}…`
                    : "A group show exploring memory, material and mark."}
                </p>
                <p className="mt-2.5 text-[10px] leading-snug text-muted">
                  {current?.end ? `Until ${current.end}` : ""}
                  {current?.venue ? (
                    <>
                      <br />
                      {current.venue}
                    </>
                  ) : null}
                </p>
                <Link
                  href="/exhibitions"
                  className="mt-2.5 inline-block border-b border-ink pb-0.5 text-[10px] transition-opacity hover:opacity-60"
                >
                  Explore Exhibition →
                </Link>
              </div>

              {/* Upcoming / past cards */}
              <div className="grid grid-rows-2 gap-3">
                {others.map((e, i) => (
                  <Link
                    key={e.slug}
                    href="/exhibitions"
                    className="group flex items-center gap-2.5 border border-line p-2"
                  >
                    <div className="relative h-12 w-10 shrink-0 overflow-hidden bg-wash">
                      {e.image && (
                        <Image src={e.image} alt={e.title} fill sizes="40px" className="object-cover" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] text-muted">{i === 0 ? "Upcoming" : "Past"}</p>
                      <p className="truncate font-display text-[13px] leading-tight">{e.title}</p>
                      <p className="text-[9px] text-muted">
                        {e.start}
                        {e.end ? ` – ${e.end}` : ""}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </>
        }
      />

      {/* ───────── Assurances (full width) ───────── */}
      <section className="border-b border-line">
        <div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-x-5 gap-y-7 px-5 py-8 sm:px-8 lg:grid-cols-4 lg:gap-0 lg:px-10">
          {assurances.map((a, i) => {
            const Icon = assuranceIcons[a.icon];
            return (
              <div
                key={a.title}
                className={`flex items-start gap-3 lg:px-8 ${
                  i > 0 ? "lg:border-l lg:border-line" : ""
                }`}
              >
                <Icon size={19} strokeWidth={1.2} className="mt-0.5 shrink-0" />
                <div>
                  <p className="text-[12px]">{a.title}</p>
                  <p className="mt-1 text-[10px] leading-snug text-muted">{a.body}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ───────── Collectors Say │ From the Journal ───────── */}
      <Pair
        left={
          <>
            <h2 className="mb-5 font-display text-xl leading-none sm:text-2xl">
              Collectors Say
            </h2>
            <Testimonials />
          </>
        }
        right={
          <>
            <Head title="From the Journal" href="/blog" cta="View all articles" />
            <div className="grid gap-4 sm:grid-cols-3">
              {journal.map((p) => (
                <Link key={p.slug} href={`/blog/${p.slug}`} className="group block">
                  <div className="relative aspect-[4/3] overflow-hidden bg-wash">
                    {p.image && (
                      <Image
                        src={p.image}
                        alt={p.title}
                        fill
                        sizes="(max-width: 640px) 100vw, 14vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      />
                    )}
                  </div>
                  <p className="mt-2 text-[9.5px] text-muted">{p.category}</p>
                  <p className="mt-0.5 font-display text-[13px] leading-snug">{p.title}</p>
                  <span className="mt-1 inline-flex items-center gap-1 text-[9.5px] text-muted transition-colors group-hover:text-ink">
                    Read more <ArrowRight size={9} />
                  </span>
                </Link>
              ))}
            </div>
          </>
        }
      />

      {/* ───────── Visit │ image │ Stay Inspired ───────── */}
      <section>
        <div className="mx-auto grid max-w-[1400px] items-center gap-6 px-5 py-8 sm:px-8 lg:grid-cols-[0.85fr_1.1fr_1fr] lg:gap-10 lg:px-10">
          <div>
            <h2 className="font-display text-xl leading-none sm:text-2xl">
              Visit the Gallery
            </h2>
            <p className="mt-2.5 text-[11px] leading-relaxed text-muted">
              Experience the artwork in person.
              <br />
              We&apos;d love to welcome you.
            </p>
            <Link
              href="/visit"
              className="mt-3 inline-block border-b border-ink pb-0.5 text-[11px] transition-opacity hover:opacity-60"
            >
              Plan your visit →
            </Link>
          </div>

          <div className="relative aspect-[16/7] overflow-hidden bg-wash">
            <Image
              src="https://www.uchaanarts.com/uploaded_files/slider/1728130444_ganesha_series_36x54_oil_on_linen_canvas_300000_-_copy.jpg"
              alt="Inside the Uchaan gallery"
              fill
              sizes="(max-width: 1024px) 100vw, 30vw"
              className="object-cover"
            />
          </div>

          <div>
            <h2 className="font-display text-xl leading-none sm:text-2xl">Stay Inspired</h2>
            <p className="mt-2.5 text-[11px] leading-relaxed text-muted">
              Curated stories, new works
              <br />
              and exhibition updates.
            </p>
            <form className="mt-3.5 flex max-w-sm">
              <label htmlFor="subscribe" className="sr-only">
                Email address
              </label>
              <input
                id="subscribe"
                type="email"
                required
                placeholder="Enter your email"
                className="min-w-0 flex-1 border border-line bg-card px-3 py-2.5 text-[11px] outline-none focus:border-ink"
              />
              <button type="submit" className="btn-accent shrink-0 px-5 py-2.5 text-[11px]">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}

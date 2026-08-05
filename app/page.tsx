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
import HeroPlate from "@/components/HeroPlate";
import Testimonials from "@/components/Testimonials";
import { getArtworks, getArtists, getPosts, getExhibitions } from "@/lib/cms";
import { curatedPaths, advisorySteps, realSpaces, assurances } from "@/lib/site";
import { formatINR } from "@/lib/data";

/**
 * Home — matched to the client's desktop reference.
 *
 * Structure, top to bottom:
 *   hero (copy + trust strip │ plate with caption)   full width, split
 *   New & Noteworthy                                  full width
 *   Curated Paths                                     full-width beige band
 *   Artist Focus │ Art Advisory                       paired, ruled
 *   Art in Real Spaces │ At the Gallery               paired, ruled
 *   assurances                                        full width, 4 divided
 *   Collectors Say │ From the Journal                 paired, ruled
 *   Visit │ image │ Stay Inspired                     full width, 3 columns
 */

const pathIcons = { rupee: IndianRupee, frame: Frame, sprout: Sprout, grid: LayoutGrid };
const assuranceIcons = {
  certificate: BadgeCheck,
  guidance: MessageSquare,
  relationships: Users,
  delivery: Truck,
};
const stepIcons = [UserRound, ClipboardCheck, PackageCheck];

/** Trim to a word boundary so excerpts never cut mid-word. */
function excerpt(text: string | undefined, max: number, fallback: string) {
  if (!text) return fallback;
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:.\s]+$/, "")}…`;
}

function Head({ title, href, cta }: { title: string; href: string; cta: string }) {
  return (
    <div className="mb-6 flex items-baseline justify-between gap-4">
      <h2 className="font-display text-[1.6rem] leading-none">{title}</h2>
      <Link
        href={href}
        className="inline-flex shrink-0 items-center gap-1.5 text-[13px] text-muted transition-colors hover:text-ink"
      >
        {cta} <ArrowRight size={12} />
      </Link>
    </div>
  );
}

/** Paired two-column block with a dividing rule. */
function Pair({ left, right }: { left: React.ReactNode; right: React.ReactNode }) {
  return (
    <section className="border-b border-line">
      <div className="mx-auto grid max-w-[1400px] lg:grid-cols-2">
        <div className="border-b border-line px-5 py-10 sm:px-8 lg:border-b-0 lg:border-r lg:px-10 lg:py-12">
          {left}
        </div>
        <div className="px-5 py-10 sm:px-8 lg:px-10 lg:py-12">{right}</div>
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
        <div className="mx-auto grid max-w-[1400px] lg:grid-cols-[0.86fr_1.14fr]">
          {/* Copy + trust strip */}
          <div className="flex flex-col justify-between px-5 pb-8 pt-10 sm:px-8 lg:py-12 lg:pl-10 lg:pr-8">
            <div>
              <h1 className="font-display text-[2.2rem] leading-[1.18] sm:text-[2.6rem] xl:text-[3rem]">
                Contemporary Indian art,
                <br />
                <em className="italic">thoughtfully curated.</em>
              </h1>
              <p className="mt-6 max-w-md text-[14px] leading-relaxed text-muted">
                Explore original works by emerging and established Indian artists,
                <br className="hidden sm:block" />
                 thoughtfully selected for private collections, homes and distinctive spaces.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/art-gallery" className="btn-accent px-8 py-3.5 text-[14px]">
                  Explore Art
                </Link>
                <Link href="/advisory" className="btn-outline px-8 py-3.5 text-[14px]">
                  Speak to a Curator
                </Link>
              </div>
            </div>

            {/* Trust strip sits at the foot of the copy column */}
            <ul className="mt-12 flex flex-wrap gap-x-8 gap-y-3 text-[12.5px] text-muted">
              {[
                { Icon: Clock, label: "15+ Years of Curatorial Experience" },
                { Icon: MapPin, label: "Delhi & Gurugram" },
                { Icon: Globe, label: "Secure Delivery Pan India & Worldwide" },
              ].map(({ Icon, label }) => (
                <li key={label} className="flex items-center gap-2.5">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-line">
                    <Icon size={12} strokeWidth={1.4} />
                  </span>
                  {label}
                </li>
              ))}
            </ul>
          </div>

          {/* Plate — flush to the header, inset from the right edge */}
          <div className="pb-6 pr-5 sm:pr-8 lg:pr-10">
            <HeroPlate works={heroWorks} names={names} />
          </div>
        </div>
      </section>

      {/* ───────── New & Noteworthy ─────────
          Uniform HEIGHT with natural widths, so each work keeps its own
          proportions — a filmstrip rather than a grid of equal boxes. */}
      <section className="border-b border-line">
        <div className="mx-auto max-w-[1400px] px-5 py-10 sm:px-8 lg:px-10 lg:py-12">
          <Head title="New & Noteworthy" href="/art-gallery" cta="View all artworks" />

          <div className="flex gap-5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] lg:gap-6 [&::-webkit-scrollbar]:hidden">
            {noteworthy.map((w) => (
              <Link key={w.slug} href={`/art/${w.slug}`} className="group block shrink-0">
                {/* Plain img: fixed height, automatic width preserves aspect. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={w.image}
                  alt={w.title}
                  className="h-[190px] w-auto max-w-none bg-wash object-cover transition-opacity duration-300 group-hover:opacity-90 sm:h-[230px] lg:h-[265px]"
                />
                <div className="mt-3.5 max-w-[230px]">
                  <p className="text-[14px] leading-tight">{names[w.artist] ?? ""}</p>
                  <p className="mt-1 text-[14px] italic leading-tight text-muted">
                    {w.title}
                  </p>
                  <p className="mt-2.5 text-[12.5px] leading-snug text-muted">{w.medium}</p>
                  <p className="text-[12.5px] leading-snug text-muted">{w.size}</p>
                  <p className="mt-2.5 text-[14px]">
                    {w.price > 0 ? formatINR(w.price) : "Price on request"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── Curated Paths ───────── */}
      <section className="border-b border-line bg-wash">
        <div className="mx-auto max-w-[1400px] px-5 py-11 sm:px-8 lg:px-10">
          <h2 className="text-center font-display text-[1.6rem]">
           Find the Art That Speaks to You
          </h2>

          <div className="mt-9 grid grid-cols-2 gap-x-6 gap-y-9 sm:grid-cols-4 sm:gap-0">
            {curatedPaths.map((p, i) => {
              const Icon = pathIcons[p.icon];
              return (
                <div
                  key={p.slug}
                  className={`flex items-start gap-4 sm:px-7 ${
                    i > 0 ? "sm:border-l sm:border-line" : ""
                  }`}
                >
                  <span className="mt-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-full border border-line bg-paper">
                    <Icon size={17} strokeWidth={1.3} />
                  </span>
                  <div>
                    <p className="font-display text-[15px] leading-snug">{p.title}</p>
                    <p className="mt-1.5 text-[12.5px] leading-snug text-muted">{p.blurb}</p>
                    <Link
                      href={p.href}
                      className="mt-2.5 inline-flex items-center gap-1.5 text-[12.5px] transition-colors hover:text-signal"
                    >
                      Explore <ArrowRight size={11} />
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
            <h2 className="font-display text-[1.6rem] leading-none">Meet the Artist</h2>
            <p className="mt-2 font-display text-[1.6rem] italic leading-none text-muted">
              {focusArtist?.name}
            </p>

            {/* copy · portrait · two stacked works */}
            <div className="mt-7 grid grid-cols-[0.9fr_1.15fr_0.85fr] gap-4">
              <div className="self-center">
                <p className="text-[13px] leading-relaxed text-muted">
                  {excerpt(
                    focusArtist?.bio,
                    110,
                    "Exploring memory, landscape and the quiet poetry of everyday moments."
                  )}
                </p>
                <Link
                  href={`/artists/${focusArtist?.slug ?? ""}`}
                  className="mt-5 inline-block border-b border-ink pb-0.5 text-[13px] transition-opacity hover:opacity-60"
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
                    sizes="(max-width: 1024px) 40vw, 17vw"
                    className="object-cover"
                  />
                )}
              </div>

              <div className="flex flex-col gap-4">
                {focusWorks.map((w) => (
                  <Link
                    key={w.slug}
                    href={`/art/${w.slug}`}
                    className="relative block aspect-[5/4] overflow-hidden bg-wash"
                  >
                    <Image
                      src={w.image}
                      alt={w.title}
                      fill
                      sizes="(max-width: 1024px) 30vw, 12vw"
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
            <h2 className="font-display text-[1.6rem] leading-none">Art Advisory</h2>

            <div className="mt-7 grid gap-8 sm:grid-cols-[1fr_auto]">
              <div>
                <p className="font-display text-[1.3rem] leading-snug">
                  The right work of art should feel personal.
                  <br />
                  <em className="italic">Finding it can be too.</em>
                </p>
                <p className="mt-4 max-w-sm text-[13px] leading-relaxed text-muted">
                  Tell us about your space, your taste and your budget. Our curatorial team will create a considered shortlist of original works for you.
                </p>
                <Link
                  href="/advisory"
                  className="mt-5 inline-block border-b border-ink pb-0.5 text-[13px] transition-opacity hover:opacity-60"
                >
                  Book a Consultation →
                </Link>
              </div>

              <ol className="space-y-5 sm:border-l sm:border-line sm:pl-8">
                {advisorySteps.map((s, i) => {
                  const Icon = stepIcons[i];
                  return (
                    <li key={s.n} className="flex items-start gap-3.5">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded border border-line">
                        <Icon size={15} strokeWidth={1.3} />
                      </span>
                      <div>
                        <p className="text-[12px] text-faint">{s.n}</p>
                        <p className="max-w-[9.5rem] text-[12.5px] leading-snug text-muted">
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
             <p className="mt-4 max-w-sm text-[13px] leading-relaxed text-muted">
                  See how original art transforms private homes, hospitality spaces, workplaces and public environments.
                </p>
            
            <div className="flex gap-3.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:grid sm:grid-cols-4 [&::-webkit-scrollbar]:hidden">
              {realSpaces.map((s) => (
                <div key={s.label} className="w-[44vw] shrink-0 sm:w-auto">
                  <div className="relative aspect-[4/3] overflow-hidden bg-wash">
                    <Image
                      src={s.image}
                      alt={s.label}
                      fill
                      sizes="(max-width: 640px) 44vw, 12vw"
                      className="object-cover"
                    />
                  </div>
                  <p className="mt-2.5 text-[12.5px]">{s.label}</p>
                  <p className="text-[11.5px] leading-snug text-muted">{s.sub}</p>
                </div>
              ))}
            </div>
          </>
        }
        right={
          <>
            <Head title="At the Gallery" href="/exhibitions" cta="View all exhibitions" />

            <div className="grid gap-5 sm:grid-cols-[0.8fr_1.15fr_1.05fr]">
              {/* Current exhibition plate */}
              <div className="relative aspect-[3/4] overflow-hidden bg-wash">
                {current?.image && (
                  <Image
                    src={current.image}
                    alt={current.title}
                    fill
                    sizes="(max-width: 640px) 100vw, 13vw"
                    className="object-cover"
                  />
                )}
              </div>

              {/* Details */}
              <div className="self-center">
                <p className="text-[12px] text-muted">Current Exhibition</p>
                <p className="mt-1 font-display text-[1.25rem] italic leading-tight">
                  {current?.title}
                </p>
                <p className="mt-2.5 text-[12.5px] leading-relaxed text-muted">
                  {excerpt(
                    current?.blurb,
                    62,
                    "A group show exploring memory, material and mark."
                  )}
                </p>
                <p className="mt-3 text-[12px] leading-snug text-muted">
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
                  className="mt-3 inline-block border-b border-ink pb-0.5 text-[12.5px] transition-opacity hover:opacity-60"
                >
                  Explore Exhibition →
                </Link>
              </div>

              {/* Upcoming / past, as bordered cards */}
              <div className="flex flex-col gap-4">
                {others.map((e, i) => (
                  <Link
                    key={e.slug}
                    href="/exhibitions"
                    className="flex flex-1 items-center gap-3 border border-line p-3 transition-colors hover:border-ink"
                  >
                    <div className="relative h-14 w-12 shrink-0 overflow-hidden bg-wash">
                      {e.image && (
                        <Image src={e.image} alt={e.title} fill sizes="48px" className="object-cover" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] text-muted">{i === 0 ? "Upcoming" : "Past"}</p>
                      <p className="truncate font-display text-[14px] leading-tight">{e.title}</p>
                      <p className="mt-0.5 text-[11px] text-muted">
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

      {/* ───────── Assurances ───────── */}
      <section className="border-b border-line">
        <div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-x-6 gap-y-8 px-5 py-9 sm:px-8 lg:grid-cols-4 lg:gap-0 lg:px-10">
          {assurances.map((a, i) => {
            const Icon = assuranceIcons[a.icon];
            return (
              <div
                key={a.title}
                className={`flex items-start gap-3.5 lg:px-8 ${
                  i > 0 ? "lg:border-l lg:border-line" : ""
                }`}
              >
                <Icon size={21} strokeWidth={1.2} className="mt-0.5 shrink-0" />
                <div>
                  <p className="text-[13.5px]">{a.title}</p>
                  <p className="mt-1.5 text-[12px] leading-snug text-muted">{a.body}</p>
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
            <h2 className="mb-7 font-display text-[1.6rem] leading-none">Collectors Say</h2>
            <Testimonials />
          </>
        }
        right={
          <>
            <Head title="From the Journal" href="/blog" cta="View all articles" />
            <div className="grid gap-5 sm:grid-cols-3">
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
                  <p className="mt-2.5 text-[11.5px] text-muted">{p.category}</p>
                  <p className="mt-1 font-display text-[14px] leading-snug">{p.title}</p>
                  <span className="mt-2 inline-flex items-center gap-1.5 text-[11.5px] text-muted transition-colors group-hover:text-ink">
                    Read more <ArrowRight size={10} />
                  </span>
                </Link>
              ))}
            </div>
          </>
        }
      />

      {/* ───────── Visit │ image │ Stay Inspired ───────── */}
      <section>
        <div className="mx-auto grid max-w-[1400px] items-center gap-7 px-5 py-10 sm:px-8 lg:grid-cols-[0.8fr_1.15fr_0.95fr] lg:gap-12 lg:px-10">
          <div>
            <h2 className="font-display text-[1.6rem] leading-none">Visit the Gallery</h2>
            <p className="mt-3 text-[13px] leading-relaxed text-muted">
              Experience the artwork in person.
              <br />
              We&apos;d love to welcome you.
            </p>
            <Link
              href="/visit"
              className="mt-4 inline-block border-b border-ink pb-0.5 text-[13px] transition-opacity hover:opacity-60"
            >
              Plan your visit →
            </Link>
          </div>

          <div className="relative aspect-[16/8] overflow-hidden bg-wash">
            <Image
              src="https://www.uchaanarts.com/uploaded_files/slider/1728130444_ganesha_series_36x54_oil_on_linen_canvas_300000_-_copy.jpg"
              alt="Inside the Uchaan gallery"
              fill
              sizes="(max-width: 1024px) 100vw, 32vw"
              className="object-cover"
            />
          </div>

          <div>
            <h2 className="font-display text-[1.6rem] leading-none">Stay Inspired</h2>
            <p className="mt-3 text-[13px] leading-relaxed text-muted">
              Curated stories, new works
              <br />
              and exhibition updates.
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
                className="min-w-0 flex-1 border border-line bg-card px-3.5 py-3 text-[13px] outline-none focus:border-ink"
              />
              <button type="submit" className="btn-accent shrink-0 px-6 py-3 text-[13px]">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}

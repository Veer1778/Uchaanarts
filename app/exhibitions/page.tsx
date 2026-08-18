import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import { getExhibitions } from "@/lib/cms";
import type { Exhibition } from "@/lib/data";

export const metadata: Metadata = {
  title: "Exhibitions",
  description:
    "Current, upcoming and past exhibitions and art fairs featuring Uchaan Arts, in India and internationally.",
};

const fmt = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const isRealDate = (d?: string) => {
  if (!d) return false;
  const parsed = new Date(d);
  // Guards the zero dates MySQL returns for empty DATE columns.
  return !Number.isNaN(parsed.getTime()) && parsed.getFullYear() > 1971;
};

/**
 * One display string for an exhibition's dates.
 *
 * Structured start/end dates are preferred, but several rows carry only the
 * CMS's free-text field ("23rd to 26th April, 2026"). Formatting those
 * directly is what produced "Invalid Date — Invalid Date".
 */
function dateLine(e: Exhibition): string {
  if (isRealDate(e.start) && isRealDate(e.end)) {
    return `${fmt(e.start)} — ${fmt(e.end)}`;
  }
  if (isRealDate(e.start)) return fmt(e.start);
  if (e.dateText?.trim()) return e.dateText.trim();
  return "";
}

export default async function ExhibitionsPage() {
  const all = await getExhibitions();

  // Three groups, taken from the CMS's own status. An exhibition can be marked
  // complete before its end date, and most rows have no structured dates at
  // all, so date arithmetic is only a fallback.
  const now = new Date();
  const bucket = (e: Exhibition) => {
    if (e.status) return e.status;
    if (isRealDate(e.end) && new Date(e.end) < now) return "past";
    return "upcoming";
  };

  const newestFirst = (a: Exhibition, b: Exhibition) => {
    const at = isRealDate(a.start) ? new Date(a.start).getTime() : -Infinity;
    const bt = isRealDate(b.start) ? new Date(b.start).getTime() : -Infinity;
    return bt - at;
  };

  const current = all.filter((e) => bucket(e) === "current").sort(newestFirst);
  const upcoming = all.filter((e) => bucket(e) === "upcoming").sort(newestFirst);
  const past = all.filter((e) => bucket(e) === "past").sort(newestFirst);

  const Card = ({
    e,
    index,
    highlight = false,
  }: {
    e: Exhibition;
    index: number;
    highlight?: boolean;
  }) => {
    const dates = dateLine(e);
    return (
      <Reveal delay={index * 0.06}>
        <article
          className={`group grid gap-6 border md:grid-cols-[1.1fr_1fr] ${
            highlight ? "border-signal" : "border-line"
          }`}
        >
          <div className="relative aspect-[16/10] overflow-hidden md:aspect-auto">
            <Image
              src={e.image}
              alt={e.title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            />
            {highlight && (
              <span className="absolute left-4 top-4 bg-signal px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-white">
                On now
              </span>
            )}
          </div>
          <div className="flex flex-col justify-center p-6 md:py-10">
            {dates && (
              <p className="text-[11px] uppercase tracking-[0.2em] text-signal">
                {dates}
              </p>
            )}
            <h2 className="mt-3 font-display text-3xl">{e.title.trim()}</h2>
            {e.artistLine && (
              <p className="mt-1 text-sm text-muted">{e.artistLine}</p>
            )}
            {e.blurb && (
              <p className="mt-4 text-sm leading-relaxed text-muted">{e.blurb}</p>
            )}
            {e.venue && (
              <p className="mt-5 text-xs uppercase tracking-[0.16em] text-ink">
                {e.venue}
              </p>
            )}
          </div>
        </article>
      </Reveal>
    );
  };

  const Section = ({
    title,
    items,
    highlight = false,
  }: {
    title: string;
    items: Exhibition[];
    highlight?: boolean;
  }) =>
    items.length === 0 ? null : (
      <>
        <h2 className="mb-6 mt-4 text-[11px] uppercase tracking-[0.3em] text-muted">
          {title}
        </h2>
        <div className="mb-16 space-y-8">
          {items.map((e, i) => (
            <Card key={e.slug} e={e} index={i} highlight={highlight} />
          ))}
        </div>
      </>
    );

  const nothingScheduled = current.length === 0 && upcoming.length === 0;

  return (
    <section className="relative mx-auto max-w-6xl px-5 pt-14">
      <div className="aura -right-40 top-0 h-80 w-80" />
      <Reveal>
        <h1 className="mb-4 font-display text-5xl sm:text-6xl">
          Exhibi<span className="text-signal">tions</span>
        </h1>
        <p className="mb-12 max-w-xl text-sm text-muted">
          Uchaan Arts shows at leading art fairs and galleries across India and
          internationally.
        </p>
      </Reveal>

      <Section title="Current shows" items={current} highlight />
      <Section title="Upcoming" items={upcoming} />

      {/* An empty "Upcoming" heading reads as a dormant gallery, so when
          nothing is scheduled we invite contact instead. */}
      {nothingScheduled && (
        <Reveal>
          <div className="mb-16 border border-line p-8 text-center">
            <p className="text-sm text-muted">
              Our next show is being planned. To hear about it first, or to
              arrange a private viewing at the gallery,
            </p>
            <Link
              href="/enquire"
              className="mt-4 inline-block bg-signal px-7 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:bg-signal-dark"
            >
              Get in touch
            </Link>
          </div>
        </Reveal>
      )}

      <Section title={nothingScheduled ? "Recent exhibitions" : "Past"} items={past} />
    </section>
  );
}

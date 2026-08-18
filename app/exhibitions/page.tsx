import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import { getExhibitions } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Exhibitions",
  description:
    "Exhibitions and art fairs featuring Uchaan Arts, in India and internationally.",
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
 * Structured start/end dates are preferred, but several rows only carry the
 * CMS's free-text field ("23rd to 26th April, 2026"). Formatting those
 * directly is what produced "Invalid Date — Invalid Date".
 */
function dateLine(e: { start?: string; end?: string; dateText?: string }): string {
  if (isRealDate(e.start) && isRealDate(e.end)) {
    return `${fmt(e.start!)} — ${fmt(e.end!)}`;
  }
  if (isRealDate(e.start)) return fmt(e.start!);
  if (e.dateText?.trim()) return e.dateText.trim();
  return "";
}

export default async function ExhibitionsPage() {
  const all = await getExhibitions();

  const now = new Date();
  const isPast = (e: (typeof all)[number]) => {
    // The CMS's own classification wins: an exhibition can be marked complete
    // before its end date, and several rows have no structured dates at all.
    if (e.status) return e.status === "past";
    return isRealDate(e.end) && new Date(e.end) < now;
  };

  const upcoming = all.filter((e) => !isPast(e));

  // Most recent first. Rows without a real date fall to the end rather than
  // being sorted against NaN.
  const past = all.filter(isPast).sort((a, b) => {
    const at = isRealDate(a.start) ? new Date(a.start).getTime() : -Infinity;
    const bt = isRealDate(b.start) ? new Date(b.start).getTime() : -Infinity;
    return bt - at;
  });

  const Card = ({ e, index }: { e: (typeof all)[number]; index: number }) => {
    const dates = dateLine(e);
    return (
      <Reveal delay={index * 0.06}>
        <article className="group grid gap-6 border border-line md:grid-cols-[1.1fr_1fr]">
          <div className="relative aspect-[16/10] overflow-hidden md:aspect-auto">
            <Image
              src={e.image}
              alt={e.title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            />
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

      {upcoming.length > 0 && (
        <>
          <h2 className="mb-6 text-[11px] uppercase tracking-[0.3em] text-muted">
            Upcoming
          </h2>
          <div className="space-y-8">
            {upcoming.map((e, i) => (
              <Card key={e.slug} e={e} index={i} />
            ))}
          </div>
        </>
      )}

      {/* With nothing upcoming, an empty "Upcoming" heading reads as a dormant
          gallery. Show an invitation to get in touch instead, and only render
          the heading when there is something under it. */}
      {upcoming.length === 0 && (
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

      {past.length > 0 && (
        <>
          <h2 className="mb-6 mt-4 text-[11px] uppercase tracking-[0.3em] text-muted">
            {upcoming.length > 0 ? "Past" : "Recent exhibitions"}
          </h2>
          <div className="space-y-8">
            {past.map((e, i) => (
              <Card key={e.slug} e={e} index={i} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

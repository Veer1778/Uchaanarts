import Image from "next/image";
import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import { getExhibitions } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Exhibitions",
  description:
    "Upcoming and past exhibitions at Uchaan Arts galleries in Delhi and Gurgaon.",
};

const fmt = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

/**
 * Exhibition dates as one display string.
 *
 * Most CMS rows have null start/end and only free text like
 * "23rd to 26th April, 2026". Formatting those directly is what produced
 * "Invalid Date — Invalid Date" on the live site. Order of preference:
 * real dates, then the CMS's own text, then nothing at all.
 */
function dateLine(e: { start?: string; end?: string; dateText?: string }): string {
  const valid = (d?: string) => {
    if (!d) return false;
    const parsed = new Date(d);
    // Guard the zero dates MySQL hands back for empty DATE columns.
    return !Number.isNaN(parsed.getTime()) && parsed.getFullYear() > 1971;
  };

  if (valid(e.start) && valid(e.end)) return `${fmt(e.start!)} — ${fmt(e.end!)}`;
  if (valid(e.start)) return fmt(e.start!);
  if (e.dateText && e.dateText.trim()) return e.dateText.trim();
  return "";
}

export default async function ExhibitionsPage() {
  const all = await getExhibitions();

  // The CMS classifies exhibitions itself, and most rows have no machine
  // readable start/end date at all — only free text like "23rd to 26th April,
  // 2026". Comparing new Date("") produces Invalid Date, which is neither
  // >= nor < now, so date maths silently dropped every exhibition from both
  // lists. Trust `status`, and fall back to dates only when it is missing.
  const now = new Date();
  const isPast = (e: (typeof all)[number]) => {
    if (e.status) return e.status === "past";
    const end = new Date(e.end);
    return !Number.isNaN(end.getTime()) && end < now;
  };

  const upcoming = all.filter((e) => !isPast(e));
  const past = all.filter(isPast);

  const Card = ({ e, index }: { e: (typeof all)[number]; index: number }) => (
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
          {dateLine(e) && (
            <p className="text-[11px] uppercase tracking-[0.2em] text-signal">
              {dateLine(e)}
            </p>
          )}
          <h2 className="mt-3 font-display text-3xl">{e.title}</h2>
          {e.artistLine && <p className="mt-1 text-sm text-muted">{e.artistLine}</p>}
          {e.blurb && (
            <p className="mt-4 text-sm leading-relaxed text-muted">{e.blurb}</p>
          )}
          {e.venue && (
            <p className="mt-5 text-xs uppercase tracking-[0.16em] text-ink">{e.venue}</p>
          )}
        </div>
      </article>
    </Reveal>
  );

  return (
    <section className="relative mx-auto max-w-6xl px-5 pt-14">
      <div className="aura -right-40 top-0 h-80 w-80" />
      <Reveal>
        <h1 className="mb-12 font-display text-5xl sm:text-6xl">
          Exhibi<span className="text-signal">tions</span>
        </h1>
      </Reveal>

      <h2 className="mb-6 text-[11px] uppercase tracking-[0.3em] text-muted">Upcoming</h2>
      <div className="space-y-8">
        {upcoming.length === 0 ? (
          <p className="text-sm text-muted">New shows are being planned — check back soon.</p>
        ) : (
          upcoming.map((e, i) => <Card key={e.slug} e={e} index={i} />)
        )}
      </div>

      {past.length > 0 && (
        <>
          <h2 className="mb-6 mt-20 text-[11px] uppercase tracking-[0.3em] text-muted">Past</h2>
          <div className="space-y-8 opacity-90">
            {past.map((e, i) => (
              <Card key={e.slug} e={e} index={i} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

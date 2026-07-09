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

export default async function ExhibitionsPage() {
  const all = await getExhibitions();
  const now = new Date();
  const upcoming = all.filter((e) => new Date(e.end) >= now);
  const past = all.filter((e) => new Date(e.end) < now);

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
          <p className="text-[11px] uppercase tracking-[0.2em] text-signal">
            {fmt(e.start)} — {fmt(e.end)}
          </p>
          <h2 className="mt-3 font-display text-3xl">{e.title}</h2>
          <p className="mt-1 text-sm text-muted">{e.artistLine}</p>
          <p className="mt-4 text-sm leading-relaxed text-muted">{e.blurb}</p>
          <p className="mt-5 text-xs uppercase tracking-[0.16em] text-ink">{e.venue}</p>
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

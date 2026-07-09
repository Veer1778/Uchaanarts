import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import { getPosts } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Art insights, events & workshops, and artist spotlights from Uchaan Arts.",
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const posts = await getPosts();
  const categories = ["All", "Art Insights", "Events & Workshops", "Artist Spotlight"];
  const active = category && categories.includes(category) ? category : "All";
  const visible = active === "All" ? posts : posts.filter((p) => p.category === active);

  return (
    <section className="relative mx-auto max-w-6xl px-5 pt-14">
      <div className="aura -left-32 top-0 h-80 w-80" />
      <Reveal>
        <h1 className="mb-3 font-display text-5xl sm:text-6xl">
          The <span className="text-signal">journal</span>
        </h1>
        <p className="mb-10 max-w-xl text-sm text-muted">
          To the world of art, through our eyes.
        </p>
      </Reveal>

      <div className="mb-12 flex flex-wrap gap-3">
        {categories.map((c) => (
          <Link
            key={c}
            href={c === "All" ? "/blog" : `/blog?category=${encodeURIComponent(c)}`}
            className={`rounded-xl border px-5 py-1.5 text-sm transition-colors ${
              active === c
                ? "border-signal bg-signal text-white"
                : "border-line hover:border-signal"
            }`}
          >
            {c}
          </Link>
        ))}
      </div>

      <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((p, i) => (
          <Reveal key={p.slug} delay={(i % 3) * 0.06}>
            <Link href={`/blog/${p.slug}`} className="group block">
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-wash">
                <Image
                  src={p.image}
                  alt={p.title}
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <p className="mt-4 flex items-center gap-3 text-[11px] uppercase tracking-[0.18em] text-signal">
                {p.category}
                <span className="text-muted normal-case tracking-normal">
                  {new Date(p.date).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </p>
              <h2 className="mt-2 font-display text-2xl leading-snug group-hover:underline">
                {p.title}
              </h2>
              <p className="mt-2 line-clamp-3 text-sm text-muted">{p.excerpt}</p>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

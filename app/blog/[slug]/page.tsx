import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import { getPost, getPosts } from "@/lib/cms";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  return { title: post.title, description: post.excerpt };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const more = (await getPosts()).filter((p) => p.slug !== slug).slice(0, 3);

  return (
    <>
      <article className="relative mx-auto max-w-3xl px-5 pt-14">
        <div className="aura -right-64 top-0 h-80 w-80" />
        <Reveal>
          <p className="text-[11px] uppercase tracking-[0.25em] text-signal">{post.category}</p>
          <h1 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">{post.title}</h1>
          <p className="mt-3 text-sm text-muted">
            {new Date(post.date).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="relative mt-10 aspect-[16/9] overflow-hidden rounded-lg bg-wash">
            <Image
              src={post.image}
              alt={post.title}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
              priority
            />
          </div>
        </Reveal>
        <Reveal delay={0.15}>
          <div className="mt-10 space-y-6 text-[15px] leading-loose text-ink/85">
            {post.body.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </Reveal>
      </article>

      <section className="mx-auto max-w-6xl px-5 pt-24">
        <Reveal>
          <h2 className="mb-8 font-display text-3xl">
            More from the <span className="text-signal">journal</span>
          </h2>
        </Reveal>
        <div className="grid gap-6 sm:grid-cols-3">
          {more.map((p) => (
            <Link key={p.slug} href={`/blog/${p.slug}`} className="group block">
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-wash">
                <Image
                  src={p.image}
                  alt={p.title}
                  fill
                  sizes="33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <h3 className="mt-3 font-display text-lg leading-snug group-hover:underline">
                {p.title}
              </h3>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

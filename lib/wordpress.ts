// ---------------------------------------------------------------------------
// WordPress + WooCommerce client (GoDaddy-hosted).
//
// Reads are public:
//   • Products  -> WooCommerce Store API   /wp-json/wc/store/v1/products
//   • Posts     -> WordPress REST API      /wp-json/wp/v2/posts
//   • Artists   -> WP custom post type     /wp-json/wp/v2/artist   (ACF fields)
//   • Exhibitions -> WP custom post type   /wp-json/wp/v2/exhibition (ACF fields)
//
// Set NEXT_PUBLIC_WP_URL to your WordPress site (e.g. https://cms.uchaanarts.com).
// Nothing here needs secret keys — the Store API and public REST endpoints are
// read-only and safe to call from a Netlify build/runtime.
// ---------------------------------------------------------------------------

import type { Artwork, Artist, Exhibition, Post } from "./data";

const WP = process.env.NEXT_PUBLIC_WP_URL?.replace(/\/$/, "");

export const wordpressEnabled = Boolean(WP);

async function wp<T>(path: string, revalidate = 60): Promise<T> {
  if (!WP) throw new Error("WordPress is not configured");
  const res = await fetch(`${WP}${path}`, { next: { revalidate } });
  if (!res.ok) throw new Error(`WP request failed (${res.status}): ${path}`);
  return (await res.json()) as T;
}

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const stripHtml = (html = "") =>
  html.replace(/<[^>]*>/g, "").replace(/&#8217;/g, "'").replace(/&amp;/g, "&").trim();

// -- WooCommerce Store API (products) --------------------------------------

type StoreProduct = {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  description: string;
  short_description: string;
  prices: { price: string; currency_minor_unit: number };
  images: { src: string }[];
  categories: { name: string; slug: string }[];
  attributes: { name: string; terms: { name: string }[] }[];
};

const attr = (p: StoreProduct, name: string) =>
  p.attributes.find((a) => a.name.toLowerCase() === name.toLowerCase())?.terms?.[0]?.name;

function toArtwork(p: StoreProduct): Artwork {
  const minor = p.prices.currency_minor_unit ?? 2;
  const price = Number(p.prices.price) / 10 ** minor;
  const artistName = attr(p, "Artist") ?? "";
  const category = (p.categories[0]?.name ?? "Painting") as Artwork["category"];
  return {
    slug: p.slug,
    title: p.name,
    artist: artistName ? slugify(artistName) : "unknown",
    image: p.images[0]?.src ?? "",
    medium: attr(p, "Medium") ?? "",
    category,
    size: attr(p, "Size") ?? "",
    price,
    wooId: p.id,
    description: stripHtml(p.short_description || p.description),
  };
}

export async function wpArtworks(): Promise<Artwork[]> {
  const products = await wp<StoreProduct[]>("/wp-json/wc/store/v1/products?per_page=100");
  return products.map(toArtwork);
}

export async function wpArtwork(slug: string): Promise<Artwork | undefined> {
  const products = await wp<StoreProduct[]>(
    `/wp-json/wc/store/v1/products?slug=${encodeURIComponent(slug)}`
  );
  return products[0] ? toArtwork(products[0]) : undefined;
}

// -- WordPress CPTs (artists, exhibitions) + posts -------------------------

type WPMedia = { source_url: string };
type Embedded = { _embedded?: { "wp:featuredmedia"?: WPMedia[] } };
type ACF = Record<string, string>;

const featured = (item: Embedded) =>
  item._embedded?.["wp:featuredmedia"]?.[0]?.source_url ?? "";

export async function wpArtists(): Promise<Artist[]> {
  const items = await wp<(Embedded & { slug: string; title: { rendered: string }; acf?: ACF })[]>(
    "/wp-json/wp/v2/artist?_embed&per_page=100"
  );
  return items.map((a) => ({
    slug: a.slug,
    name: a.title.rendered,
    location: a.acf?.location ?? "",
    bio: a.acf?.bio ?? "",
    image: featured(a),
    featured: a.acf?.featured === "1" || a.acf?.featured === "true",
  }));
}

export async function wpExhibitions(): Promise<Exhibition[]> {
  const items = await wp<(Embedded & { slug: string; title: { rendered: string }; acf?: ACF })[]>(
    "/wp-json/wp/v2/exhibition?_embed&per_page=100"
  );
  return items.map((e) => ({
    slug: e.slug,
    title: e.title.rendered,
    artistLine: e.acf?.artist_line ?? "",
    venue: e.acf?.venue ?? "",
    start: e.acf?.start ?? "",
    end: e.acf?.end ?? "",
    image: featured(e),
    blurb: e.acf?.blurb ?? "",
  }));
}

export async function wpPosts(): Promise<Post[]> {
  const items = await wp<
    (Embedded & {
      slug: string;
      date: string;
      title: { rendered: string };
      excerpt: { rendered: string };
      content: { rendered: string };
      _embedded?: { "wp:term"?: { name: string }[][] } & Embedded["_embedded"];
    })[]
  >("/wp-json/wp/v2/posts?_embed&per_page=30");

  return items.map((p) => {
    const category =
      (p._embedded?.["wp:term"]?.[0]?.[0]?.name as Post["category"]) ?? "Art Insights";
    const body = stripHtml(p.content.rendered)
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    return {
      slug: p.slug,
      title: stripHtml(p.title.rendered),
      category,
      date: p.date,
      image: featured(p),
      excerpt: stripHtml(p.excerpt.rendered),
      body: body.length ? body : [stripHtml(p.content.rendered)],
    };
  });
}

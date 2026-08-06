// ---------------------------------------------------------------------------
// Content access layer.
//
// Every page reads through these functions. They now pull from the CodeIgniter
// API at NEXT_PUBLIC_API_URL and map its responses onto the types in
// lib/data.ts, so no component or page had to change.
//
// If the API is unreachable, each function falls back to the demo dataset so
// the site still renders rather than throwing a 500.
//
// lib/wordpress.ts, lib/wpgraphql.ts and lib/woocommerce.ts are now dead and
// can be deleted once you've confirmed this works.
// ---------------------------------------------------------------------------

import {
  artworks as demoArtworks,
  artists as demoArtists,
  exhibitions as demoExhibitions,
  posts as demoPosts,
  type Artwork,
  type Artist,
  type Exhibition,
  type Post,
} from "./data";
import {
  api,
  type Artwork as ApiArtwork,
  type Artist as ApiArtist,
  type Exhibition as ApiExhibition,
  type BlogPost as ApiBlogPost,
  type Category as ApiCategory,
} from "./api";

const PLACEHOLDER = "/placeholder.svg";

/** How long Next.js caches an API response, in seconds. */
export const REVALIDATE = 300;

// ---------------------------------------------------------------------------
// Lookup caches. Module scope, so a single render pass fetches each once.
// ---------------------------------------------------------------------------

let categoryCache: Map<number, string> | null = null;

async function categoryNames(): Promise<Map<number, string>> {
  if (categoryCache) return categoryCache;
  try {
    const cats: ApiCategory[] = await api.categories();
    categoryCache = new Map(cats.map((c) => [c.id, c.name]));
  } catch {
    categoryCache = new Map();
  }
  return categoryCache;
}

let blogCategoryCache: Map<number, string> | null = null;

async function blogCategoryNames(): Promise<Map<number, string>> {
  if (blogCategoryCache) return blogCategoryCache;
  try {
    const cats = await api.blogCategories();
    blogCategoryCache = new Map(cats.map((c) => [c.id, c.name ?? ""]));
  } catch {
    blogCategoryCache = new Map();
  }
  return blogCategoryCache;
}

// ---------------------------------------------------------------------------
// Mappers: API shape -> lib/data.ts shape
// ---------------------------------------------------------------------------

function toArtwork(w: ApiArtwork, cats: Map<number, string>): Artwork {
  const categoryName =
    w.category_ids.map((id) => cats.get(id)).find(Boolean) ?? "Painting";

  return {
    slug: w.slug,
    title: w.name,
    // data.ts stores the artist as a slug; the API now returns artist_slug
    // computed with the same rule /api/artists uses, so links line up.
    artist: w.artist_slug ?? "",
    image: w.image ?? PLACEHOLDER,
    medium: w.medium ?? "",
    category: categoryName as Artwork["category"],
    size: w.size_label ?? formatSize(w),
    // Price-on-request pieces get 0. Components should check
    // priceOnRequest before rendering a number.
    price: w.price ?? 0,
    priceOnRequest: w.price_on_request,
    available: w.available,
    featured: w.featured,
    style: w.style ?? undefined,
    artistName: w.artist_name ?? undefined,
    description: w.description ?? w.short_description ?? "",
    itemId: w.id,
  };
}

function formatSize(w: ApiArtwork): string {
  const { width, height } = w.dimensions;
  if (!width && !height) return "";
  return `${width ?? "?"} x ${height ?? "?"} in`;
}

function toArtist(a: ApiArtist, location = ""): Artist {
  return {
    slug: a.slug,
    name: a.name,
    location,
    bio: a.bio ?? "",
    image: a.image ?? PLACEHOLDER,
    featured: a.featured,
  };
}

function toExhibition(e: ApiExhibition): Exhibition {
  return {
    slug: e.slug,
    title: e.title,
    artistLine: "",
    venue: e.venue ?? "",
    start: e.start_date ?? "",
    end: e.end_date ?? "",
    image: e.image ?? e.flyer ?? PLACEHOLDER,
    blurb: stripHtml(e.description ?? "").slice(0, 240),
  };
}

function toPost(p: ApiBlogPost, cats: Map<number, string>): Post {
  return {
    slug: p.slug,
    title: p.title,
    category: (cats.get(p.category_id) ?? "Art Insights") as Post["category"],
    date: p.published_date ?? "",
    image: p.image ?? PLACEHOLDER,
    excerpt: stripHtml(p.short_description ?? "").slice(0, 200),
    body: p.details ? splitParagraphs(p.details) : [],
  };
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function splitParagraphs(html: string): string[] {
  const blocks = html
    .split(/<\/p>|<br\s*\/?>|\n{2,}/i)
    .map(stripHtml)
    .filter((s) => s.length > 0);
  return blocks.length ? blocks : [stripHtml(html)];
}

// ---------------------------------------------------------------------------
// Public API. Same eight exports the pages already import.
// ---------------------------------------------------------------------------

/**
 * The gallery grid filters client-side, so it needs the full catalogue.
 * That is ~4,800 rows, so this is capped and cached. If you later want true
 * server-side filtering, call api.artworks() directly from the page and pass
 * filters through instead of pulling everything.
 */
export async function getArtworks(): Promise<Artwork[]> {
  try {
    const [{ items }, cats] = await Promise.all([
      api.artworks({ per_page: 100, sort: "new_old" }),
      categoryNames(),
    ]);
    if (items.length) return items.map((w) => toArtwork(w, cats));
  } catch (e) {
    console.error("[cms] getArtworks failed, using demo data:", e);
  }
  return demoArtworks;
}

export async function getFeaturedArtworks(): Promise<Artwork[]> {
  try {
    const [{ items }, cats] = await Promise.all([
      api.artworks({ featured: true, per_page: 12 }),
      categoryNames(),
    ]);
    if (items.length) return items.map((w) => toArtwork(w, cats));
  } catch (e) {
    console.error("[cms] getFeaturedArtworks failed:", e);
  }
  const all = await getArtworks();
  const featured = all.filter((w) => w.featured);
  return featured.length ? featured : all.slice(0, 8);
}

export async function getArtwork(slug: string): Promise<Artwork | undefined> {
  try {
    const [detail, cats] = await Promise.all([api.artwork(slug), categoryNames()]);
    const mapped = toArtwork(detail, cats);
    // Detail-only extras the product page can use.
    mapped.gallery = detail.gallery;
    mapped.description = detail.description ?? mapped.description;
    if (detail.artist) mapped.artistName = detail.artist.name;
    return mapped;
  } catch (e) {
    console.error("[cms] getArtwork failed:", e);
  }
  return demoArtworks.find((w) => w.slug === slug);
}

export async function getArtists(): Promise<Artist[]> {
  try {
    const { items } = await api.artists({ per_page: 200 });
    if (items.length) return items.map((a) => toArtist(a));
  } catch (e) {
    console.error("[cms] getArtists failed:", e);
  }
  return demoArtists;
}

export async function getArtist(slug: string): Promise<Artist | undefined> {
  try {
    const detail = await api.artist(slug);
    return toArtist(
      detail,
      [detail.city, detail.country].filter(Boolean).join(", ")
    );
  } catch (e) {
    console.error("[cms] getArtist failed:", e);
  }
  const all = await getArtists();
  return all.find((a) => a.slug === slug);
}

export async function getExhibitions(): Promise<Exhibition[]> {
  try {
    const [upcoming, past] = await Promise.all([
      api.exhibitions({ type: "upcoming", per_page: 30 }),
      api.exhibitions({ type: "past", per_page: 30 }),
    ]);
    const all = [...upcoming.items, ...past.items];
    if (all.length) return all.map(toExhibition);
  } catch (e) {
    console.error("[cms] getExhibitions failed:", e);
  }
  return demoExhibitions;
}

export async function getPosts(): Promise<Post[]> {
  try {
    const [{ items }, cats] = await Promise.all([
      api.blogs({ per_page: 50 }),
      blogCategoryNames(),
    ]);
    if (items.length) return items.map((p) => toPost(p, cats));
  } catch (e) {
    console.error("[cms] getPosts failed:", e);
  }
  return demoPosts;
}

export async function getPost(slug: string): Promise<Post | undefined> {
  try {
    const [post, cats] = await Promise.all([api.blog(slug), blogCategoryNames()]);
    return toPost(post, cats);
  } catch (e) {
    console.error("[cms] getPost failed:", e);
  }
  const all = await getPosts();
  return all.find((p) => p.slug === slug);
}

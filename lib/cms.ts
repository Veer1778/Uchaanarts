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
    size: cleanSize(w),
    // Price-on-request pieces get 0. Components should check
    // priceOnRequest before rendering a number.
    price: w.price ?? 0,
    priceOnRequest: w.price_on_request,
    available: w.available,
    featured: w.featured,
    style: w.style ?? undefined,
    theme: w.theme ?? undefined,
    year: w.year ?? undefined,
    surface: w.surface ?? undefined,
    code: w.code ?? undefined,
    mediumTerm: w.medium_label ?? undefined,
    material: w.material_label ?? undefined,
    artistName: w.artist_name ?? undefined,
    description: stripHtml(w.description ?? w.short_description ?? ""),
    itemId: w.id,
  };
}

/**
 * Artwork dimensions, or "" when the CMS has nothing usable.
 *
 * The CMS stores blanks, "0", and stray units in these columns, so the naive
 * version produced strings like "22 x  in" and "46 x  in" on the live site.
 * Anything that isn't a real measurement on BOTH axes is dropped rather than
 * half-rendered.
 */
function cleanSize(w: ApiArtwork): string {
  const unit = w.dimensions.unit || "in";

  const num = (v: string | null | undefined) => {
    if (v === null || v === undefined) return null;
    const n = parseFloat(String(v).replace(/[^0-9.]/g, ""));
    return Number.isFinite(n) && n > 0 ? String(n) : null;
  };

  const width = num(w.dimensions.width);
  const height = num(w.dimensions.height);
  const depth = num(w.dimensions.depth);

  // Both axes present: build it ourselves, which is the most reliable path.
  if (width && height) {
    return depth
      ? `${width} × ${height} × ${depth} ${unit}`
      : `${width} × ${height} ${unit}`;
  }

  // Otherwise fall back to the CMS's own text, which is often complete even
  // when the numeric columns are not.
  const label = (w.size_label ?? "").replace(/\s+/g, " ").trim();
  if (label) {
    // Repair dangling separators from partial data entry: the live site shows
    // "48 x  in" because one axis was left blank. Strip the orphan operator
    // rather than printing it.
    const repaired = label
      .replace(/\s*[x×]\s*(?=(in|cm|inch|inches)?\s*$)/i, " ")
      .replace(/\s+/g, " ")
      .trim();
    // Keep only if something numeric survived.
    if (/\d/.test(repaired)) return repaired;
  }

  // Single usable axis: better than nothing, but say which one it is.
  if (width) return `${width} ${unit} wide`;
  if (height) return `${height} ${unit} high`;

  return "";
}

function toArtist(a: ApiArtist, location = ""): Artist {
  return {
    slug: a.slug,
    // CMS names carry leading spaces and doubled inner spaces from the admin
    // forms, e.g. " Aashima  Mehrotra".
    name: a.name.replace(/\s+/g, " ").trim(),
    location,
    // CKEditor stores markup, so <p> tags leak straight into the page.
    bio: stripHtml(a.bio ?? ""),
    image: a.image ?? PLACEHOLDER,
    featured: a.featured,
  };
}

function toExhibition(e: ApiExhibition, status: "upcoming" | "past"): Exhibition {
  return {
    slug: e.slug,
    title: e.title.trim(),
    artistLine: "",
    venue: e.venue ?? "",
    start: e.start_date ?? "",
    end: e.end_date ?? "",
    image: e.image ?? e.flyer ?? PLACEHOLDER,
    blurb: stripHtml(e.description ?? "").slice(0, 240),
    status,
    dateText: e.date_text ?? undefined,
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
      // light=1 trims each row and lifts the page cap to 3000, so the whole
      // catalogue arrives in one request and the grid can filter instantly.
      api.artworks({ light: true, per_page: 3000, sort: "new_old" }),
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

    // Detail-only extras. The listing endpoint returns a trimmed object, so
    // these are only available here.
    mapped.gallery = detail.gallery;
    mapped.description = stripHtml(detail.description ?? "") || mapped.description;
    if (detail.artist) mapped.artistName = detail.artist.name;

    // The detail endpoint resolves taxonomy ids to labels, which the listing
    // endpoint cannot. Prefer them over the single-label fallbacks.
    const attrs = detail.attributes;
    if (attrs) {
      const styles = attrs.styles?.map((t) => t.name).filter(Boolean);
      const themes = attrs.themes?.map((t) => t.name).filter(Boolean);
      if (styles?.length) mapped.style = styles.join(", ");
      if (themes?.length) mapped.theme = themes.join(", ");
      if (attrs.medium?.name) mapped.mediumTerm = attrs.medium.name;
      if (attrs.material?.name) mapped.material = attrs.material.name;
    }

    return mapped;
  } catch (e) {
    console.error("[cms] getArtwork failed:", e);
  }
  return demoArtworks.find((w) => w.slug === slug);
}

/**
 * Everything the artwork detail page needs, in a single API call.
 *
 * The page previously called getArtworks() and getArtists(), pulling all 2,500
 * artworks and 300 artists just to render six related works and resolve one
 * name. The detail endpoint already returns `similar` and `more_by_artist`
 * with artist names attached, so none of that traffic is necessary.
 */
export async function getArtworkPage(slug: string): Promise<{
  artwork: Artwork;
  related: Artwork[];
  relatedHeading: string;
  names: Record<string, string>;
} | null> {
  try {
    const [detail, cats] = await Promise.all([api.artwork(slug), categoryNames()]);

    const artwork = toArtwork(detail, cats);
    artwork.gallery = detail.gallery;
    artwork.description = stripHtml(detail.description ?? "") || artwork.description;
    if (detail.artist) artwork.artistName = detail.artist.name;

    const attrs = detail.attributes;
    if (attrs) {
      const styles = attrs.styles?.map((t) => t.name).filter(Boolean);
      const themes = attrs.themes?.map((t) => t.name).filter(Boolean);
      if (styles?.length) artwork.style = styles.join(", ");
      if (themes?.length) artwork.theme = themes.join(", ");
      if (attrs.medium?.name) artwork.mediumTerm = attrs.medium.name;
      if (attrs.material?.name) artwork.material = attrs.material.name;
      // Many works have no numeric dimensions but do carry a size taxonomy
      // term, which is why the Size row was missing entirely.
      if (attrs.size?.name && !artwork.size) artwork.size = attrs.size.name;
    }

    const byArtist = (detail.more_by_artist ?? []).map((w) => toArtwork(w, cats));
    const similar = (detail.similar ?? []).map((w) => toArtwork(w, cats));

    const useArtist = byArtist.length >= 3;
    const related = (useArtist ? byArtist : similar).slice(0, 6);

    const names: Record<string, string> = {};
    for (const w of [...byArtist, ...similar]) {
      if (w.artist && w.artistName) names[w.artist] = w.artistName;
    }

    return {
      artwork,
      related,
      relatedHeading: useArtist
        ? `More from ${detail.artist?.name ?? artwork.artistName ?? "this artist"}`
        : "You may also love",
      names,
    };
  } catch (e) {
    console.error("[cms] getArtworkPage failed:", e);
  }

  // Demo fallback keeps the page renderable if the API is unreachable.
  const demo = demoArtworks.find((w) => w.slug === slug);
  if (!demo) return null;
  return {
    artwork: demo,
    related: demoArtworks.filter((w) => w.slug !== slug).slice(0, 6),
    relatedHeading: "You may also love",
    names: {},
  };
}

export async function getArtists(): Promise<Artist[]> {
  try {
    const { items } = await api.artists({ per_page: 300 });
    if (items.length) {
      const mapped = items.map((a) => toArtist(a));
      // Featured first, then alphabetical. The CMS returns creation order,
      // which puts the gallery's headline artists arbitrarily deep in a
      // 257-name list.
      return mapped.sort((a, b) => {
        if (a.featured !== b.featured) return a.featured ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
    }
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
    const all = [
      ...upcoming.items.map((e) => toExhibition(e, "upcoming")),
      ...past.items.map((e) => toExhibition(e, "past")),
    ];
    if (all.length) return all;
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

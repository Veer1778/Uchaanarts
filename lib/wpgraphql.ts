// ---------------------------------------------------------------------------
// WordPress client — WPGraphQL (no REST, no ACF).
//
// Everything goes through ONE endpoint: <WP_URL>/graphql
//   • Artworks    -> WooGraphQL `products`
//   • Artists     -> `artists`      (CPT + native meta, exposed by uchaan-headless)
//   • Exhibitions -> `exhibitions`  (CPT + native meta, exposed by uchaan-headless)
//   • Blog        -> `posts`
//
// Required WP plugins: WPGraphQL, WPGraphQL for WooCommerce (WooGraphQL),
// WooCommerce, and the bundled `uchaan-headless` plugin.
// ---------------------------------------------------------------------------

import type { Artwork, Artist, Exhibition, Post } from "./data";

const WP = process.env.NEXT_PUBLIC_WP_URL?.replace(/\/$/, "");

export const wordpressEnabled = Boolean(WP);

/** Single POST to /graphql. Cached by Next for `revalidate` seconds. */
async function gql<T>(
  query: string,
  variables: Record<string, unknown> = {},
  revalidate = 60
): Promise<T> {
  if (!WP) throw new Error("WordPress is not configured");

  const res = await fetch(`${WP}/graphql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
    next: { revalidate },
  });

  if (!res.ok) throw new Error(`GraphQL request failed: ${res.status}`);

  const json = await res.json();
  if (json.errors?.length) {
    throw new Error(json.errors.map((e: { message: string }) => e.message).join("; "));
  }
  return json.data as T;
}

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const stripHtml = (html = "") =>
  html
    .replace(/<[^>]*>/g, "")
    .replace(/&#8217;/g, "'")
    .replace(/&#8211;/g, "–")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .trim();

// -- Artworks (WooGraphQL products) ----------------------------------------

const PRODUCT_FIELDS = /* GraphQL */ `
  databaseId
  slug
  name
  description
  shortDescription
  image {
    sourceUrl
  }
  productCategories {
    nodes {
      name
    }
  }
  attributes {
    nodes {
      name
      options
    }
  }
  ... on SimpleProduct {
    price(format: RAW)
    featured
  }
  ... on VariableProduct {
    price(format: RAW)
    featured
  }
`;

type GqlProduct = {
  databaseId: number;
  slug: string;
  name: string;
  description?: string;
  shortDescription?: string;
  image?: { sourceUrl: string } | null;
  productCategories?: { nodes: { name: string }[] };
  attributes?: { nodes: { name: string; options: string[] }[] };
  price?: string | null;
  featured?: boolean;
};

const attr = (p: GqlProduct, name: string) =>
  p.attributes?.nodes.find((a) => a.name.toLowerCase() === name.toLowerCase())
    ?.options?.[0];

function toArtwork(p: GqlProduct): Artwork {
  const artistName = attr(p, "Artist") ?? "";
  return {
    slug: p.slug,
    title: stripHtml(p.name),
    artist: artistName ? slugify(artistName) : "unknown",
    image: p.image?.sourceUrl ?? "",
    medium: attr(p, "Medium") ?? "",
    category: (p.productCategories?.nodes[0]?.name ?? "Painting") as Artwork["category"],
    size: attr(p, "Size") ?? "",
    price: Number(p.price ?? 0),
    featured: Boolean(p.featured),
    wooId: p.databaseId,
    style: attr(p, "Style") ?? attr(p, "Theme"),
    folkForm: attr(p, "Folk Form") ?? attr(p, "Folk Art Form"),
    description: stripHtml(p.shortDescription || p.description || ""),
  };
}

export async function wpArtworks(): Promise<Artwork[]> {
  const data = await gql<{ products: { nodes: GqlProduct[] } }>(/* GraphQL */ `
    query Artworks {
      products(first: 100, where: { status: "publish" }) {
        nodes { ${PRODUCT_FIELDS} }
      }
    }
  `);
  return data.products.nodes.map(toArtwork);
}

export async function wpArtwork(slug: string): Promise<Artwork | undefined> {
  const data = await gql<{ product: GqlProduct | null }>(
    /* GraphQL */ `
      query Artwork($slug: ID!) {
        product(id: $slug, idType: SLUG) { ${PRODUCT_FIELDS} }
      }
    `,
    { slug }
  );
  return data.product ? toArtwork(data.product) : undefined;
}

// -- Artists ----------------------------------------------------------------

export async function wpArtists(): Promise<Artist[]> {
  const data = await gql<{
    artists: {
      nodes: {
        slug: string;
        title: string;
        featuredImage?: { node: { sourceUrl: string } } | null;
        location?: string;
        bio?: string;
        featured?: boolean;
      }[];
    };
  }>(/* GraphQL */ `
    query Artists {
      artists(first: 200) {
        nodes {
          slug
          title
          featuredImage {
            node {
              sourceUrl
            }
          }
          location
          bio
          featured
        }
      }
    }
  `);

  return data.artists.nodes.map((a) => ({
    slug: a.slug,
    name: stripHtml(a.title),
    location: a.location ?? "",
    bio: a.bio ?? "",
    image: a.featuredImage?.node.sourceUrl ?? "",
    featured: Boolean(a.featured),
  }));
}

// -- Exhibitions ------------------------------------------------------------

export async function wpExhibitions(): Promise<Exhibition[]> {
  const data = await gql<{
    exhibitions: {
      nodes: {
        slug: string;
        title: string;
        featuredImage?: { node: { sourceUrl: string } } | null;
        artistLine?: string;
        venue?: string;
        start?: string;
        end?: string;
        blurb?: string;
      }[];
    };
  }>(/* GraphQL */ `
    query Exhibitions {
      exhibitions(first: 100) {
        nodes {
          slug
          title
          featuredImage {
            node {
              sourceUrl
            }
          }
          artistLine
          venue
          start
          end
          blurb
        }
      }
    }
  `);

  return data.exhibitions.nodes.map((e) => ({
    slug: e.slug,
    title: stripHtml(e.title),
    artistLine: e.artistLine ?? "",
    venue: e.venue ?? "",
    start: e.start ?? "",
    end: e.end ?? "",
    image: e.featuredImage?.node.sourceUrl ?? "",
    blurb: e.blurb ?? "",
  }));
}

// -- Blog posts -------------------------------------------------------------

export async function wpPosts(): Promise<Post[]> {
  const data = await gql<{
    posts: {
      nodes: {
        slug: string;
        title: string;
        date: string;
        excerpt?: string;
        content?: string;
        featuredImage?: { node: { sourceUrl: string } } | null;
        categories?: { nodes: { name: string }[] };
      }[];
    };
  }>(/* GraphQL */ `
    query Posts {
      posts(first: 30) {
        nodes {
          slug
          title
          date
          excerpt
          content
          featuredImage {
            node {
              sourceUrl
            }
          }
          categories {
            nodes {
              name
            }
          }
        }
      }
    }
  `);

  return data.posts.nodes.map((p) => {
    const body = stripHtml(p.content ?? "")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    return {
      slug: p.slug,
      title: stripHtml(p.title),
      category: (p.categories?.nodes[0]?.name ?? "Art Insights") as Post["category"],
      date: p.date,
      image: p.featuredImage?.node.sourceUrl ?? "",
      excerpt: stripHtml(p.excerpt ?? ""),
      body: body.length ? body : [stripHtml(p.content ?? "")],
    };
  });
}

// ---------------------------------------------------------------------------
// Content access layer.
// Every page reads through these functions. When NEXT_PUBLIC_WP_URL is set,
// content comes from WordPress + WooCommerce; otherwise the demo dataset in
// lib/data.ts is used so the site is fully functional out of the box.
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
  wordpressEnabled,
  wpArtworks,
  wpArtwork,
  wpArtists,
  wpExhibitions,
  wpPosts,
} from "./wordpress";

export async function getArtworks(): Promise<Artwork[]> {
  if (wordpressEnabled) {
    try {
      return await wpArtworks();
    } catch (e) {
      console.error(e);
    }
  }
  return demoArtworks;
}

export async function getFeaturedArtworks(): Promise<Artwork[]> {
  const all = await getArtworks();
  const featured = all.filter((w) => w.featured);
  return featured.length ? featured : all.slice(0, 8);
}

export async function getArtwork(slug: string): Promise<Artwork | undefined> {
  if (wordpressEnabled) {
    try {
      const w = await wpArtwork(slug);
      if (w) return w;
    } catch (e) {
      console.error(e);
    }
  }
  return demoArtworks.find((w) => w.slug === slug);
}

export async function getArtists(): Promise<Artist[]> {
  if (wordpressEnabled) {
    try {
      const a = await wpArtists();
      if (a.length) return a;
    } catch (e) {
      console.error(e);
    }
  }
  return demoArtists;
}

export async function getArtist(slug: string): Promise<Artist | undefined> {
  const all = await getArtists();
  return all.find((a) => a.slug === slug);
}

export async function getExhibitions(): Promise<Exhibition[]> {
  if (wordpressEnabled) {
    try {
      const e = await wpExhibitions();
      if (e.length) return e;
    } catch (err) {
      console.error(err);
    }
  }
  return demoExhibitions;
}

export async function getPosts(): Promise<Post[]> {
  if (wordpressEnabled) {
    try {
      const p = await wpPosts();
      if (p.length) return p;
    } catch (e) {
      console.error(e);
    }
  }
  return demoPosts;
}

export async function getPost(slug: string): Promise<Post | undefined> {
  const all = await getPosts();
  return all.find((p) => p.slug === slug);
}

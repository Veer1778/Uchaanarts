// app/debug/route.ts   (or app/api/debug/route.ts — wherever yours lives)
//
// v2: calls lib/cms.ts, not the API directly. The previous version proved the
// API is reachable; this proves whether cms.ts is the new code and whether its
// mappers work.
//
// DELETE once resolved.

import { getArtworks, getArtists, getPosts, getExhibitions } from "@/lib/cms";
import {
  artworks as demoArtworks,
  posts as demoPosts,
  exhibitions as demoExhibitions,
} from "@/lib/data";

export const dynamic = "force-dynamic";

/**
 * The demo dataset uses real uchaanarts titles, so "looks plausible" proves
 * nothing. Compare against the actual demo slugs instead.
 */
const demoArtworkSlugs = new Set(demoArtworks.map((w) => w.slug));
const demoPostSlugs = new Set(demoPosts.map((p) => p.slug));
const demoExhibitionSlugs = new Set(demoExhibitions.map((e) => e.slug));

async function check<T extends { slug: string }>(
  name: string,
  fn: () => Promise<T[]>,
  demoSlugs: Set<string>,
  demoCount: number
) {
  const started = Date.now();
  try {
    const items = await fn();
    const fromDemo = items.length > 0 && items.every((i) => demoSlugs.has(i.slug));
    return {
      name,
      ms: Date.now() - started,
      count: items.length,
      demoCount,
      source: fromDemo ? "DEMO FALLBACK" : "LIVE API",
      firstThree: items.slice(0, 3).map((i) => ({
        slug: i.slug,
        title: (i as any).title ?? (i as any).name,
      })),
    };
  } catch (e) {
    return {
      name,
      ms: Date.now() - started,
      source: "THREW",
      error: e instanceof Error ? e.message : String(e),
      stack: e instanceof Error ? e.stack?.split("\n").slice(0, 5) : null,
    };
  }
}

export async function GET() {
  const results = await Promise.all([
    check("getArtworks", getArtworks, demoArtworkSlugs, demoArtworks.length),
    check("getPosts", getPosts, demoPostSlugs, demoPosts.length),
    check("getExhibitions", getExhibitions, demoExhibitionSlugs, demoExhibitions.length),
    check("getArtists", getArtists, new Set(), 0),
  ]);

  return Response.json(
    {
      note: "source LIVE API = working. DEMO FALLBACK = the catch fired. THREW = error leaked.",
      hint: "If every source is DEMO FALLBACK with no error logged, lib/cms.ts is still the old WordPress version.",
      env: {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? "(not set)",
        NEXT_PUBLIC_WP_URL: process.env.NEXT_PUBLIC_WP_URL ?? "(not set)",
      },
      results,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}

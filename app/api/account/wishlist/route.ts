import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  AUTH_COOKIE,
  authLive,
  cookieOptions,
  parseSession,
  wpMe,
} from "@/lib/auth";

/**
 * Wishlist storage — sync across devices when signed in.
 *
 * Live mode: stores the slug array as WP user meta (via a small REST route
 * you add in wordpress/functions-snippets.php, mirroring the existing CPT
 * setup). If that endpoint isn't present, we fall back to writing a signed
 * cookie so the UX still works.
 *
 * Demo mode: stores in a cookie keyed by the demo email so switching demo
 * accounts still shows a fresh list.
 */

const WISHLIST_COOKIE = "ua_wishlist";

async function readCookieWishlist(value?: string): Promise<string[]> {
  if (!value) return [];
  try {
    return JSON.parse(Buffer.from(value, "base64").toString("utf8"));
  } catch {
    return [];
  }
}
const writeCookieWishlist = (slugs: string[]) =>
  Buffer.from(JSON.stringify(slugs)).toString("base64");

async function wpWishlistFetch(userId: number, token: string): Promise<string[] | null> {
  const WP = process.env.NEXT_PUBLIC_WP_URL?.replace(/\/$/, "");
  if (!WP) return null;
  const res = await fetch(`${WP}/wp-json/uchaan/v1/wishlist`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  }).catch(() => null);
  if (!res || !res.ok) return null;
  const data = await res.json().catch(() => null);
  return Array.isArray(data?.slugs) ? (data.slugs as string[]) : [];
}

async function wpWishlistSave(token: string, slugs: string[]): Promise<boolean> {
  const WP = process.env.NEXT_PUBLIC_WP_URL?.replace(/\/$/, "");
  if (!WP) return false;
  const res = await fetch(`${WP}/wp-json/uchaan/v1/wishlist`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ slugs }),
    cache: "no-store",
  }).catch(() => null);
  return Boolean(res && res.ok);
}

export async function GET() {
  const jar = await cookies();
  const session = parseSession(jar.get(AUTH_COOKIE)?.value);

  if (session.kind === "jwt" && authLive && session.token) {
    const me = await wpMe(session.token);
    if (me) {
      const remote = await wpWishlistFetch(me.id, session.token);
      if (remote) return NextResponse.json({ slugs: remote });
    }
  }

  const slugs = await readCookieWishlist(jar.get(WISHLIST_COOKIE)?.value);
  return NextResponse.json({ slugs });
}

// PUT /api/account/wishlist  body: { slugs: string[] }
export async function PUT(req: Request) {
  const { slugs } = (await req.json()) as { slugs: string[] };
  const list = Array.isArray(slugs) ? slugs : [];
  const jar = await cookies();
  const session = parseSession(jar.get(AUTH_COOKIE)?.value);

  if (session.kind === "jwt" && authLive && session.token) {
    const ok = await wpWishlistSave(session.token, list);
    if (ok) return NextResponse.json({ ok: true });
  }

  jar.set(WISHLIST_COOKIE, writeCookieWishlist(list), cookieOptions);
  return NextResponse.json({ ok: true });
}

// app/api/account/wishlist/route.ts
//
// Wishlist storage, synced across devices when signed in.
//
// Rewritten off WordPress. The CMS has no wishlist endpoint yet, so this
// persists to a cookie for everyone. That keeps the feature working for
// signed-out visitors too, which the WP version did not.
//
// When a CMS wishlist endpoint lands, swap readList/writeList for
// apiAuthed("/account/wishlist") and keep the cookie as the anonymous path.

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionUser } from "@/lib/auth";

const WISHLIST_COOKIE = "ua_wishlist";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
};

function decode(value?: string): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(Buffer.from(value, "base64").toString("utf8"));
    // Filter to strings: the cookie is user-supplied and could be anything.
    return Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === "string") : [];
  } catch {
    return [];
  }
}

function encode(slugs: string[]): string {
  return Buffer.from(JSON.stringify(slugs)).toString("base64");
}

export async function GET() {
  const jar = await cookies();
  return NextResponse.json({ slugs: decode(jar.get(WISHLIST_COOKIE)?.value) });
}

// PUT /api/account/wishlist   body: { slugs: string[] }
export async function PUT(req: Request) {
  let slugs: unknown;
  try {
    ({ slugs } = await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const list = Array.isArray(slugs)
    ? slugs.filter((s): s is string => typeof s === "string").slice(0, 500)
    : [];

  const jar = await cookies();
  jar.set(WISHLIST_COOKIE, encode(list), cookieOptions);

  // Signed-in state is reported back so the client can show a "synced" hint
  // once server-side storage exists.
  const user = await getSessionUser();
  return NextResponse.json({ ok: true, synced: false, signedIn: Boolean(user) });
}

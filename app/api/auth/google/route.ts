import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  AUTH_COOKIE,
  authLive,
  cookieOptions,
  demoSession,
  verifyGoogleIdToken,
  wpMe,
} from "@/lib/auth";

// POST /api/auth/google  body: { credential }
// Verifies the Google ID token, then signs the user in.
// - Live mode: attempts to log the WP user in by finding a customer with the
//   same email. If your WP has a Google-Auth plugin, it may already accept
//   the token directly; we call that endpoint first when present.
// - Demo mode: creates a demo session with the Google-verified name/email.
export async function POST(req: Request) {
  const { credential } = await req.json();
  if (!credential) {
    return NextResponse.json({ error: "Missing credential." }, { status: 400 });
  }

  const verified = await verifyGoogleIdToken(credential);
  if ("error" in verified) {
    return NextResponse.json({ error: verified.error }, { status: 401 });
  }

  const jar = await cookies();

  if (authLive) {
    // Preferred path: a WP endpoint that swaps a Google ID token for a JWT.
    // (Common plugins: nextend-social-login, wp-rest-google-auth.)
    const WP = process.env.NEXT_PUBLIC_WP_URL?.replace(/\/$/, "");
    const swap = await fetch(`${WP}/wp-json/jwt-auth/v1/token/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_token: credential }),
      cache: "no-store",
    }).catch(() => null);

    if (swap && swap.ok) {
      const data = await swap.json();
      if (data?.token) {
        jar.set(AUTH_COOKIE, data.token, cookieOptions);
        const me = await wpMe(data.token);
        return NextResponse.json({ user: me });
      }
    }

    return NextResponse.json(
      {
        error:
          "Google sign-in isn't fully wired on the store yet. Please use email + password.",
      },
      { status: 501 }
    );
  }

  // Demo mode
  jar.set(AUTH_COOKIE, demoSession(verified.email), cookieOptions);
  return NextResponse.json({
    user: { id: 0, email: verified.email, name: verified.name, demo: true },
  });
}

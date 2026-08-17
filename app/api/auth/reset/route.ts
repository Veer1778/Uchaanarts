// app/api/auth/reset/route.ts
//
// Two operations on one route:
//   POST { email }                     -> send a reset link
//   POST { user_id, token, password }  -> complete the reset
//
// The request-a-link response is deliberately identical whether or not the
// address has an account, so this cannot be used to discover which emails are
// registered.

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE, apiForgotPassword, apiResetPassword, cookieOptions } from "@/lib/auth";

export async function POST(req: Request) {
  let body: { email?: string; user_id?: number; token?: string; password?: string };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Completing a reset
  if (body.token && body.user_id) {
    if (!body.password || body.password.length < 6) {
      return NextResponse.json(
        { error: "Choose a password of at least 6 characters." },
        { status: 400 }
      );
    }

    const result = await apiResetPassword(body.user_id, body.token, body.password);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status || 400 });
    }

    // Signed in straight away with the new password.
    const jar = await cookies();
    jar.set(AUTH_COOKIE, result.token, cookieOptions);
    return NextResponse.json({ user: result.user });
  }

  // Requesting a link
  if (!body.email) {
    return NextResponse.json({ error: "Enter your email address." }, { status: 400 });
  }

  const result = await apiForgotPassword(body.email);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status || 400 });
  }

  return NextResponse.json({ message: result.message });
}

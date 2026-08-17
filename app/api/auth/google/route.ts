// app/api/auth/google/route.ts
//
// Exchanges a Google ID token for a session. The credential comes from the
// Google Identity Services button in the browser; the CI3 API verifies it
// against Google and checks the aud claim before trusting it.

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE, apiGoogle, cookieOptions } from "@/lib/auth";

export async function POST(req: Request) {
  let credential: string | undefined;
  try {
    ({ credential } = await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!credential) {
    return NextResponse.json({ error: "Missing Google credential." }, { status: 400 });
  }

  const result = await apiGoogle(credential);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status || 401 });
  }

  const jar = await cookies();
  jar.set(AUTH_COOKIE, result.token, cookieOptions);

  return NextResponse.json({ user: result.user });
}

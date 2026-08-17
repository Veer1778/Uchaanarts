// app/api/auth/login/route.ts
//
// Email (or registered mobile) plus password. The CMS accepts either, since
// flexi_auth's identity_cols is ['uacc_email', 'uacc_username'].

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE, apiLogin, cookieOptions } from "@/lib/auth";

export async function POST(req: Request) {
  let identity: string | undefined;
  let password: string | undefined;

  try {
    const body = await req.json();
    // Accept `email` too, so the existing AuthContext call site works unchanged.
    identity = body.identity ?? body.email;
    password = body.password;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!identity || !password) {
    return NextResponse.json(
      { error: "Enter your email and password." },
      { status: 400 }
    );
  }

  const result = await apiLogin(identity, password);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status || 401 });
  }

  const jar = await cookies();
  jar.set(AUTH_COOKIE, result.token, cookieOptions);

  return NextResponse.json({ user: result.user });
}

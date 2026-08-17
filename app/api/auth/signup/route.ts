// app/api/auth/signup/route.ts
//
// Email + password registration. Creates the account via the CMS (which uses
// flexi_auth internally, so the account also works on the old site) and sets
// the session cookie, meaning the user is signed in immediately after signing up.

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE, apiSignup, cookieOptions } from "@/lib/auth";

export async function POST(req: Request) {
  let name: string | undefined;
  let email: string | undefined;
  let password: string | undefined;
  let phone: string | undefined;

  try {
    ({ name, email, password, phone } = await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!name || !email || !password) {
    return NextResponse.json(
      { error: "Name, email and password are required." },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "Choose a password of at least 6 characters." },
      { status: 400 }
    );
  }

  const result = await apiSignup(name, email, password, phone);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status || 400 });
  }

  const jar = await cookies();
  jar.set(AUTH_COOKIE, result.token, cookieOptions);

  return NextResponse.json({ user: result.user });
}

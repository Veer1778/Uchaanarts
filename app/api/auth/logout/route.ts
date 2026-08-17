// app/api/auth/logout/route.ts

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE, apiLogout } from "@/lib/auth";

export async function POST() {
  const jar = await cookies();
  const token = jar.get(AUTH_COOKIE)?.value;

  // Revoke server-side as well. Clearing the cookie alone would leave a
  // working token in anyone's hands who had already captured it.
  if (token) await apiLogout(token);

  jar.delete(AUTH_COOKIE);
  return NextResponse.json({ ok: true });
}

// app/api/account/profile/route.ts
//
// The session endpoint AuthContext polls on mount. Returns { user: null }
// rather than a 401 when signed out, so a logged-out visitor is a normal
// state and not a console error on every page load.

import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSessionUser();
  return NextResponse.json({ user });
}

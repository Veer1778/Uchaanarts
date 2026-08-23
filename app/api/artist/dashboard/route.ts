// app/api/artist/dashboard/route.ts
//
// Forwards the artist dashboard request with the bearer token attached
// server-side, so the token stays in the httpOnly cookie.

import { NextResponse } from "next/server";
import { apiAuthed } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = await apiAuthed<unknown>("/artist/dashboard");

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status || 400 });
  }
  return NextResponse.json(result.data);
}

// app/api/checkout/quote/route.ts
//
// Prices a cart. No authentication: a visitor should see the full total,
// including tax and delivery, before being asked to sign in.

import { NextResponse } from "next/server";

const API = process.env.NEXT_PUBLIC_API_URL || "https://uchaanarts.com/api";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  try {
    const res = await fetch(`${API}/checkout/quote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const data = await res.json();

    if (!res.ok || !data.success) {
      return NextResponse.json(
        { error: data?.error?.message ?? "Could not price your cart." },
        { status: res.status || 400 }
      );
    }
    return NextResponse.json(data.data);
  } catch {
    return NextResponse.json({ error: "Could not reach the server." }, { status: 502 });
  }
}

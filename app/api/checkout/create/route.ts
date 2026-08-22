// app/api/checkout/create/route.ts
//
// Creates the order and the matching Razorpay order. Authenticated: the CMS
// requires a buyer account on every order row.
//
// The bearer token is added here, server-side, from the httpOnly cookie. It
// never reaches the browser.

import { NextResponse } from "next/server";
import { apiAuthed } from "@/lib/auth";

type CreateResponse = {
  order_no: string;
  rzp_order_id: string;
  key_id: string;
  amount: number;
  currency: string;
  totals: { subtotal: number; gst: number; shipping: number; net: number };
  prefill: { name: string; email: string; contact: string };
};

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const result = await apiAuthed<CreateResponse>("/checkout/create", {
    method: "POST",
    body: JSON.stringify(body),
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status || 400 });
  }
  return NextResponse.json(result.data);
}

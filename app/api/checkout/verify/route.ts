// app/api/checkout/verify/route.ts
//
// Confirms a payment after the Razorpay modal closes.
//
// This is the fast path only. Razorpay's webhook is the authoritative
// confirmation, so an order still completes if the buyer closes the tab here.

import { NextResponse } from "next/server";
import { apiAuthed } from "@/lib/auth";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const result = await apiAuthed<{ order_no: string; paid: boolean; amount: number }>(
    "/checkout/verify",
    { method: "POST", body: JSON.stringify(body) }
  );

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status || 400 });
  }
  return NextResponse.json(result.data);
}

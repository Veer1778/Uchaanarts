// app/api/checkout/route.ts
//
// Rewritten off WooCommerce.
//
// Razorpay is not wired up yet, so this falls back to the gallery's existing
// sales channel: a prefilled WhatsApp enquiry. That keeps the buy path working
// rather than dead-ending, and it is what the client uses today anyway.
//
// When Razorpay lands, this becomes: POST the line items to the CMS, let it
// price them server-side and create the order, then return the Razorpay order
// id for the browser to open. Prices must never come from the client.

import { NextResponse } from "next/server";

const WHATSAPP_NUMBER = "918860277388";

type Line = {
  /** tbl_item.item_id. Named itemId now that wooId is gone. */
  itemId?: number;
  quantity: number;
  title: string;
};

export async function POST(req: Request) {
  let lines: Line[] = [];
  try {
    const body = await req.json();
    lines = Array.isArray(body?.lines) ? body.lines : [];
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (lines.length === 0) {
    return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
  }

  const message = encodeURIComponent(
    "Hi, I would like to purchase the following artwork(s) from Uchaan Arts:\n" +
      lines
        .map((l) => `• ${l.title}${l.quantity > 1 ? ` x${l.quantity}` : ""}`)
        .join("\n")
  );

  return NextResponse.json({
    checkoutUrl: `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${message}`,
    fallback: true,
  });
}

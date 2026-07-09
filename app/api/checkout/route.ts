import { NextResponse } from "next/server";
import { buildCheckoutUrl, wooEnabled } from "@/lib/woocommerce";

// POST /api/checkout
// body: { lines: [{ wooId?, quantity, title }] }
export async function POST(req: Request) {
  const body = await req.json();
  const lines: { wooId?: number; quantity: number; title: string }[] = body.lines ?? [];

  const ids = lines.map((l) => l.wooId).filter((id): id is number => typeof id === "number");

  // WooCommerce configured and every line maps to a product -> hosted checkout.
  if (wooEnabled && ids.length === lines.length && lines.length > 0) {
    const url = buildCheckoutUrl(ids);
    if (url) return NextResponse.json({ checkoutUrl: url });
  }

  // Fallback: WhatsApp enquiry (the gallery's current sales channel).
  const message = encodeURIComponent(
    "Hi, I would like to purchase the following artwork(s) from Uchaan Arts:\n" +
      lines.map((l) => `• ${l.title} x${l.quantity}`).join("\n")
  );
  return NextResponse.json({
    checkoutUrl: `https://api.whatsapp.com/send?phone=918860277388&text=${message}`,
    fallback: true,
  });
}

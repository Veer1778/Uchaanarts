// ---------------------------------------------------------------------------
// WooCommerce headless checkout.
//
// The storefront runs on Netlify; the store + checkout live in WooCommerce on
// GoDaddy. We don't rebuild checkout — we hand the buyer to WooCommerce's own
// hosted cart/checkout, which already supports Razorpay / UPI / cards via the
// installed payment plugin.
//
// Multi-item handoff uses WooCommerce's comma-separated add-to-cart
// (`?add-to-cart=12,15,18`). That needs a tiny snippet in the theme's
// functions.php — see wordpress/functions-snippets.php.
// ---------------------------------------------------------------------------

const WOO = process.env.NEXT_PUBLIC_WOO_URL?.replace(/\/$/, "");

export const wooEnabled = Boolean(WOO);

/** Build a WooCommerce cart URL that pre-adds the given product IDs. */
export function buildCheckoutUrl(productIds: number[]): string | null {
  if (!WOO || productIds.length === 0) return null;
  const ids = productIds.join(",");
  return `${WOO}/cart/?add-to-cart=${ids}`;
}

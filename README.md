# Uchaan Arts — Gallery & Store

A modern rebuild of [uchaanarts.com](https://www.uchaanarts.com), designed after
the Figma references (Playfair serif, heavy-caps "Artwork Exhibition" hero,
Uchaan red `#EB0000`).

## Stack

| Layer      | Tech                                                        |
| ---------- | ----------------------------------------------------------- |
| Frontend   | Next.js 15 (App Router) + React 19                          |
| Styling    | Tailwind CSS v4                                             |
| Animations | GSAP + Motion                                               |
| CMS + Store| **WordPress + WooCommerce** (hosted on GoDaddy)            |
| Hosting    | **Netlify** (`@netlify/plugin-nextjs`)                      |
| Payments   | WooCommerce checkout (Razorpay/UPI/cards via a WP plugin)   |

## Run locally

```bash
npm install
npm run dev
```

Works with **zero configuration** — a demo dataset in `lib/data.ts` (real Uchaan
artworks/artists) powers the whole site until WordPress is connected. Checkout
falls back to a WhatsApp enquiry until WooCommerce is wired up.

## Connect WordPress + WooCommerce (GoDaddy)

1. Follow `wordpress/README.md` and paste `wordpress/functions-snippets.php`
   into your theme — it registers the Artist/Exhibition post types, exposes ACF
   to REST, enables multi-item add-to-cart, and sets CORS for the Netlify URL.
2. Add products in WooCommerce (name, price, featured image, category, and the
   `Artist` / `Medium` / `Size` attributes).
3. Set env vars (see `.env.example`): `NEXT_PUBLIC_WP_URL`, `NEXT_PUBLIC_WOO_URL`,
   and `WP_IMAGE_HOST`.

`lib/cms.ts` switches from demo data to live WordPress/WooCommerce automatically
once `NEXT_PUBLIC_WP_URL` is present. The client lives in `lib/wordpress.ts`
(WP REST + WooCommerce Store API) and `lib/woocommerce.ts` (checkout handoff).

## Deploy to Netlify

1. Push to GitHub, "Add new site" → import the repo.
2. Netlify auto-detects Next.js; `netlify.toml` pins Node 20 and the Next plugin.
3. Add the env vars above under Site settings → Environment variables.

Checkout flow: local cart (persisted in `localStorage`) → `POST /api/checkout`
→ builds a WooCommerce `/cart/?add-to-cart=…` URL → buyer completes payment on
WooCommerce. No secret keys live in the frontend.

## Pages

Home (collage hero, featured masonry, categories, price, exhibitions, journal,
trust badges) · `/art-gallery` (left filter sidebar + masonry of cards) ·
`/art/[slug]` (Mojarto-style product page) · `/artists` + `/artists/[slug]` ·
`/exhibitions` · `/blog` + `/blog/[slug]` · `/wishlist` · `/about`.

## Notes
- `public/logo.png` is the Uchaan Arts logo, used in the header and loader.
- Every route has a branded loading state (`app/**/loading.tsx`).
- The demo dataset hotlinks images from uchaanarts.com; once products live in
  WooCommerce, images serve from your WordPress media library.

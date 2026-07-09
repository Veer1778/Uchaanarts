# WordPress + WooCommerce setup (GoDaddy)

The Next.js storefront (Netlify) reads content from this WordPress install.

## 1. Install
- WooCommerce (products = artworks)
- Advanced Custom Fields (ACF) — for Artist/Exhibition fields
- A payment gateway for India (e.g. Razorpay for WooCommerce) — UPI/cards/netbanking

## 2. Add the snippets
Paste `functions-snippets.php` into your theme's `functions.php` (child theme) or
a Code Snippets plugin. It registers the Artist + Exhibition post types, exposes
ACF to REST, enables multi-item add-to-cart, and sets CORS for your Netlify URL.

## 3. Product attributes (per WooCommerce product)
Create global attributes under **Products → Attributes**: `Artist`, `Medium`,
`Size`. Set them on each product. Put the artwork price in the product's price,
the photo as the featured image, and pick a product **category** from:
Painting, Sculpture, Serigraph, Photography, Digital Art, Folk Art.

## 4. ACF fields
- **Artist** post type: `location` (text), `bio` (textarea), `featured` (true/false)
- **Exhibition** post type: `artist_line`, `venue`, `start` (date), `end` (date), `blurb`
Enable "Show in REST API" on the field group.

## 5. Point the storefront at this site
In Netlify env vars set `NEXT_PUBLIC_WP_URL` and `NEXT_PUBLIC_WOO_URL` to this
WordPress URL (usually the same). The storefront switches from demo data to live
content automatically.

## Endpoints used
- Products:     `/wp-json/wc/store/v1/products`
- Posts:        `/wp-json/wp/v2/posts?_embed`
- Artists:      `/wp-json/wp/v2/artist?_embed`
- Exhibitions:  `/wp-json/wp/v2/exhibition?_embed`

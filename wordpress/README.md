# WordPress + WooCommerce setup (headless, GraphQL, no ACF)

The Next.js storefront talks to WordPress through a single **WPGraphQL**
endpoint (`/graphql`). Custom fields are native registered post meta exposed to
the GraphQL schema, so **ACF is not needed**.

## 1. Plugins

Keep: **WooCommerce**, **WPGraphQL**, **Rank Math**, **Redirection**,
**SVG Support**, **Copy & Delete Posts**, **Code Snippets** (optional).

Install: **WPGraphQL for WooCommerce (WooGraphQL)** — required for `products`.

Remove: **ACF** and **WPGraphQL for ACF** (this plugin replaces both).

## 2. Install this plugin

Put `uchaan-headless.php` in `wp-content/plugins/uchaan-headless/` and activate.
It provides:

- `artist` + `exhibition` post types (skipped if CPT UI already made them), and
  forces `show_in_graphql` on them either way
- Their fields as **native post meta**, exposed to the GraphQL schema
  (snake_case meta becomes camelCase fields: `artist_line` -> `artistLine`)
- A simple "Details" panel in the editor for those fields
- CORS for the storefront origin (edit `uchaan_allowed_origins()` at the top)
- Multi-item add-to-cart (`/cart/?add-to-cart=12,15,18`) for checkout handoff
- Renames "Products" to "Artworks" in the admin

## 3. Fields

**Artist**: `location` (text), `bio` (textarea), `featured` (checkbox)
**Exhibition**: `artist_line`, `venue`, `start` (date), `end` (date), `blurb`

Titles and featured images come from WordPress itself.

## 4. Artworks = WooCommerce products

Create global attributes under **Products → Attributes**: `Artist`, `Medium`,
`Size`, `Style` and `Folk Form`. Set them on each product. `Style` uses the same
taxonomy as the current site (Realistic, Abstract, Impressionism, Contemporary,
Portraits, Figurative, Landscape, Banaras, Ganesha, and so on) and `Folk Form`
covers Gond, Pichawai, Madhubani, Thangka, Pattachitra, Warli, Phad, Kalighat,
Kerala Mural, Mural and Tanjore. Use them (not custom taxonomies) because
attributes come through WooGraphQL, custom taxonomies don't.

Per product: name = artwork title, featured image = the photo, regular price =
price in INR, and pick a product **category** from: Painting, Sculpture,
Serigraph, Photography, Digital Art, Folk Art.

The `Artist` attribute value must match the Artist post title, so the storefront
can link the artwork to `/artists/<slug>`.

## 5. Point the storefront at this site

Set `NEXT_PUBLIC_WP_URL` and `NEXT_PUBLIC_WOO_URL` (usually the same URL), plus
`WP_IMAGE_HOST`. The storefront then switches from demo data to live content.

## Testing the schema

Open **GraphQL → GraphiQL IDE** in wp-admin and run:

```graphql
{
  artists(first: 5)     { nodes { slug title location bio featured } }
  exhibitions(first: 5) { nodes { slug title venue start end } }
  posts(first: 5)       { nodes { slug title } }
  products(first: 5)    { nodes { slug name ... on SimpleProduct { price(format: RAW) } } }
}
```

If all four return data, the storefront will work. If `artists` is missing from
the schema, this plugin isn't active. If `products` is missing, install
WooGraphQL.

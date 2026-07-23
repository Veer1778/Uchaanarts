<?php
/**
 * Uchaan Arts — WordPress/WooCommerce snippets for the headless Next.js
 * storefront (hosted on Netlify). Paste these into your theme's functions.php
 * (or a small "Code Snippets" plugin) on the GoDaddy-hosted WordPress site.
 */

/* 1) Custom post types: Artist + Exhibition, exposed to the REST API -------- */
add_action('init', function () {
  register_post_type('artist', [
    'label'        => 'Artists',
    'public'       => true,
    'show_in_rest' => true,          // enables /wp-json/wp/v2/artist
    'rest_base'    => 'artist',
    'supports'     => ['title', 'editor', 'thumbnail'],
    'menu_icon'    => 'dashicons-admin-users',
  ]);

  register_post_type('exhibition', [
    'label'        => 'Exhibitions',
    'public'       => true,
    'show_in_rest' => true,          // enables /wp-json/wp/v2/exhibition
    'rest_base'    => 'exhibition',
    'supports'     => ['title', 'editor', 'thumbnail'],
    'menu_icon'    => 'dashicons-calendar-alt',
  ]);
});

/* 2) Expose ACF fields on those CPTs to REST as `acf`.
 *    (ACF PRO: Settings -> "Show in REST API" = Yes. Or use the filter below.)
 *    Artist fields:     location (text), bio (textarea), featured (true/false)
 *    Exhibition fields: artist_line, venue, start (date), end (date), blurb
 */
add_filter('acf/settings/rest_api_format', function () {
  return 'standard';
});

/* 3) Allow WooCommerce comma-separated add-to-cart, so the Next.js cart can
 *    hand off multiple items in one link: /cart/?add-to-cart=12,15,18
 */
add_filter('woocommerce_add_to_cart_handler', function ($handler, $product) {
  return $handler;
}, 10, 2);

add_action('wp_loaded', function () {
  if (isset($_REQUEST['add-to-cart']) && is_string($_REQUEST['add-to-cart'])
      && strpos($_REQUEST['add-to-cart'], ',') !== false) {
    $ids = array_filter(array_map('absint', explode(',', $_REQUEST['add-to-cart'])));
    if (!empty($ids) && function_exists('WC')) {
      foreach ($ids as $id) {
        WC()->cart->add_to_cart($id);
      }
      unset($_REQUEST['add-to-cart']);
      $_GET['add-to-cart'] = '';
    }
  }
}, 20);

/* 4) CORS: let the Netlify site read the REST + Store API. Replace the origin. */
add_action('rest_api_init', function () {
  remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
  add_filter('rest_pre_serve_request', function ($value) {
    header('Access-Control-Allow-Origin: https://uchaanarts.netlify.app');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    return $value;
  });
}, 15);

/* 5) WooCommerce product mapping expected by the storefront:
 *    - Product name        -> artwork title
 *    - Featured image      -> artwork image
 *    - Regular price       -> price (INR)
 *    - Product category    -> Painting / Sculpture / Serigraph / Photography /
 *                             Digital Art / Folk Art
 *    - Custom product attributes (Products -> Attributes), set per product:
 *        Artist  (e.g. "Pankaj Bawdekar")   -> maps to /artists/<slug>
 *        Medium  (e.g. "Acrylic on Canvas")
 *        Size    (e.g. "30 x 30 in")
 */

/* 6) REST route for the cross-device wishlist (called from /api/account/wishlist).
 *    Stores the slug array as user meta. Auth via the JWT token in the header. */
add_action('rest_api_init', function () {
  register_rest_route('uchaan/v1', '/wishlist', [
    [
      'methods'  => 'GET',
      'callback' => function () {
        if (!is_user_logged_in()) return new WP_Error('unauth', 'Sign in required', ['status' => 401]);
        $slugs = get_user_meta(get_current_user_id(), 'uchaan_wishlist', true);
        return ['slugs' => is_array($slugs) ? array_values($slugs) : []];
      },
      'permission_callback' => '__return_true',
    ],
    [
      'methods'  => 'POST',
      'callback' => function (WP_REST_Request $req) {
        if (!is_user_logged_in()) return new WP_Error('unauth', 'Sign in required', ['status' => 401]);
        $slugs = $req->get_json_params()['slugs'] ?? [];
        if (!is_array($slugs)) $slugs = [];
        $slugs = array_slice(array_values(array_unique(array_map('sanitize_title', $slugs))), 0, 500);
        update_user_meta(get_current_user_id(), 'uchaan_wishlist', $slugs);
        return ['ok' => true, 'slugs' => $slugs];
      },
      'permission_callback' => '__return_true',
    ],
  ]);
});

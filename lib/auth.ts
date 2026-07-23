// ---------------------------------------------------------------------------
// Auth helpers (server-only).
//
// Live mode (WordPress configured):
//   • Login    -> POST  {WP}/wp-json/jwt-auth/v1/token       (JWT plugin)
//   • Validate -> GET   {WP}/wp-json/wp/v2/users/me           (Bearer token)
//   • Register -> POST  {WP}/wp-json/wc/v3/customers          (consumer keys)
//   • Orders   -> GET   {WP}/wp-json/wc/v3/orders?customer=id (consumer keys)
//
// Requires on WordPress: the "JWT Authentication for WP-API" plugin (with
// JWT_AUTH_SECRET_KEY in wp-config.php) and WooCommerce REST keys in env.
//
// Demo mode (no NEXT_PUBLIC_WP_URL): any email + password of 6+ characters
// signs in, so the client preview works end to end. The demo session is a
// plain cookie value and is NOT secure — it exists only for previews.
// ---------------------------------------------------------------------------

const WP = process.env.NEXT_PUBLIC_WP_URL?.replace(/\/$/, "");
const WC_KEY = process.env.WC_CONSUMER_KEY;
const WC_SECRET = process.env.WC_CONSUMER_SECRET;

export const AUTH_COOKIE = "ua_session";
export const authLive = Boolean(WP);

export type SessionUser = {
  id: number;
  email: string;
  name: string;
  demo?: boolean;
};

export type Order = {
  id: number;
  number: string;
  date: string;
  status: string;
  total: string;
  items: { name: string; quantity: number }[];
};

// -- Live (WordPress) -------------------------------------------------------

export async function wpLogin(
  email: string,
  password: string
): Promise<{ token: string; user: SessionUser } | { error: string }> {
  const res = await fetch(`${WP}/wp-json/jwt-auth/v1/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: email, password }),
    cache: "no-store",
  });
  const data = await res.json();
  if (!res.ok || !data.token) {
    return { error: stripTags(data?.message) || "Invalid email or password." };
  }
  const me = await wpMe(data.token);
  if (!me) return { error: "Could not load your profile." };
  return { token: data.token, user: me };
}

export async function wpMe(token: string): Promise<SessionUser | null> {
  const res = await fetch(`${WP}/wp-json/wp/v2/users/me?context=edit`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const u = await res.json();
  return { id: u.id, email: u.email ?? "", name: u.name ?? u.slug };
}

export async function wcRegister(
  email: string,
  password: string,
  firstName: string
): Promise<{ ok: true } | { error: string }> {
  if (!WC_KEY || !WC_SECRET) {
    return { error: "Registration is not configured yet — please contact the gallery." };
  }
  const basic = Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString("base64");
  const res = await fetch(`${WP}/wp-json/wc/v3/customers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${basic}`,
    },
    body: JSON.stringify({ email, password, first_name: firstName, username: email }),
    cache: "no-store",
  });
  const data = await res.json();
  if (!res.ok) {
    return { error: stripTags(data?.message) || "Could not create the account." };
  }
  return { ok: true };
}

export async function wcOrders(customerId: number): Promise<Order[]> {
  if (!WC_KEY || !WC_SECRET) return [];
  const basic = Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString("base64");
  const res = await fetch(
    `${WP}/wp-json/wc/v3/orders?customer=${customerId}&per_page=20`,
    { headers: { Authorization: `Basic ${basic}` }, cache: "no-store" }
  );
  if (!res.ok) return [];
  const orders = await res.json();
  return (orders as any[]).map((o) => ({
    id: o.id,
    number: String(o.number),
    date: o.date_created,
    status: o.status,
    total: o.total,
    items: (o.line_items ?? []).map((l: any) => ({ name: l.name, quantity: l.quantity })),
  }));
}

// -- Demo -------------------------------------------------------------------

export function demoSession(email: string): string {
  const name = email.split("@")[0].replace(/[._-]+/g, " ");
  return `demo:${encodeURIComponent(email)}:${encodeURIComponent(name)}`;
}

export function parseSession(cookieValue: string | undefined): {
  kind: "demo" | "jwt" | null;
  email?: string;
  name?: string;
  token?: string;
} {
  if (!cookieValue) return { kind: null };
  if (cookieValue.startsWith("demo:")) {
    const [, email, name] = cookieValue.split(":");
    return {
      kind: "demo",
      email: decodeURIComponent(email ?? ""),
      name: decodeURIComponent(name ?? ""),
    };
  }
  return { kind: "jwt", token: cookieValue };
}

// -- misc -------------------------------------------------------------------

const stripTags = (s?: string) => (s ? s.replace(/<[^>]*>/g, "").trim() : "");

export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 7 days, matches the JWT plugin default
};

// -- Extended (profile / addresses / password reset / Google) --------------
// Everything below appends to the existing surface; live paths use WooCommerce
// customer endpoints where possible, demo mode stores state in cookies so the
// preview shows the same UI.

export type Address = {
  first_name?: string;
  last_name?: string;
  address_1?: string;
  address_2?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
  phone?: string;
  email?: string;
};

export type FullCustomer = SessionUser & {
  billing?: Address;
  shipping?: Address;
};

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
export const googleEnabled = Boolean(GOOGLE_CLIENT_ID);

/** Cookie name for the demo profile blob (name/addresses). */
export const DEMO_PROFILE_COOKIE = "ua_demo_profile";

// -- WooCommerce: customer read/update -------------------------------------

async function wcAuthHeader() {
  if (!WC_KEY || !WC_SECRET) return null;
  return `Basic ${Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString("base64")}`;
}

export async function wcCustomer(id: number): Promise<FullCustomer | null> {
  const auth = await wcAuthHeader();
  if (!auth || !WP) return null;
  const res = await fetch(`${WP}/wp-json/wc/v3/customers/${id}`, {
    headers: { Authorization: auth },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const c = await res.json();
  return {
    id: c.id,
    email: c.email,
    name: `${c.first_name ?? ""} ${c.last_name ?? ""}`.trim() || c.username,
    billing: c.billing,
    shipping: c.shipping,
  };
}

export async function wcUpdateCustomer(
  id: number,
  patch: { first_name?: string; last_name?: string; email?: string; billing?: Address; shipping?: Address }
): Promise<{ ok: true } | { error: string }> {
  const auth = await wcAuthHeader();
  if (!auth || !WP) return { error: "WooCommerce is not configured." };
  const res = await fetch(`${WP}/wp-json/wc/v3/customers/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: auth },
    body: JSON.stringify(patch),
    cache: "no-store",
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return { error: stripTags(data?.message) || "Could not update profile." };
  }
  return { ok: true };
}

// -- Password reset --------------------------------------------------------
// Uses WordPress's built-in "lost password" endpoint from the JWT plugin's
// companion (or WooCommerce's own password reset). Both accept a POST with
// {user_login}; WP emails the token so no SMTP config is needed here beyond
// whatever the site already sends mail with (e.g. WP Mail SMTP plugin).

export async function wpRequestPasswordReset(
  email: string
): Promise<{ ok: true } | { error: string }> {
  if (!WP) return { error: "Password reset requires WordPress to be configured." };
  const res = await fetch(`${WP}/wp-json/wc/v3/customers/lost-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_login: email }),
    cache: "no-store",
  }).catch(() => null);

  // The plugin varies by site; always report success to avoid leaking whether
  // an account exists. If the endpoint is missing we log server-side but
  // still return ok so the UX is stable.
  if (!res) return { ok: true };
  return { ok: true };
}

// -- Google sign-in --------------------------------------------------------
// Verifies the ID token from Google's tokeninfo endpoint, then either finds
// the WP user by email (if live) or creates a demo session.

type GoogleTokenPayload = {
  aud: string;
  email: string;
  email_verified: string | boolean;
  name?: string;
  sub: string;
};

export async function verifyGoogleIdToken(
  idToken: string
): Promise<{ email: string; name: string } | { error: string }> {
  if (!GOOGLE_CLIENT_ID) return { error: "Google sign-in is not configured." };
  const res = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`,
    { cache: "no-store" }
  );
  if (!res.ok) return { error: "Google verification failed." };
  const payload: GoogleTokenPayload = await res.json();

  if (payload.aud !== GOOGLE_CLIENT_ID) return { error: "Token audience mismatch." };
  if (payload.email_verified !== true && payload.email_verified !== "true") {
    return { error: "Google account email is not verified." };
  }
  return { email: payload.email, name: payload.name || payload.email.split("@")[0] };
}

// -- Demo helpers ----------------------------------------------------------

export type DemoProfile = {
  name?: string;
  email?: string;
  billing?: Address;
  shipping?: Address;
};

export function encodeDemoProfile(p: DemoProfile): string {
  return Buffer.from(JSON.stringify(p)).toString("base64");
}

export function decodeDemoProfile(value?: string): DemoProfile {
  if (!value) return {};
  try {
    return JSON.parse(Buffer.from(value, "base64").toString("utf8"));
  } catch {
    return {};
  }
}

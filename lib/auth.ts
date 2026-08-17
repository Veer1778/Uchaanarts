import "server-only";
import { cookies } from "next/headers";

/**
 * Server-side auth helper.
 *
 * The browser never holds the CMS token. It goes in an httpOnly cookie on
 * this app's own origin, and these helpers forward it to CodeIgniter as a
 * bearer header from the server. Two reasons that matters:
 *
 *  - The frontend and the CMS are on different origins today, so a cookie set
 *    by uchaanarts.com would be third-party and Safari would drop it.
 *  - A token in localStorage is readable by any injected script.
 *
 * When the app later moves onto the client's VPS this needs no change; it just
 * becomes same-origin.
 *
 * Replaces the old WordPress/WooCommerce version of this file entirely.
 */

const API = process.env.NEXT_PUBLIC_API_URL || "https://uchaanarts.com/api";

export const AUTH_COOKIE = "ua_token";

export const googleEnabled = Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
export const facebookEnabled = Boolean(process.env.NEXT_PUBLIC_FACEBOOK_APP_ID);

export type SessionUser = {
  id: number;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  phone?: string | null;
  avatar?: string | null;
  group?: number;
  isArtist?: boolean;
};

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  error?: { code: number; message: string };
};

export type AuthResult =
  | { ok: true; token: string; user: SessionUser }
  | { ok: false; error: string; status: number };

/** Thirty days, matching the token lifetime the API issues. */
const MAX_AGE = 60 * 60 * 24 * 30;

export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: MAX_AGE,
};

// ---------------------------------------------------------------------------
// Low-level call
// ---------------------------------------------------------------------------

async function callApi<T>(
  path: string,
  init: RequestInit = {}
): Promise<{ ok: true; data: T } | { ok: false; error: string; status: number }> {
  let res: Response;
  try {
    res = await fetch(`${API}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "uchaanarts-frontend/1.0",
        ...(init.headers ?? {}),
      },
      // Auth calls must never be served from cache.
      cache: "no-store",
    });
  } catch (e) {
    return {
      ok: false,
      status: 0,
      error:
        e instanceof Error
          ? `Could not reach the server: ${e.message}`
          : "Could not reach the server.",
    };
  }

  const text = await res.text();
  let body: ApiEnvelope<T>;
  try {
    body = JSON.parse(text);
  } catch {
    return {
      ok: false,
      status: res.status,
      error: `Unexpected response from the server (HTTP ${res.status}).`,
    };
  }

  if (!res.ok || !body.success) {
    return {
      ok: false,
      status: res.status,
      error: body?.error?.message ?? "Something went wrong.",
    };
  }

  return { ok: true, data: body.data };
}

/** Shapes a sign-in response from any provider into one result type. */
function toAuthResult(
  result: Awaited<ReturnType<typeof callApi<{ token: string; user: SessionUser }>>>
): AuthResult {
  if (!result.ok) return result;
  const { token, user } = result.data;
  if (!token || !user) {
    return { ok: false, status: 500, error: "Sign-in did not return a session.", };
  }
  return { ok: true, token, user };
}

// ---------------------------------------------------------------------------
// Sign-in methods
// ---------------------------------------------------------------------------

export async function apiLogin(identity: string, password: string): Promise<AuthResult> {
  return toAuthResult(
    await callApi<{ token: string; user: SessionUser }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ identity, password }),
    })
  );
}

export async function apiGoogle(credential: string): Promise<AuthResult> {
  return toAuthResult(
    await callApi<{ token: string; user: SessionUser }>("/auth/google", {
      method: "POST",
      body: JSON.stringify({ credential }),
    })
  );
}

export async function apiSignup(
  name: string,
  email: string,
  password: string,
  phone?: string
): Promise<AuthResult> {
  return toAuthResult(
    await callApi<{ token: string; user: SessionUser }>("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, password, phone }),
    })
  );
}

// ---------------------------------------------------------------------------
// Password reset
// ---------------------------------------------------------------------------

export async function apiForgotPassword(
  email: string
): Promise<{ ok: true; message: string } | { ok: false; error: string; status: number }> {
  const res = await callApi<{ message: string }>("/auth/forgot", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
  if (!res.ok) return res;
  return { ok: true, message: res.data.message };
}

export async function apiResetPassword(
  userId: number,
  token: string,
  password: string
): Promise<AuthResult> {
  return toAuthResult(
    await callApi<{ token: string; user: SessionUser }>("/auth/reset", {
      method: "POST",
      body: JSON.stringify({ user_id: userId, token, password }),
    })
  );
}

export async function apiFacebook(accessToken: string): Promise<AuthResult> {
  return toAuthResult(
    await callApi<{ token: string; user: SessionUser }>("/auth/facebook", {
      method: "POST",
      body: JSON.stringify({ access_token: accessToken }),
    })
  );
}

// ---------------------------------------------------------------------------
// Session
// ---------------------------------------------------------------------------

/** Reads the token from the httpOnly cookie. Server components only. */
export async function getToken(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(AUTH_COOKIE)?.value ?? null;
}

/** Current user, or null when signed out or the token has expired. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const token = await getToken();
  if (!token) return null;

  const res = await callApi<{ user: SessionUser }>("/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.ok ? res.data.user : null;
}

/** Revokes the token server-side. Clearing the cookie alone would leave it live. */
export async function apiLogout(token: string): Promise<void> {
  await callApi("/auth/logout", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  }).catch(() => undefined);
}

/** Authenticated call to any API endpoint on behalf of the signed-in user. */
export async function apiAuthed<T>(
  path: string,
  init: RequestInit = {}
): Promise<{ ok: true; data: T } | { ok: false; error: string; status: number }> {
  const token = await getToken();
  if (!token) return { ok: false, status: 401, error: "Not signed in." };

  return callApi<T>(path, {
    ...init,
    headers: { ...(init.headers ?? {}), Authorization: `Bearer ${token}` },
  });
}

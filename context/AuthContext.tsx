"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/**
 * Auth surface for the whole app.
 *
 * All network I/O goes through this app's own /api/auth/* and /api/account/*
 * routes, so the CMS token lives in an httpOnly cookie and never touches the
 * client bundle. Those routes forward it to CodeIgniter as a bearer header.
 *
 * Sign-in methods: Google, and email or registered mobile plus password.
 * Phone OTP exists on the API but is not wired up here while the client's SMS
 * gateway is out of service. Facebook is pending App Review.
 */

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

export type User = {
  id: number;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  phone?: string | null;
  avatar?: string | null;
  group?: number;
  isArtist?: boolean;
  billing?: Address;
  shipping?: Address;
};

type AuthState = {
  user: User | null;
  loading: boolean;
  /** `identity` may be an email address or a registered mobile number. */
  login: (identity: string, password: string) => Promise<string | null>;
  loginWithGoogle: (credential: string) => Promise<string | null>;
  updateProfile: (patch: Partial<User>) => Promise<string | null>;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

async function readError(res: Response, fallback: string): Promise<string> {
  try {
    const data = await res.json();
    return (data?.error as string) || fallback;
  } catch {
    return fallback;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/account/profile", { cache: "no-store" });
      const data = await res.json();
      setUser(data.user ?? null);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const login = useCallback(async (identity: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identity, password }),
      });
      if (!res.ok) return await readError(res, "Sign-in failed.");
      const data = await res.json();
      setUser(data.user ?? null);
      return null;
    } catch {
      return "Could not reach the server. Check your connection.";
    }
  }, []);

  const loginWithGoogle = useCallback(async (credential: string) => {
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential }),
      });
      if (!res.ok) return await readError(res, "Google sign-in failed.");
      const data = await res.json();
      setUser(data.user ?? null);
      return null;
    } catch {
      return "Could not reach the server. Check your connection.";
    }
  }, []);

  const updateProfile = useCallback(async (patch: Partial<User>) => {
    try {
      const res = await fetch("/api/account/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) return await readError(res, "Could not save your details.");
      const data = await res.json();
      setUser(data.user ?? null);
      return null;
    } catch {
      return "Could not reach the server. Check your connection.";
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      // Clear locally even if the revoke call failed, so the UI never shows
      // someone as signed in when they have asked to leave.
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, loginWithGoogle, updateProfile, refresh, logout }),
    [user, loading, login, loginWithGoogle, updateProfile, refresh, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

/** For components that render whether or not the provider is mounted. */
export function useAuthOptional(): AuthState | null {
  return useContext(AuthContext);
}

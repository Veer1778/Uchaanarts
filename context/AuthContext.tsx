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
 * Auth surface exposed to the whole app. All network I/O flows through the
 * `/api/auth/*` and `/api/account/*` routes so real credentials never touch
 * the client bundle and the httpOnly cookie can't be read from JS.
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
  demo?: boolean;
  billing?: Address;
  shipping?: Address;
};

type AuthState = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  register: (name: string, email: string, password: string) => Promise<string | null>;
  loginWithGoogle: (credential: string) => Promise<string | null>;
  requestPasswordReset: (email: string) => Promise<{ error?: string; message?: string }>;
  updateProfile: (patch: Partial<User>) => Promise<string | null>;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const r = await fetch("/api/account/profile");
      const d = await r.json();
      setUser(d.user ?? null);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) return (data.error as string) || "Sign-in failed.";
    await refresh();
    return null;
  }, [refresh]);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) return (data.error as string) || "Registration failed.";
      await refresh();
      return null;
    },
    [refresh]
  );

  const loginWithGoogle = useCallback(
    async (credential: string) => {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential }),
      });
      const data = await res.json();
      if (!res.ok) return (data.error as string) || "Google sign-in failed.";
      await refresh();
      return null;
    },
    [refresh]
  );

  const requestPasswordReset = useCallback(async (email: string) => {
    const res = await fetch("/api/auth/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) return { error: (data.error as string) || "Could not send reset email." };
    return { message: data.message as string };
  }, []);

  const updateProfile = useCallback(
    async (patch: Partial<User>) => {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (!res.ok) return (data.error as string) || "Could not save changes.";
      await refresh();
      return null;
    },
    [refresh]
  );

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      loading,
      login,
      register,
      loginWithGoogle,
      requestPasswordReset,
      updateProfile,
      refresh,
      logout,
    }),
    [user, loading, login, register, loginWithGoogle, requestPasswordReset, updateProfile, refresh, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Like useAuth, but returns null instead of throwing when the provider
 * isn't in the tree (used by leaf components rendered on the not-found
 * page and other prerender-only routes). */
export function useAuthOptional() {
  return useContext(AuthContext);
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

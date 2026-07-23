"use client";

/* Auth-gated: skip prerender so `useAuth()` never runs without a provider. */
export const dynamic = "force-dynamic";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "@/context/AuthContext";
import GoogleSignInButton from "@/components/GoogleSignInButton";

/**
 * /login — a single page that hosts three modes:
 *   • signin  — email + password, plus Google
 *   • register — name, email, password
 *   • reset   — request a password reset email
 * A ?next=<url> query redirects there after a successful sign-in.
 */

type Mode = "signin" | "register" | "reset";

function LoginInner() {
  const {
    user,
    loading,
    login,
    register,
    loginWithGoogle,
    requestPasswordReset,
  } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/account";
  const initial = (params.get("mode") as Mode) || "signin";

  const [mode, setMode] = useState<Mode>(initial);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace(next);
  }, [loading, user, router, next]);

  useEffect(() => {
    setError(null);
    setNotice(null);
  }, [mode]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setBusy(true);
    let err: string | null = null;
    let msg: string | undefined;
    if (mode === "signin") err = await login(email, password);
    else if (mode === "register") err = await register(name, email, password);
    else {
      const r = await requestPasswordReset(email);
      err = r.error ?? null;
      msg = r.message;
    }
    setBusy(false);
    if (err) setError(err);
    else if (mode === "reset") setNotice(msg ?? "Check your inbox for a reset link.");
    else router.replace(next);
  };

  const onGoogle = async (credential: string) => {
    setBusy(true);
    const err = await loginWithGoogle(credential);
    setBusy(false);
    if (err) setError(err);
    else router.replace(next);
  };

  return (
    <main className="relative mx-auto grid min-h-[80vh] max-w-md place-items-center px-5 py-16">
      <div className="aura -right-32 top-0 h-80 w-80 opacity-60" />

      <div className="relative w-full">
        {/* Mode switch */}
        {mode !== "reset" && (
          <div className="mb-6 flex gap-6 text-xs uppercase tracking-[0.28em]">
            {(["signin", "register"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`transition-colors ${
                  mode === m ? "text-signal" : "text-muted hover:text-ink"
                }`}
              >
                {m === "signin" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>
        )}

        <h1 className="mb-2 font-display text-4xl leading-tight">
          {mode === "signin" && "Welcome back."}
          {mode === "register" && "Join the collection."}
          {mode === "reset" && "Reset password."}
        </h1>
        <p className="mb-8 text-sm text-muted">
          {mode === "signin" && "Sign in to view orders, save works and track exhibitions."}
          {mode === "register" && "Create an account to buy artworks and save your wishlist."}
          {mode === "reset" &&
            "Enter your account email and we'll send you a link to reset your password."}
        </p>

        <form onSubmit={submit} className="space-y-4">
          <AnimatePresence mode="popLayout" initial={false}>
            {mode === "register" && (
              <motion.div
                key="name"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
              >
                <Field
                  label="Full name"
                  type="text"
                  value={name}
                  onChange={setName}
                  autoComplete="name"
                  required
                />
              </motion.div>
            )}
          </AnimatePresence>

          <Field
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            autoComplete="email"
            required
          />

          {mode !== "reset" && (
            <Field
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              hint={mode === "register" ? "At least 6 characters." : undefined}
              required
            />
          )}

          {error && (
            <p className="rounded-sm border border-signal/30 bg-signal/5 px-3 py-2 text-sm text-signal">
              {error}
            </p>
          )}
          {notice && (
            <p className="rounded-sm border border-line bg-wash px-3 py-2 text-sm text-muted">
              {notice}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full bg-ink px-5 py-3 text-xs uppercase tracking-[0.28em] text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {busy
              ? "Please wait…"
              : mode === "signin"
              ? "Sign in"
              : mode === "register"
              ? "Create account"
              : "Send reset link"}
          </button>

          {mode === "signin" && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => setMode("reset")}
                className="text-xs text-muted underline underline-offset-2 hover:text-ink"
              >
                Forgot password?
              </button>
            </div>
          )}
        </form>

        {mode !== "reset" && (
          <>
            <div className="my-6 flex items-center gap-3 text-[10px] uppercase tracking-[0.28em] text-faint">
              <hr className="flex-1 border-line" />
              or
              <hr className="flex-1 border-line" />
            </div>
            <div className="flex justify-center">
              <GoogleSignInButton
                onCredential={onGoogle}
                label={mode === "signin" ? "signin_with" : "signup_with"}
              />
            </div>
          </>
        )}

        {mode === "reset" && (
          <button
            type="button"
            onClick={() => setMode("signin")}
            className="mt-6 text-xs uppercase tracking-[0.28em] text-muted hover:text-ink"
          >
            ← Back to sign in
          </button>
        )}

        <p className="mt-8 text-center text-xs text-muted">
          By continuing you agree to Uchaan's{" "}
          <Link href="/about" className="underline underline-offset-2">
            terms
          </Link>
          .
        </p>
      </div>
    </main>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
  autoComplete,
  required,
  hint,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  required?: boolean;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] uppercase tracking-[0.24em] text-muted">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        required={required}
        className="w-full border border-line bg-transparent px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ink"
      />
      {hint && <span className="mt-1 block text-[11px] text-faint">{hint}</span>}
    </label>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh]" />}>
      <LoginInner />
    </Suspense>
  );
}

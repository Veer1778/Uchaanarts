"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "@/context/AuthContext";
import GoogleSignInButton from "@/components/GoogleSignInButton";

/**
 * /login — a two-panel sign-in.
 *
 * Left: a full-bleed artwork with a quiet quotation, so the page feels like
 * part of the gallery rather than a utility form. Right: the form itself,
 * generously spaced, hairline-ruled inputs, no boxes or shadows.
 *
 * Three modes live here: signin, register and reset. `?next=` redirects after
 * success; `?mode=register` deep-links to the register tab.
 */

type Mode = "signin" | "register" | "reset";

/* The plate rotates on each visit so the page feels like part of a living
   collection. Chosen after mount to avoid a server/client hydration mismatch. */
const PLATES = [
  {
    src: "https://www.uchaanarts.com/uploaded_files/itempic/thumbmain/1732105315_raghu_neware_search_of_eternity-1203__36x36_oil_on_canvas_180000.jpg",
    title: "Search of Eternity",
    artist: "Raghu Neware",
  },
  {
    src: "https://www.uchaanarts.com/uploaded_files/itempic/thumbmain/1740229981_pankaj_bawadekar.jpg",
    title: "Procession",
    artist: "Pankaj Bawdekar",
  },
  {
    src: "https://www.uchaanarts.com/uploaded_files/itempic/thumbmain/1747563640_horse_resonance_1.JPG",
    title: "Horse, Resonance",
    artist: "Vinay Sharma",
  },
  {
    src: "https://www.uchaanarts.com/uploaded_files/slider/1724254173_wash_copy.jpg",
    title: "Monsoon Wash",
    artist: "Sanjay Sarfare",
  },
  {
    src: "https://www.uchaanarts.com/uploaded_files/itempic/thumbmain/1744531634_whatsapp_image_2025-04-12_at_190101_5eb25f3e.jpg",
    title: "Market Hustle",
    artist: "Yashwant Shirwadkar",
  },
  {
    src: "https://www.uchaanarts.com/uploaded_files/itempic/thumbmain/1741109721_su.jpg",
    title: "Maya",
    artist: "Sunil Kale",
  },
];

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
  // Index 0 renders on the server; a random plate is chosen once mounted.
  const [plate, setPlate] = useState(0);
  useEffect(() => {
    setPlate(Math.floor(Math.random() * PLATES.length));
  }, []);

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
    <main className="grid min-h-[calc(100vh-72px)] lg:grid-cols-2">
      {/* ---------- Plate ---------- */}
      <aside className="relative hidden overflow-hidden bg-wash lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={PLATES[plate].src}
          src={PLATES[plate].src}
          alt={`${PLATES[plate].title} by ${PLATES[plate].artist}`}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-ink/50" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <p className="label text-paper/70">Uchaan Arts · Est 2009</p>

          <div className="max-w-sm">
            <p className="font-display text-3xl italic leading-snug text-paper">
              Every work here was chosen to be lived with, not merely looked at.
            </p>

            {/* Credit for the work on show */}
            <div className="mt-8 border-t border-paper/25 pt-5">
              <p className="font-display text-lg text-paper">
                {PLATES[plate].title}
              </p>
              <p className="mt-0.5 text-sm text-paper/60">
                {PLATES[plate].artist} · Delhi &amp; Gurgaon
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* ---------- Form ---------- */}
      <div className="flex items-center justify-center px-6 py-16 sm:px-12">
        <div className="w-full max-w-sm">
          <p className="label mb-6 text-muted">
            {mode === "reset" ? "Account recovery" : "Client access"}
          </p>

          <h1 className="font-display text-4xl leading-tight sm:text-[2.75rem]">
            {mode === "signin" && "Welcome back"}
            {mode === "register" && "Create an account"}
            {mode === "reset" && "Reset password"}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            {mode === "signin" &&
              "Sign in to follow artists, keep a private wishlist and track your acquisitions."}
            {mode === "register" &&
              "Save works you love, and collect from the gallery with your details remembered."}
            {mode === "reset" &&
              "Enter the email on your account and we'll send a link to set a new password."}
          </p>

          <form onSubmit={submit} className="mt-10 space-y-6">
            <AnimatePresence mode="popLayout" initial={false}>
              {mode === "register" && (
                <motion.div
                  key="name"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
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
                hint={mode === "register" ? "At least six characters." : undefined}
                required
              />
            )}

            {error && (
              <p className="border-l-2 border-ink pl-3 text-sm text-ink">{error}</p>
            )}
            {notice && (
              <p className="border-l-2 border-line pl-3 text-sm text-muted">
                {notice}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full bg-ink px-5 py-3.5 text-sm text-paper transition-opacity hover:opacity-85 disabled:opacity-50"
            >
              {busy
                ? "One moment…"
                : mode === "signin"
                ? "Sign in"
                : mode === "register"
                ? "Create account"
                : "Send reset link"}
            </button>
          </form>

          {mode !== "reset" && (
            <>
              <div className="my-8 flex items-center gap-4 text-xs text-faint">
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

          {/* Mode switching, kept as quiet text rather than tabs */}
          <div className="mt-10 space-y-2 border-t border-line pt-6 text-sm">
            {mode === "signin" && (
              <>
                <p className="text-muted">
                  New to Uchaan?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("register")}
                    className="text-ink underline underline-offset-4"
                  >
                    Create an account
                  </button>
                </p>
                <p className="text-muted">
                  <button
                    type="button"
                    onClick={() => setMode("reset")}
                    className="underline underline-offset-4 hover:text-ink"
                  >
                    Forgotten your password?
                  </button>
                </p>
              </>
            )}
            {mode === "register" && (
              <p className="text-muted">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("signin")}
                  className="text-ink underline underline-offset-4"
                >
                  Sign in
                </button>
              </p>
            )}
            {mode === "reset" && (
              <button
                type="button"
                onClick={() => setMode("signin")}
                className="text-muted underline underline-offset-4 hover:text-ink"
              >
                Back to sign in
              </button>
            )}
          </div>

          <p className="mt-8 text-xs leading-relaxed text-faint">
            By continuing you agree to Uchaan&apos;s{" "}
            <Link href="/about" className="underline underline-offset-2">
              terms
            </Link>{" "}
            and{" "}
            <Link href="/about" className="underline underline-offset-2">
              privacy policy
            </Link>
            .
          </p>
        </div>
      </div>
    </main>
  );
}

/** Hairline-ruled input: no box, just a baseline that darkens on focus. */
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
      <span className="mb-2 block text-xs tracking-[0.12em] text-muted">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        required={required}
        className="w-full border-0 border-b border-line bg-transparent px-0 py-2 text-[15px] text-ink outline-none transition-colors placeholder:text-faint focus:border-ink"
      />
      {hint && <span className="mt-2 block text-xs text-faint">{hint}</span>}
    </label>
  );
}

export default function LoginView() {
  return (
    <Suspense fallback={<div className="min-h-[60vh]" />}>
      <LoginInner />
    </Suspense>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

/**
 * /account/profile — edit name and email. Live mode PATCHes the WooCommerce
 * customer; demo mode stores the change in a demo-profile cookie.
 */
export default function ProfilePage() {
  const { user, loading, updateProfile } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/login?next=/account/profile");
  }, [loading, user, router]);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  if (loading || !user) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setSaved(false);
    const err = await updateProfile({ name, email });
    setBusy(false);
    if (err) setError(err);
    else setSaved(true);
  };

  return (
    <main className="mx-auto max-w-2xl px-5 py-16">
      <Link
        href="/account"
        className="mb-6 inline-block text-[11px] uppercase tracking-[0.28em] text-muted hover:text-ink"
      >
        ← Back to account
      </Link>
      <h1 className="mb-8 font-display text-4xl">Profile</h1>

      <form onSubmit={submit} className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-[11px] uppercase tracking-[0.24em] text-muted">
            Name
          </span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border border-line bg-transparent px-3 py-2.5 text-sm outline-none focus:border-ink"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-[11px] uppercase tracking-[0.24em] text-muted">
            Email
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-line bg-transparent px-3 py-2.5 text-sm outline-none focus:border-ink"
          />
        </label>

        {error && (
          <p className="rounded-sm border border-signal/30 bg-signal/5 px-3 py-2 text-sm text-signal">
            {error}
          </p>
        )}
        {saved && (
          <p className="rounded-sm border border-line bg-wash px-3 py-2 text-sm text-muted">
            Changes saved.
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="bg-ink px-6 py-3 text-xs uppercase tracking-[0.28em] text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {busy ? "Saving…" : "Save changes"}
        </button>
      </form>
    </main>
  );
}

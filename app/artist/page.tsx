"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Lock, Star } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { formatINR } from "@/lib/data";

/**
 * Artist portal — read only.
 *
 * The gallery decided artists view their profile and works but cannot upload
 * or edit; gallery staff manage all content in the CMS. So this is a window
 * onto their own record, not an editor.
 */

type Work = {
  id: number;
  slug: string;
  name: string;
  code: string | null;
  image: string | null;
  price: number | null;
  price_on_request: boolean;
  size: string | null;
  medium: string | null;
  year: number | null;
  listed: boolean;
};

type Dashboard = {
  profile: {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    city: string;
    bio: string | null;
    featured: boolean;
    avatar: string | null;
    slug: string;
  };
  stats: { listed: number; sold: number; total: number };
  listed: Work[];
  sold: Work[];
};

export default function ArtistPortalPage() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"listed" | "sold">("listed");

  useEffect(() => {
    if (authLoading || !user) return;
    fetch("/api/artist/dashboard", { cache: "no-store" })
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body?.error ?? "Could not load your work.");
        setData(body);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Something went wrong."))
      .finally(() => setLoading(false));
  }, [user, authLoading]);

  if (authLoading || (user && loading)) {
    return (
      <main className="flex min-h-[50vh] items-center justify-center">
        <Loader2 size={22} className="animate-spin text-muted" />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="mx-auto max-w-lg px-5 py-24 text-center">
        <Lock size={28} className="mx-auto text-muted" />
        <h1 className="mt-5 font-display text-3xl">Artist sign in</h1>
        <p className="mt-3 text-sm text-muted">
          Sign in to see the works the gallery has listed for you.
        </p>
        <Link
          href="/login"
          className="mt-7 inline-block bg-signal px-7 py-3 text-xs uppercase tracking-[0.16em] text-white transition-colors hover:bg-signal-dark"
        >
          Sign in
        </Link>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-lg px-5 py-24 text-center">
        <h1 className="font-display text-3xl">Not available</h1>
        <p className="mt-3 text-sm text-muted">{error}</p>
        <Link
          href="/account"
          className="mt-7 inline-block border border-line px-6 py-3 text-xs uppercase tracking-[0.16em] transition-colors hover:border-signal hover:text-signal"
        >
          Back to your account
        </Link>
      </main>
    );
  }

  if (!data) return null;

  const { profile, stats } = data;
  const works = tab === "sold" ? data.sold : data.listed;

  const tabClass = (t: typeof tab) =>
    `border-b-2 pb-2 text-sm transition-colors ${
      tab === t ? "border-signal text-ink" : "border-transparent text-muted hover:text-ink"
    }`;

  return (
    <main className="mx-auto max-w-[1200px] px-5 py-14 sm:px-8">
      {/* Profile */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full bg-wash">
          {profile.avatar && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatar} alt="" className="h-full w-full object-cover" />
          )}
        </div>

        <div className="flex-1">
          <p className="text-[11px] uppercase tracking-[0.24em] text-signal">
            Artist portal
          </p>
          <h1 className="mt-2 font-display text-3xl sm:text-4xl">{profile.name}</h1>
          <p className="mt-1 text-sm text-muted">
            {[profile.city, profile.email].filter(Boolean).join(" · ")}
          </p>

          {profile.featured && (
            <p className="mt-3 inline-flex items-center gap-1.5 bg-signal/10 px-3 py-1 text-xs text-signal">
              <Star size={12} className="fill-current" />
              Featured artist
            </p>
          )}

          <Link
            href={`/artists/${profile.slug}`}
            className="mt-3 block text-xs text-signal hover:underline"
          >
            View your public profile →
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-10 grid grid-cols-3 gap-4 border-y border-line py-6">
        {[
          { value: stats.listed, label: "Listed" },
          { value: stats.sold, label: "Sold" },
          { value: stats.total, label: "Total works" },
        ].map((s) => (
          <div key={s.label}>
            <p className="font-display text-3xl">{s.value}</p>
            <p className="mt-0.5 text-xs text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="mt-8 flex gap-6 border-b border-line">
        <button onClick={() => setTab("listed")} className={tabClass("listed")}>
          Listed works
        </button>
        <button onClick={() => setTab("sold")} className={tabClass("sold")}>
          Sold
        </button>
      </div>

      {/* Works */}
      {works.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted">
              {tab === "sold"
                ? "No works sold yet."
                : "No works listed yet. The gallery adds work to your profile."}
            </p>
          ) : (
            <div className="mt-8 grid gap-6 sm:grid-cols-3 lg:grid-cols-4">
              {works.map((w) => (
                <Link key={w.id} href={`/art/${w.slug}`} className="group">
                  <div className="relative aspect-[3/4] overflow-hidden bg-wash">
                    {w.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={w.image}
                        alt={w.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                    {!w.listed && (
                      <span className="absolute left-2 top-2 bg-ink/80 px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-paper">
                        Not live
                      </span>
                    )}
                  </div>
                  <p className="mt-2 truncate text-sm group-hover:text-signal">{w.name}</p>
                  <p className="truncate text-xs text-muted">{w.code}</p>
                  <p className="text-xs text-signal">
                    {w.price_on_request || !w.price
                      ? "Price on request"
                      : formatINR(w.price)}
                  </p>
                </Link>
              ))}
            </div>
      )}

      <p className="mt-12 border-t border-line pt-6 text-xs text-muted">
        To update your profile, biography or works, contact the gallery and the
        team will make the changes for you.
      </p>
    </main>
  );
}

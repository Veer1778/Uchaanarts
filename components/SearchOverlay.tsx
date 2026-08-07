"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Search, X, Loader2 } from "lucide-react";
import { api, formatPrice, type Artwork, type Artist } from "@/lib/api";

/**
 * Full-width search overlay, opened from the navbar or with Cmd/Ctrl+K.
 *
 * Queries /api/search directly from the browser (CORS is whitelisted for this
 * origin), debounced so typing doesn't fire a request per keystroke.
 */
export default function SearchOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  // Guards against a slow early request overwriting a fast later one.
  const requestId = useRef(0);

  const run = useCallback(async (q: string) => {
    const id = ++requestId.current;
    if (q.trim().length < 2) {
      setArtworks([]);
      setArtists([]);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.search(q.trim(), 8);
      if (id !== requestId.current) return; // a newer query already fired
      setArtworks(res.artworks);
      setArtists(res.artists);
    } catch (e) {
      if (id !== requestId.current) return;
      setError(e instanceof Error ? e.message : "Search failed");
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, []);

  // Debounce
  useEffect(() => {
    const t = setTimeout(() => run(query), 250);
    return () => clearTimeout(t);
  }, [query, run]);

  // Focus on open, reset on close
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 60);
      return () => clearTimeout(t);
    }
    setQuery("");
    setArtworks([]);
    setArtists([]);
    setError(null);
  }, [open]);

  // Escape to close, and lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  const submit = () => {
    if (query.trim().length < 2) return;
    onClose();
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const hasResults = artworks.length > 0 || artists.length > 0;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-ink/50 backdrop-blur-sm"
          />

          <motion.div
            key="panel"
            initial={{ y: -24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -24, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            role="dialog"
            aria-modal="true"
            aria-label="Search"
            className="fixed inset-x-0 top-0 z-[61] max-h-[85vh] overflow-y-auto bg-paper shadow-2xl"
          >
            <div className="mx-auto max-w-[1000px] px-5 py-6 sm:px-8">
              <div className="flex items-center gap-3 border-b border-line pb-4">
                <Search size={20} strokeWidth={1.5} className="shrink-0 text-muted" />
                <input
                  ref={inputRef}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                  placeholder="Search artworks and artists"
                  aria-label="Search artworks and artists"
                  className="w-full bg-transparent font-display text-xl outline-none placeholder:text-muted sm:text-2xl"
                />
                {loading && (
                  <Loader2 size={18} className="shrink-0 animate-spin text-muted" />
                )}
                <button
                  onClick={onClose}
                  aria-label="Close search"
                  className="shrink-0 text-muted transition-colors hover:text-ink"
                >
                  <X size={20} />
                </button>
              </div>

              {error && (
                <p className="py-8 text-center text-sm text-signal">{error}</p>
              )}

              {!error && query.trim().length >= 2 && !loading && !hasResults && (
                <p className="py-12 text-center text-sm text-muted">
                  Nothing found for &ldquo;{query.trim()}&rdquo;.
                </p>
              )}

              {artists.length > 0 && (
                <section className="pt-6">
                  <h3 className="mb-3 text-[11px] uppercase tracking-[0.18em] text-muted">
                    Artists
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {artists.map((a) => (
                      <Link
                        key={a.id}
                        href={`/artists/${a.slug}`}
                        onClick={onClose}
                        className="flex items-center gap-2 border border-line px-3 py-2 text-sm transition-colors hover:border-signal hover:text-signal"
                      >
                        {a.image && (
                          <Image
                            src={a.image}
                            alt=""
                            width={28}
                            height={28}
                            className="h-7 w-7 rounded-full object-cover"
                          />
                        )}
                        {a.name.trim()}
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {artworks.length > 0 && (
                <section className="py-6">
                  <h3 className="mb-3 text-[11px] uppercase tracking-[0.18em] text-muted">
                    Artworks
                  </h3>
                  <ul className="grid gap-3 sm:grid-cols-2">
                    {artworks.map((w) => (
                      <li key={w.id}>
                        <Link
                          href={`/art/${w.slug}`}
                          onClick={onClose}
                          className="flex items-center gap-3 border border-transparent p-2 transition-colors hover:border-line"
                        >
                          <div className="relative h-16 w-16 shrink-0 overflow-hidden bg-line">
                            {w.image && (
                              <Image
                                src={w.image}
                                alt=""
                                fill
                                sizes="64px"
                                className="object-cover"
                              />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm">{w.name}</p>
                            <p className="truncate text-xs text-muted">
                              {w.artist_name ?? ""}
                            </p>
                            <p className="text-xs text-signal">{formatPrice(w)}</p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={submit}
                    className="mt-2 w-full border border-line py-3 text-xs uppercase tracking-[0.18em] transition-colors hover:border-signal hover:text-signal"
                  >
                    See all results
                  </button>
                </section>
              )}

              {query.trim().length < 2 && (
                <p className="py-12 text-center text-sm text-muted">
                  Type at least two characters. Try an artist name, a title, or a
                  work code.
                </p>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Search, Bookmark, Menu, X, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuthOptional } from "@/context/AuthContext";
import SearchOverlay from "./SearchOverlay";

/**
 * Header — letterspaced UCHAAN / ARTS wordmark on the left, editorial nav
 * centred, and utilities plus a terracotta Enquire button on the right, as in
 * the client reference.
 */

const links = [
  { href: "/art-gallery", label: "Art" },
  { href: "/artists", label: "Artists" },
  { href: "/exhibitions", label: "Exhibitions" },
  { href: "/advisory", label: "Art Advisory" },
  { href: "/trade", label: "Corporate & Hospitality" },
  { href: "/blog", label: "Journal" },
  { href: "/about", label: "About" },
  { href: "/visit", label: "Visit" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { count, open } = useCart();
  const { count: wishCount } = useWishlist();
  const auth = useAuthOptional();
  const user = auth?.user ?? null;
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Cmd/Ctrl+K opens search from anywhere, the convention people expect.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
    <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    <header className="sticky top-0 z-40 bg-paper/95 backdrop-blur">
      <div className="mx-auto flex h-[68px] max-w-[1400px] items-stretch gap-4 px-5 sm:h-[76px] sm:gap-8 sm:px-8 lg:px-10">
        {/* Wordmark — the header rule starts after it, as in the reference */}
        <Link href="/" aria-label="Uchaan Arts home" className="flex shrink-0 flex-col justify-center">
          <span className="wordmark block text-[1.5rem] leading-none">UCHAAN</span>
          <span className="wordmark mt-1 block text-[0.62rem] text-muted">ARTS</span>
        </Link>

        {/* justify-end below lg: the nav is hidden there, so justify-between
            left-aligned the utilities and stranded whitespace to the right of
            the hamburger. */}
        <div className="flex flex-1 items-center justify-end gap-6 border-b border-line lg:justify-between">

        {/* Nav */}
        <nav className="hidden items-center gap-6 xl:gap-7 lg:flex">
          {links.map((l) => {
            const active = pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`relative whitespace-nowrap py-1 text-[13.5px] transition-colors ${
                  active ? "text-ink" : "text-muted hover:text-ink"
                }`}
              >
                {l.label}
                {active && (
                  <motion.span
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className="absolute -bottom-0.5 left-0 h-px w-full bg-signal"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Utilities */}
        <div className="flex shrink-0 items-center gap-3.5 sm:gap-4">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Search artworks"
            className="text-ink transition-colors hover:text-signal"
          >
            <Search size={18} strokeWidth={1.5} />
          </button>

          <Link
            href="/wishlist"
            aria-label={`Saved works, ${wishCount}`}
            className="relative text-ink transition-colors hover:text-signal"
          >
            <Bookmark size={18} strokeWidth={1.5} />
            {wishCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 grid h-4 w-4 place-items-center rounded-full bg-signal text-[10px] text-white">
                {wishCount}
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={open}
            aria-label={`Cart, ${count} items`}
            className="relative text-ink transition-colors hover:text-signal"
          >
            <ShoppingBag size={18} strokeWidth={1.5} />
            {count > 0 && (
              <span className="absolute -right-1.5 -top-1.5 grid h-4 w-4 place-items-center rounded-full bg-signal text-[10px] text-white">
                {count}
              </span>
            )}
          </button>

          {/* Two distinct actions. These were previously one button that read
              "Enquire" when signed out and "Account" when signed in, so a
              visitor wanting to contact the gallery was sent to a login form. */}
          <Link
            href="/enquire"
            className="hidden border border-line px-5 py-2.5 text-[13.5px] transition-colors hover:border-signal hover:text-signal sm:block"
          >
            Enquire
          </Link>

          {/* Artists land in the portal rather than the buyer account view. */}
          <Link
            href={user ? (user.isArtist ? "/artist" : "/account") : "/login"}
            className="btn-accent hidden px-6 py-2.5 text-[13.5px] sm:block"
          >
            {user ? (user.isArtist ? "My Work" : "Account") : "Sign in"}
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={menuOpen}
            className="text-ink lg:hidden"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-line lg:hidden"
          >
            <div className="mx-auto max-w-[1400px] px-5 py-3 sm:px-8">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="block border-b border-line py-3 font-display text-xl last:border-0"
                >
                  {l.label}
                </Link>
              ))}
              <Link
                href={user ? "/account" : "/login"}
                onClick={() => setMenuOpen(false)}
                className="btn-accent mt-4 inline-block px-6 py-3 text-sm"
              >
                {user ? "My account" : "Enquire"}
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
    </>
  );
}

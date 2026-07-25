"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Heart, ShoppingBag, Menu, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuthOptional } from "@/context/AuthContext";

/**
 * Navbar — editorial masthead: wordmark left, centred links, and a bracketed
 * "Sign up" control on the right, as in the reference. Hairline rules tie it
 * into the modular grid below.
 */

/* Primary nav is the catalogue itself: the shopper picks a medium straight
   from the header rather than hunting through editorial pages. */
const categoryLinks = [
  { href: "/art-gallery", label: "All Art" },
  { href: "/art-gallery?category=Painting", label: "Painting" },
  { href: "/art-gallery?category=Sculpture", label: "Sculpture" },
  { href: "/art-gallery?category=Serigraph", label: "Serigraph" },
  { href: "/art-gallery?category=Photography", label: "Photography" },
  { href: "/art-gallery?category=Folk%20Art", label: "Folk Art" },
  { href: "/art-gallery?category=Digital%20Art", label: "Digital Art" },
];

/* Editorial pages move to the secondary row / mobile drawer. */
const secondaryLinks = [
  { href: "/artists", label: "Artists" },
  { href: "/exhibitions", label: "Exhibitions" },
  { href: "/blog", label: "Journal" },
  { href: "/about", label: "About" },
];

export default function Navbar() {
  const pathname = usePathname();
  // Category links differ only by their query string. useSearchParams() would
  // opt every page out of static rendering from the root layout, so the query
  // is read on the client after mount instead.
  const [current, setCurrent] = useState(pathname);
  useEffect(() => {
    setCurrent(`${pathname}${window.location.search}`);
  }, [pathname]);
  const { count, open } = useCart();
  const { count: wishCount } = useWishlist();
  // Optional: the Navbar renders on /_not-found too, which prerenders
  // without AuthProvider around it.
  const auth = useAuthOptional();
  const user = auth?.user ?? null;
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
      <div className="mx-auto flex h-[72px] max-w-[1400px] items-center justify-between gap-6 px-6 sm:px-10">
        {/* Logo */}
        <Link href="/" aria-label="Uchaan Arts home" className="flex shrink-0 items-center">
          <Image
            src="/logo.png"
            alt="Uchaan Arts"
            width={129}
            height={83}
            priority
            className="h-8 w-auto"
          />
        </Link>

        {/* Categories */}
        <nav className="hidden items-center gap-6 xl:gap-7 lg:flex">
          {categoryLinks.map((l) => {
            const active = current === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`relative whitespace-nowrap py-1 text-sm transition-colors ${
                  active ? "text-ink" : "text-muted hover:text-ink"
                }`}
              >
                {l.label}
                {active && (
                  <motion.span
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="absolute -bottom-0.5 left-0 h-px w-full bg-ink"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Utilities */}
        <div className="flex shrink-0 items-center gap-4">
          <Link
            href="/wishlist"
            aria-label={`Wishlist, ${wishCount} items`}
            className="relative text-ink transition-colors hover:text-signal"
          >
            <Heart size={19} strokeWidth={1.6} />
            {wishCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 grid h-4 w-4 place-items-center rounded-full bg-signal text-[10px] text-paper">
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
            <ShoppingBag size={19} strokeWidth={1.6} />
            {count > 0 && (
              <span className="absolute -right-1.5 -top-1.5 grid h-4 w-4 place-items-center rounded-full bg-signal text-[10px] text-paper">
                {count}
              </span>
            )}
          </button>

          {/* Bracketed sign-up control from the reference */}
          <Link
            href={user ? "/account" : "/login"}
            className="relative hidden px-4 py-2 text-sm text-ink transition-colors hover:text-signal sm:block"
          >
            <span className="absolute left-0 top-0 h-2.5 w-2.5 border-l border-t border-signal" />
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 border-b border-r border-signal" />
            {user ? "Account" : "Sign up"}
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

      {/* Secondary row — editorial pages, kept out of the shopping path */}
      <div className="hidden border-t border-line lg:block">
        <div className="mx-auto flex h-10 max-w-[1400px] items-center gap-7 px-6 sm:px-10">
          {secondaryLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-xs transition-colors ${
                pathname.startsWith(l.href) ? "text-ink" : "text-muted hover:text-ink"
              }`}
            >
              {l.label}
            </Link>
          ))}
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
            <div className="mx-auto max-w-[1400px] px-6 py-4">
              {categoryLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="block border-b border-line py-3 font-display text-2xl"
                >
                  {l.label}
                </Link>
              ))}
              <div className="flex flex-wrap gap-x-6 gap-y-2 pt-4">
                {secondaryLinks.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setMenuOpen(false)}
                    className="text-sm text-muted"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
              <Link
                href={user ? "/account" : "/login"}
                onClick={() => setMenuOpen(false)}
                className="mt-4 inline-block bg-ink px-5 py-2.5 text-xs tracking-[0.14em] text-paper"
              >
                {user ? "My account" : "Sign up"}
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

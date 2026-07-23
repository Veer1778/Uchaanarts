"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Heart, ShoppingBag, UserRound } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuthOptional } from "@/context/AuthContext";

const links = [
  { href: "/", label: "Home" },
  { href: "/art-gallery", label: "Art Gallery" },
  { href: "/artists", label: "Artists" },
  { href: "/exhibitions", label: "Exhibitions" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { count, open } = useCart();
  const { count: wishCount } = useWishlist();
  // Optional: the Navbar renders on /_not-found too, which prerenders
  // without AuthProvider around it.
  const auth = useAuthOptional();
  const user = auth?.user ?? null;
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-ink/90 bg-paper/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        {/* Uchaan Arts logo */}
        <Link href="/" aria-label="Uchaan Arts home" className="flex items-center">
          <Image
            src="/logo.png"
            alt="Uchaan Arts"
            width={129}
            height={83}
            priority
            className="h-9 w-auto"
          />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-7 md:flex">
          {links.map((l) => {
            const active =
              l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`text-[11px] uppercase tracking-[0.14em] transition-colors ${
                  active ? "text-ink" : "text-muted hover:text-ink"
                }`}
              >
                <span className="relative">
                  {l.label}
                  {active && (
                    <motion.span
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="absolute -bottom-1.5 left-0 h-px w-full bg-signal"
                    />
                  )}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href={user ? "/account" : "/login"}
            aria-label={user ? "Your account" : "Sign in"}
            className="relative text-ink"
          >
            <UserRound size={19} />
            {user && (
              <span
                aria-hidden
                className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full border border-paper bg-signal"
              />
            )}
          </Link>

          <Link
            href="/wishlist"
            className="relative text-ink"
            aria-label={`Wishlist, ${wishCount} item${wishCount === 1 ? "" : "s"}`}
          >
            <Heart size={19} />
            <AnimatePresence>
              {wishCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -right-2.5 -top-2 grid h-4 w-4 place-items-center rounded-full bg-signal text-[9px] font-semibold text-white"
                >
                  {wishCount}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          <button
            onClick={open}
            className="relative text-ink"
            aria-label={`Open cart, ${count} item${count === 1 ? "" : "s"}`}
          >
            <ShoppingBag size={19} />
            <AnimatePresence>
              {count > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -right-2.5 -top-2 grid h-4 w-4 place-items-center rounded-full bg-signal text-[9px] font-semibold text-white"
                >
                  {count}
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          {/* Mobile menu toggle */}
          <button
            className="flex flex-col gap-1.5 md:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-label="Toggle menu"
          >
            <span className={`h-px w-6 bg-ink transition-transform ${menuOpen ? "translate-y-[3.5px] rotate-45" : ""}`} />
            <span className={`h-px w-6 bg-ink transition-transform ${menuOpen ? "-translate-y-[3.5px] -rotate-45" : ""}`} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            aria-label="Mobile"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-line bg-paper md:hidden"
          >
            <div className="flex flex-col px-5 py-4">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="py-3 text-sm uppercase tracking-[0.14em] text-ink"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

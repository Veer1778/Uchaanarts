import Link from "next/link";

/**
 * Footer — charcoal slab with the letterspaced wordmark and tagline on the
 * left, then six link columns and a legal strip, per the client reference.
 * Columns collapse to two-up on mobile.
 */

const columns = [
  {
    title: "Art",
    links: [
      { href: "/art-gallery", label: "All Artworks" },
      { href: "/art-gallery", label: "New Arrivals" },
      { href: "/art-gallery?price=0", label: "Art Under ₹50,000" },
      { href: "/art-gallery", label: "Sold Works" },
    ],
  },
  {
    title: "Artists",
    links: [
      { href: "/artists", label: "All Artists" },
      { href: "/artists", label: "Emerging Artists" },
      { href: "/artists", label: "Featured Artists" },
    ],
  },
  {
    title: "Exhibitions",
    links: [
      { href: "/exhibitions", label: "Current Exhibitions" },
      { href: "/exhibitions", label: "Upcoming" },
      { href: "/exhibitions", label: "Past Exhibitions" },
    ],
  },
  {
    title: "Services",
    links: [
      { href: "/advisory", label: "Art Advisory" },
      { href: "/trade", label: "Trade & Corporate" },
      { href: "/advisory", label: "Commissions" },
    ],
  },
  {
    title: "Visit",
    links: [
      { href: "/visit", label: "New Delhi Gallery" },
      { href: "/visit", label: "Gurugram Gallery" },
      { href: "/visit", label: "Plan Your Visit" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-charcoal text-white/80">
      <div className="mx-auto max-w-[1400px] px-5 py-14 sm:px-8 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_repeat(5,1fr)_1.15fr] lg:gap-8">
          {/* Wordmark */}
          <div>
            <p className="wordmark text-[1.4rem] leading-none text-white">UCHAAN</p>
            <p className="wordmark mt-1 text-[0.58rem] text-white/50">ARTS</p>
            <p className="mt-5 text-xs leading-relaxed text-white/50">
              Contemporary Indian art.
              <br />
              Curated with care.
            </p>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-5 lg:grid-cols-5 lg:gap-8">
            {columns.map((c) => (
              <div key={c.title}>
                <p className="mb-3.5 text-[11px] tracking-[0.14em] text-white/45">
                  {c.title}
                </p>
                <ul className="space-y-2 text-xs">
                  {c.links.map((l) => (
                    <li key={l.label}>
                      <Link href={l.href} className="transition-colors hover:text-white">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Connect */}
          <div>
            <p className="mb-3.5 text-[11px] tracking-[0.14em] text-white/45">Connect</p>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="mailto:info@uchaanarts.com" className="transition-colors hover:text-white">
                  info@uchaanarts.com
                </a>
              </li>
              <li>
                <a href="tel:+918860277388" className="transition-colors hover:text-white">
                  +91 88602 77388
                </a>
              </li>
            </ul>
            <div className="mt-4 flex items-center gap-3.5">
              <a href="https://instagram.com/uchaanarts" aria-label="Instagram" className="text-white/70 transition-colors hover:text-white">
                <Instagram />
              </a>
              <a href="https://facebook.com/uchaanarts" aria-label="Facebook" className="text-white/70 transition-colors hover:text-white">
                <Facebook />
              </a>
              <a href="https://api.whatsapp.com/send?phone=918860277388" aria-label="WhatsApp" className="text-white/70 transition-colors hover:text-white">
                <WhatsApp />
              </a>
            </div>
          </div>
        </div>

        {/* Legal */}
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-white/12 pt-6 text-[11px] text-white/40">
          <p>© {new Date().getFullYear()} Uchaan Arts. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/about" className="transition-colors hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/about" className="transition-colors hover:text-white">
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* Brand marks drawn inline — lucide removed its brand icon set. */
function Instagram() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function Facebook() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function WhatsApp() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8z" />
    </svg>
  );
}

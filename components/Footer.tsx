import Link from "next/link";

/**
 * Footer — charcoal slab: wordmark and tagline on the left, then five link
 * columns and a Connect column, with a legal strip beneath. Per the desktop
 * reference. Columns collapse to two-up on mobile.
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
      { href: "/trade", label: "Corporate & Hospitality" },
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
    <footer className="bg-charcoal text-white/70">
      <div className="mx-auto max-w-[1400px] px-5 py-10 sm:px-8 lg:px-10 lg:py-12">
        <div className="grid gap-9 lg:grid-cols-[1.05fr_repeat(5,0.8fr)_1fr] lg:gap-6">
          {/* Wordmark */}
          <div>
            <p className="wordmark text-[1.3rem] leading-none text-white">UCHAAN</p>
            <p className="wordmark mt-1 text-[0.55rem] text-white/45">ARTS</p>
            <p className="mt-4 text-[12px] leading-relaxed text-white/45">
              Contemporary Indian art.
              <br />
              Curated with care.
            </p>
          </div>

          {/* Link columns */}
          {columns.map((c) => (
            <div key={c.title}>
              <p className="mb-3.5 text-[13px] text-white/85">{c.title}</p>
              <ul className="space-y-2 text-[12px]">
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

          {/* Connect */}
          <div>
            <p className="mb-3.5 text-[13px] text-white/85">Connect</p>
            <ul className="space-y-2 text-[12px]">
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
            <div className="mt-3.5 flex items-center gap-3">
              <a href="https://instagram.com/uchaanarts" aria-label="Instagram" className="transition-colors hover:text-white">
                <Instagram />
              </a>
              <a href="https://facebook.com/uchaanarts" aria-label="Facebook" className="transition-colors hover:text-white">
                <Facebook />
              </a>
              <a href="https://youtube.com/@uchaanarts" aria-label="YouTube" className="transition-colors hover:text-white">
                <YouTube />
              </a>
            </div>
          </div>
        </div>

        {/* Legal */}
        <div className="mt-9 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5 text-[12px] text-white/35">
          <p>© {new Date().getFullYear()} Uchaan Arts. All rights reserved.</p>
          <div className="flex gap-5">
            <Link href="/about" className="transition-colors hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/about" className="transition-colors hover:text-white">
              Terms &amp; Conditions
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
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function Facebook() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function YouTube() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="5" width="20" height="14" rx="4" />
      <path d="M10 9.5v5l4.5-2.5z" fill="currentColor" stroke="none" />
    </svg>
  );
}

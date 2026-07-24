import Link from "next/link";

/**
 * Footer — oversized black wordmark sitting straight on the page ground and
 * cropped at the baseline by the rule beneath it, so the letterforms read as
 * cut rather than boxed.
 *
 * Mobile-first: the wordmark scales with the viewport via clamp(), link
 * columns fall to two-up, and the seal moves onto its own row rather than
 * being squeezed into the grid.
 */

const explore = [
  { href: "/art-gallery", label: "Art Gallery" },
  { href: "/artists", label: "Artists" },
  { href: "/exhibitions", label: "Exhibitions" },
  { href: "/blog", label: "Journal" },
  { href: "/about", label: "About" },
];

const support = [
  { href: "/about", label: "Contact" },
  { href: "/about", label: "Shipping Policy" },
  { href: "/about", label: "Refund Policy" },
  { href: "/about", label: "Terms & Conditions" },
  { href: "/about", label: "Privacy Policy" },
];

const collect = [
  { href: "/art-gallery?category=Painting", label: "Painting" },
  { href: "/art-gallery?category=Sculpture", label: "Sculpture" },
  { href: "/art-gallery?category=Serigraph", label: "Serigraph" },
  { href: "/art-gallery?category=Folk%20Art", label: "Folk Art" },
  { href: "/art-gallery?category=Digital%20Art", label: "Digital Art" },
];

export default function Footer() {
  return (
    <footer className="mt-24">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
        {/* ---- Oversized wordmark, cropped at the baseline ---- */}
        <div className="relative overflow-hidden pt-10 sm:pt-14">
          <p
            aria-hidden
            className="translate-y-[16%] select-none text-center font-display leading-[0.78] tracking-[-0.02em] text-ink"
            style={{ fontSize: "clamp(4.5rem, 23vw, 17rem)" }}
          >
            uchaan
          </p>
        </div>

        {/* ---- Content panel ---- */}
        <div className="border-t border-line px-5 py-10 sm:px-8 sm:py-12">
          <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr_1fr_1fr] lg:gap-8">
            {/* Statement + newsletter */}
            <div>
              <h2 className="font-display text-2xl leading-snug sm:text-[1.7rem]">
                Art chosen with care.
                <br />
                Made to be lived with.
              </h2>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
                A nurturing ground for artists since 2009, with galleries in
                Delhi and Gurgaon.
              </p>

              <div className="mt-7 flex items-center gap-4 text-ink">
                <a
                  href="https://instagram.com/uchaanarts"
                  aria-label="Instagram"
                  className="transition-colors hover:text-signal"
                >
                  <Instagram />
                </a>
                <a
                  href="https://facebook.com/uchaanarts"
                  aria-label="Facebook"
                  className="transition-colors hover:text-signal"
                >
                  <Facebook />
                </a>
                <a
                  href="https://api.whatsapp.com/send?phone=918860277388"
                  aria-label="WhatsApp"
                  className="transition-colors hover:text-signal"
                >
                  <WhatsApp />
                </a>
              </div>
            </div>

            {/* Link columns — two-up on mobile, inline from lg */}
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-3 lg:gap-8">
              <FooterColumn title="Explore" links={explore} />
              <FooterColumn title="Support" links={support} />
              <FooterColumn title="Collect" links={collect} />
            </div>
          </div>

          {/* Seal + contact */}
          <div className="mt-10 flex flex-wrap items-center justify-between gap-6 border-t border-line pt-8">
            <div className="text-sm">
              <a
                href="mailto:info@uchaanarts.com"
                className="block transition-colors hover:text-signal"
              >
                info@uchaanarts.com
              </a>
              <a
                href="tel:+918860277388"
                className="block text-muted transition-colors hover:text-signal"
              >
                +91 88602 77388
              </a>
            </div>

            <Seal />
          </div>

          <p className="mt-8 text-xs text-faint">
            © {new Date().getFullYear()} Uchaan Arts. Nurturing art and artists
            since 2009.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <p className="label mb-4 text-muted">{title}</p>
      <ul className="space-y-2.5 text-sm">
        {links.map((l) => (
          <li key={l.label}>
            <Link href={l.href} className="transition-colors hover:text-signal">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Circular seal, echoing the badge device used in the hero. */
function Seal() {
  return (
    <div className="relative grid h-24 w-24 shrink-0 place-items-center">
      <svg viewBox="0 0 100 100" className="badge-spin absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <path
            id="seal-circle"
            d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0"
            fill="none"
          />
        </defs>
        <text className="fill-muted" style={{ fontSize: "8px", letterSpacing: "0.16em" }}>
          <textPath href="#seal-circle" startOffset="0">
            UCHAAN ARTS · EST 2009 · DELHI &amp; GURGAON ·
          </textPath>
        </text>
      </svg>
      <span className="font-display text-xl">
        U<span className="text-signal">A</span>
      </span>
    </div>
  );
}

/* Brand marks as inline SVG — lucide removed its brand icon set, so these
   are drawn here rather than pulled from the icon package. */
function Instagram() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function Facebook() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function WhatsApp() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8z" />
    </svg>
  );
}

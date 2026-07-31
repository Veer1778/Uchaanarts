import Link from "next/link";

/**
 * Footer — charcoal strip carrying the wordmark and tagline on the left and
 * social marks on the right, with a legal line beneath, as in the reference.
 *
 * Deliberately minimal: the reference does not use link columns here, because
 * the header already carries the full navigation.
 */
export default function Footer() {
  return (
    <footer className="bg-charcoal text-white/70">
      <div className="mx-auto max-w-[1400px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-end gap-4">
            <div>
              <p className="wordmark text-[1.35rem] leading-none text-white">UCHAAN</p>
              <p className="wordmark mt-1 text-[0.55rem] text-white/45">ARTS</p>
            </div>
            <p className="max-w-[11rem] text-[10px] leading-snug text-white/45 sm:text-[11px]">
              Contemporary Indian art.
              <br />
              Curated with care.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://instagram.com/uchaanarts"
              aria-label="Instagram"
              className="transition-colors hover:text-white"
            >
              <Instagram />
            </a>
            <a
              href="https://facebook.com/uchaanarts"
              aria-label="Facebook"
              className="transition-colors hover:text-white"
            >
              <Facebook />
            </a>
            <a
              href="https://youtube.com/@uchaanarts"
              aria-label="YouTube"
              className="transition-colors hover:text-white"
            >
              <YouTube />
            </a>
          </div>
        </div>

        <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5 text-[10px] text-white/35 sm:text-[11px]">
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
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function Facebook() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function YouTube() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="5" width="20" height="14" rx="4" />
      <path d="M10 9.5v5l4.5-2.5z" fill="currentColor" stroke="none" />
    </svg>
  );
}

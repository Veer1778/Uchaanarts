import Link from "next/link";

const socials = [
  { label: "Instagram", href: "https://www.instagram.com/uchaanarts.gallery/" },
  { label: "Facebook", href: "https://www.facebook.com/uchaanarts/" },
  { label: "YouTube", href: "https://www.youtube.com/channel/UCm8xRS3d7j24DNmxlJ_H44A" },
  { label: "X", href: "https://twitter.com/UchaanArts" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/uchaan-arts-91351b123/" },
];

export default function Footer() {
  return (
    <footer className="relative mt-24 overflow-hidden border-t border-line bg-wash text-ink">
      
      <div className="relative mx-auto max-w-[1400px] px-6 py-16 sm:px-10">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <span className="diamond bg-signal" />
              <span className="diamond bg-gold" />
            </div>
            <p className="font-display text-3xl">
              the<span className="font-semibold">Uchaan</span>Gallery
            </p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
              A nurturing ground for art and artists for over 15 years, with
              galleries in Delhi and Gurgaon. Every artwork tells a unique
              story — ours is to carry it to you.
            </p>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] uppercase tracking-[0.18em] text-muted transition-colors hover:text-signal"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          <nav aria-label="Explore">
            <p className="mb-4 text-[11px] uppercase tracking-[0.2em] text-faint">
              Explore
            </p>
            <ul className="space-y-2.5 text-sm text-muted">
              <li><Link href="/art-gallery" className="hover:text-signal">Art Gallery</Link></li>
              <li><Link href="/artists" className="hover:text-signal">Artists</Link></li>
              <li><Link href="/exhibitions" className="hover:text-signal">Exhibitions</Link></li>
              <li><Link href="/blog" className="hover:text-signal">Blog</Link></li>
              <li><Link href="/about" className="hover:text-signal">About Us</Link></li>
            </ul>
          </nav>

          <nav aria-label="Support">
            <p className="mb-4 text-[11px] uppercase tracking-[0.2em] text-faint">
              Support
            </p>
            <ul className="space-y-2.5 text-sm text-muted">
              <li><a href="#" className="hover:text-signal">Shipping Policy</a></li>
              <li><a href="#" className="hover:text-signal">Refund Policy</a></li>
              <li><a href="#" className="hover:text-signal">Terms &amp; Conditions</a></li>
              <li><a href="#" className="hover:text-signal">Privacy Policy</a></li>
            </ul>
          </nav>

          <div>
            <p className="mb-4 text-[11px] uppercase tracking-[0.2em] text-faint">
              Visit / Contact
            </p>
            <ul className="space-y-2.5 text-sm text-muted">
              <li>Delhi &amp; Gurgaon, India</li>
              <li>
                <a href="tel:+918860277388" className="hover:text-signal">
                  +91 88602 77388
                </a>
              </li>
              <li>
                <a href="mailto:info@uchaanarts.com" className="hover:text-signal">
                  info@uchaanarts.com
                </a>
              </li>
              <li className="text-muted">Open daily · 7 am – 10 pm IST</li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-line pt-6 text-[11px] text-faint sm:flex-row">
          <p>© {new Date().getFullYear()} Uchaan Arts. All rights reserved.</p>
          <p>Worldwide shipping · 100% secure payments · Expert curation</p>
        </div>
      </div>
    </footer>
  );
}

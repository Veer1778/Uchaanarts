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
    <footer className="relative mt-24 overflow-hidden border-t border-ink/90 bg-ink text-white">
      <div className="aura -right-32 -top-40 h-96 w-96 opacity-50" />
      <div className="relative mx-auto max-w-6xl px-5 py-16">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <p className="font-display text-3xl">
              Uchaan <span className="text-signal">Art</span>s
            </p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">
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
                  className="text-[11px] uppercase tracking-[0.18em] text-white/60 transition-colors hover:text-signal"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          <nav aria-label="Explore">
            <p className="mb-4 text-[11px] uppercase tracking-[0.2em] text-white/50">
              Explore
            </p>
            <ul className="space-y-2.5 text-sm text-white/80">
              <li><Link href="/art-gallery" className="hover:text-white">Art Gallery</Link></li>
              <li><Link href="/artists" className="hover:text-white">Artists</Link></li>
              <li><Link href="/exhibitions" className="hover:text-white">Exhibitions</Link></li>
              <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
              <li><Link href="/about" className="hover:text-white">About Us</Link></li>
            </ul>
          </nav>

          <nav aria-label="Support">
            <p className="mb-4 text-[11px] uppercase tracking-[0.2em] text-white/50">
              Support
            </p>
            <ul className="space-y-2.5 text-sm text-white/80">
              <li><a href="#" className="hover:text-white">Shipping Policy</a></li>
              <li><a href="#" className="hover:text-white">Refund Policy</a></li>
              <li><a href="#" className="hover:text-white">Terms &amp; Conditions</a></li>
              <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
            </ul>
          </nav>

          <div>
            <p className="mb-4 text-[11px] uppercase tracking-[0.2em] text-white/50">
              Visit / Contact
            </p>
            <ul className="space-y-2.5 text-sm text-white/80">
              <li>Delhi &amp; Gurgaon, India</li>
              <li>
                <a href="tel:+918860277388" className="hover:text-white">
                  +91 88602 77388
                </a>
              </li>
              <li>
                <a href="mailto:info@uchaanarts.com" className="hover:text-white">
                  info@uchaanarts.com
                </a>
              </li>
              <li className="text-white/60">Open daily · 7 am – 10 pm IST</li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-6 text-[11px] text-white/50 sm:flex-row">
          <p>© {new Date().getFullYear()} Uchaan Arts. All rights reserved.</p>
          <p>Worldwide shipping · 100% secure payments · Expert curation</p>
        </div>
      </div>
    </footer>
  );
}

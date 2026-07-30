import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Trade & Corporate",
  description:
    "Uchaan Arts works with architects, interior designers, hotels and corporate collections on commissions and large-scale placements.",
};

export default function TradePage() {
  return (
    <div className="mx-auto max-w-[1400px] px-5 py-16 sm:px-8 lg:px-10">
      <p className="font-display text-xl">Trade &amp; Corporate</p>
      <h1 className="mt-4 max-w-2xl font-display text-4xl leading-[1.12] sm:text-5xl">
        Art programmes for <em className="italic">spaces at scale.</em>
      </h1>
      <p className="mt-6 max-w-xl text-sm leading-relaxed text-muted">
        We work with architects, interior designers, hospitality groups and
        corporate collections — from single statement works to full-building
        programmes, including commissions made for the space.
      </p>

      <div className="mt-12 grid gap-10 border-t border-line pt-10 sm:grid-cols-3">
        {[
          { t: "Trade pricing", b: "Preferential terms for registered design practices." },
          { t: "Commissions", b: "Original works developed with the artist for your brief." },
          { t: "Installation", b: "Crating, delivery and hanging handled end to end." },
        ].map((c) => (
          <div key={c.t}>
            <p className="font-display text-lg">{c.t}</p>
            <p className="mt-2 text-sm leading-relaxed text-muted">{c.b}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 flex flex-wrap gap-3">
        <a
          href="mailto:info@uchaanarts.com?subject=Trade%20enquiry"
          className="btn-accent px-7 py-3.5 text-sm"
        >
          Make a trade enquiry
        </a>
        <Link href="/advisory" className="btn-outline px-7 py-3.5 text-sm">
          Art advisory
        </Link>
      </div>
    </div>
  );
}

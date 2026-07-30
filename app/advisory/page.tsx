import type { Metadata } from "next";
import Link from "next/link";
import { advisorySteps } from "@/lib/site";

export const metadata: Metadata = {
  title: "Art Advisory",
  description:
    "Share your space, preferences and budget with Uchaan's curatorial team and receive a shortlist of original works suited to you.",
};

export default function AdvisoryPage() {
  return (
    <div className="mx-auto max-w-[1400px] px-5 py-16 sm:px-8 lg:px-10">
      <p className="font-display text-xl">Art Advisory</p>
      <h1 className="mt-4 max-w-2xl font-display text-4xl leading-[1.12] sm:text-5xl">
        Art can be personal.
        <br />
        <em className="italic">Choosing it should be too.</em>
      </h1>
      <p className="mt-6 max-w-xl text-sm leading-relaxed text-muted">
        Share your space, preferences and budget with our curatorial team.
        We&apos;ll recommend original works suited to you — with guidance on
        scale, framing, placement and installation.
      </p>

      <ol className="mt-12 grid gap-8 border-t border-line pt-10 sm:grid-cols-3">
        {advisorySteps.map((s) => (
          <li key={s.n}>
            <p className="text-xs text-faint">{s.n}</p>
            <p className="mt-2 font-display text-lg leading-snug">{s.label}</p>
          </li>
        ))}
      </ol>

      <div className="mt-12 flex flex-wrap gap-3">
        <a
          href="mailto:info@uchaanarts.com?subject=Art%20Advisory%20enquiry"
          className="btn-accent px-7 py-3.5 text-sm"
        >
          Book a consultation
        </a>
        <Link href="/art-gallery" className="btn-outline px-7 py-3.5 text-sm">
          Browse the collection
        </Link>
      </div>
    </div>
  );
}

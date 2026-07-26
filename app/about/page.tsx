import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "UCHAAN is an organisation dedicated to nurturing established and emerging artists from across India, with galleries in Delhi and Gurgaon.",
};

/**
 * About — set in the same hairline-ruled system as the shop: flat panels,
 * square corners, greyscale. Sections are separated by rules rather than
 * floating rounded cards.
 */
export default function AboutPage() {
  return (
    <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-10">
      {/* Statement */}
      <section className="border-b border-line py-14 sm:py-20">
        <div className="grid items-start gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          <Reveal>
            <p className="label mb-5 text-muted">Since 2009</p>
            <h1 className="font-display text-4xl leading-[1.08] sm:text-5xl lg:text-6xl">
              A nurturing ground for art and artists
            </h1>
            <p className="mt-8 max-w-xl text-sm leading-relaxed text-muted">
              UCHAAN is an organisation dedicated to nurturing both established
              and emerging artists from across the country, with galleries in
              Delhi and Gurgaon. For over 15 years we have shown all forms of
              visual art in our own distinguished way — inside the gallery and
              beyond its confines at off-site locations.
            </p>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted">
              At Uchaan Arts, every artwork tells a unique story. Our exclusive
              collection features original creations, meticulously photographed
              to capture their essence. We take on corporate works and
              commissions, creating bespoke pieces to realise your vision.
            </p>

            <Link
              href="/art-gallery"
              className="mt-8 inline-block border-b border-ink pb-1 text-sm transition-opacity hover:opacity-60"
            >
              Browse the collection
            </Link>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative aspect-[3/4] overflow-hidden bg-wash">
                <Image
                  src="https://www.uchaanarts.com/uploaded_files/slider/1762953059_untitled_design_2.jpg"
                  alt="Banaras — sunset over the ghats"
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="object-cover"
                />
              </div>
              <div className="relative mt-10 aspect-[3/4] overflow-hidden bg-wash">
                <Image
                  src="https://www.uchaanarts.com/uploaded_files/itempic/thumbmain/1726310195_agomoni_17x19x5_bronze_140000.jpg"
                  alt="Agomoni — bronze sculpture"
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="object-cover"
                />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Figures */}
      <Reveal>
        <section className="border-b border-line py-14">
          <dl className="grid gap-10 sm:grid-cols-3">
            {[
              { n: "15+", label: "Years championing contemporary Indian art" },
              { n: "2", label: "Galleries — Delhi and Gurgaon" },
              { n: "100s", label: "Of artists shown, from masters to first solos" },
            ].map((s) => (
              <div key={s.label}>
                <dt className="font-display text-5xl leading-none">{s.n}</dt>
                <dd className="mt-4 max-w-[16rem] text-sm leading-relaxed text-muted">
                  {s.label}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      </Reveal>

      {/* Submission — flat black band, full width of the measure */}
      <Reveal>
        <section className="my-14 bg-ink px-6 py-16 text-paper sm:px-12 sm:py-20">
          <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto] lg:gap-16">
            <div>
              <h2 className="font-display text-3xl leading-snug sm:text-4xl">
                Are you an artist? Show with us.
              </h2>
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-paper/60">
                We review submissions year-round for gallery representation,
                group shows and our online collection.
              </p>
            </div>
            <a
              href="mailto:info@uchaanarts.com?subject=Artwork%20submission"
              className="inline-block shrink-0 bg-paper px-9 py-4 text-sm text-ink transition-opacity hover:opacity-85"
            >
              Submit your artwork
            </a>
          </div>
        </section>
      </Reveal>

      {/* Practical detail */}
      <Reveal>
        <section className="border-t border-line py-14">
          <div className="grid gap-12 md:grid-cols-2 lg:gap-20">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl">
                Visit the galleries
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted">
                Open daily, 7 am – 10 pm IST. Walk-ins welcome; private viewings
                by appointment.
              </p>
              <ul className="mt-6 space-y-2 text-sm">
                <li>
                  <a href="tel:+918860277388" className="hover:opacity-60">
                    +91 88602 77388
                  </a>
                </li>
                <li>
                  <a href="mailto:info@uchaanarts.com" className="hover:opacity-60">
                    info@uchaanarts.com
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="font-display text-2xl sm:text-3xl">
                Collect with confidence
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted">
                Every purchase ships worldwide, insured, with a certificate of
                authenticity. Our curators are available for guidance before and
                after your purchase — start in the{" "}
                <Link href="/art-gallery" className="underline underline-offset-4">
                  art gallery
                </Link>
                .
              </p>
            </div>
          </div>
        </section>
      </Reveal>
    </div>
  );
}

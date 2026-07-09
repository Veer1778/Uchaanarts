import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "UCHAAN is an organisation dedicated to nurturing established and emerging artists from across India, with galleries in Delhi and Gurgaon.",
};

export default function AboutPage() {
  return (
    <>
      <section className="relative mx-auto max-w-6xl px-5 pt-14">
        <div className="aura -right-40 top-0 h-96 w-96" />
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <h1 className="font-display text-5xl leading-tight sm:text-6xl">
              A nurturing ground for <span className="text-signal">art</span> and{" "}
              <span className="text-signal">artists</span>
            </h1>
            <p className="mt-7 text-sm leading-relaxed text-muted">
              UCHAAN is an organisation dedicated to nurturing both established
              and emerging artists from across the country, with galleries in
              Delhi and Gurgaon. For over 15 years we have shown all forms of
              visual art in our own distinguished way — inside the gallery and
              beyond its confines at off-site locations.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              At Uchaan Arts, every artwork tells a unique story. Our exclusive
              collection features original creations, meticulously photographed
              to capture their essence. We take on corporate works and
              commissions, creating bespoke pieces to realise your vision.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative aspect-[3/4] overflow-hidden rounded-lg">
                <Image
                  src="https://www.uchaanarts.com/uploaded_files/slider/1762953059_untitled_design_2.jpg"
                  alt="Banaras — sunset over the ghats"
                  fill
                  sizes="50vw"
                  className="object-cover"
                />
              </div>
              <div className="relative mt-10 aspect-[3/4] overflow-hidden rounded-lg">
                <Image
                  src="https://www.uchaanarts.com/uploaded_files/itempic/thumbmain/1726310195_agomoni_17x19x5_bronze_140000.jpg"
                  alt="Agomoni — bronze sculpture"
                  fill
                  sizes="50vw"
                  className="object-cover"
                />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pt-24">
        <Reveal>
          <div className="grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-3">
            {[
              { n: "15+", label: "Years championing contemporary Indian art" },
              { n: "2", label: "Galleries — Delhi and Gurgaon" },
              { n: "100s", label: "Of artists shown, from masters to first solos" },
            ].map((s) => (
              <div key={s.label} className="bg-paper p-8">
                <p className="font-display text-5xl text-signal">{s.n}</p>
                <p className="mt-3 text-sm text-muted">{s.label}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="mx-auto max-w-6xl px-5 pt-24">
        <Reveal>
          <div className="relative overflow-hidden rounded-lg bg-ink px-8 py-14 text-center text-white">
            <div className="aura -right-20 -top-24 h-72 w-72" />
            <h2 className="relative font-display text-3xl sm:text-4xl">
              Are you an artist? <span className="text-signal">Show with us.</span>
            </h2>
            <p className="relative mx-auto mt-4 max-w-lg text-sm text-white/70">
              We review submissions year-round for gallery representation,
              group shows and our online collection.
            </p>
            <a
              href="mailto:info@uchaanarts.com?subject=Artwork%20submission"
              className="relative mt-8 inline-block bg-signal px-10 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-signal-dark"
            >
              Submit your artwork
            </a>
          </div>
        </Reveal>
      </section>

      <section className="mx-auto max-w-6xl px-5 pt-24">
        <Reveal>
          <div className="grid gap-10 md:grid-cols-2">
            <div>
              <h2 className="font-display text-3xl">Visit the galleries</h2>
              <p className="mt-4 text-sm leading-relaxed text-muted">
                Open daily, 7 am – 10 pm IST. Walk-ins welcome; private
                viewings by appointment.
              </p>
              <ul className="mt-6 space-y-2 text-sm">
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
              </ul>
            </div>
            <div>
              <h2 className="font-display text-3xl">Collect with confidence</h2>
              <p className="mt-4 text-sm leading-relaxed text-muted">
                Every purchase ships worldwide, insured, with a certificate of
                authenticity. Our curators are available for guidance before
                and after your purchase — start in the{" "}
                <Link href="/art-gallery" className="text-signal underline">
                  art gallery
                </Link>
                .
              </p>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}

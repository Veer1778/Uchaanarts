import type { Metadata } from "next";
import Link from "next/link";
import {
  Hotel,
  Building2,
  Landmark,
  Home,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Art consultancy and bespoke art solutions. Curated art, sculptures, installations and site-specific work for hospitality, architecture, corporate and private spaces.",
};

/**
 * Projects — formerly Trade & Corporate.
 *
 * All copy is taken from the client's own corporate profile deck, so nothing
 * here is invented. Project photographs are theirs to supply; the section is
 * omitted entirely rather than filled with stock imagery, which would undercut
 * a page selling original commissioned work.
 */

const WHATSAPP = "918860277388";

const sectors = [
  {
    icon: Hotel,
    title: "Hospitality & Resorts",
    body: "Curated artworks and site-specific installations for hotels, resorts and hospitality environments.",
  },
  {
    icon: Landmark,
    title: "Architecture & Design",
    body: "Art developed in dialogue with the design language of the space.",
  },
  {
    icon: Building2,
    title: "Corporate & Developers",
    body: "Statement art for offices, commercial and mixed-use environments.",
  },
  {
    icon: Home,
    title: "Private Residences",
    body: "Curated and commissioned works for individual spaces and collections.",
  },
];

const capabilities = [
  {
    label: "Artworks & Installations",
    items: ["Paintings", "Sculptures", "Ceramic Art", "Wall Art", "Art Installations"],
  },
  {
    label: "Materials & Mediums",
    items: ["Canvas", "Ceramic", "Metal", "FRP", "Mosaic", "Textile", "Stone", "Mixed Media"],
  },
  {
    label: "Artistic Capabilities",
    items: [
      "Site-Specific Art",
      "Large-Scale Features",
      "Sculptural Elements",
      "Custom Fabrication",
    ],
  },
];

const process = [
  "Brief",
  "Site Study",
  "Concept",
  "Artwork Selection",
  "Customisation",
  "Sampling",
  "Production",
  "Quality Check",
  "Installation",
];

export default function ProjectsPage() {
  return (
    <div className="mx-auto max-w-[1400px] px-5 py-16 sm:px-8 lg:px-10">
      <p className="text-[11px] uppercase tracking-[0.24em] text-signal">
        Art Consultancy &amp; Bespoke Art Solutions
      </p>
      <h1 className="mt-4 max-w-3xl text-4xl leading-[1.12] sm:text-5xl">
        Art that belongs
        <br />
        <em>to the space.</em>
      </h1>
      <p className="mt-6 max-w-2xl text-sm leading-relaxed text-muted">
        Established in 2014, Uchaan Arts is an art consultancy and project-art
        studio working at the intersection of art, architecture and interior
        design. We collaborate with architects, interior designers, hospitality
        brands, developers and private clients to develop curated, commissioned
        and site-specific art solutions.
      </p>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">
        From individual artworks to large-scale installations, each project is
        developed in response to the architecture, scale, material palette and
        character of the space.
      </p>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/enquire" className="btn-accent px-7 py-3.5 text-sm">
          Discuss a project
        </Link>
        <a
          href={`https://api.whatsapp.com/send?phone=${WHATSAPP}&text=${encodeURIComponent(
            "Hello Uchaan Arts, I'd like to discuss an art project."
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="border border-line px-7 py-3.5 text-sm transition-colors hover:border-signal hover:text-signal"
        >
          WhatsApp a curator
        </a>
      </div>

      {/* Sectors */}
      <section className="mt-16 border-t border-line pt-12">
        <h2 className="text-2xl">Art for exceptional spaces</h2>
        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {sectors.map((s) => (
            <div key={s.title}>
              <s.icon size={22} strokeWidth={1.5} className="text-signal" />
              <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Capabilities */}
      <section className="mt-16 border-t border-line pt-12">
        <h2 className="text-2xl">Art solutions across mediums</h2>
        <div className="mt-8 grid gap-10 lg:grid-cols-3">
          {capabilities.map((c) => (
            <div key={c.label}>
              <p className="text-[11px] uppercase tracking-[0.18em] text-signal">
                {c.label}
              </p>
              <ul className="mt-3 flex flex-wrap gap-x-2 gap-y-2 text-sm text-muted">
                {c.items.map((item, i) => (
                  <li key={item}>
                    {item}
                    {i < c.items.length - 1 && (
                      <span className="ml-2 text-faint">|</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Process */}
      <section className="mt-16 border-t border-line pt-12">
        <h2 className="text-2xl">From brief to installation</h2>
        <ol className="mt-8 flex flex-wrap items-center gap-x-2 gap-y-3">
          {process.map((step, i) => (
            <li key={step} className="flex items-center gap-2">
              <span className="border border-line px-3.5 py-2 text-sm">
                {step}
              </span>
              {i < process.length - 1 && (
                <ArrowRight size={14} className="text-faint" aria-hidden />
              )}
            </li>
          ))}
        </ol>
      </section>

      {/*
        PROJECT GALLERY — awaiting photographs from the client.

        Their deck shows four: Wall Art & Installations, Hand-Painted MS
        Sculptural Installation, Site-Specific Carved Wall Installation, and
        Bespoke Layered Wall Installation. Drop the files into
        /public/projects/ and replace this comment with a grid.

        Deliberately omitted until then: an empty "Our Projects" heading reads
        worse than none, and stock photography on a page selling original
        commissioned art would undercut the whole pitch.
      */}

      <section className="mt-16 border-t border-line pt-12">
        <h2 className="text-2xl">Start a conversation</h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
          Tell us about the space, the timeline and roughly what you have in
          mind. We will come back with a shortlist and an idea of cost.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/enquire" className="btn-accent px-7 py-3.5 text-sm">
            Send a brief
          </Link>
          <a
            href="mailto:corporate@uchaanarts.com"
            className="border border-line px-7 py-3.5 text-sm transition-colors hover:border-signal hover:text-signal"
          >
            corporate@uchaanarts.com
          </a>
          <a
            href="tel:+918860277388"
            className="border border-line px-7 py-3.5 text-sm transition-colors hover:border-signal hover:text-signal"
          >
            +91 88602 77388
          </a>
        </div>
      </section>
    </div>
  );
}

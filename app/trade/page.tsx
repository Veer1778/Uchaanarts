import type { Metadata } from "next";
import Link from "next/link";
import { Building2, Hotel, Landmark, Ruler, Truck, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Corporate & Hospitality Art",
  description:
    "Original art, sculpture and custom installations for hotels, offices, restaurants and architect-led projects. Commissioned, framed, delivered and installed by Uchaan Arts.",
};

const WHATSAPP = "918860277388";

const sectors = [
  {
    icon: Hotel,
    title: "Hotels & Restaurants",
    body: "Lobby statements, corridor series and suite artwork developed to a property's identity, at the scale the architecture asks for.",
  },
  {
    icon: Building2,
    title: "Offices & Workspaces",
    body: "Reception pieces, boardroom works and floor-wide programmes, chosen to suit both the brand and the people who work under them every day.",
  },
  {
    icon: Landmark,
    title: "Architect & Design Projects",
    body: "We work from drawings and mood boards alongside architects and interior designers, from concept through to installation on site.",
  },
];

const capabilities = [
  {
    icon: Ruler,
    title: "Commissioned to scale",
    body: "Custom paintings, sculpture and installations made to your dimensions, palette and brief, by artists matched to the work.",
  },
  {
    icon: ShieldCheck,
    title: "Documented and authenticated",
    body: "Every piece arrives with artist authentication and full documentation for your records and insurers.",
  },
  {
    icon: Truck,
    title: "Framed, delivered, installed",
    body: "Framing, crating, transport and on-site installation handled end to end, across India and internationally.",
  },
];

export default function CorporatePage() {
  return (
    <div className="mx-auto max-w-[1400px] px-5 py-16 sm:px-8 lg:px-10">
      <p className="font-display text-xl">Corporate &amp; Hospitality Art</p>
      <h1 className="mt-4 max-w-3xl font-display text-4xl leading-[1.12] sm:text-5xl">
        Art that gives a space
        <br />
        <em className="italic">a reason to be remembered.</em>
      </h1>
      <p className="mt-6 max-w-2xl text-sm leading-relaxed text-muted">
        For fifteen years Uchaan Arts has placed original work in hotels,
        offices, restaurants and private developments across India. We commission
        custom paintings, sculpture and installations, and handle everything from
        the first site visit to the final fixing.
      </p>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/enquire" className="btn-accent px-7 py-3.5 text-sm">
          Discuss a project
        </Link>
        <a
          href={`https://api.whatsapp.com/send?phone=${WHATSAPP}&text=${encodeURIComponent(
            "Hello Uchaan Arts, I'd like to discuss a corporate or hospitality art project."
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="border border-line px-7 py-3.5 text-sm transition-colors hover:border-signal hover:text-signal"
        >
          WhatsApp a curator
        </a>
      </div>

      <section className="mt-16 border-t border-line pt-12">
        <h2 className="font-display text-2xl">Who we work with</h2>
        <div className="mt-8 grid gap-8 sm:grid-cols-3">
          {sectors.map((s) => (
            <div key={s.title}>
              <s.icon size={22} strokeWidth={1.5} className="text-signal" />
              <h3 className="mt-3 font-display text-lg">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16 border-t border-line pt-12">
        <h2 className="font-display text-2xl">What we handle</h2>
        <div className="mt-8 grid gap-8 sm:grid-cols-3">
          {capabilities.map((c) => (
            <div key={c.title}>
              <c.icon size={22} strokeWidth={1.5} className="text-signal" />
              <h3 className="mt-3 font-display text-lg">{c.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/*
        PROJECT GALLERY — awaiting photographs from the client.

        Once they arrive, drop them in /public/projects/ and replace this
        section with a grid. Keeping it out entirely is deliberate: an empty
        "Our Projects" heading reads worse than no heading at all, and stock
        photography on a page selling original art would undercut the pitch.

        Suggested shape per project: photograph, venue name, city, and one line
        naming the work or the artist.
      */}

      <section className="mt-16 border-t border-line pt-12">
        <h2 className="font-display text-2xl">How a project runs</h2>
        <ol className="mt-8 grid gap-8 sm:grid-cols-4">
          {[
            ["01", "Brief and site", "We visit or work from your drawings to understand the space, light and sightlines."],
            ["02", "Curation", "A shortlist of existing works, or artists matched to a commission, with sizes and budget set out."],
            ["03", "Approval", "Mock-ups showing the work in place, so nothing is a surprise once it is on the wall."],
            ["04", "Installation", "Framing, delivery and fixing handled by our team, with documentation on completion."],
          ].map(([n, title, body]) => (
            <li key={n}>
              <p className="text-xs text-faint">{n}</p>
              <p className="mt-2 font-display text-lg leading-snug">{title}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-16 border-t border-line pt-12">
        <h2 className="font-display text-2xl">Start a conversation</h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
          Tell us about the space, the timeline and roughly what you have in
          mind. We will come back with a shortlist and an idea of cost.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/enquire" className="btn-accent px-7 py-3.5 text-sm">
            Send a brief
          </Link>
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

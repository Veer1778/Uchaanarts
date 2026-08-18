import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Phone, Mail, Clock, MessageCircle, Train } from "lucide-react";

export const metadata: Metadata = {
  title: "Visit",
  description:
    "Visit the Uchaan Arts galleries in Ghitorni, New Delhi and Ambience Mall, Gurugram. Open daily; private viewings by appointment.",
};

const WHATSAPP = "918860277388";

/**
 * Gallery details verified against the Google Business listings for both
 * locations. The previous version of this page said "Open daily, 7 am – 10 pm"
 * for both, which was wrong on both counts.
 *
 * Photographs: drop files into /public/visit/ and set `photo` below.
 */
const galleries = [
  {
    id: "delhi",
    city: "New Delhi",
    name: "Ghitorni Gallery",
    address: [
      "416/2, Mehrauli-Gurgaon Road",
      "Opposite Metro Pillar No. 127",
      "Ghitorni, New Delhi 110030",
    ],
    hours: "Daily, 11:30 am – 9:00 pm",
    transit: "Ghitorni Metro Station (Yellow Line), 2 minutes on foot",
    lat: 28.4915444,
    lng: 77.1431426,
    placeId: "ChIJYVWKG2MZDTkRPkigiK8yos4",
    photo: "https://lh3.googleusercontent.com/gps-cs-s/AHRPTWlfL8A_Mr5Vw-UuO-yARm_859MtDjAWDB25nfSjvQkOdnSveYLYyvyzmQai8f99SYeUUAXJbWuYGM5KekTDriAf9kV6zgyVxUqDzhQP3VqVkv3_YTsZWSp5WBl6QQyADyHyq1KP=s680-w680-h510-rw", // e.g. "/visit/delhi-gallery.jpg"
  },
  {
    id: "gurugram",
    city: "Gurugram",
    name: "Ambience Mall Gallery",
    address: [
      "Ambience Mall, 3rd Floor",
      "Near PVR Cinemas, Lift No. 14",
      "Ambience Island, NH-8, Gurugram 122010",
    ],
    hours: "Daily, 11:00 am – 8:00 pm",
    transit: "Free shuttle from Sikanderpur Metro Station",
    lat: 28.5050164,
    lng: 77.0965475,
    placeId: "ChIJVZUBq-cYDTkRz5laZKp5KGE",
    photo: "https://lh3.googleusercontent.com/gps-cs-s/AHRPTWnrP4ykcvPHScov-4JF4Z_XsHkQRMnRct_TJTrLZehHX-Hu_RTP_cZ7wGJBbe9V2AwJm6ewcutNqgcxgz-I3u9rcEp0Q5HeTw8qF7hwTCYEoYTIiMkYzpZzLJLAfv1v5DYUHNCz=s680-w680-h510-rw", // e.g. "/visit/gurugram-gallery.jpg"
  },
];

export default function VisitPage() {
  return (
    <div className="mx-auto max-w-[1400px] px-5 py-16 sm:px-8 lg:px-10">
      <p className="font-display text-xl">Visit</p>
      <h1 className="mt-4 max-w-2xl font-display text-4xl leading-[1.12] sm:text-5xl">
        Experience the artwork <em className="italic">in person.</em>
      </h1>
      <p className="mt-6 max-w-xl text-sm leading-relaxed text-muted">
        Two galleries, both open daily. Walk in to browse, or arrange a private
        viewing and we will have works ready for you to see.
      </p>

      <div className="mt-14 grid gap-14 border-t border-line pt-12 lg:grid-cols-2">
        {galleries.map((g) => (
          <section key={g.id} aria-labelledby={`${g.id}-heading`}>
            {/* Photograph, when one is supplied. The map stands in until then
                rather than leaving an empty frame. */}
            {g.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={g.photo}
                alt={`${g.name}, ${g.city}`}
                className="mb-6 aspect-[16/10] w-full object-cover"
              />
            ) : null}

            <p className="text-[11px] uppercase tracking-[0.24em] text-signal">
              {g.city}
            </p>
            <h2 id={`${g.id}-heading`} className="mt-2 font-display text-3xl">
              {g.name}
            </h2>

            <dl className="mt-6 space-y-4 text-sm">
              <div className="flex gap-3">
                <dt className="pt-0.5">
                  <MapPin size={16} className="text-muted" />
                  <span className="sr-only">Address</span>
                </dt>
                <dd className="text-muted">
                  {g.address.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </dd>
              </div>

              <div className="flex gap-3">
                <dt className="pt-0.5">
                  <Clock size={16} className="text-muted" />
                  <span className="sr-only">Opening hours</span>
                </dt>
                <dd className="text-muted">{g.hours}</dd>
              </div>

              <div className="flex gap-3">
                <dt className="pt-0.5">
                  <Train size={16} className="text-muted" />
                  <span className="sr-only">Getting here</span>
                </dt>
                <dd className="text-muted">{g.transit}</dd>
              </div>
            </dl>

            {/* Keyless embed. Avoids a Maps API key and its billing account,
                which matters for a site the client will maintain. */}
            <div className="mt-6 overflow-hidden border border-line">
              <iframe
                title={`Map to ${g.name}`}
                src={`https://maps.google.com/maps?q=${g.lat},${g.lng}&z=16&output=embed`}
                width="100%"
                height="260"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${g.lat},${g.lng}&query_place_id=${g.placeId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-line px-5 py-2.5 text-xs uppercase tracking-[0.14em] transition-colors hover:border-signal hover:text-signal"
              >
                Directions
              </a>
              <a
                href={`https://api.whatsapp.com/send?phone=${WHATSAPP}&text=${encodeURIComponent(
                  `Hello Uchaan Arts, I'd like to visit the ${g.city} gallery.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 border border-line px-5 py-2.5 text-xs uppercase tracking-[0.14em] transition-colors hover:border-signal hover:text-signal"
              >
                <MessageCircle size={14} />
                WhatsApp
              </a>
            </div>
          </section>
        ))}
      </div>

      <section className="mt-16 border-t border-line pt-10">
        <h2 className="font-display text-2xl">Get in touch</h2>
        <div className="mt-5 flex flex-wrap gap-x-10 gap-y-4 text-sm">
          <a
            href="tel:+918860277388"
            className="flex items-center gap-2 hover:text-signal"
          >
            <Phone size={15} className="text-muted" />
            +91 88602 77388
          </a>
          <a
            href="mailto:info@uchaanarts.com"
            className="flex items-center gap-2 hover:text-signal"
          >
            <Mail size={15} className="text-muted" />
            info@uchaanarts.com
          </a>
          <a
            href={`https://api.whatsapp.com/send?phone=${WHATSAPP}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-signal"
          >
            <MessageCircle size={15} className="text-muted" />
            WhatsApp a curator
          </a>
        </div>

        <p className="mt-8 text-sm text-muted">
          Planning a visit for a specific work?{" "}
          <Link href="/enquire" className="text-signal hover:underline">
            Tell us in advance
          </Link>{" "}
          and we will have it out of storage and ready to view.
        </p>
      </section>
    </div>
  );
}

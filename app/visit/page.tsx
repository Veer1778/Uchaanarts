import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Visit",
  description:
    "Visit the Uchaan Arts galleries in New Delhi and Gurugram. Open daily; private viewings by appointment.",
};

const galleries = [
  {
    city: "New Delhi Gallery",
    lines: ["Open daily, 7 am – 10 pm IST", "Walk-ins welcome"],
  },
  {
    city: "Gurugram Gallery",
    lines: ["Open daily, 7 am – 10 pm IST", "Private viewings by appointment"],
  },
];

export default function VisitPage() {
  return (
    <div className="mx-auto max-w-[1400px] px-5 py-16 sm:px-8 lg:px-10">
      <p className="font-display text-xl">Visit</p>
      <h1 className="mt-4 max-w-2xl font-display text-4xl leading-[1.12] sm:text-5xl">
        Experience the artwork <em className="italic">in person.</em>
      </h1>

      <div className="mt-12 grid gap-10 border-t border-line pt-10 sm:grid-cols-2">
        {galleries.map((g) => (
          <div key={g.city}>
            <p className="font-display text-2xl">{g.city}</p>
            {g.lines.map((l) => (
              <p key={l} className="mt-2 text-sm text-muted">
                {l}
              </p>
            ))}
          </div>
        ))}
      </div>

      <div className="mt-12 border-t border-line pt-10 text-sm">
        <a href="tel:+918860277388" className="block hover:text-signal">
          +91 88602 77388
        </a>
        <a href="mailto:info@uchaanarts.com" className="mt-1 block text-muted hover:text-signal">
          info@uchaanarts.com
        </a>
      </div>
    </div>
  );
}

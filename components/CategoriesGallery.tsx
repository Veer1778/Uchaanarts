import Image from "next/image";
import Link from "next/link";
import { categories } from "@/lib/data";

/**
 * "By category" — a row of clickable cards, matching the reference:
 * artwork image, dark gradient at the foot, serif label bottom-left,
 * rounded corners and a soft shadow. The whole card is the link.
 *
 * Note: these are plain DOM images on purpose. The earlier WebGL version
 * required `crossOrigin="anonymous"` to upload textures, and uchaanarts.com
 * doesn't send CORS headers — so every image silently failed to load.
 */

const U = "https://www.uchaanarts.com/uploaded_files";

// Only images already proven to load on the site are used here.
const categoryImages: Record<string, string> = {
  Painting: `${U}/slider/1762953059_untitled_design_2.jpg`,
  Sculpture: `${U}/itempic/thumbmain/1726310195_agomoni_17x19x5_bronze_140000.jpg`,
  Serigraph: `${U}/slider/1728130444_ganesha_series_36x54_oil_on_linen_canvas_300000_-_copy.jpg`,
  Photography: `${U}/itempic/thumbmain/1780502416_vijay_nandi_2.jpeg`,
  "Digital Art": `${U}/slider/1764488212_untitled_design_2.png`,
  "Folk Art": `${U}/slider/1724254173_wash_copy.jpg`,
};

// Limit the row to six cards so it stays a single tidy line.
const MAX_CARDS = 6;

export default function CategoriesGallery() {
  const shown = categories.slice(0, MAX_CARDS);

  return (
    <>
      {/* Clear divide between the hero and this section */}
      <div className="mx-auto max-w-6xl px-5">
        <hr className="border-t border-line" />
      </div>

      <section className="mx-auto max-w-6xl px-5 pt-16" aria-labelledby="categories">
        <p className="mb-3 text-[11px] uppercase tracking-[0.3em] text-signal">
          Explore our diverse range of art
        </p>
        <h2 id="categories" className="mb-10 font-display text-4xl leading-tight sm:text-5xl">
          By category
        </h2>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {shown.map((c) => (
            <Link
              key={c}
              href={`/art-gallery?category=${encodeURIComponent(c)}`}
              aria-label={`Browse ${c}`}
              className="group relative block aspect-[3/4] overflow-hidden rounded-[10px] shadow-[0_10px_30px_-12px_rgba(0,0,0,0.35)] transition-transform duration-300 hover:-translate-y-1"
            >
              <Image
                src={categoryImages[c]}
                alt={c}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Foot gradient so the label always reads */}
              <span className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/15 to-transparent" />
              <span className="absolute bottom-4 left-4 font-display text-lg text-white">
                {c}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

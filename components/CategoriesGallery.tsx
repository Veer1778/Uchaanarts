"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { categories } from "@/lib/data";

// WebGL — load on the client only.
const CircularGallery = dynamic(() => import("./CircularGallery"), { ssr: false });

const categoryImages: Record<string, string> = {
  Painting:
    "https://www.uchaanarts.com/uploaded_files/slider/1762953059_untitled_design_2.jpg",
  Sculpture:
    "https://www.uchaanarts.com/uploaded_files/itempic/thumbmain/1726310195_agomoni_17x19x5_bronze_140000.jpg",
  Serigraph:
    "https://www.uchaanarts.com/uploaded_files/slider/1728130444_ganesha_series_36x54_oil_on_linen_canvas_300000_-_copy.jpg",
  Photography:
    "https://www.uchaanarts.com/uploaded_files/slider/1724252030_neeraj.jpg",
  "Digital Art":
    "https://www.uchaanarts.com/uploaded_files/slider/1764488212_untitled_design_2.png",
  "Folk Art":
    "https://www.uchaanarts.com/uploaded_files/slider/1724254173_wash_copy.jpg",
};

const items = categories.map((c) => ({ image: categoryImages[c], text: c }));

export default function CategoriesGallery() {
  return (
    <section className="relative pt-20" aria-labelledby="categories">
      <div className="mx-auto max-w-6xl px-5">
        <p className="mb-3 text-[11px] uppercase tracking-[0.3em] text-signal">
          Explore our diverse range of art
        </p>
        <h2 id="categories" className="font-display text-4xl leading-tight sm:text-5xl">
          By category
        </h2>
      </div>

      {/* Curved, draggable gallery. Full-bleed so the arc reads properly. */}
      <div className="mt-8 h-[460px] w-full sm:h-[520px]">
        <CircularGallery
          items={items}
          bend={3}
          textColor="#121212"
          borderRadius={0.05}
          scrollEase={0.02}
          font="500 28px Poppins"
          fontUrl="https://fonts.googleapis.com/css2?family=Poppins:wght@500&display=swap"
        />
      </div>

      {/* Real links — the canvas above is decorative and not keyboard/SEO friendly. */}
      <div className="mx-auto mt-2 flex max-w-6xl flex-wrap justify-center gap-3 px-5">
        {categories.map((c) => (
          <Link
            key={c}
            href={`/art-gallery?category=${encodeURIComponent(c)}`}
            className="border border-line px-5 py-2 text-xs uppercase tracking-[0.14em] transition-colors hover:border-signal hover:text-signal"
          >
            {c}
          </Link>
        ))}
      </div>
    </section>
  );
}

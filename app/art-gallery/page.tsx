import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import GalleryGrid from "@/components/GalleryGrid";
import { getArtworks, getArtists } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Art Gallery",
  description:
    "Browse original paintings, sculpture, serigraphs and more from India's finest contemporary artists.",
};

export default async function ArtGalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; price?: string }>;
}) {
  const params = await searchParams;
  const [artworks, artists] = await Promise.all([getArtworks(), getArtists()]);

  return (
    <section className="relative mx-auto max-w-7xl px-5 pt-14">
      <div className="aura -right-40 -top-24 h-80 w-80" />
      <Reveal>
        <h1 className="mb-3 font-display text-5xl sm:text-6xl">
          Art <span className="text-signal">gallery</span>
        </h1>
        <p className="mb-12 max-w-xl text-sm text-muted">
          Every piece is an original, photographed to capture its essence and
          shipped worldwide. Filter by category, artist or budget.
        </p>
      </Reveal>
      <GalleryGrid
        artworks={artworks}
        artists={artists}
        initialCategory={params.category}
        initialPriceBand={params.price !== undefined ? Number(params.price) : undefined}
      />
    </section>
  );
}

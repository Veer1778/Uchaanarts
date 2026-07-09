import type { Metadata } from "next";
import WishlistView from "@/components/WishlistView";

export const metadata: Metadata = {
  title: "Wishlist",
  description: "Artworks you've saved at Uchaan Arts.",
};

export default function WishlistPage() {
  return (
    <section className="relative mx-auto max-w-6xl px-5 pt-14">
      <div className="aura -right-40 top-0 h-80 w-80" />
      <h1 className="mb-3 font-display text-5xl sm:text-6xl">
        Your <span className="text-signal">wishlist</span>
      </h1>
      <p className="mb-12 max-w-xl text-sm text-muted">
        Saved works, kept in one place. They live in this browser — sign-in sync
        comes with the WooCommerce customer accounts integration.
      </p>
      <WishlistView />
    </section>
  );
}

/**
 * Editorial and marketing copy for the homepage sections, kept apart from the
 * catalogue data in lib/data.ts so it can move to the CMS later without
 * touching the artwork model.
 */

export const curatedPaths = [
  {
    slug: "under-50k",
    title: "Art Under ₹50,000",
    blurb: "Thoughtful works for every space",
    href: "/art-gallery?price=0",
    icon: "rupee" as const,
  },
  {
    slug: "large-format",
    title: "Large-Format Works",
    blurb: "Make a statement in your space",
    href: "/art-gallery?size=L",
    icon: "frame" as const,
  },
  {
    slug: "emerging",
    title: "Emerging Artists",
    blurb: "Discover new voices and perspectives",
    href: "/artists",
    icon: "sprout" as const,
  },
  {
    slug: "abstract",
    title: "Abstract & Minimal",
    blurb: "Quiet, timeless and considered",
    href: "/art-gallery?category=Abstract",
    icon: "grid" as const,
  },
];

export const advisorySteps = [
  { n: "01", label: "Tell us about your space" },
  { n: "02", label: "Receive a curated shortlist" },
  { n: "03", label: "Finalise delivery and installation" },
];

export const realSpaces = [
  {
    label: "Homes",
    sub: "Private Residences",
    image:
      "https://www.uchaanarts.com/uploaded_files/slider/1762953059_untitled_design_2.jpg",
  },
  {
    label: "Hospitality",
    sub: "Hotels & Restaurants",
    image:
      "https://www.uchaanarts.com/uploaded_files/itempic/thumbmain/1744531634_whatsapp_image_2025-04-12_at_190101_5eb25f3e.jpg",
  },
  {
    label: "Workspaces",
    sub: "Offices & Corporate",
    image:
      "https://www.uchaanarts.com/uploaded_files/slider/1724254173_wash_copy.jpg",
  },
  {
    label: "Public Spaces",
    sub: "Institutions & Galleries",
    image:
      "https://www.uchaanarts.com/uploaded_files/itempic/thumbmain/1726310195_agomoni_17x19x5_bronze_140000.jpg",
  },
];

export const assurances = [
  {
    icon: "certificate" as const,
    title: "Original Works",
    body: "Every artwork is an original or a clearly identified edition.",
  },
  {
    icon: "guidance" as const,
    title: "Curatorial Guidance",
    body: "Personal recommendations for collectors and spaces.",
  },
  {
    icon: "relationships" as const,
    title: "Artist Relationships",
    body: "A growing programme of established and emerging artists.",
  },
  {
    icon: "delivery" as const,
    title: "Safe Delivery",
    body: "Professional packing and worldwide shipping.",
  },
];

export const testimonials = [
  {
    quote:
      "Uchaan helped us find a work that completely transformed our living space.",
    by: "Raghav & Meera, New Delhi",
  },
  {
    quote:
      "Their understanding of scale, mood and our taste was remarkable.",
    by: "Architect Studio Origin",
  },
  {
    quote:
      "The entire experience, from curation to delivery, was seamless.",
    by: "Collector, Bengaluru",
  },
];

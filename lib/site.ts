/**
 * Editorial and marketing copy for the homepage sections, kept apart from the
 * catalogue data in lib/data.ts so it can move to the CMS later without
 * touching the artwork model.
 */

export const curatedPaths = [
  {
    slug: "under-50k",
    title: "Art Under ₹50,000",
    blurb: "Original works for first-time buyers and growing collections.",
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
    blurb: "Discover distinctive practices shaping the next chapter of Indian art.",
    href: "/artists",
    icon: "sprout" as const,
  },
  {
    slug: "abstract",
    title: "Abstract & Minimal",
    blurb: "Works defined by form, texture, rhythm and restraint.",
    href: "/art-gallery?category=Abstract",
    icon: "grid" as const,
  },
];

export const advisorySteps = [
  { n: "01", label: "Share Your Space and Preferences" },
  { n: "02", label: "Receive a Personalised Selection" },
  { n: "03", label: "Choose Your Work and Leave the Details to Us" },
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
    title: "Originality Assured",
    body: "Every work is an original or a clearly documented limited edition.",
  },
  {
    icon: "guidance" as const,
    title: "Personal Curatorial Guidance",
    body: "Thoughtful recommendations shaped around your taste, space and budget.",
  },
  {
    icon: "relationships" as const,
    title: "Rooted in Artist Relationships",
    body: "We work closely with established names and compelling new voices.",
  },
  {
    icon: "delivery" as const,
    title: "Handled with Care",
    body: "Secure packing and coordinated delivery across India and internationally.",
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

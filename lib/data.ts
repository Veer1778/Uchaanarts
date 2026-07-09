// ---------------------------------------------------------------------------
// Demo content layer.
//
// This file mirrors the shape of what WordPress/WooCommerce returns (see
// lib/cms.ts and lib/wordpress.ts). It uses real artworks and artists from
// uchaanarts.com so the site is fully browsable before the CMS is connected.
// Once NEXT_PUBLIC_WP_URL is set, lib/cms.ts pulls from WordPress instead
// and this file is ignored.
// ---------------------------------------------------------------------------

export type Artist = {
  slug: string;
  name: string;
  location: string;
  bio: string;
  image: string;
  featured?: boolean;
};

export type Artwork = {
  slug: string;
  title: string;
  artist: string; // artist slug
  image: string;
  medium: string;
  category: "Painting" | "Sculpture" | "Serigraph" | "Photography" | "Digital Art" | "Folk Art";
  size: string;
  price: number; // INR
  featured?: boolean;
  tag?: "Latest" | "Popular" | "Curated";
  /** WooCommerce product ID — used for headless checkout */
  wooId?: number;
  description: string;
};

export type Exhibition = {
  slug: string;
  title: string;
  artistLine: string;
  venue: string;
  start: string; // ISO date
  end: string;
  image: string;
  blurb: string;
};

export type Post = {
  slug: string;
  title: string;
  category: "Art Insights" | "Events & Workshops" | "Artist Spotlight";
  date: string;
  image: string;
  excerpt: string;
  body: string[];
};

const img = (path: string) => `https://www.uchaanarts.com/uploaded_files/${path}`;

export const artists: Artist[] = [
  {
    slug: "pankaj-bawdekar",
    name: "Pankaj Bawdekar",
    location: "Mumbai",
    bio: "Pankaj Bawdekar paints ceremony and movement — processions, elephants, festival crowds — with a palette that lets grey stone bloom into colour. His acrylics balance weight and celebration in equal measure.",
    image: img("itempic/thumbmain/1740229981_pankaj_bawadekar.jpg"),
    featured: true,
  },
  {
    slug: "ridhi-jain",
    name: "Ridhi Jain",
    location: "New Delhi",
    bio: "Ridhi Jain works in layered mixed media, drawing wild manes and untamed spirits out of gold-leafed grounds. Her 'Spirit' series studies the animal form as pure gesture.",
    image: img("itempic/thumbmain/1732105315_raghu_neware_search_of_eternity-1203__36x36_oil_on_canvas_180000.jpg"),
    featured: true,
  },
  {
    slug: "chandan-roy",
    name: "Chandan Roy",
    location: "Kolkata",
    bio: "A sculptor trained in the Bengal tradition, Chandan Roy casts everyday labour and festivity in bronze. 'Agomoni' captures the arrival celebrations of autumn in a single balanced composition.",
    image: img("itempic/thumbmain/1726310195_agomoni_17x19x5_bronze_140000.jpg"),
    featured: true,
  },
  {
    slug: "ramesh-jhawar",
    name: "Ramesh Jhawar",
    location: "Kolkata",
    bio: "Ramesh Jhawar is one of India's finest contemporary watercolourists. His street and market scenes trade in scarlet awnings, wet light and the everyday drama of commerce.",
    image: img("itempic/thumbmain/1744531634_whatsapp_image_2025-04-12_at_190101_5eb25f3e.jpg"),
    featured: true,
  },
  {
    slug: "raghu-neware",
    name: "Raghu Neware",
    location: "Nagpur",
    bio: "Raghu Neware's oils search for the eternal in the figurative — meditative canvases built up in warm, mineral tones.",
    image: img("itempic/thumbmain/1732105315_raghu_neware_search_of_eternity-1203__36x36_oil_on_canvas_180000.jpg"),
  },
  {
    slug: "jyoti-singh",
    name: "Jyoti Singh",
    location: "Varanasi",
    bio: "Jyoti Singh paints the river and its people — boats, ghats and quiet poses — in generous acrylic colour.",
    image: img("itempic/thumbmain/1763810405_whatsapp_image_2025-11-22_at_160530.jpeg"),
  },
  {
    slug: "suchismita-majumdar",
    name: "Suchismita Majumdar",
    location: "Kolkata",
    bio: "Suchismita Majumdar's 'Maya' works explore illusion and femininity through saturated acrylic portraiture.",
    image: img("itempic/thumbmain/1741109721_su.jpg"),
  },
  {
    slug: "vijay-vansh",
    name: "Vijay Vansh",
    location: "New Delhi",
    bio: "Vijay Vansh composes large-format devotional canvases where harmony is both subject and method.",
    image: img("itempic/thumbmain/1780502416_vijay_nandi_2.jpeg"),
  },
  {
    slug: "pratick-mallick",
    name: "Pratick Mallick",
    location: "Kolkata",
    bio: "Pratick Mallick's mixed-media horses vibrate with charcoal energy — resonance studies in motion and restraint.",
    image: img("itempic/thumbmain/1747563640_horse_resonance_1.JPG"),
  },
  {
    slug: "amit-srivastava",
    name: "Amit Srivastava",
    location: "New Delhi",
    bio: "A master realist, Amit Srivastava paints slowly and precisely, finding the extraordinary in ordinary vessels, faces and light. His devotional series in oil on linen are collected across India.",
    image: img("slider/1728130444_ganesha_series_36x54_oil_on_linen_canvas_300000_-_copy.jpg"),
  },
  {
    slug: "rajesh-baderia",
    name: "Rajesh K Baderia",
    location: "Bhopal",
    bio: "Rajesh K Baderia works in bold, vibrant abstraction, treating colour as consciousness. His 'Cosmos Within' series maps an inner, spiritual landscape.",
    image: img("slider/1764488212_untitled_design_2.png"),
  },
  {
    slug: "jyoti-kalra",
    name: "Jyoti Kalra",
    location: "Gurgaon",
    bio: "Jyoti Kalra's wash paintings and folk-inspired works celebrate the monsoon and the handmade, in soft, layered watercolour.",
    image: img("slider/1724254173_wash_copy.jpg"),
  },
];

export const artworks: Artwork[] = [
  {
    slug: "procession",
    title: "Procession",
    artist: "pankaj-bawdekar",
    image: img("itempic/thumbmain/1740229981_pankaj_bawadekar.jpg"),
    medium: "Acrylic on Canvas",
    category: "Painting",
    size: "30 x 30 in",
    price: 150000,
    featured: true,
    tag: "Latest",
    description:
      "A ceremonial elephant emerges from grey stone into bursts of pink, blue and gold — Bawdekar's meditation on how celebration colours the everyday.",
  },
  {
    slug: "agomoni",
    title: "Agomoni",
    artist: "chandan-roy",
    image: img("itempic/thumbmain/1726310195_agomoni_17x19x5_bronze_140000.jpg"),
    medium: "Bronze",
    category: "Sculpture",
    size: "17 x 19 x 5 in",
    price: 140000,
    featured: true,
    tag: "Latest",
    description:
      "Cast in bronze, 'Agomoni' — the arrival — gathers a procession of figures balanced on a single pedestal, celebrating the homecoming rhythms of autumn in Bengal.",
  },
  {
    slug: "spirit",
    title: "Spirit",
    artist: "ridhi-jain",
    image: img("itempic/thumbmain/1747563640_horse_resonance_1.JPG"),
    medium: "Mixed Media on Canvas",
    category: "Painting",
    size: "33 x 33 in",
    price: 115000,
    featured: true,
    tag: "Latest",
    description:
      "A wild mane rendered in ink-black strokes against a gilded ground — the animal reduced to pure, untamed gesture.",
  },
  {
    slug: "market-hustle",
    title: "Market Hustle",
    artist: "ramesh-jhawar",
    image: img("itempic/thumbmain/1744531634_whatsapp_image_2025-04-12_at_190101_5eb25f3e.jpg"),
    medium: "Watercolour on Paper",
    category: "Painting",
    size: "22 x 29 in",
    price: 50000,
    featured: true,
    tag: "Latest",
    description:
      "Scarlet awnings, wet stone and the churn of trade — Jhawar's watercolour catches a market at full tilt.",
  },
  {
    slug: "search-of-eternity",
    title: "Search of Eternity — 1203",
    artist: "raghu-neware",
    image: img("itempic/thumbmain/1732105315_raghu_neware_search_of_eternity-1203__36x36_oil_on_canvas_180000.jpg"),
    medium: "Oil on Canvas",
    category: "Painting",
    size: "36 x 36 in",
    price: 180000,
    featured: true,
    tag: "Popular",
    description:
      "Part of Neware's long-running series, this oil turns the figurative inward — a search rendered in warm mineral tones.",
  },
  {
    slug: "posing-on-a-boat",
    title: "Posing on a Boat",
    artist: "jyoti-singh",
    image: img("itempic/thumbmain/1763810405_whatsapp_image_2025-11-22_at_160530.jpeg"),
    medium: "Acrylic on Canvas",
    category: "Painting",
    size: "48 x 48 in",
    price: 112000,
    tag: "Popular",
    description:
      "River light and generous colour: Jyoti Singh's Varanasi seen from the water, mid-pose, mid-story.",
  },
  {
    slug: "maya",
    title: "Maya",
    artist: "suchismita-majumdar",
    image: img("itempic/thumbmain/1741109721_su.jpg"),
    medium: "Acrylic on Canvas",
    category: "Painting",
    size: "36 x 36 in",
    price: 150000,
    tag: "Curated",
    description:
      "Illusion as portrait — Majumdar's 'Maya' holds the viewer's gaze and asks what is real in it.",
  },
  {
    slug: "divine-harmony",
    title: "Divine Harmony",
    artist: "vijay-vansh",
    image: img("itempic/thumbmain/1780502416_vijay_nandi_2.jpeg"),
    medium: "Acrylic on Canvas",
    category: "Painting",
    size: "48 x 72 in",
    price: 750000,
    tag: "Curated",
    description:
      "A large-format devotional canvas where composition itself becomes an act of worship.",
  },
  {
    slug: "horse-resonance-1",
    title: "Horse (Resonance) 1",
    artist: "pratick-mallick",
    image: img("itempic/thumbmain/1747563640_horse_resonance_1.JPG"),
    medium: "Mixed Media on Paper",
    category: "Painting",
    size: "40 x 28 in",
    price: 120000,
    tag: "Popular",
    description:
      "Charcoal energy in motion — the first of Mallick's resonance studies, where the horse is less an animal than a frequency.",
  },
  {
    slug: "ganesha-series",
    title: "Ganesha Series",
    artist: "amit-srivastava",
    image: img("slider/1728130444_ganesha_series_36x54_oil_on_linen_canvas_300000_-_copy.jpg"),
    medium: "Oil on Linen Canvas",
    category: "Painting",
    size: "36 x 54 in",
    price: 300000,
    featured: true,
    tag: "Curated",
    description:
      "A large devotional canvas from Srivastava's Ganesha series — realism in the service of stillness and reverence.",
  },
  {
    slug: "cosmos-within",
    title: "Cosmos Within",
    artist: "rajesh-baderia",
    image: img("slider/1764488212_untitled_design_2.png"),
    medium: "Digital Print on Archival Paper",
    category: "Digital Art",
    size: "24 x 24 in",
    price: 95000,
    tag: "Curated",
    description:
      "From Baderia's abstraction of inner consciousness — colour treated as spiritual weather.",
  },
  {
    slug: "monsoon-wash",
    title: "Monsoon Wash",
    artist: "jyoti-kalra",
    image: img("slider/1724254173_wash_copy.jpg"),
    medium: "Watercolour Wash on Paper",
    category: "Folk Art",
    size: "18 x 22 in",
    price: 22000,
    tag: "Latest",
    description:
      "A soft, layered wash celebrating the mood of the monsoon — from the Monsoon Muse camp.",
  },
];

export const exhibitions: Exhibition[] = [
  {
    slug: "cosmos-within",
    title: "Cosmos Within",
    artistLine: "A solo exhibition by Rajesh K Baderia, curated by Kapil Kapoor",
    venue: "Uchaan Arts Gallery, Gurgaon",
    start: "2026-08-08",
    end: "2026-08-24",
    image: img("slider/1764488212_untitled_design_2.png"),
    blurb:
      "Bold, vibrant canvases exploring abstraction, spirituality and inner consciousness — a journey from pigment to presence.",
  },
  {
    slug: "drawing-painting-from-life",
    title: "Drawing & Painting From Life",
    artistLine: "A 4-month mentorship with master realist Amit Srivastava",
    venue: "Uchaan Arts Academy, Delhi",
    start: "2026-09-01",
    end: "2026-12-20",
    image: img("slider/1732188587_realistic.png"),
    blurb:
      "Classical drawing and oil painting techniques focused on observation, strong foundations, still life and life drawing. Limited seats.",
  },
  {
    slug: "monsoon-muse-art-camp",
    title: "Monsoon Muse Art Camp",
    artistLine: "Curated by Jyoti Kalra",
    venue: "Uchaan Arts Gallery, Gurgaon",
    start: "2024-07-20",
    end: "2024-07-21",
    image: img("slider/1724254173_wash_copy.jpg"),
    blurb:
      "An enchanting confluence of artistic expressions inspired by the beauty and mystique of the monsoon season.",
  },
];

export const posts: Post[] = [
  {
    slug: "mentorship-program",
    title: "Mentorship Program: Drawing & Painting From Life",
    category: "Events & Workshops",
    date: "2026-06-12",
    image: img("slider/1732188587_realistic.png"),
    excerpt:
      "Learn classical drawing and oil painting at Uchaan Arts Academy, Delhi — a 4-month course taught by master realist Amit Srivastava.",
    body: [
      "Uchaan Arts Academy opens enrolment for 'Drawing & Painting From Life', a four-month intensive taught by master realist Amit Srivastava in Delhi.",
      "The course builds from observation upward: strong foundations, still life, and life drawing, with classical oil technique introduced once drawing discipline is in place.",
      "Seats are limited to keep the studio ratio low. Write to info@uchaanarts.com to reserve a place.",
    ],
  },
  {
    slug: "cosmos-within",
    title: "Cosmos Within",
    category: "Events & Workshops",
    date: "2026-05-30",
    image: img("slider/1764488212_untitled_design_2.png"),
    excerpt:
      "Uchaan Arts presents 'Cosmos Within' — a solo exhibition by Rajesh K Baderia exploring abstraction, spirituality and inner consciousness.",
    body: [
      "Curated by Kapil Kapoor, 'Cosmos Within' gathers Rajesh K Baderia's most recent canvases — bold, vibrant fields where abstraction becomes a spiritual practice.",
      "The show reads as a single journey inward: colour as consciousness, gesture as breath.",
      "The exhibition opens at the Gurgaon gallery this August. Preview requests are open now.",
    ],
  },
  {
    slug: "the-art-of-stillness",
    title: "The Art of Stillness: Amit Srivastava's Journey in Realism",
    category: "Artist Spotlight",
    date: "2026-03-18",
    image: img("slider/1728130444_ganesha_series_36x54_oil_on_linen_canvas_300000_-_copy.jpg"),
    excerpt:
      "An artist who finds beauty in stillness, capturing the essence of the real world through detailed, serene paintings.",
    body: [
      "Amit Srivastava paints slowly, and it shows — every canvas carries the calm of long looking.",
      "His subjects are ordinary: vessels, fruit, faces, light on a wall. The extraordinary part is the patience — precision in the service of serenity rather than spectacle.",
      "For Srivastava, realism is not reproduction. It is attention, sustained until the everyday gives up its quiet.",
    ],
  },
  {
    slug: "depths-of-human-connection",
    title: "Unveiling the Depths of Human Connection: Ajay Kumar Samir",
    category: "Artist Spotlight",
    date: "2025-11-02",
    image: img("itempic/thumbmain/1741109721_su.jpg"),
    excerpt:
      "A hauntingly beautiful exploration of human connection and the complexities of the heart, in Samir's latest masterpiece.",
    body: [
      "Ajay Kumar Samir's newest work is a mesmerising study of intimacy — figures bound and separated by the same lines.",
      "The canvas rewards slow viewing: what reads first as embrace resolves, on the second look, into distance.",
      "It is this doubleness — connection as both comfort and complexity — that has made the piece the talking point of the season.",
    ],
  },
  {
    slug: "exploring-realistic-art",
    title: "Exploring the Depth and Beauty of Realistic Art",
    category: "Art Insights",
    date: "2025-08-14",
    image: img("slider/1732188587_realistic.png"),
    excerpt:
      "Realism seeks to depict subjects as they appear in everyday life — celebrated for precision, detail and honesty.",
    body: [
      "Realism asks a deceptively simple question: what does it take to paint the world as it is?",
      "The answer, historically, has been discipline — drawing from life, understanding light, and refusing shortcuts of style.",
      "In contemporary Indian practice, realism is having a quiet renaissance, with collectors returning to work that rewards close, repeated looking.",
    ],
  },
  {
    slug: "monsoon-muse-art-camp",
    title: "Monsoon Muse Art Camp: A Celebration of Art and Inspiration",
    category: "Events & Workshops",
    date: "2024-07-25",
    image: img("slider/1724254173_wash_copy.jpg"),
    excerpt:
      "Curated by Jyoti Kalra, an enchanting confluence of artistic expressions inspired by the monsoon season.",
    body: [
      "For two days in July, the gallery traded white walls for weather — the Monsoon Muse Art Camp brought artists together to paint the season itself.",
      "Curated by Jyoti Kalra, the camp produced work in watercolour, ink and acrylic, all of it wet-edged and alive.",
      "A selection of camp works is now available through the gallery.",
    ],
  },
];

// -- helpers ---------------------------------------------------------------

export const formatINR = (n: number) =>
  "\u20B9" + n.toLocaleString("en-IN");

export const artistBySlug = (slug: string) => artists.find((a) => a.slug === slug);

export const artworksByArtist = (slug: string) =>
  artworks.filter((w) => w.artist === slug);

export const categories = [
  "Painting",
  "Sculpture",
  "Serigraph",
  "Photography",
  "Digital Art",
  "Folk Art",
] as const;

export const priceBands = [
  { label: "Under \u20B910,000", min: 0, max: 10000 },
  { label: "\u20B910,000 – 25,000", min: 10000, max: 25000 },
  { label: "\u20B925,000 – 50,000", min: 25000, max: 50000 },
  { label: "\u20B950,000 – 75,000", min: 50000, max: 75000 },
  { label: "\u20B975,000 – 1,00,000", min: 75000, max: 100000 },
  { label: "Over \u20B91,00,000", min: 100000, max: Infinity },
] as const;

/** Build a plain slug -> name map, safe to pass from Server to Client Components. */
export const namesMap = (list: { slug: string; name: string }[]) =>
  Object.fromEntries(list.map((a) => [a.slug, a.name])) as Record<string, string>;

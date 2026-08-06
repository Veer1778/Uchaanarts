/**
 * Uchaan Arts API client
 *
 * Drop at: src/lib/api.ts
 *
 * Set NEXT_PUBLIC_API_URL=https://uchaanarts.com/api in .env.local, and add
 * the same value in Vercel under Settings -> Environment Variables for
 * Production, Preview, and Development. Next.js only exposes vars prefixed
 * with NEXT_PUBLIC_ to the browser.
 *
 * Every component should import from here. Nothing else should call fetch().
 * When you delete the demo data, this file is the only thing that changes.
 */

const BASE = process.env.NEXT_PUBLIC_API_URL || 'https://uchaanarts.com/api';

// ---------------------------------------------------------------
// Response envelope
// ---------------------------------------------------------------

export interface Meta {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

interface Envelope<T> {
  success: boolean;
  data: T;
  meta?: Meta;
  error?: { code: number; message: string };
}

export interface Paged<T> {
  items: T[];
  meta: Meta;
}

// ---------------------------------------------------------------
// Domain types
// ---------------------------------------------------------------

export interface Dimensions {
  width: string | null;
  height: string | null;
  depth: string | null;
  unit: string;
}

export interface Artwork {
  id: number;
  slug: string;
  name: string;
  code: string | null;
  artist_id: number;
  artist_name: string | null;
  image: string | null;
  available: boolean;
  price_on_request: boolean;
  price: number | null;
  mrp: number | null;
  discount: number;
  currency: string;
  featured: boolean;
  medium: string | null;
  surface: string | null;
  material: string | null;
  size_label: string | null;
  dimensions: Dimensions;
  year: number | null;
  short_description: string | null;
  description: string | null;
  category_ids: number[];
}

export interface Term {
  id: number;
  name: string;
}

export interface Artist {
  id: number;
  slug: string;
  name: string;
  first_name: string;
  last_name: string;
  bio: string | null;
  image: string | null;
  banner: string | null;
  featured: boolean;
  gender: string | null;
}

export interface ArtworkDetail extends Artwork {
  artist: Artist | null;
  gallery: string[];
  attributes: {
    styles: Term[];
    themes: Term[];
    medium: Term | null;
    material: Term | null;
    size: Term | null;
  };
  similar: Artwork[];
  more_by_artist: Artwork[];
}

export interface ArtistDetail extends Artist {
  city: string | null;
  country: string | null;
  artworks: Artwork[];
}

export interface Category {
  id: number;
  name: string;
  permalink: string | null;
  image: string | null;
  featured: boolean;
}

export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  short_description: string | null;
  image: string | null;
  category_id: number;
  published_date: string | null;
  details?: string;
  category?: { id: number; name: string | null; permalink: string | null } | null;
}

export interface Exhibition {
  id: number;
  slug: string;
  title: string;
  type: string;
  start_date: string | null;
  end_date: string | null;
  date_text: string | null;
  venue: string | null;
  image: string | null;
  flyer: string | null;
  apply_now: boolean;
  description?: string;
  artworks?: Artwork[];
}

export interface EventItem {
  id: number;
  slug: string;
  name: string;
  date: string | null;
  venue: string | null;
  text: string | null;
  image: string | null;
  type: string;
  description?: string;
}

export interface Slide {
  id: number;
  title: string | null;
  image: string | null;
  link: string | null;
  label: string | null;
}

export interface HomePayload {
  sliders: Slide[];
  banners: Slide[];
  shop_by_category: Slide[];
  featured_artworks: Artwork[];
  featured_artists: Artist[];
  categories: Category[];
  blogs: BlogPost[];
}

export interface Filters {
  styles: Term[];
  themes: Term[];
  mediums: Term[];
  materials: Term[];
  sizes: Term[];
  categories: Category[];
  price_bands: { id: number; label: string }[];
  sorts: string[];
}

export interface ArtworkQuery {
  page?: number;
  per_page?: number;
  category?: number;
  styles?: number[];
  themes?: number[];
  mediums?: number[];
  materials?: number[];
  sizes?: number[];
  artists?: number[];
  price?: number;
  sort?: 'new_old' | 'old_new' | 'high_low' | 'low_high' | 'name';
  q?: string;
  featured?: boolean;
  include_sold?: boolean;
}

// ---------------------------------------------------------------
// Core request
// ---------------------------------------------------------------

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/**
 * Generic rather than Record<string, unknown>: interfaces like ArtworkQuery
 * have no implicit index signature, so they are not assignable to Record.
 * Object.entries accepts any object, so a generic constraint is enough.
 */
function qs<T extends object>(params: T): string {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(params) as [string, unknown][]) {
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value)) {
      if (value.length === 0) continue;
      parts.push(`${key}=${encodeURIComponent(value.join(','))}`);
    } else if (typeof value === 'boolean') {
      if (value) parts.push(`${key}=1`);
    } else {
      parts.push(`${key}=${encodeURIComponent(String(value))}`);
    }
  }
  return parts.length ? `?${parts.join('&')}` : '';
}

async function request<T>(path: string, init?: RequestInit): Promise<Envelope<T>> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });

  let body: Envelope<T>;
  try {
    body = await res.json();
  } catch {
    throw new ApiError(`Bad JSON from ${path} (HTTP ${res.status})`, res.status);
  }

  if (!res.ok || !body.success) {
    throw new ApiError(body?.error?.message ?? `Request failed: ${path}`, res.status);
  }
  return body;
}

async function get<T>(path: string): Promise<T> {
  return (await request<T>(path)).data;
}

async function getPaged<T>(path: string): Promise<Paged<T>> {
  const body = await request<T[]>(path);
  return {
    items: body.data,
    meta: body.meta ?? { page: 1, per_page: body.data.length, total: body.data.length, total_pages: 1 },
  };
}

async function post<T>(path: string, payload: unknown): Promise<T> {
  return (await request<T>(path, { method: 'POST', body: JSON.stringify(payload) })).data;
}

// ---------------------------------------------------------------
// Endpoints
// ---------------------------------------------------------------

export const api = {
  home: () => get<HomePayload>('/home'),

  artworks: (params: ArtworkQuery = {}) => getPaged<Artwork>(`/artworks${qs(params)}`),
  artwork: (id: number | string) => get<ArtworkDetail>(`/artworks/${idOf(id)}`),

  artists: (params: { page?: number; per_page?: number; search?: string; start?: string; featured?: boolean } = {}) =>
    getPaged<Artist>(`/artists${qs(params)}`),
  artist: (id: number | string) => get<ArtistDetail>(`/artists/${idOf(id)}`),

  filters: () => get<Filters>('/filters'),
  categories: () => get<Category[]>('/categories'),

  blogs: (params: { page?: number; per_page?: number; category?: string | number } = {}) =>
    getPaged<BlogPost>(`/blogs${qs(params)}`),
  blog: (id: number | string) => get<BlogPost>(`/blogs/${idOf(id)}`),
  blogCategories: () => get<{ id: number; name: string | null; permalink: string | null }[]>('/blog_categories'),

  exhibitions: (params: { type?: 'upcoming' | 'past'; page?: number; per_page?: number } = {}) =>
    getPaged<Exhibition>(`/exhibitions${qs(params)}`),
  exhibition: (id: number | string) => get<Exhibition>(`/exhibitions/${idOf(id)}`),

  events: (params: { type?: 'upcoming' | 'past'; page?: number; per_page?: number } = {}) =>
    getPaged<EventItem>(`/events${qs(params)}`),
  event: (id: number | string) => get<EventItem>(`/events/${idOf(id)}`),

  testimonials: () => get<any[]>('/testimonials'),
  media: () => get<any[]>('/media'),
  pages: () => get<{ id: number; name: string; permalink: string }[]>('/pages'),
  page: (permalink: string) => get<any>(`/pages/${encodeURIComponent(permalink)}`),

  search: (q: string, limit = 10) =>
    get<{ query: string; artworks: Artwork[]; artists: Artist[] }>(`/search${qs({ q, per_page: limit })}`),

  contact: (payload: { name: string; email?: string; mobile?: string; message: string }) =>
    post<{ id: number; message: string }>('/contact', payload),

  enquiry: (payload: {
    name: string;
    email?: string;
    mobile?: string;
    message: string;
    item_id?: number;
    artist_id?: number;
  }) => post<{ id: number; message: string }>('/enquiry', payload),
};

/**
 * Slugs look like "sunset-over-varanasi-1284". The API takes the numeric id,
 * so pull the trailing number off whatever the router hands you.
 */
export function idOf(value: number | string): number {
  if (typeof value === 'number') return value;
  const tail = value.split('-').pop();
  return Number(tail);
}

export function formatPrice(work: Pick<Artwork, 'price' | 'price_on_request'>): string {
  if (work.price_on_request || work.price === null) return 'Price on request';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(work.price);
}

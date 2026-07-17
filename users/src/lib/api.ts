import type {
  AboutContent,
  Article,
  ArticleSummary,
  CarouselImage,
  Category,
  HeroSettings,
  Paginated,
  SiteSettings,
} from './types';

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

// Revalidate public content every 60s (ISR). Admin edits show up within a minute.
const REVALIDATE = 60;

async function get<T>(path: string, fallback: T, revalidate = REVALIDATE): Promise<T> {
  try {
    const res = await fetch(`${BASE}/api/public${path}`, { next: { revalidate } });
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch {
    // Network/backend down — degrade gracefully so the site still renders.
    return fallback;
  }
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  business_name: 'Betty & Promise Roofing System',
  tagline: "Nigeria's #1 Aluminium Roofing Sheet Supplier",
  logo_url: null,
  primary_color: '#2A2D33',
  secondary_color: '#FFFFFF',
  default_hero_color: '#2A2D33',
  phone: '',
  whatsapp: '',
  whatsapp_greeting:
    'Welcome to Betty & Promise Roofing System. How can we help you with your aluminium roofing today?',
  email: '',
  address: 'Lagos, Nigeria',
  city: 'Lagos',
  state: 'Lagos',
  country: 'Nigeria',
  lat: null,
  lng: null,
  facebook_url: '',
  instagram_url: '',
  twitter_url: '',
  linkedin_url: '',
  tiktok_url: '',
  default_meta_title:
    'Betty & Promise Roofing System — Aluminium Roofing Sheets in Lagos, Nigeria',
  default_meta_description:
    "Betty & Promise Roofing System is Lagos, Nigeria's leading supplier of premium aluminium roofing sheets.",
};

const DEFAULT_HERO: HeroSettings = {
  heading: 'Premium Aluminium Roofing Sheets in Lagos',
  subheading:
    'Durable, weather-proof and affordable roofing solutions — supplied and installed across Nigeria.',
  cta_label: 'Get a Free Quote',
  cta_href: '/about',
  secondary_cta_label: 'Read Our Blog',
  secondary_cta_href: '/articles',
  background_type: 'color',
  background_color: '#2A2D33',
  text_color: '#FFFFFF',
  overlay_opacity: 0.45,
  image_url: null,
};

export const getSiteSettings = () =>
  get<SiteSettings>('/site-settings', DEFAULT_SITE_SETTINGS);

export const getHero = () => get<HeroSettings>('/hero', DEFAULT_HERO);

export const getCarousel = () => get<CarouselImage[]>('/carousel', []);

export const getAbout = () =>
  get<AboutContent>('/about', {
    headline: 'About Betty & Promise Roofing System',
    subheading: 'Trusted aluminium roofing sheet supplier in Lagos, Nigeria.',
    body_html:
      '<p>Betty & Promise Roofing System is a leading supplier of premium aluminium roofing sheets in Lagos, Nigeria.</p>',
    image_url: null,
    stats: [],
    team: [],
  });

export const getCategories = () => get<Category[]>('/categories', []);

export const getArticles = (page = 1, limit = 9, featured = false, category?: string) =>
  get<Paginated<ArticleSummary>>(
    `/articles?page=${page}&limit=${limit}${featured ? '&featured=true' : ''}${
      category ? `&category=${encodeURIComponent(category)}` : ''
    }`,
    { items: [], page, limit, total: 0, totalPages: 0 },
  );

export async function getArticle(slug: string): Promise<Article | null> {
  try {
    const res = await fetch(`${BASE}/api/public/articles/${slug}`, {
      next: { revalidate: REVALIDATE },
    });
    if (!res.ok) return null;
    return (await res.json()) as Article;
  } catch {
    return null;
  }
}

export const getRelated = (slug: string) =>
  get<ArticleSummary[]>(`/articles/${slug}/related`, []);

export const getSitemapArticles = () =>
  get<{ slug: string; updated_at: string; published_at: string | null }[]>(
    '/sitemap-articles',
    [],
    300,
  );

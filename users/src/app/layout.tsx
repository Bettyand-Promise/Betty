import type { Metadata, Viewport } from 'next';
import { Inter, Fraunces } from 'next/font/google';
import './globals.css';

const sans = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

// Elegant variable serif for headings — gives the brand a premium, editorial feel.
const serif = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-serif',
  axes: ['opsz'],
});

export const viewport: Viewport = {
  themeColor: '#2A2D33',
  width: 'device-width',
  initialScale: 1,
};
import { getSiteSettings } from '@/lib/api';
import { SITE_URL, localBusinessJsonLd, organizationJsonLd } from '@/lib/seo';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import JsonLd from '@/components/JsonLd';
import FloatingActions from '@/components/FloatingActions';

// Build a square favicon from the admin logo (padded on the brand background so
// a wide logo isn't squished). Falls back to the default icon when no logo is set.
function faviconFrom(url: string | null): string | undefined {
  if (!url || !url.includes('/upload/')) return undefined;
  return url.replace('/upload/', '/upload/w_64,h_64,c_pad,b_rgb:fbf6f4,f_png/');
}

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  const favicon = faviconFrom(s.logo_url);
  return {
    metadataBase: new URL(SITE_URL),
    ...(favicon ? { icons: { icon: favicon, shortcut: favicon, apple: favicon } } : {}),
    title: {
      default: s.default_meta_title,
      template: `%s | ${s.business_name}`,
    },
    description: s.default_meta_description,
    keywords: [
      'aluminium roofing sheets',
      'roofing sheets Lagos',
      'roofing sheets Nigeria',
      'aluminium roofing Nigeria',
      'long span aluminium',
      'stone coated roofing',
      s.business_name,
    ],
    applicationName: s.business_name,
    authors: [{ name: s.business_name }],
    alternates: { canonical: '/' },
    openGraph: {
      type: 'website',
      siteName: s.business_name,
      title: s.default_meta_title,
      description: s.default_meta_description,
      url: SITE_URL,
      locale: 'en_NG',
    },
    twitter: {
      card: 'summary_large_image',
      title: s.default_meta_title,
      description: s.default_meta_description,
    },
    robots: { index: true, follow: true },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();

  // Feed admin-chosen brand colors into CSS variables as "R G B" channels (so
  // Tailwind opacity modifiers keep working). Gold/background/ink are fixed
  // design tokens set in globals.css, preserving the luxury palette.
  const channels = (hex: string, fallback: string) => {
    const h = (hex || '').replace('#', '');
    const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
    if (!/^[0-9a-fA-F]{6}$/.test(full)) return fallback;
    return `${parseInt(full.slice(0, 2), 16)} ${parseInt(full.slice(2, 4), 16)} ${parseInt(full.slice(4, 6), 16)}`;
  };
  const themeVars = `:root{--brand-primary:${channels(settings.primary_color, '42 45 51')};--brand-secondary:${channels(settings.secondary_color, '255 255 255')};}`;

  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <head>
        {/* Warm up the Cloudinary connection early so the LCP image lands faster. */}
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <style dangerouslySetInnerHTML={{ __html: themeVars }} />
      </head>
      <body>
        <JsonLd data={localBusinessJsonLd(settings)} />
        <JsonLd data={organizationJsonLd(settings)} />
        <Header settings={settings} />
        <main>{children}</main>
        <Footer settings={settings} />
        <FloatingActions
          whatsapp={settings.whatsapp}
          businessName={settings.business_name}
          greeting={settings.whatsapp_greeting}
        />
      </body>
    </html>
  );
}

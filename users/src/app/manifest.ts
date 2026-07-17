import type { MetadataRoute } from 'next';
import { getSiteSettings } from '@/lib/api';

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const s = await getSiteSettings();
  // Keep short_name compact (installed-app label): first word of the business name.
  const shortName = s.business_name.trim().split(/\s+/)[0] || s.business_name;

  return {
    name: s.business_name,
    short_name: shortName,
    description: s.default_meta_description,
    start_url: '/',
    display: 'standalone',
    background_color: '#FAF8F3',
    theme_color: s.primary_color || '#2A2D33',
    icons: [],
  };
}

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
    background_color: '#FBF6F4',
    theme_color: s.primary_color || '#7B1E2B',
    icons: [],
  };
}

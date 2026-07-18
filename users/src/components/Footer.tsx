import Link from 'next/link';
import type { SiteSettings } from '@/lib/types';
import {
  FacebookIcon,
  InstagramIcon,
  XIcon,
  LinkedInIcon,
  TikTokIcon,
} from './BrandIcons';

export default function Footer({ settings }: { settings: SiteSettings }) {
  const socials = [
    { label: 'Facebook', url: settings.facebook_url, Icon: FacebookIcon },
    { label: 'Instagram', url: settings.instagram_url, Icon: InstagramIcon },
    { label: 'X (Twitter)', url: settings.twitter_url, Icon: XIcon },
    { label: 'LinkedIn', url: settings.linkedin_url, Icon: LinkedInIcon },
    { label: 'TikTok', url: settings.tiktok_url, Icon: TikTokIcon },
  ].filter((s) => s.url);

  return (
    <footer className="bg-brand-deep text-white">
      {/* Gold hairline */}
      <div className="h-px bg-gradient-to-r from-transparent via-brand-gold/50 to-transparent" />

      <div className="mx-auto grid max-w-content gap-10 px-5 py-16 md:grid-cols-3">
        <div>
          <h3 className="font-serif text-2xl font-semibold">
            {settings.business_name.split(' ').slice(0, 2).join(' ')}
            <span className="text-brand-gold"> {settings.business_name.split(' ').slice(2).join(' ')}</span>
          </h3>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/70">{settings.tagline}</p>
        </div>

        <div>
          <h4 className="mb-4 text-xs font-bold uppercase tracking-wider2 text-brand-gold">Explore</h4>
          <ul className="space-y-2.5 text-sm text-white/75">
            <li><Link href="/" className="transition-colors hover:text-white">Home</Link></li>
            <li><Link href="/articles" className="transition-colors hover:text-white">Articles</Link></li>
            <li><Link href="/about" className="transition-colors hover:text-white">About Us</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-xs font-bold uppercase tracking-wider2 text-brand-gold">Contact</h4>
          <ul className="space-y-2.5 text-sm text-white/75">
            {settings.address && <li>{settings.address}</li>}
            {settings.phone && (
              <li><a href={`tel:${settings.phone}`} className="transition-colors hover:text-white">{settings.phone}</a></li>
            )}
            {settings.email && (
              <li><a href={`mailto:${settings.email}`} className="transition-colors hover:text-white">{settings.email}</a></li>
            )}
            {settings.whatsapp && (
              <li>
                <a
                  href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`}
                  className="transition-colors hover:text-white"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp
                </a>
              </li>
            )}
          </ul>
          {socials.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2.5">
              {socials.map(({ label, url, Icon }) => (
                <a
                  key={label}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  title={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/75 transition-colors hover:border-brand-gold hover:text-brand-gold"
                >
                  <Icon />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-white/10 py-6 text-center text-xs text-white/50">
        © {new Date().getFullYear()} {settings.business_name}. Premium aluminium roofing sheets in Lagos, Nigeria.
      </div>
    </footer>
  );
}

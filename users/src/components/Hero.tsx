import Link from 'next/link';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';
import type { HeroSettings, SiteSettings } from '@/lib/types';

/**
 * Admin-designed hero. With background_type "image" + an image it renders the
 * Cloudinary image under a burgundy gradient; otherwise it falls back to a rich
 * solid-color background (admin-set background_color / default_hero_color).
 */
export default function Hero({ hero, settings }: { hero: HeroSettings; settings: SiteSettings }) {
  const useImage = hero.background_type === 'image' && !!hero.image_url;
  const fallbackColor = hero.background_color || settings.default_hero_color || '#2A2D33';

  return (
    <section
      className="relative flex min-h-[92vh] items-center overflow-hidden"
      style={!useImage ? { backgroundColor: fallbackColor } : undefined}
    >
      {useImage ? (
        <>
          <Image
            src={hero.image_url as string}
            alt={hero.heading}
            fill
            priority
            sizes="100vw"
            className="animate-kenburns object-cover"
          />
          {/* Burgundy gradient for legibility + brand warmth */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(105deg, rgba(74,14,26,${0.55 + hero.overlay_opacity * 0.4}) 0%, rgba(74,14,26,${hero.overlay_opacity * 0.6}) 55%, rgba(26, 28, 32,0.35) 100%)`,
            }}
          />
        </>
      ) : (
        // Subtle radial sheen + gold hairline on the solid-color hero
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(120% 120% at 80% 10%, rgba(224, 168, 46,0.18) 0%, rgba(224, 168, 46,0) 45%), linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(26, 28, 32,0.35) 100%)',
          }}
        />
      )}

      <div className="relative z-10 mx-auto w-full max-w-content px-5">
        <div className="max-w-2xl animate-fade-up">
          <span className="eyebrow mb-5" style={{ color: '#E9C75A' }}>
            Lagos · Nigeria
          </span>
          <h1
            className="font-serif text-4xl font-semibold leading-[1.08] sm:text-5xl md:text-6xl"
            style={{ color: hero.text_color || '#FFFFFF' }}
          >
            {hero.heading}
          </h1>
          {hero.subheading && (
            <p
              className="mt-6 max-w-xl text-base leading-relaxed sm:text-lg"
              style={{ color: hero.text_color || '#FFFFFF', opacity: 0.9 }}
            >
              {hero.subheading}
            </p>
          )}

          <div className="mt-9 flex flex-wrap items-center gap-4">
            {hero.cta_label && (
              <Link href={hero.cta_href || '/about'} className="btn-gold px-8 py-3.5">
                {hero.cta_label}
              </Link>
            )}
            {hero.secondary_cta_label && (
              <Link href={hero.secondary_cta_href || '/articles'} className="btn-outline px-8 py-3.5">
                {hero.secondary_cta_label}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <div className="absolute inset-x-0 bottom-7 z-10 flex justify-center">
        <ChevronDown size={26} className="animate-bounce text-white/70" />
      </div>

      {/* Gold hairline at the base of the hero */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand-gold/60 to-transparent" />
    </section>
  );
}

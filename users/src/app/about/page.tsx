import type { Metadata } from 'next';
import { getAbout, getSiteSettings } from '@/lib/api';
import Image from 'next/image';
import JsonLd from '@/components/JsonLd';
import { breadcrumbJsonLd } from '@/lib/seo';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  return {
    title: 'About Us',
    description: `Learn about ${s.business_name} — Lagos, Nigeria's trusted supplier of premium aluminium roofing sheets.`,
    alternates: { canonical: '/about' },
    openGraph: { title: `About ${s.business_name}`, url: '/about' },
  };
}

export default async function AboutPage() {
  const [about, settings] = await Promise.all([getAbout(), getSiteSettings()]);

  return (
    <div className="bg-brand-bg">
      <JsonLd data={breadcrumbJsonLd([{ name: 'Home', url: '/' }, { name: 'About Us', url: '/about' }])} />

      <section className="relative overflow-hidden bg-brand-deep pb-20 pt-36 text-center text-white">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(90% 130% at 50% 0%, rgba(224, 168, 46,0.18) 0%, rgba(224, 168, 46,0) 55%)',
          }}
        />
        <div className="relative mx-auto max-w-2xl px-5">
          <span className="eyebrow justify-center">Our Story</span>
          <h1 className="mt-4 font-serif text-4xl font-semibold sm:text-5xl">{about.headline}</h1>
          {about.subheading && <p className="mt-4 text-white/80">{about.subheading}</p>}
        </div>
      </section>

      <section className="mx-auto max-w-content px-5 py-20">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div
            className="prose-article"
            dangerouslySetInnerHTML={{ __html: about.body_html }}
          />
          {about.image_url ? (
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-lg">
              <Image
                src={about.image_url}
                alt={settings.business_name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex aspect-[4/3] items-center justify-center rounded-2xl bg-brand-primary/8 font-serif text-brand-primary">
              <span className="font-semibold">{settings.business_name}</span>
            </div>
          )}
        </div>

        {about.stats.length > 0 && (
          <div className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {about.stats.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-brand-ink/8 bg-white p-7 text-center shadow-soft"
              >
                <div className="font-serif text-4xl font-semibold text-brand-primary">{s.value}</div>
                <div className="mt-1.5 text-sm font-medium text-brand-muted">{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Contact band */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-content px-5">
          <div className="mb-10 text-center">
            <span className="eyebrow justify-center">Contact</span>
            <h2 className="mt-3 font-serif text-3xl font-semibold text-brand-ink sm:text-4xl">
              Get in Touch
            </h2>
          </div>
          <div className="grid gap-6 text-center sm:grid-cols-3">
            {settings.phone && (
              <div className="rounded-2xl border border-brand-ink/8 bg-brand-bg p-8 transition-shadow hover:shadow-card">
                <h3 className="font-serif text-lg font-semibold text-brand-primary">Call Us</h3>
                <a href={`tel:${settings.phone}`} className="mt-2 block text-brand-muted hover:text-brand-ink">
                  {settings.phone}
                </a>
              </div>
            )}
            {settings.email && (
              <div className="rounded-2xl border border-brand-ink/8 bg-brand-bg p-8 transition-shadow hover:shadow-card">
                <h3 className="font-serif text-lg font-semibold text-brand-primary">Email</h3>
                <a href={`mailto:${settings.email}`} className="mt-2 block text-brand-muted hover:text-brand-ink">
                  {settings.email}
                </a>
              </div>
            )}
            <div className="rounded-2xl border border-brand-ink/8 bg-brand-bg p-8 transition-shadow hover:shadow-card">
              <h3 className="font-serif text-lg font-semibold text-brand-primary">Visit</h3>
              <p className="mt-2 text-brand-muted">{settings.address}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

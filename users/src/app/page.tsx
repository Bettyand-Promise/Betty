import Link from 'next/link';
import { ShieldCheck, Truck, Award, PhoneCall, LayoutGrid, HardHat } from 'lucide-react';
import { getArticles, getCarousel, getHero, getSiteSettings } from '@/lib/api';
import Hero from '@/components/Hero';
import Carousel from '@/components/Carousel';
import ArticleCard from '@/components/ArticleCard';
import Reveal from '@/components/Reveal';
import Faq from '@/components/Faq';
import JsonLd from '@/components/JsonLd';
import { faqJsonLd } from '@/lib/seo';
import { FAQS } from '@/lib/faq';

export const revalidate = 60;

const STATS = [
  { value: '30+ Yrs', label: 'Roof lifespan' },
  { value: '100%', label: 'Rust-proof aluminium' },
  { value: 'Nationwide', label: 'Delivery & install' },
  { value: 'Free', label: 'On-site quotes' },
];

const FEATURES = [
  { icon: ShieldCheck, title: 'Premium Aluminium', text: 'Long-span, weather-proof sheets engineered for the Nigerian climate.' },
  { icon: Truck, title: 'Supply & Installation', text: 'Nationwide delivery and expert installation across Lagos and beyond.' },
  { icon: Award, title: 'Trusted in Lagos', text: 'The first choice for homeowners, contractors and developers nationwide.' },
];

const STEPS = [
  { icon: PhoneCall, title: 'Get a Free Quote', text: "Tell us your roof size and we'll price it — no obligation." },
  { icon: LayoutGrid, title: 'Choose Your Profile', text: 'Long-span, step-tile or stone-coated, in your colour.' },
  { icon: Truck, title: 'Fast Delivery', text: 'Delivered to your site anywhere in Nigeria.' },
  { icon: HardHat, title: 'Expert Installation', text: 'Fitted by our experienced roofing team.' },
];

export default async function HomePage() {
  const [hero, settings, carousel, latest] = await Promise.all([
    getHero(),
    getSiteSettings(),
    getCarousel(),
    getArticles(1, 6),
  ]);

  return (
    <>
      <JsonLd data={faqJsonLd(FAQS)} />
      <Hero hero={hero} settings={settings} />

      {/* Stats band */}
      <section className="bg-brand-ink">
        <div className="mx-auto grid max-w-content grid-cols-2 gap-y-8 px-5 py-10 md:grid-cols-4">
          {STATS.map((s, i) => (
            <div key={s.label} className={`text-center ${i ? 'md:border-l md:border-white/10' : ''}`}>
              <div className="font-serif text-3xl font-semibold text-brand-gold sm:text-4xl">{s.value}</div>
              <div className="mt-1 text-sm text-white/70">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Latest articles */}
      {latest.items.length > 0 && (
        <section className="bg-brand-bg py-20">
          <div className="mx-auto max-w-content px-5">
            <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className="eyebrow">From the Blog</span>
                <h2 className="mt-3 font-serif text-3xl font-semibold text-brand-ink sm:text-4xl">
                  Latest Articles
                </h2>
                <p className="mt-2 text-brand-muted">The 6 newest roofing tips, guides and product insights.</p>
              </div>
              <Link href="/articles" className="btn-ghost">
                View all articles
              </Link>
            </div>
            <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {latest.items.map((a, i) => (
                <Reveal key={a.id} delay={(i % 3) * 90}>
                  <ArticleCard article={a} businessName={settings.business_name} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Value props */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-content px-5">
          <div className="grid gap-6 md:grid-cols-3">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <Reveal key={f.title} delay={i * 90}>
                  <div className="group h-full rounded-2xl border border-brand-ink/8 bg-brand-bg p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-card">
                    <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary transition-colors group-hover:bg-brand-gold group-hover:text-brand-ink">
                      <Icon size={26} />
                    </div>
                    <h3 className="font-serif text-xl font-semibold text-brand-ink">{f.title}</h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-brand-muted">{f.text}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <Carousel images={carousel} businessName={settings.business_name} />

      {/* How it works */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-content px-5">
          <Reveal className="mb-12 text-center">
            <span className="eyebrow justify-center">How It Works</span>
            <h2 className="mt-3 font-serif text-3xl font-semibold text-brand-ink sm:text-4xl">
              From quote to finished roof
            </h2>
          </Reveal>
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              return (
                <Reveal key={s.title} delay={i * 90}>
                  <div className="relative h-full rounded-2xl border border-brand-ink/8 bg-brand-bg p-7">
                    <span className="absolute right-5 top-4 font-serif text-4xl font-semibold text-brand-primary/10">
                      {i + 1}
                    </span>
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary text-white">
                      <Icon size={22} />
                    </div>
                    <h3 className="font-serif text-lg font-semibold text-brand-ink">{s.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-brand-muted">{s.text}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* SEO intro copy */}
      <section className="bg-brand-bg py-24">
        <Reveal className="mx-auto max-w-3xl px-5 text-center">
          <span className="eyebrow justify-center">Why {settings.business_name}</span>
          <h2 className="mt-4 font-serif text-3xl font-semibold leading-tight text-brand-ink sm:text-4xl">
            Nigeria&apos;s Leading Aluminium Roofing Sheet Supplier
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-brand-muted">
            Based in Lagos, {settings.business_name} supplies and installs premium aluminium roofing
            sheets for homes, offices and industrial buildings across Nigeria. From long-span and
            step-tile to stone-coated profiles, we deliver durable, rust-resistant roofing at
            competitive prices — backed by expert advice and reliable service.
          </p>
          <div className="mx-auto mt-8 h-px w-24 bg-brand-gold" />
        </Reveal>
      </section>

      {/* FAQ */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-content px-5">
          <Reveal className="mb-12 text-center">
            <span className="eyebrow justify-center">Questions</span>
            <h2 className="mt-3 font-serif text-3xl font-semibold text-brand-ink sm:text-4xl">
              Frequently Asked Questions
            </h2>
          </Reveal>
          <Reveal>
            <Faq />
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-brand-deep py-20 text-center text-white">
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(80% 120% at 50% 0%, rgba(224, 168, 46,0.18) 0%, rgba(224, 168, 46,0) 55%)' }}
        />
        <Reveal className="relative mx-auto max-w-2xl px-5">
          <span className="eyebrow justify-center">Get Started</span>
          <h2 className="mt-4 font-serif text-3xl font-semibold sm:text-4xl">Ready to roof with the best?</h2>
          <p className="mt-3 text-white/80">Get a free quote on premium aluminium roofing sheets today.</p>
          <Link href="/about" className="btn-gold mt-8 px-9 py-3.5">
            Contact Us
          </Link>
        </Reveal>
      </section>
    </>
  );
}

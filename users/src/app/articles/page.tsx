import type { Metadata } from 'next';
import Link from 'next/link';
import { getArticles, getCategories, getSiteSettings } from '@/lib/api';
import ArticleCard from '@/components/ArticleCard';
import JsonLd from '@/components/JsonLd';
import { breadcrumbJsonLd } from '@/lib/seo';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  return {
    title: 'Roofing Articles & Guides',
    description: `Expert articles on aluminium roofing sheets, installation tips and product guides from ${s.business_name}, Lagos, Nigeria.`,
    alternates: { canonical: '/articles' },
    openGraph: {
      title: `Roofing Articles & Guides | ${s.business_name}`,
      description: 'Expert articles on aluminium roofing sheets in Nigeria.',
      url: '/articles',
    },
  };
}

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: { page?: string; category?: string };
}) {
  const page = Math.max(1, parseInt(searchParams.page || '1', 10));
  const category = searchParams.category;
  const [data, categories, settings] = await Promise.all([
    getArticles(page, 9, false, category),
    getCategories(),
    getSiteSettings(),
  ]);
  const qs = (p: number) => `/articles?page=${p}${category ? `&category=${category}` : ''}`;

  return (
    <div className="bg-brand-bg">
      <JsonLd data={breadcrumbJsonLd([{ name: 'Home', url: '/' }, { name: 'Articles', url: '/articles' }])} />

      {/* Page header (burgundy band; sits under the transparent header) */}
      <section className="relative overflow-hidden bg-brand-deep pb-20 pt-36 text-center text-white">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(90% 130% at 50% 0%, rgba(224, 168, 46,0.18) 0%, rgba(224, 168, 46,0) 55%)',
          }}
        />
        <div className="relative mx-auto max-w-2xl px-5">
          <span className="eyebrow justify-center">Insights & Guides</span>
          <h1 className="mt-4 font-serif text-4xl font-semibold sm:text-5xl">Roofing Articles & Guides</h1>
          <p className="mt-4 text-white/80">
            Expert insights on aluminium roofing sheets, installation and maintenance in Nigeria.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-content px-5 py-16">
        {categories.length > 0 && (
          <div className="mb-10 flex flex-wrap justify-center gap-2.5">
            <Link
              href="/articles"
              className={`border px-4 py-2 text-sm font-semibold transition-colors ${
                !category
                  ? 'border-brand-primary bg-brand-primary text-white'
                  : 'border-brand-ink/15 text-brand-ink hover:border-brand-primary hover:text-brand-primary'
              }`}
            >
              All
            </Link>
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/articles?category=${c.slug}`}
                className={`border px-4 py-2 text-sm font-semibold transition-colors ${
                  category === c.slug
                    ? 'border-brand-primary bg-brand-primary text-white'
                    : 'border-brand-ink/15 text-brand-ink hover:border-brand-primary hover:text-brand-primary'
                }`}
              >
                {c.name}
              </Link>
            ))}
          </div>
        )}

        {data.items.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-brand-ink/15 bg-white py-24 text-center">
            <p className="font-serif text-xl font-semibold text-brand-ink">No articles published yet</p>
            <p className="mt-2 text-sm text-brand-muted">Check back soon for roofing tips and guides.</p>
          </div>
        ) : (
          <>
            <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {data.items.map((a) => (
                <ArticleCard key={a.id} article={a} businessName={settings.business_name} />
              ))}
            </div>

            {data.totalPages > 1 && (
              <div className="mt-14 flex items-center justify-center gap-4">
                {page > 1 && (
                  <Link href={qs(page - 1)} className="btn-ghost">
                    ← Previous
                  </Link>
                )}
                <span className="text-sm font-medium text-brand-muted">
                  Page {page} of {data.totalPages}
                </span>
                {page < data.totalPages && (
                  <Link href={qs(page + 1)} className="btn-ghost">
                    Next →
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

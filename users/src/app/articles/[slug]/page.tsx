import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getArticle, getRelated, getSiteSettings } from '@/lib/api';
import { articleJsonLd, breadcrumbJsonLd } from '@/lib/seo';
import Image from 'next/image';
import JsonLd from '@/components/JsonLd';
import ArticleCard from '@/components/ArticleCard';
import ReadingProgress from '@/components/ReadingProgress';

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const article = await getArticle(params.slug);
  if (!article) return { title: 'Article not found' };

  const title = article.meta_title || article.title;
  const description = article.meta_description || article.excerpt;

  return {
    title,
    description,
    keywords: article.keywords,
    alternates: { canonical: `/articles/${article.slug}` },
    openGraph: {
      type: 'article',
      title,
      description,
      url: `/articles/${article.slug}`,
      publishedTime: article.published_at || undefined,
      modifiedTime: article.updated_at || undefined,
      images: article.cover_image_url ? [{ url: article.cover_image_url }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: article.cover_image_url ? [article.cover_image_url] : undefined,
    },
  };
}

function formatDate(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const [article, settings] = await Promise.all([getArticle(params.slug), getSiteSettings()]);
  if (!article) notFound();

  const related = await getRelated(params.slug);

  return (
    <article className="bg-white">
      <ReadingProgress />
      <JsonLd data={articleJsonLd(article, settings)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', url: '/' },
          { name: 'Articles', url: '/articles' },
          { name: article.title, url: `/articles/${article.slug}` },
        ])}
      />

      {/* Hero / cover */}
      <header className="relative bg-brand-deep pb-14 pt-36 text-white">
        {article.cover_image_url && (
          <>
            <Image
              src={article.cover_image_url}
              alt={article.title}
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-black/40" />
          </>
        )}
        <div className="relative mx-auto max-w-3xl px-5">
          <Link href="/articles" className="text-sm font-semibold text-brand-gold transition-colors hover:text-white">
            ← Back to articles
          </Link>
          <h1 className="mt-5 font-serif text-3xl font-semibold leading-[1.12] sm:text-4xl md:text-5xl">
            {article.title}
          </h1>
          <div className="mt-5 flex flex-wrap items-center gap-2 text-sm text-white/75">
            <span>{article.author}</span>
            <span className="text-brand-gold">•</span>
            <span>{formatDate(article.published_at)}</span>
            <span className="text-brand-gold">•</span>
            <span>{article.reading_minutes} min read</span>
          </div>
        </div>
      </header>

      <div
        className="prose-article mx-auto max-w-3xl px-5 py-12"
        dangerouslySetInnerHTML={{ __html: article.content_html }}
      />

      {related.length > 0 && (
        <section className="border-t border-brand-ink/8 bg-brand-bg py-16">
          <div className="mx-auto max-w-content px-5">
            <span className="eyebrow">Keep reading</span>
            <h2 className="mb-8 mt-3 font-serif text-2xl font-semibold text-brand-ink sm:text-3xl">
              Related Articles
            </h2>
            <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((a) => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}

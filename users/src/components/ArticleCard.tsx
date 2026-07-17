import Link from 'next/link';
import Image from 'next/image';
import type { ArticleSummary } from '@/lib/types';

function formatDate(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function ArticleCard({
  article,
  businessName,
}: {
  article: ArticleSummary;
  businessName?: string;
}) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-brand-ink/8 bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card">
      <Link href={`/articles/${article.slug}`}>
        <div className="relative h-52 w-full overflow-hidden bg-brand-bg">
          {article.cover_image_url ? (
            <Image
              src={article.cover_image_url}
              alt={article.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-brand-primary/8">
              <span className="font-serif text-sm font-semibold text-brand-primary">
                {businessName || 'Roofing'}
              </span>
            </div>
          )}
        </div>
        <div className="p-6">
          <div className="mb-3 flex items-center gap-2 text-xs font-medium text-brand-muted">
            <span>{formatDate(article.published_at)}</span>
            <span className="text-brand-gold">•</span>
            <span>{article.reading_minutes} min read</span>
          </div>
          <h3 className="font-serif text-xl font-semibold leading-snug text-brand-ink transition-colors group-hover:text-brand-primary">
            {article.title}
          </h3>
          {article.excerpt && (
            <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-brand-muted">
              {article.excerpt}
            </p>
          )}
          <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-primary">
            Read article
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </span>
        </div>
      </Link>
      {/* Gold accent bar reveals on hover */}
      <div className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-brand-gold transition-transform duration-300 group-hover:scale-x-100" />
    </article>
  );
}

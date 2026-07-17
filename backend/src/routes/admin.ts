import { Router, Response, NextFunction } from 'express';
import { query, one, insertRow, updateRow } from '../lib/db';
import { buildUploadSignature, destroyAsset } from '../lib/cloudinary';
import { requireAdmin, AuthedRequest } from '../middleware/auth';
import { slugify, estimateReadingMinutes } from '../lib/slug';
import { sanitizeRichText } from '../lib/sanitize';
import { mediaLimiter } from '../middleware/rateLimit';
import {
  articleSchema,
  heroSchema,
  siteSettingsSchema,
  carouselSchema,
  carouselUpdateSchema,
  reorderSchema,
  aboutSchema,
  categorySchema,
  mediaSignSchema,
  mediaDestroySchema,
} from '../validation/schemas';

const router = Router();
router.use(requireAdmin);

const wrap =
  (fn: (req: AuthedRequest, res: Response) => Promise<void>) =>
  (req: AuthedRequest, res: Response, next: NextFunction) =>
    fn(req, res).catch(next);

// Default article author = the current business name from site settings, so a
// rebrand flows through without any hardcoded fallback.
async function defaultAuthor(): Promise<string> {
  const row = await one<{ business_name: string }>(
    'select business_name from site_settings where id = 1',
  );
  return row?.business_name || 'Roofing';
}

// ---------------------------------------------------------------------
// Media (Cloudinary)
// ---------------------------------------------------------------------
router.post(
  '/media/sign',
  mediaLimiter,
  wrap(async (req, res) => {
    const { folder } = mediaSignSchema.parse(req.body);
    res.json(buildUploadSignature(folder));
  }),
);

router.delete(
  '/media',
  wrap(async (req, res) => {
    const { public_id } = mediaDestroySchema.parse(req.body);
    await destroyAsset(public_id);
    res.json({ ok: true });
  }),
);

// ---------------------------------------------------------------------
// Dashboard stats
// ---------------------------------------------------------------------
router.get(
  '/stats',
  wrap(async (_req, res) => {
    const row = await one<{
      articles: number;
      published: number;
      carousel: number;
      categories: number;
    }>(
      `select
         (select count(*)::int from articles) as articles,
         (select count(*)::int from articles where status = 'published') as published,
         (select count(*)::int from carousel_images) as carousel,
         (select count(*)::int from categories) as categories`,
    );
    const articles = row?.articles ?? 0;
    const published = row?.published ?? 0;
    res.json({
      articles,
      published,
      drafts: articles - published,
      carousel: row?.carousel ?? 0,
      categories: row?.categories ?? 0,
    });
  }),
);

// ---------------------------------------------------------------------
// Articles CRUD
// ---------------------------------------------------------------------
router.get(
  '/articles',
  wrap(async (_req, res) => {
    const data = await query(
      `select id, slug, title, status, featured, published_at, updated_at, cover_image_url
         from articles
        order by updated_at desc`,
    );
    res.json(data);
  }),
);

router.get(
  '/articles/:id',
  wrap(async (req, res) => {
    const data = await one(
      `select a.*,
              coalesce(
                (select json_agg(json_build_object('category_id', ac.category_id))
                   from article_categories ac where ac.article_id = a.id),
                '[]'
              ) as article_categories
         from articles a
        where a.id = $1`,
      [req.params.id],
    );
    if (!data) {
      res.status(404).json({ error: 'Article not found' });
      return;
    }
    res.json(data);
  }),
);

async function setArticleCategories(articleId: string, categoryIds: string[]) {
  await query('delete from article_categories where article_id = $1', [articleId]);
  for (const category_id of categoryIds) {
    await query(
      'insert into article_categories (article_id, category_id) values ($1, $2) on conflict do nothing',
      [articleId, category_id],
    );
  }
}

router.post(
  '/articles',
  wrap(async (req, res) => {
    const body = articleSchema.parse(req.body);
    const slug = slugify(body.slug || body.title);
    const content = sanitizeRichText(body.content_html);

    const data = await insertRow<{ id: string }>('articles', {
      author: body.author || (await defaultAuthor()),
      title: body.title,
      slug,
      excerpt: body.excerpt,
      content_html: content,
      cover_image_url: body.cover_image_url ?? null,
      cover_public_id: body.cover_public_id ?? null,
      meta_title: body.meta_title,
      meta_description: body.meta_description,
      keywords: body.keywords,
      status: body.status,
      featured: body.featured,
      reading_minutes: estimateReadingMinutes(content),
      published_at: body.status === 'published' ? new Date().toISOString() : null,
    });

    await setArticleCategories(data.id, body.category_ids);
    res.status(201).json(data);
  }),
);

router.put(
  '/articles/:id',
  wrap(async (req, res) => {
    const body = articleSchema.parse(req.body);

    const existing = await one<{ status: string; published_at: string | null }>(
      'select status, published_at from articles where id = $1',
      [req.params.id],
    );

    const slug = slugify(body.slug || body.title);
    const content = sanitizeRichText(body.content_html);
    const becomingPublished = body.status === 'published';
    const published_at =
      becomingPublished && !existing?.published_at
        ? new Date().toISOString()
        : existing?.published_at ?? null;

    const data = await updateRow<{ id: string }>(
      'articles',
      {
        title: body.title,
        slug,
        excerpt: body.excerpt,
        content_html: content,
        cover_image_url: body.cover_image_url ?? null,
        cover_public_id: body.cover_public_id ?? null,
        meta_title: body.meta_title,
        meta_description: body.meta_description,
        keywords: body.keywords,
        status: body.status,
        featured: body.featured,
        author: body.author || (await defaultAuthor()),
        reading_minutes: estimateReadingMinutes(content),
        published_at: becomingPublished ? published_at : null,
      },
      'id = $1',
      [req.params.id],
    );

    if (!data) {
      res.status(404).json({ error: 'Article not found' });
      return;
    }
    await setArticleCategories(data.id, body.category_ids);
    res.json(data);
  }),
);

router.delete(
  '/articles/:id',
  wrap(async (req, res) => {
    const existing = await one<{ cover_public_id: string | null }>(
      'select cover_public_id from articles where id = $1',
      [req.params.id],
    );
    if (existing?.cover_public_id) await destroyAsset(existing.cover_public_id);

    await query('delete from articles where id = $1', [req.params.id]);
    res.json({ ok: true });
  }),
);

// ---------------------------------------------------------------------
// Hero
// ---------------------------------------------------------------------
router.get(
  '/hero',
  wrap(async (_req, res) => {
    const data = await one('select * from hero_settings where id = 1');
    res.json(data);
  }),
);

router.put(
  '/hero',
  wrap(async (req, res) => {
    const body = heroSchema.parse(req.body);
    const data = await updateRow(
      'hero_settings',
      { ...body, image_url: body.image_url ?? null, image_public_id: body.image_public_id ?? null },
      'id = 1',
    );
    res.json(data);
  }),
);

// ---------------------------------------------------------------------
// Site settings (appearance + business + SEO)
// ---------------------------------------------------------------------
router.get(
  '/site-settings',
  wrap(async (_req, res) => {
    const data = await one('select * from site_settings where id = 1');
    res.json(data);
  }),
);

router.put(
  '/site-settings',
  wrap(async (req, res) => {
    const body = siteSettingsSchema.parse(req.body);
    const data = await updateRow('site_settings', body, 'id = 1');
    res.json(data);
  }),
);

// ---------------------------------------------------------------------
// About content
// ---------------------------------------------------------------------
router.get(
  '/about',
  wrap(async (_req, res) => {
    const data = await one('select * from about_content where id = 1');
    res.json(data);
  }),
);

router.put(
  '/about',
  wrap(async (req, res) => {
    const body = aboutSchema.parse(req.body);
    // stats/team are jsonb — pass as JSON text and cast, so pg doesn't coerce the
    // JS arrays into Postgres array literals.
    const data = await one(
      `update about_content set
         headline = $1,
         subheading = $2,
         body_html = $3,
         image_url = $4,
         image_public_id = $5,
         stats = $6::jsonb,
         team = $7::jsonb
       where id = 1
       returning *`,
      [
        body.headline,
        body.subheading,
        sanitizeRichText(body.body_html),
        body.image_url ?? null,
        body.image_public_id ?? null,
        JSON.stringify(body.stats),
        JSON.stringify(body.team),
      ],
    );
    res.json(data);
  }),
);

// ---------------------------------------------------------------------
// Carousel
// ---------------------------------------------------------------------
router.get(
  '/carousel',
  wrap(async (_req, res) => {
    const data = await query('select * from carousel_images order by sort_order asc');
    res.json(data);
  }),
);

router.post(
  '/carousel',
  wrap(async (req, res) => {
    const body = carouselSchema.parse(req.body);
    const data = await insertRow('carousel_images', body);
    res.status(201).json(data);
  }),
);

router.put(
  '/carousel/:id',
  wrap(async (req, res) => {
    const body = carouselUpdateSchema.parse(req.body);
    const data = await updateRow('carousel_images', body, 'id = $1', [req.params.id]);
    res.json(data);
  }),
);

router.put(
  '/carousel-reorder',
  wrap(async (req, res) => {
    const { ids } = reorderSchema.parse(req.body);
    await Promise.all(
      ids.map((id, index) =>
        query('update carousel_images set sort_order = $1 where id = $2', [index, id]),
      ),
    );
    res.json({ ok: true });
  }),
);

router.delete(
  '/carousel/:id',
  wrap(async (req, res) => {
    const existing = await one<{ public_id: string | null }>(
      'select public_id from carousel_images where id = $1',
      [req.params.id],
    );
    if (existing?.public_id) await destroyAsset(existing.public_id);

    await query('delete from carousel_images where id = $1', [req.params.id]);
    res.json({ ok: true });
  }),
);

// ---------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------
router.get(
  '/categories',
  wrap(async (_req, res) => {
    const data = await query('select * from categories order by name asc');
    res.json(data);
  }),
);

router.post(
  '/categories',
  wrap(async (req, res) => {
    const body = categorySchema.parse(req.body);
    const slug = slugify(body.slug || body.name);
    const data = await insertRow('categories', { ...body, slug });
    res.status(201).json(data);
  }),
);

router.put(
  '/categories/:id',
  wrap(async (req, res) => {
    const body = categorySchema.parse(req.body);
    const slug = slugify(body.slug || body.name);
    const data = await updateRow('categories', { ...body, slug }, 'id = $1', [req.params.id]);
    res.json(data);
  }),
);

router.delete(
  '/categories/:id',
  wrap(async (req, res) => {
    await query('delete from categories where id = $1', [req.params.id]);
    res.json({ ok: true });
  }),
);

export default router;

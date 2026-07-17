import { Router, Request, Response, NextFunction } from 'express';
import { query, one } from '../lib/db';

const router = Router();

const wrap =
  (fn: (req: Request, res: Response) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) =>
    fn(req, res).catch(next);

// GET /api/public/site-settings
router.get(
  '/site-settings',
  wrap(async (_req, res) => {
    const data = await one('select * from site_settings where id = 1');
    res.json(data);
  }),
);

// GET /api/public/hero
router.get(
  '/hero',
  wrap(async (_req, res) => {
    const data = await one('select * from hero_settings where id = 1');
    res.json(data);
  }),
);

// GET /api/public/about
router.get(
  '/about',
  wrap(async (_req, res) => {
    const data = await one('select * from about_content where id = 1');
    res.json(data);
  }),
);

// GET /api/public/carousel
router.get(
  '/carousel',
  wrap(async (_req, res) => {
    const data = await query(
      'select * from carousel_images where active = true order by sort_order asc',
    );
    res.json(data);
  }),
);

// GET /api/public/categories
router.get(
  '/categories',
  wrap(async (_req, res) => {
    const data = await query('select * from categories order by name asc');
    res.json(data);
  }),
);

// GET /api/public/articles?page=1&limit=9&category=slug&featured=true
router.get(
  '/articles',
  wrap(async (req, res) => {
    const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
    const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit || '9'), 10)));
    const offset = (page - 1) * limit;

    const empty = { items: [], page, limit, total: 0, totalPages: 0 };

    const where: string[] = ["status = 'published'"];
    const params: unknown[] = [];

    if (req.query.featured === 'true') where.push('featured = true');

    // Filter by category slug (resolve slug -> id -> article ids).
    if (req.query.category) {
      const cat = await one<{ id: string }>('select id from categories where slug = $1', [
        String(req.query.category),
      ]);
      if (!cat) {
        res.json(empty);
        return;
      }
      const links = await query<{ article_id: string }>(
        'select article_id from article_categories where category_id = $1',
        [cat.id],
      );
      const ids = links.map((l) => l.article_id);
      if (!ids.length) {
        res.json(empty);
        return;
      }
      params.push(ids);
      where.push(`id = any($${params.length}::uuid[])`);
    }

    // count(*) over() carries the total matching count alongside the page rows.
    params.push(limit, offset);
    const rows = await query<Record<string, unknown> & { _total: number }>(
      `select id, slug, title, excerpt, cover_image_url, author, reading_minutes,
              published_at, featured, keywords, count(*) over()::int as _total
         from articles
        where ${where.join(' and ')}
        order by published_at desc nulls last
        limit $${params.length - 1} offset $${params.length}`,
      params,
    );

    const total = rows.length ? Number(rows[0]._total) : 0;
    const items = rows.map(({ _total, ...rest }) => rest);

    res.json({
      items,
      page,
      limit,
      total,
      totalPages: total ? Math.ceil(total / limit) : 0,
    });
  }),
);

// GET /api/public/articles/:slug
router.get(
  '/articles/:slug',
  wrap(async (req, res) => {
    const data = await one(
      "select * from articles where slug = $1 and status = 'published'",
      [req.params.slug],
    );
    if (!data) {
      res.status(404).json({ error: 'Article not found' });
      return;
    }
    res.json(data);
  }),
);

// GET /api/public/articles/:slug/related
router.get(
  '/articles/:slug/related',
  wrap(async (req, res) => {
    const data = await query(
      `select id, slug, title, excerpt, cover_image_url, published_at, reading_minutes
         from articles
        where status = 'published' and slug <> $1
        order by published_at desc nulls last
        limit 3`,
      [req.params.slug],
    );
    res.json(data);
  }),
);

// GET /api/public/sitemap-articles — slugs + updated dates for the sitemap
router.get(
  '/sitemap-articles',
  wrap(async (_req, res) => {
    const data = await query(
      `select slug, updated_at, published_at
         from articles
        where status = 'published'
        order by published_at desc nulls last`,
    );
    res.json(data);
  }),
);

export default router;

# Betty & Promise Roofing System — SEO Blog Platform

An SEO-optimized blog/marketing platform for **Betty & Promise Roofing System**, built to rank
for *aluminium roofing sheet supply in Lagos, Nigeria*. Pure red + white branding, fully
admin-controlled hero/carousel/colors/content, Cloudinary media, Supabase data + auth.

## Architecture

Three independently deployable apps (one Vercel project each):

| Folder      | What it is                              | Local port | Stack |
|-------------|------------------------------------------|-----------|-------|
| `backend/`  | API (reads + admin writes + media sign)  | 4000      | Express + TypeScript, Supabase (service role), Cloudinary |
| `users/`    | Public site (Home, Articles, About)      | 3000      | Next.js App Router, Tailwind, full SEO layer |
| `admin/`    | Admin dashboard                          | 3001      | Next.js App Router, Supabase Auth, Tiptap |
| `supabase/` | `schema.sql` (tables + RLS + seeds)      | —         | Postgres |

**Data flow:** the admin app authenticates with Supabase Auth and calls the backend with the
user's access token. The backend verifies the token + admin role, writes via the Supabase
service-role key, and signs Cloudinary uploads (browser uploads files directly to Cloudinary).
The public site server-renders content from the backend's public read endpoints with ISR.

## 1. Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Cloudinary](https://cloudinary.com) account
- A [Vercel](https://vercel.com) account (for deploy)

## 2. Set up Supabase

1. Create a Supabase project.
2. Open **SQL Editor**, paste the contents of [`supabase/schema.sql`](supabase/schema.sql) and run it.
   This creates all tables, RLS policies, and seeds the singleton rows.
3. Create your admin user: **Authentication → Users → Add user** (email + password).
4. Promote that user to admin — in the SQL editor run:
   ```sql
   insert into public.profiles (id, email, role)
   values ('<the-new-user-uuid>', '<email>', 'admin')
   on conflict (id) do update set role = 'admin';
   ```
5. Grab from **Project Settings → API**: `Project URL`, `anon` key, and `service_role` key.

## 3. Configure environment variables

Copy each `.env.example` to `.env` (backend) / `.env.local` (Next apps) and fill in values.

- **backend/.env** — `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`,
  `CLOUDINARY_CLOUD_NAME/_API_KEY/_API_SECRET`, `ALLOWED_ORIGINS` (the users + admin origins).
- **users/.env.local** — `NEXT_PUBLIC_BACKEND_URL`, `NEXT_PUBLIC_SITE_URL`,
  `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`.
- **admin/.env.local** — `NEXT_PUBLIC_BACKEND_URL`, `NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`.

## 4. Run locally

```bash
# in three terminals
cd backend && npm install && npm run dev    # http://localhost:4000
cd users   && npm install && npm run dev    # http://localhost:3000
cd admin   && npm install && npm run dev    # http://localhost:3001
```

Log in to the admin at http://localhost:3001 with the user you created, then design the hero,
upload carousel images, set brand colors, and publish your first article. The public site at
http://localhost:3000 reflects the changes within ~60s (ISR).

## 5. Deploy to Vercel (3 projects)

Create three Vercel projects, each with **Root Directory** set to the matching folder:

1. **backend** → **Root Directory = `backend`**, Framework Preset = **Other** (leave Build/Output
   Command empty — `backend/vercel.json` builds the Express app as a single serverless function via
   `@vercel/node`). Add the backend env vars (see step 3). Note its URL (e.g. `https://fc-api.vercel.app`).
   Verify it deployed by opening `https://<backend-url>/api/health`.
2. **users** → root `users/`. Set `NEXT_PUBLIC_BACKEND_URL` to the backend URL and
   `NEXT_PUBLIC_SITE_URL` to the public site's own URL.
3. **admin** → root `admin/`. Set `NEXT_PUBLIC_BACKEND_URL` to the backend URL + the Supabase vars.

Finally, set the backend's `ALLOWED_ORIGINS` to the deployed users + admin URLs (comma-separated)
and redeploy the backend so CORS allows them.

## Production hardening

This project ships with enterprise-grade defaults:

**Backend**
- Fail-fast env validation (crashes on boot in production if a required secret is missing)
- `helmet` security headers, `compression`, `trust proxy`, `x-powered-by` disabled
- Rate limiting: public reads, admin mutations, and a strict limiter on Cloudinary signing
- **Stored-XSS protection** — all rich-text (article + about HTML) is sanitized server-side on write
- Structured JSON logging + access logs (no secrets/bodies), graceful shutdown, global crash handlers
- CDN cache headers (`s-maxage` + `stale-while-revalidate`) on public endpoints

**Frontend (both apps)**
- Strict security headers incl. a Content-Security-Policy (admin's CSP is derived from its env origins),
  HSTS, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`; admin is `noindex`
- `loading` / `error` / `global-error` boundaries; admin `not-found`
- Cloudinary delivery transforms (`f_auto,q_auto,dpr_auto`, responsive sizing) for Core Web Vitals
- PWA manifest + `theme-color`

**Tooling**
- ESLint configured for all three apps; `engines` pin Node ≥ 18.18; `.nvmrc`, `.editorconfig`
- GitHub Actions CI runs `typecheck` + `lint` + `build` for backend, users, and admin on every push/PR

> For self-hosting the backend, set `NODE_ENV=production`. Vercel sets it automatically.

## SEO features

- Per-page `generateMetadata` (title, description, canonical, Open Graph, Twitter cards)
- Dynamic `sitemap.xml` (includes all published articles) + `robots.txt`
- JSON-LD structured data: `RoofingContractor`/`LocalBusiness` (Lagos NAP + `areaServed`),
  `Organization`, `BlogPosting`, `BreadcrumbList`
- Semantic HTML, descriptive alt text, fast RSC + ISR rendering, Cloudinary image delivery
- Keyword-targeted copy for *aluminium roofing sheets, Lagos, Nigeria*

After deploy: submit `sitemap.xml` in Google Search Console and validate structured data with the
[Rich Results Test](https://search.google.com/test/rich-results).

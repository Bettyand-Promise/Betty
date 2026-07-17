-- =====================================================================
-- Betty & Promise Roofing System — Neon (plain Postgres) schema
-- Consolidated from all previous Supabase migrations, with the Supabase-only
-- bits removed:
--   * no Row Level Security / policies (only the backend connects, with full
--     privileges; the frontends talk to the API, never the DB directly)
--   * no `profiles` table / `auth.users` FK (admin auth is env-based bcrypt)
-- Idempotent: safe to run repeatedly (create ... if not exists).
-- =====================================================================

create extension if not exists "pgcrypto";

-- Helper: auto-update updated_at -------------------------------------
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =====================================================================
-- site_settings: singleton row (id = 1) — brand + business + SEO
-- =====================================================================
create table if not exists site_settings (
  id                  int primary key default 1 check (id = 1),
  business_name       text not null default 'Betty & Promise Roofing System',
  tagline             text default 'Nigeria''s #1 Aluminium Roofing Sheet Supplier',
  logo_url            text,
  logo_public_id      text,
  primary_color       text not null default '#7B1E2B',
  secondary_color     text not null default '#FFFFFF',
  default_hero_color  text not null default '#7B1E2B',
  phone               text default '',
  whatsapp            text default '',
  whatsapp_greeting   text not null default 'Welcome to Betty & Promise Roofing System. How can we help you with your aluminium roofing today?',
  email               text default '',
  address             text default 'Lagos, Nigeria',
  city                text default 'Lagos',
  state               text default 'Lagos',
  country             text default 'Nigeria',
  lat                 double precision,
  lng                 double precision,
  facebook_url        text default '',
  instagram_url       text default '',
  twitter_url         text default '',
  linkedin_url        text default '',
  tiktok_url          text default '',
  default_meta_title  text default 'Betty & Promise Roofing System — Aluminium Roofing Sheets in Lagos, Nigeria',
  default_meta_description text default 'Betty & Promise Roofing System is Lagos, Nigeria''s leading supplier of premium aluminium roofing sheets. Quality, durability and expert installation.',
  updated_at          timestamptz not null default now()
);

drop trigger if exists trg_site_settings_updated on site_settings;
create trigger trg_site_settings_updated before update on site_settings
  for each row execute function set_updated_at();

-- =====================================================================
-- hero_settings: singleton row (id = 1) — admin-designed hero
-- =====================================================================
create table if not exists hero_settings (
  id                int primary key default 1 check (id = 1),
  heading           text not null default 'Premium Aluminium Roofing Sheets in Lagos',
  subheading        text not null default 'Durable, weather-proof and affordable roofing solutions — supplied and installed across Nigeria.',
  cta_label         text default 'Get a Free Quote',
  cta_href          text default '/about',
  secondary_cta_label text default 'Read Our Blog',
  secondary_cta_href  text default '/articles',
  background_type   text not null default 'color' check (background_type in ('image', 'color')),
  background_color  text not null default '#7B1E2B',
  text_color        text not null default '#FFFFFF',
  overlay_opacity   numeric not null default 0.45 check (overlay_opacity >= 0 and overlay_opacity <= 1),
  image_url         text,
  image_public_id   text,
  updated_at        timestamptz not null default now()
);

drop trigger if exists trg_hero_updated on hero_settings;
create trigger trg_hero_updated before update on hero_settings
  for each row execute function set_updated_at();

-- =====================================================================
-- carousel_images: admin-uploaded slides
-- =====================================================================
create table if not exists carousel_images (
  id          uuid primary key default gen_random_uuid(),
  image_url   text not null,
  public_id   text,
  alt         text default '',
  caption     text default '',
  sort_order  int not null default 0,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

create index if not exists idx_carousel_order on carousel_images (sort_order);

-- =====================================================================
-- categories + articles
-- =====================================================================
create table if not exists categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  description text default '',
  created_at  timestamptz not null default now()
);

create table if not exists articles (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique,
  title             text not null,
  excerpt           text default '',
  content_html      text default '',
  cover_image_url   text,
  cover_public_id   text,
  meta_title        text default '',
  meta_description  text default '',
  keywords          text[] not null default '{}',
  status            text not null default 'draft' check (status in ('draft', 'published')),
  featured          boolean not null default false,
  author            text default 'Betty & Promise Roofing System',
  reading_minutes   int not null default 3,
  published_at      timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists idx_articles_status on articles (status);
create index if not exists idx_articles_published_at on articles (published_at desc);

drop trigger if exists trg_articles_updated on articles;
create trigger trg_articles_updated before update on articles
  for each row execute function set_updated_at();

create table if not exists article_categories (
  article_id  uuid references articles(id) on delete cascade,
  category_id uuid references categories(id) on delete cascade,
  primary key (article_id, category_id)
);

-- =====================================================================
-- about_content: singleton row (id = 1)
-- =====================================================================
create table if not exists about_content (
  id          int primary key default 1 check (id = 1),
  headline    text not null default 'About Betty & Promise Roofing System',
  subheading  text default 'Trusted aluminium roofing sheet supplier in Lagos, Nigeria.',
  body_html   text default '<p>Betty & Promise Roofing System is a leading supplier of premium aluminium roofing sheets in Lagos, Nigeria.</p>',
  image_url   text,
  image_public_id text,
  stats       jsonb not null default '[]'::jsonb,
  team        jsonb not null default '[]'::jsonb,
  updated_at  timestamptz not null default now()
);

drop trigger if exists trg_about_updated on about_content;
create trigger trg_about_updated before update on about_content
  for each row execute function set_updated_at();

-- =====================================================================
-- contact_submissions: quote / contact requests from the public site
-- =====================================================================
create table if not exists contact_submissions (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null default '',
  phone       text not null default '',
  message     text not null,
  source      text not null default 'website',
  status      text not null default 'new' check (status in ('new', 'read', 'archived')),
  created_at  timestamptz not null default now(),
  constraint contact_has_reply_to check (email <> '' or phone <> '')
);

create index if not exists idx_contact_submissions_created on contact_submissions (created_at desc);
create index if not exists idx_contact_submissions_status on contact_submissions (status);

-- =====================================================================
-- Seed singleton rows
-- =====================================================================
insert into site_settings (id) values (1) on conflict (id) do nothing;
insert into hero_settings (id) values (1) on conflict (id) do nothing;
insert into about_content (id) values (1) on conflict (id) do nothing;

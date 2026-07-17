-- =====================================================================
-- Betty & Promise Roofing System — Supabase schema + RLS
-- Run this in the Supabase SQL editor (or via `supabase db push`).
-- =====================================================================

-- Extensions ----------------------------------------------------------
create extension if not exists "pgcrypto";

-- Helper: auto-update updated_at -------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =====================================================================
-- profiles: maps to auth.users, carries the admin role
-- =====================================================================
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  full_name   text,
  role        text not null default 'admin' check (role in ('admin')),
  created_at  timestamptz not null default now()
);

-- =====================================================================
-- site_settings: singleton row (id = 1) — brand + business + SEO
-- =====================================================================
create table if not exists public.site_settings (
  id                  int primary key default 1 check (id = 1),
  business_name       text not null default 'Betty & Promise Roofing System',
  tagline             text default 'Nigeria''s #1 Aluminium Roofing Sheet Supplier',
  logo_url            text,
  logo_public_id      text,
  primary_color       text not null default '#E10600',
  secondary_color     text not null default '#FFFFFF',
  default_hero_color  text not null default '#E10600',
  phone               text default '',
  whatsapp            text default '',
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
  default_meta_title  text default 'Betty & Promise Roofing System — Aluminium Roofing Sheets in Lagos, Nigeria',
  default_meta_description text default 'Betty & Promise Roofing System is Lagos, Nigeria''s leading supplier of premium aluminium roofing sheets. Quality, durability and expert installation.',
  updated_at          timestamptz not null default now()
);

drop trigger if exists trg_site_settings_updated on public.site_settings;
create trigger trg_site_settings_updated before update on public.site_settings
  for each row execute function public.set_updated_at();

-- =====================================================================
-- hero_settings: singleton row (id = 1) — admin-designed hero
-- =====================================================================
create table if not exists public.hero_settings (
  id                int primary key default 1 check (id = 1),
  heading           text not null default 'Premium Aluminium Roofing Sheets in Lagos',
  subheading        text not null default 'Durable, weather-proof and affordable roofing solutions — supplied and installed across Nigeria.',
  cta_label         text default 'Get a Free Quote',
  cta_href          text default '/about',
  secondary_cta_label text default 'Read Our Blog',
  secondary_cta_href  text default '/articles',
  background_type   text not null default 'color' check (background_type in ('image', 'color')),
  background_color  text not null default '#E10600',
  text_color        text not null default '#FFFFFF',
  overlay_opacity   numeric not null default 0.45 check (overlay_opacity >= 0 and overlay_opacity <= 1),
  image_url         text,
  image_public_id   text,
  updated_at        timestamptz not null default now()
);

drop trigger if exists trg_hero_updated on public.hero_settings;
create trigger trg_hero_updated before update on public.hero_settings
  for each row execute function public.set_updated_at();

-- =====================================================================
-- carousel_images: admin-uploaded slides
-- =====================================================================
create table if not exists public.carousel_images (
  id          uuid primary key default gen_random_uuid(),
  image_url   text not null,
  public_id   text,
  alt         text default '',
  caption     text default '',
  sort_order  int not null default 0,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

create index if not exists idx_carousel_order on public.carousel_images (sort_order);

-- =====================================================================
-- categories + articles
-- =====================================================================
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  description text default '',
  created_at  timestamptz not null default now()
);

create table if not exists public.articles (
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

create index if not exists idx_articles_status on public.articles (status);
create index if not exists idx_articles_published_at on public.articles (published_at desc);

drop trigger if exists trg_articles_updated on public.articles;
create trigger trg_articles_updated before update on public.articles
  for each row execute function public.set_updated_at();

create table if not exists public.article_categories (
  article_id  uuid references public.articles(id) on delete cascade,
  category_id uuid references public.categories(id) on delete cascade,
  primary key (article_id, category_id)
);

-- =====================================================================
-- about_content: singleton row (id = 1)
-- =====================================================================
create table if not exists public.about_content (
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

drop trigger if exists trg_about_updated on public.about_content;
create trigger trg_about_updated before update on public.about_content
  for each row execute function public.set_updated_at();

-- =====================================================================
-- Seed singleton rows
-- =====================================================================
insert into public.site_settings (id) values (1) on conflict (id) do nothing;
insert into public.hero_settings (id) values (1) on conflict (id) do nothing;
insert into public.about_content (id) values (1) on conflict (id) do nothing;

-- =====================================================================
-- Row Level Security
--   * public (anon) may SELECT published / public content
--   * all writes go through the backend service-role key (bypasses RLS)
-- =====================================================================
alter table public.profiles          enable row level security;
alter table public.site_settings     enable row level security;
alter table public.hero_settings     enable row level security;
alter table public.carousel_images   enable row level security;
alter table public.categories        enable row level security;
alter table public.articles          enable row level security;
alter table public.article_categories enable row level security;
alter table public.about_content     enable row level security;

-- Public read policies
drop policy if exists "public read site_settings" on public.site_settings;
create policy "public read site_settings" on public.site_settings for select using (true);

drop policy if exists "public read hero" on public.hero_settings;
create policy "public read hero" on public.hero_settings for select using (true);

drop policy if exists "public read about" on public.about_content;
create policy "public read about" on public.about_content for select using (true);

drop policy if exists "public read active carousel" on public.carousel_images;
create policy "public read active carousel" on public.carousel_images for select using (active = true);

drop policy if exists "public read categories" on public.categories;
create policy "public read categories" on public.categories for select using (true);

drop policy if exists "public read published articles" on public.articles;
create policy "public read published articles" on public.articles for select using (status = 'published');

drop policy if exists "public read article_categories" on public.article_categories;
create policy "public read article_categories" on public.article_categories for select using (true);

-- profiles: a user may read their own profile (admin checks happen server-side)
drop policy if exists "read own profile" on public.profiles;
create policy "read own profile" on public.profiles for select using (auth.uid() = id);

-- =====================================================================
-- After creating your first admin user in Supabase Auth, run:
--   insert into public.profiles (id, email, role)
--   values ('<auth-user-uuid>', '<email>', 'admin')
--   on conflict (id) do update set role = 'admin';
-- =====================================================================

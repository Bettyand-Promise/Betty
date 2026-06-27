-- Quote / contact requests submitted from the public site ("Get a Free Quote").
--
-- Writes go through the backend service-role key, so RLS is enabled with NO
-- public policies: the anon key can neither read nor write these rows. Only the
-- backend (service role, which bypasses RLS) inserts submissions and the admin
-- reads them. This mirrors the write pattern used by `articles`.

create table if not exists public.contact_submissions (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null default '',
  phone       text not null default '',
  message     text not null,
  source      text not null default 'website',
  status      text not null default 'new' check (status in ('new', 'read', 'archived')),
  created_at  timestamptz not null default now(),
  -- A lead is useless without a way to reply — require at least one contact method.
  constraint contact_has_reply_to check (email <> '' or phone <> '')
);

create index if not exists idx_contact_submissions_created
  on public.contact_submissions (created_at desc);
create index if not exists idx_contact_submissions_status
  on public.contact_submissions (status);

alter table public.contact_submissions enable row level security;
-- No policies are defined on purpose: all access is via the backend service role.

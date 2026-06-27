# Database Migrations

How to evolve the database (new tables, new columns, changed constraints) safely
and reproducibly. Every change is a versioned `.sql` file in `supabase/migrations/`,
committed to git, and applied with the Supabase CLI.

## One-time setup

1. **Install the CLI** (no global npm install needed on Windows):
   ```bash
   npx supabase --version
   ```
   (or install with Scoop: `scoop install supabase`)

2. **Log in & link** this folder to the hosted project:
   ```bash
   npx supabase login          # opens the browser for an access token
   npx supabase link --project-ref bbdsjtamezbdefdegnyt
   ```

3. **Baseline.** The current schema already lives in
   `supabase/migrations/20260627000000_init.sql`. Because you applied it by hand in
   the SQL Editor, tell the CLI it's already applied so it isn't run again:
   ```bash
   npx supabase migration repair --status applied 20260627000000
   ```
   (Verify with `npx supabase migration list` — local and remote should match.)

## Day-to-day workflow

### Add a new table or change an existing one
1. Create a new, empty migration:
   ```bash
   npx supabase migration new add_testimonials
   ```
   This creates `supabase/migrations/<timestamp>_add_testimonials.sql`.

2. Write the change in that file, e.g.:
   ```sql
   -- new table
   create table if not exists public.testimonials (
     id          uuid primary key default gen_random_uuid(),
     author      text not null,
     quote       text not null,
     rating      int not null default 5 check (rating between 1 and 5),
     approved    boolean not null default false,
     created_at  timestamptz not null default now()
   );

   alter table public.testimonials enable row level security;

   create policy "public read approved testimonials"
     on public.testimonials for select using (approved = true);
   ```

   Or to alter an existing table:
   ```sql
   alter table public.site_settings add column if not exists tiktok_url text default '';
   ```

3. Apply it to the hosted database:
   ```bash
   npx supabase db push
   ```
   The CLI runs only the migrations that haven't been applied yet, in order.

### If you changed something in the dashboard (Table Editor / SQL Editor)
Pull those changes down into a migration file so git stays the source of truth:
```bash
npx supabase db pull
```

### Regenerate TypeScript types after a schema change
Keep the app's types in sync with the database:
```bash
npx supabase gen types typescript --linked > shared-db-types.ts
```
Then update the hand-written interfaces in `backend/src/...`, `users/src/lib/types.ts`,
and `admin/src/lib/types.ts` to match (this project uses hand-written types per app).

## Rules of thumb

- **One migration = one logical change.** Small, focused files are easy to review and revert.
- **Never edit a migration that's already been pushed.** Write a new one to change course.
- **Prefer additive + idempotent SQL** (`add column if not exists`, `create table if not exists`)
  so re-runs are safe.
- **Writes still go through the backend service-role key**, so any new table that the public
  site reads needs an RLS `select` policy (see the `init` migration for the pattern). Writes
  don't need policies because the service role bypasses RLS.
- **Commit the migration file** with the code that uses it, so a deploy + DB change ship together.

## Local development against a real Postgres (optional)
If you want to test migrations without touching production, the CLI can run Supabase
locally in Docker:
```bash
npx supabase start          # boots local Postgres + Studio
npx supabase db reset       # applies ALL migrations from scratch locally
```

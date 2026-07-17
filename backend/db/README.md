# Database (Neon Postgres)

The backend talks to a plain Postgres database (Neon) via `pg`. There is no
Supabase, no PostgREST, and no Row Level Security — the backend is the only
thing that connects to the DB, and the frontends only ever call the backend API.

## Files
- `schema.sql` — the full schema (all tables), idempotent (`create ... if not exists`).
- `setup.ts` — applies `schema.sql` to `DATABASE_URL`.  → `npm run db:setup`
- `import-from-supabase.ts` — one-time copy of existing rows from the old Supabase
  project into Neon.  → `npm run db:import`
- `hash-password.ts` — makes a bcrypt hash for `ADMIN_PASSWORD_HASH`.  → `npm run db:hash -- "pw"`

## First-time setup on a fresh Neon database

1. Create a Neon project and copy its **pooled** connection string (host contains
   `-pooler`). Put it in `backend/.env` as `DATABASE_URL`.

2. Set the admin login:
   ```bash
   npm run db:hash -- "your-admin-password"
   ```
   Copy the printed `ADMIN_PASSWORD_HASH=...` into `.env`, and set `ADMIN_EMAIL`.

3. Create the tables:
   ```bash
   npm run db:setup
   ```

4. (Optional) Copy existing content from the old Supabase project. Add the old
   `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to `.env`, then:
   ```bash
   npm run db:import
   ```
   Remove those two vars afterwards — the app doesn't use them.

## Changing the schema later
Edit `schema.sql` (keep it idempotent) and re-run `npm run db:setup`, or apply a
one-off `ALTER TABLE` with any Postgres client. Keep the hand-written types in
`backend/src/...`, `users/src/lib/types.ts`, and `admin/src/lib/types.ts` in sync.

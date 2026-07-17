/**
 * One-time data copy: reads every row from the old Supabase project (via its
 * PostgREST API) and upserts it into the Neon database (via pg). Idempotent.
 *
 * Requires in backend/.env:
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY   (source — the old project)
 *   DATABASE_URL                              (target — Neon)
 *
 *   npm run db:import
 */
import 'dotenv/config';
import { Client } from 'pg';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DATABASE_URL = process.env.DATABASE_URL;

// Tables in FK-safe order. `pk` drives ON CONFLICT; `jsonb` lists jsonb columns
// that must be sent as JSON text rather than Postgres array/record literals.
const TABLES: { name: string; pk: string[]; jsonb?: string[] }[] = [
  { name: 'site_settings', pk: ['id'] },
  { name: 'hero_settings', pk: ['id'] },
  { name: 'about_content', pk: ['id'], jsonb: ['stats', 'team'] },
  { name: 'categories', pk: ['id'] },
  { name: 'articles', pk: ['id'] },
  { name: 'article_categories', pk: ['article_id', 'category_id'] },
  { name: 'carousel_images', pk: ['id'] },
  { name: 'contact_submissions', pk: ['id'] },
];

async function fetchRows(table: string): Promise<Record<string, unknown>[]> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*`, {
    headers: { apikey: SERVICE_KEY!, Authorization: `Bearer ${SERVICE_KEY}` },
  });
  if (!res.ok) throw new Error(`read ${table}: ${res.status} ${await res.text()}`);
  return (await res.json()) as Record<string, unknown>[];
}

async function upsert(
  client: Client,
  table: string,
  rows: Record<string, unknown>[],
  pk: string[],
  jsonb: string[] = [],
) {
  for (const row of rows) {
    const keys = Object.keys(row);
    const cols = keys.join(', ');
    const placeholders = keys
      .map((k, i) => (jsonb.includes(k) ? `$${i + 1}::jsonb` : `$${i + 1}`))
      .join(', ');
    const values = keys.map((k) => (jsonb.includes(k) ? JSON.stringify(row[k]) : row[k]));
    const updates = keys
      .filter((k) => !pk.includes(k))
      .map((k) => `${k} = excluded.${k}`)
      .join(', ');
    const conflict = `on conflict (${pk.join(', ')}) do ${updates ? `update set ${updates}` : 'nothing'}`;
    await client.query(`insert into ${table} (${cols}) values (${placeholders}) ${conflict}`, values);
  }
}

async function main() {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    throw new Error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set (source project)');
  }
  if (!DATABASE_URL) throw new Error('DATABASE_URL is not set (Neon target)');

  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: /sslmode=disable/.test(DATABASE_URL) ? false : { rejectUnauthorized: false },
  });
  await client.connect();

  try {
    for (const t of TABLES) {
      const rows = await fetchRows(t.name);
      await upsert(client, t.name, rows, t.pk, t.jsonb);
      console.log(`✓ ${t.name}: ${rows.length} row(s)`);
    }
    console.log('✓ Data import complete.');
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error('✗ Import failed:', err.message);
  process.exit(1);
});

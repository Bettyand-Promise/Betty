import { Pool, types } from 'pg';
import { env } from './env';

/**
 * Single pooled Postgres connection (Neon) used for all reads and writes.
 * Replaces the previous Supabase service-role client — access control now lives
 * entirely in this backend, so the DB connects with full privileges and the
 * frontends only ever talk to our API.
 *
 * A placeholder connection string keeps this module from throwing at import time
 * when DATABASE_URL is missing (the app serves a 503 in that case; see app.ts).
 */
const connectionString = env.databaseUrl || 'postgres://placeholder/placeholder';

// Return numeric/timestamp columns in JSON-friendly shapes matching the old API:
//   - numeric (overlay_opacity, lat/lng come back as float already) -> number
types.setTypeParser(1700, (v) => (v === null ? null : parseFloat(v))); // numeric

export const pool = new Pool({
  connectionString,
  // Neon requires TLS. Honour an explicit sslmode=disable (local dev), otherwise
  // enable SSL without demanding a locally-trusted CA (Neon uses a public CA).
  ssl: /sslmode=disable/.test(connectionString) ? false : { rejectUnauthorized: false },
  max: 5,
});

/** Run a query and return all rows. */
export async function query<T = Record<string, unknown>>(
  text: string,
  params?: unknown[],
): Promise<T[]> {
  const res = await pool.query(text, params);
  return res.rows as T[];
}

/** Run a query and return the first row (or null). */
export async function one<T = Record<string, unknown>>(
  text: string,
  params?: unknown[],
): Promise<T | null> {
  const res = await pool.query(text, params);
  return (res.rows[0] as T) ?? null;
}

/** Run a query and return the number of rows affected. */
export async function count(text: string, params?: unknown[]): Promise<number> {
  const res = await pool.query(text, params);
  return res.rowCount ?? 0;
}

/**
 * Insert a row from an object and return it. Column names come from our own code
 * (never user input) so they're interpolated directly; values are parameterized.
 * `undefined` values are skipped so DB defaults apply instead of NULL.
 */
export async function insertRow<T = Record<string, unknown>>(
  table: string,
  obj: Record<string, unknown>,
): Promise<T> {
  const keys = Object.keys(obj).filter((k) => obj[k] !== undefined);
  const cols = keys.join(', ');
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
  const values = keys.map((k) => obj[k]);
  const res = await pool.query(
    `insert into ${table} (${cols}) values (${placeholders}) returning *`,
    values,
  );
  return res.rows[0] as T;
}

/**
 * Update a row from an object and return it. `where` uses $1-based placeholders
 * referring to `whereParams` (e.g. updateRow('articles', row, 'id = $1', [id]));
 * they're re-numbered to follow the SET params. `undefined` values are skipped.
 */
export async function updateRow<T = Record<string, unknown>>(
  table: string,
  obj: Record<string, unknown>,
  where: string,
  whereParams: unknown[] = [],
): Promise<T | null> {
  const keys = Object.keys(obj).filter((k) => obj[k] !== undefined);
  const set = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
  const values = keys.map((k) => obj[k]).concat(whereParams);
  const whereClause = where.replace(/\$(\d+)/g, (_, n) => `$${keys.length + Number(n)}`);
  const res = await pool.query(
    `update ${table} set ${set} where ${whereClause} returning *`,
    values,
  );
  return (res.rows[0] as T) ?? null;
}

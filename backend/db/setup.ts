/**
 * Applies db/schema.sql to the Neon database in DATABASE_URL.
 * Idempotent — safe to run repeatedly.
 *
 *   npm run db:setup
 */
import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Client } from 'pg';

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL is not set (backend/.env)');

  const sql = readFileSync(join(__dirname, 'schema.sql'), 'utf8');
  const client = new Client({
    connectionString,
    ssl: /sslmode=disable/.test(connectionString) ? false : { rejectUnauthorized: false },
  });

  await client.connect();
  try {
    await client.query(sql);
    console.log('✓ Schema applied to Neon.');
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error('✗ Schema setup failed:', err.message);
  process.exit(1);
});

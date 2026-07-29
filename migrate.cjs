#!/usr/bin/env node
/**
 * Database migration CLI — `npm run migrate`
 *
 * This file used to carry its own hand-written copy of every CREATE TABLE, which
 * had already drifted from the copy inside server.cjs. Both now delegate to
 * server/schema.cjs, so there is exactly one definition of the schema.
 *
 * The schema module is idempotent (CREATE TABLE IF NOT EXISTS / ADD COLUMN IF NOT
 * EXISTS), so running this repeatedly is safe. Each successful run is recorded in
 * `schema_migrations` for auditability.
 *
 * Usage:
 *   node migrate.cjs           apply the schema and seed first-run content
 *   node migrate.cjs --status  print applied migrations and exit
 */
require('dotenv').config();
const db = require('./db.cjs');
const { applySchemaAndSeed } = require('./server/schema.cjs');

// Bump when the schema in server/schema.cjs changes in a way worth recording.
const SCHEMA_VERSION = 1;
const SCHEMA_NAME = 'consolidated_schema';

async function printStatus(client) {
  const res = await client.query(
    'SELECT version, name, applied_at FROM schema_migrations ORDER BY version ASC'
  );
  if (res.rows.length === 0) {
    console.log('No migrations have been applied yet.');
    return;
  }
  console.log('Applied migrations:');
  for (const row of res.rows) {
    console.log(`  ${String(row.version).padStart(3)}  ${row.name}  (${row.applied_at.toISOString()})`);
  }
}

async function main() {
  const statusOnly = process.argv.includes('--status');
  const client = await db.pool.connect();
  try {
    if (statusOnly) {
      await client.query(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
          version INT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      await printStatus(client);
      return;
    }

    console.log('Applying schema…');
    await applySchemaAndSeed(client);

    await client.query(
      `INSERT INTO schema_migrations (version, name) VALUES ($1, $2)
       ON CONFLICT (version) DO UPDATE SET name = EXCLUDED.name, applied_at = CURRENT_TIMESTAMP`,
      [SCHEMA_VERSION, SCHEMA_NAME]
    );

    console.log('Migration complete.');
    await printStatus(client);
  } finally {
    client.release();
  }
}

main()
  .then(() => db.pool.end())
  .catch(async (err) => {
    console.error('Migration failed:', err.message);
    await db.pool.end().catch(() => {});
    process.exit(1);
  });

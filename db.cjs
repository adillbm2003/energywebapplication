require('dotenv').config();
const fs = require('fs');
const { Pool } = require('pg');

/**
 * TLS configuration for the database connection.
 *
 * This used to hardcode `rejectUnauthorized: false` in production, which encrypts
 * the connection but does not authenticate the server — anything that can
 * intercept the route to RDS can present its own certificate and read or alter
 * every query. Certificate verification is now enabled whenever a CA is supplied:
 *
 *   PG_CA_CERT                  path to a CA bundle (e.g. the RDS global bundle),
 *                               or the PEM contents inline
 *   PG_SSL_REJECT_UNAUTHORIZED  'true' verifies against the system CA store
 *                               'false' explicitly opts out (logs a warning)
 *
 * Download the RDS bundle with:
 *   curl -o rds-ca.pem https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem
 */
function buildSslConfig() {
  const wantsSsl = process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging';
  if (!wantsSsl) return false;

  const caSetting = process.env.PG_CA_CERT;
  if (caSetting) {
    const ca = caSetting.includes('-----BEGIN')
      ? caSetting
      : fs.readFileSync(caSetting, 'utf8');
    return { ca, rejectUnauthorized: true };
  }

  if (process.env.PG_SSL_REJECT_UNAUTHORIZED === 'true') {
    return { rejectUnauthorized: true };
  }

  console.warn(
    '[SECURITY] Database TLS certificate verification is DISABLED. The connection ' +
    'is encrypted but the server is not authenticated. Set PG_CA_CERT to the RDS CA ' +
    'bundle (or PG_SSL_REJECT_UNAUTHORIZED=true) to enable verification.'
  );
  return { rejectUnauthorized: false };
}

const sslConfig = buildSslConfig();

let pool;

if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: sslConfig
  });
} else {
  pool = new Pool({
    host: process.env.PGHOST || 'localhost',
    port: parseInt(process.env.PGPORT || '5432', 10),
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'postgres',
    database: process.env.PGDATABASE || 'cms_energy_bm',
    ssl: sslConfig
  });
}

// Check pool error handling
pool.on('error', (err) => {
  console.error('Unexpected error on idle database client', err);
});

// Helper functions for casing conversions
function snakeToCamel(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) {
    // A DATE column comes back as local midnight — return YYYY-MM-DD using LOCAL
    // components (not toISOString, which is UTC and shifts the day back by one in
    // any UTC+ timezone). A TIMESTAMP with a real time-of-day is returned in full
    // ISO form so audit logs / version history no longer lose their time.
    const hasTime = obj.getHours() || obj.getMinutes() || obj.getSeconds() || obj.getMilliseconds();
    if (!hasTime) {
      const y = obj.getFullYear();
      const m = String(obj.getMonth() + 1).padStart(2, '0');
      const d = String(obj.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    return obj.toISOString();
  }
  if (Array.isArray(obj)) return obj.map(snakeToCamel);
  
  const newObj = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      let camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      if (camelKey === 'userName') camelKey = 'user';
      newObj[camelKey] = snakeToCamel(obj[key]);
    }
  }
  return newObj;
}

function camelToSnake(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(camelToSnake);
  
  const newObj = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      let snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      if (key === 'user') snakeKey = 'user_name';
      newObj[snakeKey] = camelToSnake(obj[key]);
    }
  }
  return newObj;
}

async function executeTransaction(callback) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(),
  executeTransaction,
  pool,
  snakeToCamel,
  camelToSnake
};

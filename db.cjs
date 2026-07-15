require('dotenv').config();
const { Pool } = require('pg');

let pool;

if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging' 
      ? { rejectUnauthorized: false } 
      : false
  });
} else {
  pool = new Pool({
    host: process.env.PGHOST || 'localhost',
    port: parseInt(process.env.PGPORT || '5432', 10),
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'postgres',
    database: process.env.PGDATABASE || 'cms_energy_bm',
    ssl: process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging'
      ? { rejectUnauthorized: false }
      : false
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

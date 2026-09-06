const { Pool } = require('pg');
require('dotenv').config();

// Hosted Postgres providers (Neon, Render, Supabase, etc.) require SSL.
// Local development databases typically don't have SSL configured at all,
// so we only turn it on when the connection string isn't pointing at
// localhost/127.0.0.1.
const isLocal = /localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL || '');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isLocal ? false : { rejectUnauthorized: false },
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
});

module.exports = pool;

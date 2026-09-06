// Applies schema.sql against whatever DATABASE_URL points to (local Postgres
// or a hosted one like Neon). Run this once before `npm run seed`.
//
//   npm run db:setup     # creates tables (drops + recreates them)
//   npm run seed          # fills them with demo sellers/products/accounts
//
// Or just: npm run db:init   (does both, in order)
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const isLocal = /localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL || '');

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set. Add it to your .env (or your shell env) first.');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isLocal ? false : { rejectUnauthorized: false },
});

async function run() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  console.log('Applying db/schema.sql to', isLocal ? 'local database' : 'remote database (SSL)', '...');
  await pool.query(schema);
  console.log('Schema applied — tables created.');
}

run()
  .catch((err) => {
    console.error('Schema setup failed:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });

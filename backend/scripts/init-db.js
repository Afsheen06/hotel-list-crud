require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('../src/config/db');
(async () => {
  await pool.query(fs.readFileSync(path.join(__dirname, '../src/config/schema.sql'), 'utf8'));
  console.log('Database schema ready');
})().catch(() => { console.error('Database setup failed; check DATABASE_URL'); process.exitCode = 1; }).finally(() => pool.end());

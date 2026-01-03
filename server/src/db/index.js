import pg from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Initialize schema on startup
const initSchema = async () => {
  try {
    const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf-8');
    await pool.query(schema);
    console.log('✅ Database schema initialized');
  } catch (error) {
    console.error('❌ Schema initialization error:', error.message);
  }
};

initSchema();

// Helper methods to match SQLite-like API
const db = {
  query: (text, params) => pool.query(text, params),
  
  // Get single row
  async get(text, params = []) {
    const result = await pool.query(text, params);
    return result.rows[0];
  },
  
  // Get all rows
  async all(text, params = []) {
    const result = await pool.query(text, params);
    return result.rows;
  },
  
  // Run insert/update/delete and return result
  async run(text, params = []) {
    const result = await pool.query(text, params);
    return {
      rowCount: result.rowCount,
      rows: result.rows
    };
  }
};

export default db;

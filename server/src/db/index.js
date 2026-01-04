import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// 根據環境自動選擇資料庫
const isProduction = process.env.NODE_ENV === 'production';
const usePostgres = isProduction || process.env.DATABASE_URL?.startsWith('postgresql');

let db;

if (usePostgres) {
  // PostgreSQL for production
  const pg = await import('pg');
  const { Pool } = pg.default;
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: isProduction ? { rejectUnauthorized: false } : false
  });

  const initSchema = async () => {
    try {
      const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf-8');
      await pool.query(schema);
      console.log('✅ PostgreSQL schema initialized');
    } catch (error) {
      console.error('❌ Schema initialization error:', error.message);
    }
  };

  await initSchema();

  db = {
    query: (text, params) => pool.query(text, params),
    async get(text, params = []) {
      const result = await pool.query(text, params);
      return result.rows[0];
    },
    async all(text, params = []) {
      const result = await pool.query(text, params);
      return result.rows;
    },
    async run(text, params = []) {
      const result = await pool.query(text, params);
      return { rowCount: result.rowCount, rows: result.rows };
    }
  };
} else {
  // SQLite for local development (only loaded when not in production)
  try {
    const Database = (await import('better-sqlite3')).default;
    const dbPath = join(__dirname, '../data/dream-tracker.db');
    
    const sqlite = new Database(dbPath);
    sqlite.pragma('journal_mode = WAL');

    const initSchema = () => {
      try {
        const schemaPath = join(__dirname, 'schema-sqlite.sql');
        if (existsSync(schemaPath)) {
          const schema = readFileSync(schemaPath, 'utf-8');
          sqlite.exec(schema);
          console.log('✅ SQLite schema initialized');
        }
      } catch (error) {
        console.error('❌ Schema initialization error:', error.message);
      }
    };

    initSchema();

    // 轉換 PostgreSQL 風格的 $1, $2 參數為 SQLite 的 ?
    const convertParams = (text) => {
      return text.replace(/\$\d+/g, () => '?');
    };

    db = {
      async get(text, params = []) {
        return sqlite.prepare(convertParams(text)).get(...params);
      },
      async all(text, params = []) {
        return sqlite.prepare(convertParams(text)).all(...params);
      },
      async run(text, params = []) {
        // 移除 RETURNING 子句（SQLite 不支援）
        const cleanText = text.replace(/\s+RETURNING\s+\w+/gi, '');
        const result = sqlite.prepare(convertParams(cleanText)).run(...params);
        // 模擬 PostgreSQL 的 RETURNING 行為
        return { 
          rowCount: result.changes, 
          rows: [{ id: result.lastInsertRowid }],
          lastInsertRowid: result.lastInsertRowid 
        };
      },
      async query(text, params = []) {
        const stmt = sqlite.prepare(convertParams(text));
        if (text.trim().toUpperCase().startsWith('SELECT')) {
          return { rows: stmt.all(...params) };
        }
        const result = stmt.run(...params);
        return { rows: [], rowCount: result.changes };
      }
    };
  } catch (error) {
    console.error('❌ SQLite not available, please set DATABASE_URL for PostgreSQL');
    process.exit(1);
  }
}

export default db;

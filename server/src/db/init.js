import 'dotenv/config';
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

// Migration queries for existing databases
const migrations = [
  // Add priority column to todos table if not exists
  `DO $$ 
   BEGIN 
     IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'todos' AND column_name = 'priority') THEN
       ALTER TABLE todos ADD COLUMN priority VARCHAR(10) DEFAULT 'medium' 
         CHECK (priority IN ('high', 'medium', 'low'));
     END IF;
   END $$;`,
  
  // Create goals table if not exists
  `CREATE TABLE IF NOT EXISTS goals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('focus', 'task', 'calories')),
    target_value INTEGER NOT NULL CHECK (target_value > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );`,
  
  // Create achievements table if not exists
  `CREATE TABLE IF NOT EXISTS achievements (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_id VARCHAR(100) NOT NULL,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, achievement_id)
  );`,
  
  // Create indexes for new tables
  `CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);`,
  `CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements(user_id);`
];

async function init() {
  try {
    // Run base schema first
    const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf-8');
    await pool.query(schema);
    console.log('✅ Base schema initialized');

    // Run migrations for existing databases
    for (const migration of migrations) {
      try {
        await pool.query(migration);
      } catch (migrationError) {
        // Ignore errors for already existing objects
        if (!migrationError.message.includes('already exists')) {
          console.warn('⚠️ Migration warning:', migrationError.message);
        }
      }
    }
    console.log('✅ Migrations completed');
    
    console.log('✅ Database initialized successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

init();

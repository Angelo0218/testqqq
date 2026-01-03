import { mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '../../data');

// Create data directory if not exists
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
  console.log('✅ Created data directory');
}

// Import db to trigger schema initialization
import('./index.js').then(() => {
  console.log('✅ Database initialized successfully');
  process.exit(0);
}).catch(err => {
  console.error('❌ Database initialization failed:', err);
  process.exit(1);
});

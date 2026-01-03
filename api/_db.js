const fs = require('fs');
const path = require('path');
let kvClient = null;

try {
  kvClient = require('@vercel/kv').kv;
} catch (e) {
  kvClient = null;
}

function hasKvConfig() {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

function dbPath(filename) {
  return path.join(process.cwd(), filename);
}

async function readDB(filename) {
  if (kvClient && hasKvConfig()) {
    const data = await kvClient.get(filename);
    return Array.isArray(data) ? data : [];
  }

  const filePath = dbPath(filename);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([]));
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (e) {
    return [];
  }
}

async function writeDB(filename, data) {
  if (kvClient && hasKvConfig()) {
    await kvClient.set(filename, data);
    return;
  }

  const filePath = dbPath(filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

module.exports = {
  readDB,
  writeDB
};

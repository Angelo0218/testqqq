const { readDB, writeDB } = require('../_db');
const { getSessionUser, readBody, sendJson } = require('../_utils');

module.exports = async (req, res) => {
  const username = getSessionUser(req);
  if (!username) return sendJson(res, 401, {});
  if (req.method !== 'POST') return sendJson(res, 405, {});
  const { id, completed } = await readBody(req);
  const db = await readDB('tododb.json');
  const item = db.find(t => t.id === id && t.username === username);
  if (item) item.completed = completed;
  await writeDB('tododb.json', db);
  return sendJson(res, 200, { success: true });
};

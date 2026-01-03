const { readDB, writeDB } = require('../_db');
const { getSessionUser, readBody, sendJson } = require('../_utils');

module.exports = async (req, res) => {
  const username = getSessionUser(req);
  if (!username) return sendJson(res, 401, {});
  if (req.method !== 'POST') return sendJson(res, 405, {});
  const { id } = await readBody(req);
  let db = await readDB('tododb.json');
  db = db.filter(t => !(t.id === id && t.username === username));
  await writeDB('tododb.json', db);
  return sendJson(res, 200, { success: true });
};

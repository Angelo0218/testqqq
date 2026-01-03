const { readDB, writeDB } = require('../_db');
const { getSessionUser, readBody, sendJson } = require('../_utils');

module.exports = async (req, res) => {
  const username = getSessionUser(req);
  if (!username) return sendJson(res, 401, {});
  if (req.method !== 'POST') return sendJson(res, 405, {});
  const { id } = await readBody(req);
  let db = await readDB('diarydb.json');
  db = db.filter(d => !(d.id === id && d.username === username));
  await writeDB('diarydb.json', db);
  return sendJson(res, 200, { success: true });
};

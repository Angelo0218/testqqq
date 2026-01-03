const { readDB, writeDB } = require('./_db');
const { getSessionUser, readBody, sendJson } = require('./_utils');
const { analyzeMealImage } = require('./_ai');

module.exports = async (req, res) => {
  const username = getSessionUser(req);
  if (!username) return sendJson(res, 401, []);

  if (req.method === 'GET') {
    const db = await readDB('mealdb.json');
    return sendJson(res, 200, db.filter(m => m.username === username));
  }

  if (req.method === 'POST') {
    const { image } = await readBody(req);
    const nutrients = await analyzeMealImage(image);
    const db = await readDB('mealdb.json');
    db.unshift({
      id: Date.now(),
      username,
      date: new Date().toISOString().split('T')[0],
      nutrients,
      summary: nutrients.summary || ''
    });
    await writeDB('mealdb.json', db);
    return sendJson(res, 200, { success: true, nutrients, summary: nutrients.summary || '' });
  }

  return sendJson(res, 405, {});
};

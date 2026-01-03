const { readDB, writeDB } = require('./_db');
const { getSessionUser, readBody, sendJson } = require('./_utils');

module.exports = async (req, res) => {
  const username = getSessionUser(req);
  if (!username) return sendJson(res, 401, {});

  if (req.method === 'GET') {
    const db = await readDB('tododb.json');
    return sendJson(res, 200, db.filter(t => t.username === username));
  }

  if (req.method === 'POST') {
    const { task, date } = await readBody(req);
    const db = await readDB('tododb.json');
    db.push({
      id: Date.now(),
      username,
      task,
      completed: false,
      date: date || new Date().toISOString().split('T')[0]
    });
    await writeDB('tododb.json', db);
    return sendJson(res, 200, { success: true });
  }

  return sendJson(res, 405, {});
};

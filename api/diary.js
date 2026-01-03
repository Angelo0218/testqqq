const { readDB, writeDB } = require('./_db');
const { getSessionUser, readBody, sendJson } = require('./_utils');
const { generateDiaryResponse } = require('./_ai');

module.exports = async (req, res) => {
  const username = getSessionUser(req);
  if (!username) return sendJson(res, 401, []);

  if (req.method === 'GET') {
    const db = await readDB('diarydb.json');
    return sendJson(res, 200, db.filter(d => d.username === username));
  }

  if (req.method === 'POST') {
    const { content } = await readBody(req);
    const aiResponse = await generateDiaryResponse(content);
    const db = await readDB('diarydb.json');
    db.unshift({
      id: Date.now(),
      username,
      date: new Date().toLocaleDateString(),
      content,
      aiResponse
    });
    await writeDB('diarydb.json', db);
    return sendJson(res, 200, { success: true, aiResponse });
  }

  return sendJson(res, 405, {});
};

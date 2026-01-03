const { readDB, writeDB } = require('./_db');
const { getSessionUser, readBody, sendJson } = require('./_utils');

module.exports = async (req, res) => {
  const username = getSessionUser(req);
  if (!username) return sendJson(res, 401, {});
  if (req.method !== 'POST') return sendJson(res, 405, {});
  const { minutes } = await readBody(req);
  const users = await readDB('userdb.json');
  const user = users.find(u => u.username === username);
  if (user) {
    user.focusTime = (user.focusTime || 0) + Number(minutes || 0);
    await writeDB('userdb.json', users);
  }
  return sendJson(res, 200, { success: true });
};

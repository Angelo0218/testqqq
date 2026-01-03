const crypto = require('crypto');
const { readDB, writeDB } = require('./_db');
const { readBody, sendJson } = require('./_utils');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return sendJson(res, 405, {});
  try {
    const { username, password } = await readBody(req);
    if (!username || !password) {
      return sendJson(res, 200, { success: false, message: 'Username or password required' });
    }
    const users = await readDB('userdb.json');
    if (users.find(u => u.username === username)) {
      return sendJson(res, 200, { success: false, message: 'Username already exists' });
    }
    const hash = crypto.createHash('sha256').update(password).digest('hex');
    users.push({ username, password: hash, focusTime: 0, streak: 0 });
    await writeDB('userdb.json', users);
    return sendJson(res, 200, { success: true, message: 'Registered. Please login.' });
  } catch (e) {
    return sendJson(res, 500, { success: false });
  }
};

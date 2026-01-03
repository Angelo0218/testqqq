const crypto = require('crypto');
const { readDB, writeDB } = require('./_db');
const { readBody, sendJson, setSession } = require('./_utils');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return sendJson(res, 405, {});
  try {
    const { username, password } = await readBody(req);
    const users = await readDB('userdb.json');
    const hash = crypto.createHash('sha256').update(password || '').digest('hex');
    const user = users.find(u => u.username === username && u.password === hash);
    if (user) {
      setSession(res, user.username);
      const today = new Date().toISOString().split('T')[0];
      if (user.lastLogin !== today) {
        user.streak = (user.streak || 0) + 1;
        user.lastLogin = today;
        await writeDB('userdb.json', users);
      }
      return sendJson(res, 200, { success: true });
    }
    return sendJson(res, 200, { success: false, message: 'Invalid credentials' });
  } catch (e) {
    return sendJson(res, 500, { success: false });
  }
};

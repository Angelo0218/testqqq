const { sendJson, clearSession } = require('./_utils');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return sendJson(res, 405, {});
  clearSession(res);
  return sendJson(res, 200, { success: true });
};

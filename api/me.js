const { sendJson, getSessionUser } = require('./_utils');

module.exports = async (req, res) => {
  const user = getSessionUser(req);
  return sendJson(res, 200, { authenticated: Boolean(user), user: user || null });
};

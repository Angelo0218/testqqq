const crypto = require('crypto');

function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;
  cookieHeader.split(';').forEach((pair) => {
    const [key, ...rest] = pair.trim().split('=');
    cookies[key] = decodeURIComponent(rest.join('='));
  });
  return cookies;
}

function sign(value, secret) {
  return crypto.createHmac('sha256', secret).update(value).digest('hex');
}

function getSessionUser(req) {
  const secret = process.env.SESSION_SECRET || 'dev_secret';
  const cookies = parseCookies(req.headers.cookie || '');
  const raw = cookies.dt_session || '';
  const parts = raw.split('|');
  if (parts.length !== 2) return null;
  const [username, sig] = parts;
  if (sign(username, secret) !== sig) return null;
  return username;
}

function setSession(res, username) {
  const secret = process.env.SESSION_SECRET || 'dev_secret';
  const sig = sign(username, secret);
  const isHttps = (res.req && res.req.headers['x-forwarded-proto'] === 'https');
  const cookie = `dt_session=${encodeURIComponent(username)}|${sig}; Path=/; HttpOnly; SameSite=Lax${isHttps ? '; Secure' : ''}`;
  res.setHeader('Set-Cookie', cookie);
}

function clearSession(res) {
  res.setHeader('Set-Cookie', 'dt_session=; Path=/; Max-Age=0');
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => { data += chunk; });
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (e) {
        reject(e);
      }
    });
  });
}

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

module.exports = {
  parseCookies,
  getSessionUser,
  setSession,
  clearSession,
  readBody,
  sendJson
};

export function requireAuth(req, res, next) {
  if (!req.session?.user) {
    return res.status(401).json({ error: '請先登入' });
  }
  next();
}

import { Router } from 'express';
import db from '../db/index.js';

const router = Router();

// Add focus time
router.post('/', (req, res) => {
  const userId = req.session.user.id;
  const { minutes } = req.body;
  
  if (!minutes || minutes <= 0) {
    return res.status(400).json({ error: '請輸入有效的專注時間' });
  }
  
  db.prepare(
    "UPDATE users SET focus_time = focus_time + ?, updated_at = datetime('now') WHERE id = ?"
  ).run(minutes, userId);
  
  const user = db.prepare('SELECT focus_time FROM users WHERE id = ?').get(userId);
  
  res.json({ 
    message: '已記錄專注時間',
    totalFocusTime: user.focus_time
  });
});

// Get focus time
router.get('/', (req, res) => {
  const userId = req.session.user.id;
  
  const user = db.prepare('SELECT focus_time FROM users WHERE id = ?').get(userId);
  
  res.json({ focusTime: user?.focus_time || 0 });
});

export default router;

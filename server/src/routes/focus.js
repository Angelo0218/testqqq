import { Router } from 'express';
import db from '../db/index.js';

const router = Router();

// Add focus time
router.post('/', async (req, res) => {
  const userId = req.session.user.id;
  const { minutes } = req.body;
  
  if (!minutes || minutes <= 0) {
    return res.status(400).json({ error: '請輸入有效的專注時間' });
  }
  
  await db.run(
    'UPDATE users SET focus_time = focus_time + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
    [minutes, userId]
  );
  
  const user = await db.get('SELECT focus_time FROM users WHERE id = $1', [userId]);
  
  res.json({ 
    message: '已記錄專注時間',
    totalFocusTime: user.focus_time
  });
});

// Get focus time
router.get('/', async (req, res) => {
  const userId = req.session.user.id;
  
  const user = await db.get('SELECT focus_time FROM users WHERE id = $1', [userId]);
  
  res.json({ focusTime: user?.focus_time || 0 });
});

export default router;

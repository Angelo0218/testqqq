import { Router } from 'express';
import db from '../db/index.js';
import { generateSummary } from '../services/ai.js';

const router = Router();

router.get('/', async (req, res) => {
  const userId = req.session.user.id;
  const today = new Date().toISOString().split('T')[0];
  
  // Get user stats
  const user = db.prepare('SELECT focus_time, streak FROM users WHERE id = ?').get(userId);
  
  // Get todo stats
  const todoStats = db.prepare(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as completed
    FROM todos WHERE user_id = ?
  `).get(userId);
  
  // Get today's calories
  const todayMeals = db.prepare(`
    SELECT SUM(calories) as total_calories
    FROM meals WHERE user_id = ? AND date = ?
  `).get(userId, today);
  
  // Get diary count
  const diaryCount = db.prepare('SELECT COUNT(*) as count FROM diaries WHERE user_id = ?').get(userId);
  
  const stats = {
    focusMinutes: user?.focus_time || 0,
    streak: user?.streak || 0,
    totalTodos: todoStats?.total || 0,
    completedTodos: todoStats?.completed || 0,
    todoRate: todoStats?.total > 0 
      ? Math.round((todoStats.completed / todoStats.total) * 100) 
      : 0,
    todayCalories: todayMeals?.total_calories || 0,
    diaryCount: diaryCount?.count || 0
  };
  
  const summary = await generateSummary(stats);
  
  res.json({ stats, summary });
});

export default router;

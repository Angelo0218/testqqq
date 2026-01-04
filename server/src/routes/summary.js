import { Router } from 'express';
import db from '../db/index.js';
import { generateSummary } from '../services/ai.js';
import { calculateGoalProgress } from '../services/statistics.js';

const router = Router();

router.get('/', async (req, res) => {
  const userId = req.session.user.id;
  const today = new Date().toISOString().split('T')[0];
  
  // Get user stats
  const user = await db.get('SELECT focus_time, streak FROM users WHERE id = $1', [userId]);
  
  // Get todo stats
  const todoStats = await db.get(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN completed = true THEN 1 ELSE 0 END) as completed
    FROM todos WHERE user_id = $1
  `, [userId]);
  
  // Get today's completed tasks for goal tracking
  const todayTasks = await db.get(`
    SELECT COUNT(*) as completed
    FROM todos WHERE user_id = $1 AND date = $2 AND completed = true
  `, [userId, today]);
  
  // Get today's calories
  const todayMeals = await db.get(`
    SELECT SUM(calories) as total_calories
    FROM meals WHERE user_id = $1 AND date = $2
  `, [userId, today]);
  
  // Get diary count
  const diaryCount = await db.get('SELECT COUNT(*) as count FROM diaries WHERE user_id = $1', [userId]);
  
  // Calculate goal progress
  const goalProgress = await calculateGoalProgress(userId);
  
  const stats = {
    focusMinutes: user?.focus_time || 0,
    streak: user?.streak || 0,
    totalTodos: parseInt(todoStats?.total) || 0,
    completedTodos: parseInt(todoStats?.completed) || 0,
    todoRate: todoStats?.total > 0 
      ? Math.round((todoStats.completed / todoStats.total) * 100) 
      : 0,
    todayCalories: parseInt(todayMeals?.total_calories) || 0,
    todayCompletedTasks: parseInt(todayTasks?.completed) || 0,
    diaryCount: parseInt(diaryCount?.count) || 0
  };
  
  const summary = await generateSummary(stats);
  
  res.json({ 
    stats, 
    summary,
    goals: goalProgress.goals,
    goalAchievements: {
      hasAchievedGoals: goalProgress.hasAchievedGoals,
      achievedGoals: goalProgress.achievedGoals
    }
  });
});

export default router;

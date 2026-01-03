import { Router } from 'express';
import db from '../db/index.js';
import { analyzeMealImage } from '../services/ai.js';

const router = Router();

// Get all meals for user
router.get('/', (req, res) => {
  const userId = req.session.user.id;
  const { date } = req.query;
  
  let query = 'SELECT * FROM meals WHERE user_id = ?';
  const params = [userId];
  
  if (date) {
    query += ' AND date = ?';
    params.push(date);
  }
  
  query += ' ORDER BY created_at DESC';
  
  const meals = db.prepare(query).all(...params);
  
  res.json(meals.map(m => ({
    id: m.id,
    nutrients: {
      calories: m.calories,
      protein: m.protein,
      fat: m.fat,
      carb: m.carb
    },
    summary: m.summary,
    date: m.date,
    createdAt: m.created_at
  })));
});

// Create meal (with image analysis)
router.post('/', async (req, res) => {
  const userId = req.session.user.id;
  const { image } = req.body;
  
  if (!image) {
    return res.status(400).json({ error: '請上傳餐點照片' });
  }
  
  const date = new Date().toISOString().split('T')[0];
  const nutrients = await analyzeMealImage(image);
  
  const result = db.prepare(
    'INSERT INTO meals (user_id, calories, protein, fat, carb, summary, date) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(userId, nutrients.calories, nutrients.protein, nutrients.fat, nutrients.carb, nutrients.summary, date);
  
  res.status(201).json({ 
    id: result.lastInsertRowid,
    nutrients,
    summary: nutrients.summary,
    date
  });
});

// Delete meal
router.delete('/:id', (req, res) => {
  const userId = req.session.user.id;
  const { id } = req.params;
  
  const result = db.prepare('DELETE FROM meals WHERE id = ? AND user_id = ?').run(id, userId);
  
  if (result.changes === 0) {
    return res.status(404).json({ error: '找不到此飲食紀錄' });
  }
  
  res.json({ message: '已刪除' });
});

export default router;

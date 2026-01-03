import { Router } from 'express';
import db from '../db/index.js';
import { analyzeMealImage } from '../services/ai.js';

const router = Router();

// Get all meals for user
router.get('/', async (req, res) => {
  const userId = req.session.user.id;
  const { date } = req.query;
  
  let query = 'SELECT * FROM meals WHERE user_id = $1';
  const params = [userId];
  
  if (date) {
    query += ' AND date = $2';
    params.push(date);
  }
  
  query += ' ORDER BY created_at DESC';
  
  const meals = await db.all(query, params);
  
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
  
  const result = await db.run(
    'INSERT INTO meals (user_id, calories, protein, fat, carb, summary, date) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
    [userId, nutrients.calories, nutrients.protein, nutrients.fat, nutrients.carb, nutrients.summary, date]
  );
  
  res.status(201).json({ 
    id: result.rows[0].id,
    nutrients,
    summary: nutrients.summary,
    date
  });
});

// Delete meal
router.delete('/:id', async (req, res) => {
  const userId = req.session.user.id;
  const { id } = req.params;
  
  const result = await db.run('DELETE FROM meals WHERE id = $1 AND user_id = $2', [id, userId]);
  
  if (result.rowCount === 0) {
    return res.status(404).json({ error: '找不到此飲食紀錄' });
  }
  
  res.json({ message: '已刪除' });
});

export default router;

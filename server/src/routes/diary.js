import { Router } from 'express';
import db from '../db/index.js';
import { generateDiaryResponse } from '../services/ai.js';

const router = Router();

// Get all diaries for user
router.get('/', async (req, res) => {
  const userId = req.session.user.id;
  
  const diaries = await db.all(
    'SELECT * FROM diaries WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  
  res.json(diaries.map(d => ({
    id: d.id,
    content: d.content,
    aiResponse: d.ai_response,
    date: d.date,
    createdAt: d.created_at
  })));
});

// Create diary
router.post('/', async (req, res) => {
  const userId = req.session.user.id;
  const { content } = req.body;
  
  if (!content || content.trim().length < 2) {
    return res.status(400).json({ error: '請輸入日記內容（至少 2 個字）' });
  }
  
  const date = new Date().toISOString().split('T')[0];
  const aiResponse = await generateDiaryResponse(content);
  
  const result = await db.run(
    'INSERT INTO diaries (user_id, content, ai_response, date) VALUES ($1, $2, $3, $4) RETURNING id',
    [userId, content.trim(), aiResponse, date]
  );
  
  res.status(201).json({ 
    id: result.rows[0].id,
    content: content.trim(),
    aiResponse,
    date
  });
});

// Delete diary
router.delete('/:id', async (req, res) => {
  const userId = req.session.user.id;
  const { id } = req.params;
  
  const result = await db.run('DELETE FROM diaries WHERE id = $1 AND user_id = $2', [id, userId]);
  
  if (result.rowCount === 0) {
    return res.status(404).json({ error: '找不到此日記' });
  }
  
  res.json({ message: '已刪除' });
});

export default router;

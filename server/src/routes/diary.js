import { Router } from 'express';
import db from '../db/index.js';
import { generateDiaryResponse } from '../services/ai.js';

const router = Router();

// Get all diaries for user
router.get('/', (req, res) => {
  const userId = req.session.user.id;
  
  const diaries = db.prepare(
    'SELECT * FROM diaries WHERE user_id = ? ORDER BY created_at DESC'
  ).all(userId);
  
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
  
  const result = db.prepare(
    'INSERT INTO diaries (user_id, content, ai_response, date) VALUES (?, ?, ?, ?)'
  ).run(userId, content.trim(), aiResponse, date);
  
  res.status(201).json({ 
    id: result.lastInsertRowid,
    content: content.trim(),
    aiResponse,
    date
  });
});

// Delete diary
router.delete('/:id', (req, res) => {
  const userId = req.session.user.id;
  const { id } = req.params;
  
  const result = db.prepare('DELETE FROM diaries WHERE id = ? AND user_id = ?').run(id, userId);
  
  if (result.changes === 0) {
    return res.status(404).json({ error: '找不到此日記' });
  }
  
  res.json({ message: '已刪除' });
});

export default router;

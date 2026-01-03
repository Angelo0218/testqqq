import { Router } from 'express';
import db from '../db/index.js';

const router = Router();

// Get all todos for user
router.get('/', async (req, res) => {
  const userId = req.session.user.id;
  const { date } = req.query;
  
  let query = 'SELECT * FROM todos WHERE user_id = $1';
  const params = [userId];
  
  if (date) {
    query += ' AND date = $2';
    params.push(date);
  }
  
  query += ' ORDER BY date DESC, created_at DESC';
  
  const todos = await db.all(query, params);
  
  res.json(todos.map(t => ({
    id: t.id,
    task: t.task,
    completed: t.completed,
    date: t.date,
    createdAt: t.created_at
  })));
});

// Create todo
router.post('/', async (req, res) => {
  const userId = req.session.user.id;
  const { task, date } = req.body;
  
  if (!task) {
    return res.status(400).json({ error: '請輸入任務內容' });
  }
  
  const todoDate = date || new Date().toISOString().split('T')[0];
  
  const result = await db.run(
    'INSERT INTO todos (user_id, task, date) VALUES ($1, $2, $3) RETURNING id',
    [userId, task, todoDate]
  );
  
  res.status(201).json({ 
    id: result.rows[0].id,
    task,
    completed: false,
    date: todoDate
  });
});

// Toggle todo
router.patch('/:id', async (req, res) => {
  const userId = req.session.user.id;
  const { id } = req.params;
  const { completed, task, date } = req.body;
  
  const todo = await db.get('SELECT * FROM todos WHERE id = $1 AND user_id = $2', [id, userId]);
  if (!todo) {
    return res.status(404).json({ error: '找不到此任務' });
  }
  
  const updates = [];
  const params = [];
  let paramIndex = 1;
  
  if (completed !== undefined) {
    updates.push(`completed = $${paramIndex++}`);
    params.push(completed);
  }
  if (task !== undefined) {
    updates.push(`task = $${paramIndex++}`);
    params.push(task);
  }
  if (date !== undefined) {
    updates.push(`date = $${paramIndex++}`);
    params.push(date);
  }
  
  if (updates.length > 0) {
    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id, userId);
    
    await db.run(
      `UPDATE todos SET ${updates.join(', ')} WHERE id = $${paramIndex++} AND user_id = $${paramIndex}`,
      params
    );
  }
  
  res.json({ message: '已更新' });
});

// Delete todo
router.delete('/:id', async (req, res) => {
  const userId = req.session.user.id;
  const { id } = req.params;
  
  const result = await db.run('DELETE FROM todos WHERE id = $1 AND user_id = $2', [id, userId]);
  
  if (result.rowCount === 0) {
    return res.status(404).json({ error: '找不到此任務' });
  }
  
  res.json({ message: '已刪除' });
});

export default router;

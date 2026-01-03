import { Router } from 'express';
import db from '../db/index.js';

const router = Router();

// Get all todos for user
router.get('/', (req, res) => {
  const userId = req.session.user.id;
  const { date } = req.query;
  
  let query = 'SELECT * FROM todos WHERE user_id = ?';
  const params = [userId];
  
  if (date) {
    query += ' AND date = ?';
    params.push(date);
  }
  
  query += ' ORDER BY date DESC, created_at DESC';
  
  const todos = db.prepare(query).all(...params);
  
  res.json(todos.map(t => ({
    id: t.id,
    task: t.task,
    completed: Boolean(t.completed),
    date: t.date,
    createdAt: t.created_at
  })));
});

// Create todo
router.post('/', (req, res) => {
  const userId = req.session.user.id;
  const { task, date } = req.body;
  
  if (!task) {
    return res.status(400).json({ error: '請輸入任務內容' });
  }
  
  const todoDate = date || new Date().toISOString().split('T')[0];
  
  const result = db.prepare(
    'INSERT INTO todos (user_id, task, date) VALUES (?, ?, ?)'
  ).run(userId, task, todoDate);
  
  res.status(201).json({ 
    id: result.lastInsertRowid,
    task,
    completed: false,
    date: todoDate
  });
});

// Toggle todo
router.patch('/:id', (req, res) => {
  const userId = req.session.user.id;
  const { id } = req.params;
  const { completed, task, date } = req.body;
  
  const todo = db.prepare('SELECT * FROM todos WHERE id = ? AND user_id = ?').get(id, userId);
  if (!todo) {
    return res.status(404).json({ error: '找不到此任務' });
  }
  
  const updates = [];
  const params = [];
  
  if (completed !== undefined) {
    updates.push('completed = ?');
    params.push(completed ? 1 : 0);
  }
  if (task !== undefined) {
    updates.push('task = ?');
    params.push(task);
  }
  if (date !== undefined) {
    updates.push('date = ?');
    params.push(date);
  }
  
  if (updates.length > 0) {
    updates.push("updated_at = datetime('now')");
    params.push(id, userId);
    
    db.prepare(
      `UPDATE todos SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`
    ).run(...params);
  }
  
  res.json({ message: '已更新' });
});

// Delete todo
router.delete('/:id', (req, res) => {
  const userId = req.session.user.id;
  const { id } = req.params;
  
  const result = db.prepare('DELETE FROM todos WHERE id = ? AND user_id = ?').run(id, userId);
  
  if (result.changes === 0) {
    return res.status(404).json({ error: '找不到此任務' });
  }
  
  res.json({ message: '已刪除' });
});

export default router;

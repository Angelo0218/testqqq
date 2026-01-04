import { Router } from 'express';
import db from '../db/index.js';
import { checkAchievementsByCategory } from '../services/achievements.js';

const router = Router();

// Get all todos for user
router.get('/', async (req, res) => {
  try {
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
      priority: t.priority || 'medium',
      createdAt: t.created_at
    })));
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ error: '無法取得任務列表' });
  }
});

// Create todo
router.post('/', async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { task, date, priority } = req.body;

    if (!task) {
      return res.status(400).json({ error: '請輸入任務內容' });
    }

    // Validate priority if provided
    const validPriorities = ['high', 'medium', 'low'];
    const todoPriority = priority && validPriorities.includes(priority) ? priority : 'medium';

    const todoDate = date || new Date().toISOString().split('T')[0];

    const result = await db.run(
      'INSERT INTO todos (user_id, task, date, priority) VALUES ($1, $2, $3, $4) RETURNING id',
      [userId, task, todoDate, todoPriority]
    );

    res.status(201).json({
      id: result.rows[0].id,
      task,
      completed: false,
      date: todoDate,
      priority: todoPriority
    });
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(500).json({ error: '新增任務失敗' });
  }
});

// Toggle todo
router.patch('/:id', async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { id } = req.params;
    const { completed, task, date, priority } = req.body;

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
    if (priority !== undefined) {
      const validPriorities = ['high', 'medium', 'low'];
      if (validPriorities.includes(priority)) {
        updates.push(`priority = $${paramIndex++}`);
        params.push(priority);
      }
    }

    let newAchievements = [];

    if (updates.length > 0) {
      updates.push('updated_at = CURRENT_TIMESTAMP');
      params.push(id, userId);
      
      await db.run(
        `UPDATE todos SET ${updates.join(', ')} WHERE id = $${paramIndex++} AND user_id = $${paramIndex}`,
        params
      );

      if (completed === true) {
        newAchievements = await checkAchievementsByCategory(userId, 'task');
      }
    }

    res.json({ message: '已更新', newAchievements });
  } catch (error) {
    console.error('Error updating todo:', error);
    res.status(500).json({ error: '更新任務失敗' });
  }
});

// Delete todo
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { id } = req.params;

    const result = await db.run('DELETE FROM todos WHERE id = $1 AND user_id = $2', [id, userId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: '找不到此任務' });
    }

    res.json({ message: '已刪除' });
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).json({ error: '刪除任務失敗' });
  }
});

export default router;

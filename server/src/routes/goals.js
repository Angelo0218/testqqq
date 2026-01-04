import { Router } from 'express';
import db from '../db/index.js';

const router = Router();

// Valid goal types
const VALID_GOAL_TYPES = ['focus', 'task', 'calories'];

// GET /api/goals - Get all goals for current user
router.get('/', async (req, res) => {
  try {
    const userId = req.session.user.id;
    
    const goals = await db.all(
      'SELECT * FROM goals WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    
    res.json(goals.map(g => ({
      id: g.id,
      type: g.type,
      targetValue: g.target_value,
      createdAt: g.created_at,
      updatedAt: g.updated_at
    })));
  } catch (error) {
    console.error('Error fetching goals:', error);
    res.status(500).json({ error: '無法取得目標設定' });
  }
});

// POST /api/goals - Create or update a goal
router.post('/', async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { type, targetValue } = req.body;
    
    // Validate goal type
    if (!type || !VALID_GOAL_TYPES.includes(type)) {
      return res.status(400).json({ 
        error: `目標類型無效，必須是: ${VALID_GOAL_TYPES.join(', ')}` 
      });
    }
    
    // Validate target value
    if (!targetValue || targetValue <= 0) {
      return res.status(400).json({ error: '目標值必須大於 0' });
    }
    
    // Check if goal of this type already exists for user
    const existingGoal = await db.get(
      'SELECT * FROM goals WHERE user_id = $1 AND type = $2',
      [userId, type]
    );
    
    let result;
    if (existingGoal) {
      // Update existing goal
      result = await db.run(
        `UPDATE goals SET target_value = $1, updated_at = CURRENT_TIMESTAMP 
         WHERE user_id = $2 AND type = $3 RETURNING id`,
        [targetValue, userId, type]
      );
      
      res.json({
        id: existingGoal.id,
        type,
        targetValue,
        message: '目標已更新'
      });
    } else {
      // Create new goal
      result = await db.run(
        'INSERT INTO goals (user_id, type, target_value) VALUES ($1, $2, $3) RETURNING id',
        [userId, type, targetValue]
      );
      
      res.status(201).json({
        id: result.rows[0].id,
        type,
        targetValue,
        message: '目標已建立'
      });
    }
  } catch (error) {
    console.error('Error creating/updating goal:', error);
    res.status(500).json({ error: '無法儲存目標設定' });
  }
});

// PUT /api/goals/:id - Update a specific goal
router.put('/:id', async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { id } = req.params;
    const { type, targetValue } = req.body;
    
    // Check if goal exists and belongs to user
    const goal = await db.get(
      'SELECT * FROM goals WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    
    if (!goal) {
      return res.status(404).json({ error: '找不到此目標設定' });
    }
    
    // Validate type if provided
    if (type && !VALID_GOAL_TYPES.includes(type)) {
      return res.status(400).json({ 
        error: `目標類型無效，必須是: ${VALID_GOAL_TYPES.join(', ')}` 
      });
    }
    
    // Validate target value if provided
    if (targetValue !== undefined && targetValue <= 0) {
      return res.status(400).json({ error: '目標值必須大於 0' });
    }
    
    // Build update query
    const updates = [];
    const params = [];
    let paramIndex = 1;
    
    if (type) {
      updates.push(`type = $${paramIndex++}`);
      params.push(type);
    }
    if (targetValue !== undefined) {
      updates.push(`target_value = $${paramIndex++}`);
      params.push(targetValue);
    }
    
    if (updates.length > 0) {
      updates.push('updated_at = CURRENT_TIMESTAMP');
      params.push(id, userId);
      
      await db.run(
        `UPDATE goals SET ${updates.join(', ')} WHERE id = $${paramIndex++} AND user_id = $${paramIndex}`,
        params
      );
    }
    
    res.json({ 
      id: parseInt(id),
      type: type || goal.type,
      targetValue: targetValue || goal.target_value,
      message: '目標已更新' 
    });
  } catch (error) {
    console.error('Error updating goal:', error);
    res.status(500).json({ error: '無法更新目標設定' });
  }
});

// DELETE /api/goals/:id - Delete a specific goal
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { id } = req.params;
    
    const result = await db.run(
      'DELETE FROM goals WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: '找不到此目標設定' });
    }
    
    res.json({ message: '目標已刪除' });
  } catch (error) {
    console.error('Error deleting goal:', error);
    res.status(500).json({ error: '無法刪除目標設定' });
  }
});

export default router;

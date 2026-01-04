import { Router } from 'express';
import {
  getWeeklyStatistics,
  getMonthlyStatistics
} from '../services/statistics.js';

const router = Router();

// GET /api/statistics/weekly - Get weekly statistics
router.get('/weekly', async (req, res) => {
  try {
    const userId = req.session.user.id;
    const statistics = await getWeeklyStatistics(userId);
    res.json(statistics);
  } catch (error) {
    console.error('Error fetching weekly statistics:', error);
    res.status(500).json({ error: '無法取得每週統計資料' });
  }
});

// GET /api/statistics/monthly - Get monthly statistics
router.get('/monthly', async (req, res) => {
  try {
    const userId = req.session.user.id;
    const statistics = await getMonthlyStatistics(userId);
    res.json(statistics);
  } catch (error) {
    console.error('Error fetching monthly statistics:', error);
    res.status(500).json({ error: '無法取得每月統計資料' });
  }
});

export default router;

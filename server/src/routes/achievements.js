import { Router } from 'express';
import {
  getAllAchievementDefinitions,
  getUserAchievements,
  checkAllAchievements,
  checkAchievementsByCategory
} from '../services/achievements.js';

const router = Router();

// GET /api/achievements - Get all achievements for current user
router.get('/', async (req, res) => {
  try {
    const userId = req.session.user.id;
    
    // Get user's unlocked achievements
    const unlockedAchievements = await getUserAchievements(userId);
    const unlockedIds = new Set(unlockedAchievements.map(a => a.id));
    
    // Get all achievement definitions
    const allDefinitions = getAllAchievementDefinitions();
    
    // Merge: show all achievements with unlocked status
    const achievements = allDefinitions.map(def => {
      const unlocked = unlockedAchievements.find(ua => ua.id === def.id);
      return {
        ...def,
        unlocked: unlockedIds.has(def.id),
        unlockedAt: unlocked?.unlockedAt || null
      };
    });
    
    res.json(achievements);
  } catch (error) {
    console.error('Error fetching achievements:', error);
    res.status(500).json({ error: '無法取得成就資料' });
  }
});

// POST /api/achievements/check - Check and unlock new achievements
router.post('/check', async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { category } = req.body;
    
    let newlyUnlocked;
    
    if (category) {
      // Check specific category
      newlyUnlocked = await checkAchievementsByCategory(userId, category);
    } else {
      // Check all achievements
      newlyUnlocked = await checkAllAchievements(userId);
    }
    
    res.json({
      newlyUnlocked,
      message: newlyUnlocked.length > 0 
        ? `恭喜！解鎖了 ${newlyUnlocked.length} 個新成就！` 
        : '目前沒有新成就解鎖'
    });
  } catch (error) {
    console.error('Error checking achievements:', error);
    res.status(500).json({ error: '無法檢查成就' });
  }
});

export default router;

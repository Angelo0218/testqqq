import db from '../db/index.js';

// Achievement definitions based on design document
export const ACHIEVEMENTS = {
  // 專注類 (Focus)
  FOCUS_FIRST: {
    id: 'focus_first',
    name: '初次專注',
    description: '完成第一次番茄鐘',
    icon: 'timer',
    category: 'focus'
  },
  FOCUS_10: {
    id: 'focus_10',
    name: '專注達人',
    description: '累計專注 10 小時',
    icon: 'timer',
    category: 'focus'
  },
  FOCUS_50: {
    id: 'focus_50',
    name: '專注大師',
    description: '累計專注 50 小時',
    icon: 'timer',
    category: 'focus'
  },

  // 任務類 (Task)
  TASK_FIRST: {
    id: 'task_first',
    name: '任務新手',
    description: '完成第一個任務',
    icon: 'check_circle',
    category: 'task'
  },
  TASK_10: {
    id: 'task_10',
    name: '任務達人',
    description: '累計完成 10 個任務',
    icon: 'check_circle',
    category: 'task'
  },
  TASK_100: {
    id: 'task_100',
    name: '任務大師',
    description: '累計完成 100 個任務',
    icon: 'check_circle',
    category: 'task'
  },

  // 日記類 (Diary)
  DIARY_FIRST: {
    id: 'diary_first',
    name: '日記新手',
    description: '撰寫第一篇日記',
    icon: 'book',
    category: 'diary'
  },
  DIARY_7: {
    id: 'diary_7',
    name: '連續七天',
    description: '連續 7 天撰寫日記',
    icon: 'book',
    category: 'diary'
  },
  DIARY_30: {
    id: 'diary_30',
    name: '月度堅持',
    description: '連續 30 天撰寫日記',
    icon: 'book',
    category: 'diary'
  },

  // 飲食類 (Meal)
  MEAL_FIRST: {
    id: 'meal_first',
    name: '飲食記錄',
    description: '記錄第一餐',
    icon: 'restaurant',
    category: 'meal'
  },
  MEAL_GOAL: {
    id: 'meal_goal',
    name: '營養達標',
    description: '達成每日熱量目標',
    icon: 'restaurant',
    category: 'meal'
  }
};

// Get all achievement definitions
export function getAllAchievementDefinitions() {
  return Object.values(ACHIEVEMENTS);
}

// Get achievement definition by ID
export function getAchievementById(achievementId) {
  return Object.values(ACHIEVEMENTS).find(a => a.id === achievementId);
}

// Check if user has already unlocked an achievement
async function hasAchievement(userId, achievementId) {
  const result = await db.get(
    'SELECT id FROM achievements WHERE user_id = $1 AND achievement_id = $2',
    [userId, achievementId]
  );
  return !!result;
}

// Unlock an achievement for a user
async function unlockAchievement(userId, achievementId) {
  const alreadyUnlocked = await hasAchievement(userId, achievementId);
  if (alreadyUnlocked) {
    return null;
  }

  await db.run(
    'INSERT INTO achievements (user_id, achievement_id) VALUES ($1, $2)',
    [userId, achievementId]
  );

  return getAchievementById(achievementId);
}


// Check focus achievements
async function checkFocusAchievements(userId) {
  const newlyUnlocked = [];
  
  const user = await db.get('SELECT focus_time FROM users WHERE id = $1', [userId]);
  const totalMinutes = user?.focus_time || 0;
  
  // FOCUS_FIRST: First pomodoro (25 minutes)
  if (totalMinutes >= 25) {
    const unlocked = await unlockAchievement(userId, ACHIEVEMENTS.FOCUS_FIRST.id);
    if (unlocked) newlyUnlocked.push(unlocked);
  }
  
  // FOCUS_10: 10 hours (600 minutes)
  if (totalMinutes >= 600) {
    const unlocked = await unlockAchievement(userId, ACHIEVEMENTS.FOCUS_10.id);
    if (unlocked) newlyUnlocked.push(unlocked);
  }
  
  // FOCUS_50: 50 hours (3000 minutes)
  if (totalMinutes >= 3000) {
    const unlocked = await unlockAchievement(userId, ACHIEVEMENTS.FOCUS_50.id);
    if (unlocked) newlyUnlocked.push(unlocked);
  }
  
  return newlyUnlocked;
}

// Check task achievements
async function checkTaskAchievements(userId) {
  const newlyUnlocked = [];
  
  const result = await db.get(
    'SELECT COUNT(*) as count FROM todos WHERE user_id = $1 AND completed = 1',
    [userId]
  );
  const completedCount = parseInt(result?.count || 0);
  
  // TASK_FIRST: First completed task
  if (completedCount >= 1) {
    const unlocked = await unlockAchievement(userId, ACHIEVEMENTS.TASK_FIRST.id);
    if (unlocked) newlyUnlocked.push(unlocked);
  }
  
  // TASK_10: 10 completed tasks
  if (completedCount >= 10) {
    const unlocked = await unlockAchievement(userId, ACHIEVEMENTS.TASK_10.id);
    if (unlocked) newlyUnlocked.push(unlocked);
  }
  
  // TASK_100: 100 completed tasks
  if (completedCount >= 100) {
    const unlocked = await unlockAchievement(userId, ACHIEVEMENTS.TASK_100.id);
    if (unlocked) newlyUnlocked.push(unlocked);
  }
  
  return newlyUnlocked;
}

// Check diary achievements
async function checkDiaryAchievements(userId) {
  const newlyUnlocked = [];
  
  // Count total diaries
  const totalResult = await db.get(
    'SELECT COUNT(*) as count FROM diaries WHERE user_id = $1',
    [userId]
  );
  const totalCount = parseInt(totalResult?.count || 0);
  
  // DIARY_FIRST: First diary entry
  if (totalCount >= 1) {
    const unlocked = await unlockAchievement(userId, ACHIEVEMENTS.DIARY_FIRST.id);
    if (unlocked) newlyUnlocked.push(unlocked);
  }
  
  // Calculate consecutive days streak
  const diaries = await db.all(
    `SELECT DISTINCT date FROM diaries 
     WHERE user_id = $1 
     ORDER BY date DESC`,
    [userId]
  );
  
  let streak = 0;
  if (diaries.length > 0) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let checkDate = today;
    for (const diary of diaries) {
      const diaryDate = new Date(diary.date);
      diaryDate.setHours(0, 0, 0, 0);
      
      const diffDays = Math.floor((checkDate - diaryDate) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0 || diffDays === 1) {
        streak++;
        checkDate = diaryDate;
      } else {
        break;
      }
    }
  }
  
  // DIARY_7: 7 consecutive days
  if (streak >= 7) {
    const unlocked = await unlockAchievement(userId, ACHIEVEMENTS.DIARY_7.id);
    if (unlocked) newlyUnlocked.push(unlocked);
  }
  
  // DIARY_30: 30 consecutive days
  if (streak >= 30) {
    const unlocked = await unlockAchievement(userId, ACHIEVEMENTS.DIARY_30.id);
    if (unlocked) newlyUnlocked.push(unlocked);
  }
  
  return newlyUnlocked;
}

// Check meal achievements
async function checkMealAchievements(userId) {
  const newlyUnlocked = [];
  
  // Count total meals
  const totalResult = await db.get(
    'SELECT COUNT(*) as count FROM meals WHERE user_id = $1',
    [userId]
  );
  const totalCount = parseInt(totalResult?.count || 0);
  
  // MEAL_FIRST: First meal record
  if (totalCount >= 1) {
    const unlocked = await unlockAchievement(userId, ACHIEVEMENTS.MEAL_FIRST.id);
    if (unlocked) newlyUnlocked.push(unlocked);
  }
  
  // Check if user has a calories goal and met it today
  const goal = await db.get(
    "SELECT target_value FROM goals WHERE user_id = $1 AND type = 'calories'",
    [userId]
  );
  
  if (goal) {
    const today = new Date().toISOString().split('T')[0];
    const todayMeals = await db.get(
      'SELECT SUM(calories) as total FROM meals WHERE user_id = $1 AND date = $2',
      [userId, today]
    );
    
    const totalCalories = parseInt(todayMeals?.total || 0);
    
    // MEAL_GOAL: Met daily calorie goal
    if (totalCalories >= goal.target_value) {
      const unlocked = await unlockAchievement(userId, ACHIEVEMENTS.MEAL_GOAL.id);
      if (unlocked) newlyUnlocked.push(unlocked);
    }
  }
  
  return newlyUnlocked;
}

// Check all achievements for a user
export async function checkAllAchievements(userId) {
  const newlyUnlocked = [];
  
  const focusAchievements = await checkFocusAchievements(userId);
  const taskAchievements = await checkTaskAchievements(userId);
  const diaryAchievements = await checkDiaryAchievements(userId);
  const mealAchievements = await checkMealAchievements(userId);
  
  newlyUnlocked.push(
    ...focusAchievements,
    ...taskAchievements,
    ...diaryAchievements,
    ...mealAchievements
  );
  
  return newlyUnlocked;
}

// Check achievements by category
export async function checkAchievementsByCategory(userId, category) {
  switch (category) {
    case 'focus':
      return checkFocusAchievements(userId);
    case 'task':
      return checkTaskAchievements(userId);
    case 'diary':
      return checkDiaryAchievements(userId);
    case 'meal':
      return checkMealAchievements(userId);
    default:
      return [];
  }
}

// Get user's unlocked achievements with definitions
export async function getUserAchievements(userId) {
  const unlocked = await db.all(
    'SELECT achievement_id, unlocked_at FROM achievements WHERE user_id = $1 ORDER BY unlocked_at DESC',
    [userId]
  );
  
  return unlocked.map(ua => {
    const definition = getAchievementById(ua.achievement_id);
    return {
      ...definition,
      unlocked: true,
      unlockedAt: ua.unlocked_at
    };
  });
}

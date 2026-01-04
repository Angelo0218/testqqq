import db from '../db/index.js';

/**
 * Calculate goal progress for a user
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Goal progress with achievement status
 */
export async function calculateGoalProgress(userId) {
  const today = new Date().toISOString().split('T')[0];
  
  // Get user's goals
  const goals = await db.all(
    'SELECT * FROM goals WHERE user_id = $1',
    [userId]
  );
  
  // Get user's focus time (cumulative)
  const user = await db.get(
    'SELECT focus_time FROM users WHERE id = $1',
    [userId]
  );
  
  // Get today's completed tasks count
  const todayTasks = await db.get(
    `SELECT COUNT(*) as completed 
     FROM todos 
     WHERE user_id = $1 AND date = $2 AND completed = true`,
    [userId, today]
  );
  
  // Get today's total calories
  const todayMeals = await db.get(
    `SELECT SUM(calories) as total_calories 
     FROM meals 
     WHERE user_id = $1 AND date = $2`,
    [userId, today]
  );
  
  // Current values
  const currentValues = {
    focus: user?.focus_time || 0,
    task: parseInt(todayTasks?.completed) || 0,
    calories: parseInt(todayMeals?.total_calories) || 0
  };
  
  // Calculate progress for each goal
  const goalProgress = goals.map(goal => {
    const current = currentValues[goal.type] || 0;
    const target = goal.target_value;
    const percentage = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
    const achieved = current >= target;
    
    return {
      id: goal.id,
      type: goal.type,
      targetValue: target,
      currentValue: current,
      percentage,
      achieved
    };
  });
  
  // Check if any goals were achieved
  const newlyAchieved = goalProgress.filter(g => g.achieved);
  
  return {
    goals: goalProgress,
    currentValues,
    hasAchievedGoals: newlyAchieved.length > 0,
    achievedGoals: newlyAchieved
  };
}

/**
 * Get date range for statistics
 * @param {number} days - Number of days to look back
 * @returns {{ startDate: string, endDate: string }}
 */
function getDateRange(days) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days + 1);
  
  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  };
}

/**
 * Generate array of dates between start and end
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {string[]}
 */
function generateDateArray(startDate, endDate) {
  const dates = [];
  const current = new Date(startDate);
  const end = new Date(endDate);
  
  while (current <= end) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }
  
  return dates;
}

/**
 * Calculate focus time statistics
 * @param {number} userId - User ID
 * @param {string} startDate - Start date
 * @param {string} endDate - End date
 * @returns {Promise<Object>}
 */
async function getFocusStatistics(userId, startDate, endDate) {
  // Get user's total focus time
  const user = await db.get(
    'SELECT focus_time FROM users WHERE id = $1',
    [userId]
  );
  
  const totalMinutes = user?.focus_time || 0;
  const dates = generateDateArray(startDate, endDate);
  const dailyAverage = Math.round(totalMinutes / dates.length);
  
  // Note: Since focus_time is stored as a cumulative value on the user,
  // we don't have daily breakdown. Return total and average.
  const trend = dates.map(date => ({
    date,
    minutes: 0 // Daily breakdown not available with current schema
  }));
  
  return {
    totalMinutes,
    dailyAverage,
    trend
  };
}

/**
 * Calculate task completion statistics
 * @param {number} userId - User ID
 * @param {string} startDate - Start date
 * @param {string} endDate - End date
 * @returns {Promise<Object>}
 */
async function getTaskStatistics(userId, startDate, endDate) {
  // Get task counts by date
  const tasksByDate = await db.all(
    `SELECT 
      date,
      COUNT(*) as total,
      SUM(CASE WHEN completed = true THEN 1 ELSE 0 END) as completed
     FROM todos 
     WHERE user_id = $1 AND date >= $2 AND date <= $3
     GROUP BY date
     ORDER BY date`,
    [userId, startDate, endDate]
  );
  
  // Create a map for quick lookup
  const taskMap = new Map();
  tasksByDate.forEach(row => {
    const dateStr = typeof row.date === 'string' 
      ? row.date.split('T')[0] 
      : new Date(row.date).toISOString().split('T')[0];
    taskMap.set(dateStr, {
      total: parseInt(row.total) || 0,
      completed: parseInt(row.completed) || 0
    });
  });
  
  // Generate trend data for all dates
  const dates = generateDateArray(startDate, endDate);
  const trend = dates.map(date => {
    const data = taskMap.get(date) || { total: 0, completed: 0 };
    return {
      date,
      total: data.total,
      completed: data.completed
    };
  });
  
  // Calculate totals
  const totalTasks = trend.reduce((sum, d) => sum + d.total, 0);
  const completedTasks = trend.reduce((sum, d) => sum + d.completed, 0);
  const completionRate = totalTasks > 0 
    ? Math.round((completedTasks / totalTasks) * 100) 
    : 0;
  
  return {
    completed: completedTasks,
    total: totalTasks,
    completionRate,
    trend
  };
}

/**
 * Calculate meal/nutrition statistics
 * @param {number} userId - User ID
 * @param {string} startDate - Start date
 * @param {string} endDate - End date
 * @returns {Promise<Object>}
 */
async function getMealStatistics(userId, startDate, endDate) {
  // Get meal data by date
  const mealsByDate = await db.all(
    `SELECT 
      date,
      SUM(calories) as calories,
      SUM(protein) as protein,
      SUM(fat) as fat,
      SUM(carb) as carb
     FROM meals 
     WHERE user_id = $1 AND date >= $2 AND date <= $3
     GROUP BY date
     ORDER BY date`,
    [userId, startDate, endDate]
  );
  
  // Create a map for quick lookup
  const mealMap = new Map();
  mealsByDate.forEach(row => {
    const dateStr = typeof row.date === 'string' 
      ? row.date.split('T')[0] 
      : new Date(row.date).toISOString().split('T')[0];
    mealMap.set(dateStr, {
      calories: parseInt(row.calories) || 0,
      protein: parseInt(row.protein) || 0,
      fat: parseInt(row.fat) || 0,
      carb: parseInt(row.carb) || 0
    });
  });
  
  // Generate trend data for all dates
  const dates = generateDateArray(startDate, endDate);
  const trend = dates.map(date => {
    const data = mealMap.get(date) || { calories: 0, protein: 0, fat: 0, carb: 0 };
    return {
      date,
      calories: data.calories,
      protein: data.protein,
      fat: data.fat,
      carb: data.carb
    };
  });
  
  // Calculate totals
  const totalCalories = trend.reduce((sum, d) => sum + d.calories, 0);
  const daysWithData = trend.filter(d => d.calories > 0).length;
  const dailyAverage = daysWithData > 0 
    ? Math.round(totalCalories / daysWithData) 
    : 0;
  
  return {
    totalCalories,
    dailyAverage,
    trend
  };
}

/**
 * Calculate diary statistics including streak
 * @param {number} userId - User ID
 * @param {string} startDate - Start date
 * @param {string} endDate - End date
 * @returns {Promise<Object>}
 */
async function getDiaryStatistics(userId, startDate, endDate) {
  // Get diary entries by date
  const diariesByDate = await db.all(
    `SELECT DISTINCT date FROM diaries 
     WHERE user_id = $1 AND date >= $2 AND date <= $3
     ORDER BY date`,
    [userId, startDate, endDate]
  );
  
  // Create a set for quick lookup
  const diaryDates = new Set();
  diariesByDate.forEach(row => {
    const dateStr = typeof row.date === 'string' 
      ? row.date.split('T')[0] 
      : new Date(row.date).toISOString().split('T')[0];
    diaryDates.add(dateStr);
  });
  
  // Generate trend data for all dates
  const dates = generateDateArray(startDate, endDate);
  const trend = dates.map(date => ({
    date,
    hasEntry: diaryDates.has(date)
  }));
  
  // Count entries
  const entriesCount = diaryDates.size;
  
  // Calculate current streak (consecutive days ending today or yesterday)
  const streak = await calculateDiaryStreak(userId);
  
  return {
    entriesCount,
    streak,
    trend
  };
}

/**
 * Calculate consecutive diary writing streak
 * @param {number} userId - User ID
 * @returns {Promise<number>}
 */
async function calculateDiaryStreak(userId) {
  const diaries = await db.all(
    `SELECT DISTINCT date FROM diaries 
     WHERE user_id = $1 
     ORDER BY date DESC`,
    [userId]
  );
  
  if (diaries.length === 0) {
    return 0;
  }
  
  let streak = 0;
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
  
  return streak;
}

/**
 * Get weekly statistics (past 7 days)
 * @param {number} userId - User ID
 * @returns {Promise<Object>}
 */
export async function getWeeklyStatistics(userId) {
  const { startDate, endDate } = getDateRange(7);
  
  const [focus, tasks, meals, diary] = await Promise.all([
    getFocusStatistics(userId, startDate, endDate),
    getTaskStatistics(userId, startDate, endDate),
    getMealStatistics(userId, startDate, endDate),
    getDiaryStatistics(userId, startDate, endDate)
  ]);
  
  return {
    period: 'week',
    startDate,
    endDate,
    focus,
    tasks,
    meals,
    diary
  };
}

/**
 * Get monthly statistics (past 30 days)
 * @param {number} userId - User ID
 * @returns {Promise<Object>}
 */
export async function getMonthlyStatistics(userId) {
  const { startDate, endDate } = getDateRange(30);
  
  const [focus, tasks, meals, diary] = await Promise.all([
    getFocusStatistics(userId, startDate, endDate),
    getTaskStatistics(userId, startDate, endDate),
    getMealStatistics(userId, startDate, endDate),
    getDiaryStatistics(userId, startDate, endDate)
  ]);
  
  return {
    period: 'month',
    startDate,
    endDate,
    focus,
    tasks,
    meals,
    diary
  };
}

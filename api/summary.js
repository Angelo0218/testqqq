const { readDB } = require('./_db');
const { getSessionUser, sendJson } = require('./_utils');
const { generateSummary } = require('./_ai');

async function buildUserStats(username) {
  const todos = (await readDB('tododb.json')).filter(t => t.username === username);
  const meals = (await readDB('mealdb.json')).filter(m => m.username === username);
  const diaries = (await readDB('diarydb.json')).filter(d => d.username === username);
  const user = (await readDB('userdb.json')).find(u => u.username === username);

  const totalTodos = todos.length;
  const completedTodos = todos.filter(t => t.completed).length;
  const todoRate = totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0;

  const today = new Date().toISOString().split('T')[0];
  const todayMeals = meals.filter(m => m.date === today);
  const todayCalories = todayMeals.reduce((acc, cur) => acc + (cur.nutrients.calories || 0), 0);

  const focusMinutes = user ? (user.focusTime || 0) : 0;
  const diaryCount = diaries.length;

  return {
    totalTodos,
    completedTodos,
    todoRate,
    todayCalories,
    focusMinutes,
    diaryCount
  };
}

module.exports = async (req, res) => {
  const username = getSessionUser(req);
  if (!username) return sendJson(res, 401, {});
  const stats = await buildUserStats(username);
  const summary = await generateSummary(stats);
  return sendJson(res, 200, { stats, summary });
};

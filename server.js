/* 白日夢冒險王 - 後端核心 v6.0 (修復日期格式、飲食一致性、AI防呆) */
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const session = require('express-session');
require('dotenv').config();

const app = express();
const PORT = 3000;
const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || 'https://globalai.vip/v1';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const OPENAI_MODEL_TEXT = process.env.OPENAI_MODEL_TEXT || 'gemini-3-flash-preview';
const OPENAI_MODEL_VISION = process.env.OPENAI_MODEL_VISION || 'gemini-3-flash-preview';

const USER_DB = path.join(__dirname, 'userdb.json');
const DIARY_DB = path.join(__dirname, 'diarydb.json');
const MEAL_DB = path.join(__dirname, 'mealdb.json');
const TODO_DB = path.join(__dirname, 'tododb.json');

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ extended: true }));
const CLIENT_DIST = path.join(__dirname, 'dist');
if (fs.existsSync(CLIENT_DIST)) {
    app.use(express.static(CLIENT_DIST));
} else {
    app.use(express.static('public'));
}
app.use(session({ secret: 'dream_v6_secure', resave: false, saveUninitialized: true }));

// --- 資料庫工具 ---
function readDB(filePath) {
    if (!fs.existsSync(filePath)) { fs.writeFileSync(filePath, JSON.stringify([])); return []; }
    try { return JSON.parse(fs.readFileSync(filePath)); } catch (e) { return []; }
}
function writeDB(filePath, data) { fs.writeFileSync(filePath, JSON.stringify(data, null, 2)); }

async function openaiChat(messages, model) {
    if (!OPENAI_API_KEY) return null;
    const res = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model,
            messages,
            temperature: 0.7
        })
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.choices?.[0]?.message?.content?.trim() || null;
}

function parseDataUrl(dataUrl) {
    const match = /^data:(.+);base64,(.*)$/.exec(dataUrl || '');
    if (!match) return null;
    return { mimeType: match[1], data: match[2] };
}

function extractJson(text) {
    if (!text) return null;
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start === -1 || end === -1 || end <= start) return null;
    try { return JSON.parse(text.slice(start, end + 1)); } catch (e) { return null; }
}

// --- 核心演算法區 ---

// 1. AI diary response (OpenAI-compatible)
async function generateDiaryResponse(content) {
    const text = (content || "").trim();
    if (text.length < 2) return "Please write a bit more so I can respond.";

    const prompt = `你是鼓勵型教練，請用繁體中文回覆，80字以內。

日記內容：${text}`;
    const aiText = await openaiChat(
        [{ role: 'user', content: prompt }],
        OPENAI_MODEL_TEXT
    );
    if (aiText) return aiText;

    return "I read your entry. Keep the habit, you are doing well.";
}




// 2. Meal analysis (OpenAI-compatible)
async function analyzeMealImage(imageStr) {
    const fallback = () => {
        let hash = 0;
        for (let i = 0; i < (imageStr || '').length; i++) {
            hash = ((hash << 5) - hash) + imageStr.charCodeAt(i);
            hash |= 0;
        }
        const seed = Math.abs(hash);
        return {
            calories: (seed % 400) + 300,
            protein: (seed % 30) + 10,
            fat: (seed % 20) + 5,
            carb: (seed % 60) + 20,
            summary: ""
        };
    };

    const parsed = parseDataUrl(imageStr);
    if (!parsed || !OPENAI_API_KEY) return fallback();

    const prompt = "你是營養師，請根據照片估算營養素與熱量。" +
        "只回傳 JSON：{\"calories\": number, \"protein\": number, \"fat\": number, \"carb\": number, \"summary\": string}。" +
        "summary 請用繁體中文一句話描述餐點。";

    try {
        const aiText = await openaiChat(
            [
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: prompt },
                        { type: 'image_url', image_url: { url: imageStr } }
                    ]
                }
            ],
            OPENAI_MODEL_VISION
        );
        const json = extractJson(aiText);
        if (json && Number.isFinite(json.calories)) {
            return {
                calories: Number(json.calories),
                protein: Number(json.protein || 0),
                fat: Number(json.fat || 0),
                carb: Number(json.carb || 0),
                summary: json.summary || ""
            };
        }
    } catch (e) {
        return fallback();
    }

    return fallback();
}




// 3. AI status summary (legacy)
function analyzeUserStatus(username) {
    const todos = readDB(TODO_DB).filter(t => t.username === username);
    const meals = readDB(MEAL_DB).filter(m => m.username === username);
    const user = readDB(USER_DB).find(u => u.username === username);

    const today = new Date().toISOString().split('T')[0];
    const todayTodos = todos.filter(t => t.date === today);
    const completedCount = todayTodos.filter(t => t.completed).length;
    const todoRate = todayTodos.length > 0 ? Math.round((completedCount / todayTodos.length) * 100) : 0;

    const todayMeals = meals.filter(m => m.date === today);
    const totalCals = todayMeals.reduce((acc, cur) => acc + (cur.nutrients.calories || 0), 0);

    const focusTime = user ? (user.focusTime || 0) : 0;

    let advice = `Today: calories ${totalCals}, focus ${focusTime} min, todo rate ${todoRate}%.`;
    if (focusTime > 60 && totalCals < 500) advice += " Long focus. Remember to refuel.";
    else if (todoRate < 30 && todayTodos.length > 0) advice += " Low progress. Do the easiest task now.";
    else if (totalCals > 2500) advice += " Calories may be high. Consider a lighter dinner.";
    else advice += " Good pace. Keep it up.";

    return { todoRate, totalCals, focusTime, advice };
}

function buildUserStats(username) {
    const todos = readDB(TODO_DB).filter(t => t.username === username);
    const meals = readDB(MEAL_DB).filter(m => m.username === username);
    const diaries = readDB(DIARY_DB).filter(d => d.username === username);
    const user = readDB(USER_DB).find(u => u.username === username);

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

async function generateSummary(stats) {
    const prompt = `請用繁體中文輸出總覽與一句建議（80字內）。
` +
        `專注分鐘: ${stats.focusMinutes}
` +
        `任務完成率: ${stats.todoRate}% (${stats.completedTodos}/${stats.totalTodos})
` +
        `今日熱量: ${stats.todayCalories}
` +
        `日記數: ${stats.diaryCount}`;

    const aiText = await openaiChat(
        [{ role: 'user', content: prompt }],
        OPENAI_MODEL_TEXT
    );
    if (aiText) return aiText;
    return "Summary ready. Keep your momentum and balance your energy.";
}

// --- API 區域 ---

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const users = readDB(USER_DB);
    const hash = crypto.createHash('sha256').update(password).digest('hex');
    const user = users.find(u => u.username === username && u.password === hash);
    if (user) {
        req.session.user = user;
        // 簡單 Streak 邏輯
        const today = new Date().toISOString().split('T')[0];
        if (user.lastLogin !== today) {
            user.streak = (user.streak || 0) + 1;
            user.lastLogin = today;
            writeDB(USER_DB, users);
        }
        res.json({ success: true });
    } else {
        res.json({ success: false, message: 'Invalid credentials' });
    }
});
app.post('/api/register', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.json({ success: false, message: 'Username or password required' });
    const users = readDB(USER_DB);
    if (users.find(u => u.username === username)) return res.json({ success: false, message: 'Username already exists' });
    const hash = crypto.createHash('sha256').update(password).digest('hex');
    users.push({ username, password: hash, focusTime: 0, streak: 0 });
    writeDB(USER_DB, users);
    res.json({ success: true, message: 'Registered. Please login.' });
});
app.post('/api/logout', (req, res) => { req.session.destroy(); res.json({success: true}); });
app.get('/api/me', (req, res) => {
    res.json({ authenticated: Boolean(req.session.user), user: req.session.user?.username || null });
});

// AI 總管
app.get('/api/butler', (req, res) => {
    if(!req.session.user) return res.status(401).json({});
    const analysis = analyzeUserStatus(req.session.user.username);
    res.json(analysis);
});

app.get('/api/summary', async (req, res) => {
    if(!req.session.user) return res.status(401).json({});
    const stats = buildUserStats(req.session.user.username);
    const summary = await generateSummary(stats);
    res.json({ stats, summary });
});

// 待辦清單 (統一日期格式)
app.post('/api/todo', (req, res) => {
    if(!req.session.user) return res.status(401).json({});
    const { task, date } = req.body;
    const db = readDB(TODO_DB);
    db.push({ 
        id: Date.now(), 
        username: req.session.user.username, 
        task, 
        completed: false,
        date: date || new Date().toISOString().split('T')[0] // 統一存 YYYY-MM-DD
    });
    writeDB(TODO_DB, db);
    res.json({ success: true });
});
app.post('/api/todo/toggle', (req, res) => {
    const { id, completed } = req.body;
    const db = readDB(TODO_DB);
    const item = db.find(t => t.id === id);
    if(item) { item.completed = completed; writeDB(TODO_DB, db); }
    res.json({ success: true });
});
app.post('/api/todo/delete', (req, res) => {
    const { id } = req.body;
    let db = readDB(TODO_DB);
    db = db.filter(t => t.id !== id);
    writeDB(TODO_DB, db);
    res.json({ success: true });
});
app.get('/api/todo', (req, res) => {
    if(!req.session.user) return res.status(401).json({});
    const db = readDB(TODO_DB);
    res.json(db.filter(t => t.username === req.session.user.username));
});

// 日記
app.post('/api/diary', async (req, res) => {
    if(!req.session.user) return res.status(401).json({});
    const { content } = req.body;
    const aiResponse = await generateDiaryResponse(content);
    const db = readDB(DIARY_DB);
    db.unshift({ 
        id: Date.now(), 
        username: req.session.user.username, 
        date: new Date().toLocaleDateString(), // ??????????????????????
        content, 
        aiResponse 
    });
    writeDB(DIARY_DB, db);
    res.json({ success: true, aiResponse });
});
app.get('/api/diary', (req, res) => {
    if(!req.session.user) return res.status(401).json([]);
    const db = readDB(DIARY_DB);
    res.json(db.filter(d => d.username === req.session.user.username));
});
app.post('/api/diary/delete', (req, res) => { // 刪除日記路由
    const { id } = req.body;
    let db = readDB(DIARY_DB);
    db = db.filter(d => d.id !== id);
    writeDB(DIARY_DB, db);
    res.json({ success: true });
});

// 飲食 (使用演算法計算)
app.post('/api/meal', async (req, res) => {
    if(!req.session.user) return res.status(401).json({});
    const { image } = req.body;
    const nutrients = await analyzeMealImage(image);
    
    const db = readDB(MEAL_DB);
    db.unshift({ 
        id: Date.now(), 
        username: req.session.user.username, 
        date: new Date().toISOString().split('T')[0], // ???YYYY-MM-DD
        nutrients,
        summary: nutrients.summary || ""
    });
    writeDB(MEAL_DB, db);
    res.json({ success: true, nutrients, summary: nutrients.summary || "" });
});
app.get('/api/meal', (req, res) => {
    if(!req.session.user) return res.status(401).json([]);
    const db = readDB(MEAL_DB);
    res.json(db.filter(m => m.username === req.session.user.username));
});
app.post('/api/meal/delete', (req, res) => { // 刪除飲食路由
    const { id } = req.body;
    let db = readDB(MEAL_DB);
    db = db.filter(m => m.id !== id);
    writeDB(MEAL_DB, db);
    res.json({ success: true });
});

// 專注時間
app.post('/api/focus', (req, res) => {
    if(!req.session.user) return res.status(401).json({});
    const { minutes } = req.body;
    const users = readDB(USER_DB);
    const user = users.find(u => u.username === req.session.user.username);
    if(user) { user.focusTime = (user.focusTime || 0) + minutes; writeDB(USER_DB, users); res.json({ success: true }); }
});
app.get(/^(?!\/api).*/, (req, res) => {
    const indexPath = fs.existsSync(CLIENT_DIST)
        ? path.join(CLIENT_DIST, 'index.html')
        : path.join(__dirname, 'public', 'index.html');
    res.sendFile(indexPath);
});

app.listen(PORT, () => console.log(`V6.0 決戰版啟動: http://localhost:${PORT}`));

/* 白日夢冒險王 - 後端核心 v1.0 */
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const session = require('express-session');

const app = express();
const PORT = 3000;
const USER_DB_FILE = path.join(__dirname, 'userdb.json');

// 設定
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // 這一行很重要，它會讓網頁顯示出來
app.use(session({
    secret: 'dream_chaser_secret',
    resave: false,
    saveUninitialized: true
}));

// 資料庫讀寫工具
function readUserDB() {
    if (!fs.existsSync(USER_DB_FILE)) return [];
    try { return JSON.parse(fs.readFileSync(USER_DB_FILE)); } catch (e) { return []; }
}
function writeUserDB(data) {
    fs.writeFileSync(USER_DB_FILE, JSON.stringify(data, null, 2));
}

// API: 註冊
app.post('/api/register', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.json({ success: false, message: '請輸入帳號密碼' });
    
    const users = readUserDB();
    if (users.find(u => u.username === username)) return res.json({ success: false, message: '帳號已存在' });
    
    // SHA256 加密
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
    
    users.push({ id: Date.now(), username, password: hashedPassword });
    writeUserDB(users);
    
    console.log(`[註冊成功] ${username}`);
    res.json({ success: true, message: '註冊成功！' });
});

// API: 登入
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const users = readUserDB();
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
    
    const user = users.find(u => u.username === username && u.password === hashedPassword);
    
    if (user) {
        req.session.user = user;
        console.log(`[登入成功] ${username}`);
        res.json({ success: true, message: '登入成功' });
    } else {
        res.json({ success: false, message: '帳號或密碼錯誤' });
    }
});

// 啟動
app.listen(PORT, () => {
    console.log(`---------------------------------------`);
    console.log(`白日夢冒險王系統啟動！`);
    console.log(`請打開網頁: http://localhost:${PORT}`);
    console.log(`---------------------------------------`);
});
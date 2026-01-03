import { Router } from 'express';
import bcrypt from 'bcrypt';
import db from '../db/index.js';

const router = Router();
const SALT_ROUNDS = 12;

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: '請輸入帳號和密碼' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: '密碼至少需要 6 個字元' });
    }

    const existing = await db.get('SELECT id FROM users WHERE username = $1', [username]);
    if (existing) {
      return res.status(409).json({ error: '此帳號已被使用' });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    
    const result = await db.run(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id',
      [username, hashedPassword]
    );

    res.status(201).json({ 
      message: '註冊成功',
      userId: result.rows[0].id 
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: '註冊失敗，請稍後再試' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await db.get('SELECT * FROM users WHERE username = $1', [username]);
    if (!user) {
      return res.status(401).json({ error: '帳號或密碼錯誤' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: '帳號或密碼錯誤' });
    }

    // Update streak
    const today = new Date().toISOString().split('T')[0];
    let newStreak = user.streak || 0;
    
    const lastLogin = user.last_login ? new Date(user.last_login).toISOString().split('T')[0] : null;
    
    if (lastLogin !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      newStreak = lastLogin === yesterday ? newStreak + 1 : 1;
      
      await db.run(
        'UPDATE users SET streak = $1, last_login = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
        [newStreak, today, user.id]
      );
    }

    req.session.user = { id: user.id, username: user.username };

    res.json({ 
      message: '登入成功',
      user: { username: user.username, streak: newStreak }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: '登入失敗，請稍後再試' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ message: '已登出' });
});

// Get current user
router.get('/me', async (req, res) => {
  if (!req.session?.user) {
    return res.json({ authenticated: false });
  }
  
  const user = await db.get(
    'SELECT username, focus_time, streak FROM users WHERE id = $1',
    [req.session.user.id]
  );
  
  res.json({ 
    authenticated: true,
    user: user ? {
      username: user.username,
      focusTime: user.focus_time,
      streak: user.streak
    } : null
  });
});

export default router;

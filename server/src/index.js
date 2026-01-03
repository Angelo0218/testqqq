import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import session from 'express-session';

import authRoutes from './routes/auth.js';
import todoRoutes from './routes/todo.js';
import diaryRoutes from './routes/diary.js';
import mealRoutes from './routes/meal.js';
import focusRoutes from './routes/focus.js';
import summaryRoutes from './routes/summary.js';
import { requireAuth } from './middleware/auth.js';

const app = express();
const PORT = process.env.PORT || 3000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Middleware
app.use(helmet());
app.use(morgan('dev'));
app.use(cors({
  origin: CLIENT_URL,
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'dream-tracker-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  }
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/todos', requireAuth, todoRoutes);
app.use('/api/diaries', requireAuth, diaryRoutes);
app.use('/api/meals', requireAuth, mealRoutes);
app.use('/api/focus', requireAuth, focusRoutes);
app.use('/api/summary', requireAuth, summaryRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

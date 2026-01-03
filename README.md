# 白日夢冒險王 Dream Tracker

一個幫助你追蹤日常生活的應用程式，包含待辦事項、日記、飲食記錄和專注計時功能。

## 專案結構

```
dream-tracker/
├── client/          # 前端 (Vue 3 + Vite + PrimeVue)
│   ├── src/
│   │   ├── App.vue
│   │   ├── main.js
│   │   └── style.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── server/          # 後端 (Express + SQLite)
│   ├── src/
│   │   ├── db/          # 資料庫
│   │   ├── middleware/  # 中間件
│   │   ├── routes/      # API 路由
│   │   ├── services/    # 服務 (AI)
│   │   └── index.js
│   ├── data/        # SQLite 資料庫檔案
│   ├── .env         # 環境變數
│   └── package.json
│
└── package.json     # 根目錄腳本
```

## 快速開始

### 1. 安裝依賴

```bash
npm run install:all
```

### 2. 初始化資料庫

```bash
npm run db:init
```

### 3. 設置環境變數

編輯 `server/.env`：

```env
OPENAI_API_KEY=your-api-key-here
```

### 4. 啟動開發伺服器

```bash
npm run dev
```

這會同時啟動：
- 前端: http://localhost:5173
- 後端: http://localhost:3000

## 功能

- 📝 待辦事項管理
- 📔 日記撰寫 (AI 回覆)
- 🍽️ 飲食記錄 (AI 圖片分析)
- ⏱️ 專注計時器
- 📊 每日總覽 (AI 摘要)

## 技術棧

**前端:**
- Vue 3
- Vite
- PrimeVue

**後端:**
- Express 5
- SQLite (better-sqlite3)
- OpenAI Compatible API

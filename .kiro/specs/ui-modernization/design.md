# Design Document: UI Modernization

## Overview

本設計文件描述 Dream Tracker 應用程式的全面 UI 升級方案，包含從 PrimeVue 遷移至 Quasar Framework、採用 Apple Fitness 風格設計、以及新增統計報告、成就徽章和目標設定功能。

### 設計原則

1. **Apple Fitness 風格** - 深色主題、活動環、多彩漸層
2. **iOS 原生體驗** - 使用 Quasar iOS 模式元件
3. **一致性** - 統一的色彩、間距、動畫系統
4. **無 Emoji** - 使用圖示替代表情符號
5. **響應式** - 手機和電腦都有最佳體驗

## Architecture

### 技術架構

```
┌─────────────────────────────────────────────────────────┐
│                    Dream Tracker App                     │
├─────────────────────────────────────────────────────────┤
│  Frontend (Vue 3 + Quasar)                              │
│  ┌─────────────┬─────────────┬─────────────────────┐   │
│  │   Pages     │  Components │    Composables      │   │
│  │  - Login    │  - Activity │  - useActivityRing  │   │
│  │  - Summary  │    Ring     │  - useStatistics    │   │
│  │  - Pomodoro │  - Task     │  - useAchievements  │   │
│  │  - Todo     │    Card     │  - useGoals         │   │
│  │  - Diary    │  - Charts   │  - useTheme         │   │
│  │  - Meal     │  - Badge    │                     │   │
│  │  - Stats    │  - Progress │                     │   │
│  │  - Achieve  │    Ring     │                     │   │
│  │  - Goals    │             │                     │   │
│  └─────────────┴─────────────┴─────────────────────┘   │
│                                                         │
│  Quasar Framework (iOS Mode)                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │  - QLayout, QPage, QHeader, QFooter             │   │
│  │  - QTabs, QTabPanels (Bottom Navigation)        │   │
│  │  - QDrawer (Side Navigation)                    │   │
│  │  - QCard, QInput, QBtn, QDialog                 │   │
│  │  - QSlideItem (Swipe Actions)                   │   │
│  │  - Dark Mode Plugin                             │   │
│  └─────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│  Backend (Express + SQLite) - 現有架構                  │
│  ┌─────────────────────────────────────────────────┐   │
│  │  新增 API:                                       │   │
│  │  - GET/POST /api/goals                          │   │
│  │  - GET/POST /api/achievements                   │   │
│  │  - GET /api/statistics/weekly                   │   │
│  │  - GET /api/statistics/monthly                  │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### 目錄結構

```
client/
├── src/
│   ├── App.vue                 # 主應用程式（重構）
│   ├── main.js                 # 入口點（更新為 Quasar）
│   │
│   ├── components/             # 新增元件目錄
│   │   ├── ActivityRing.vue    # 活動環元件
│   │   ├── ProgressRing.vue    # 進度環元件
│   │   ├── TaskCard.vue        # 任務卡片元件
│   │   ├── StatChart.vue       # 統計圖表元件
│   │   ├── AchievementBadge.vue# 成就徽章元件
│   │   └── TomatoTimer.vue     # 番茄鐘元件
│   │
│   ├── composables/            # 組合式函數
│   │   ├── useActivityRing.js  # 活動環邏輯
│   │   ├── useStatistics.js    # 統計計算
│   │   ├── useAchievements.js  # 成就系統
│   │   └── useGoals.js         # 目標設定
│   │
│   ├── styles/                 # 樣式目錄
│   │   ├── quasar-variables.scss # Quasar 變數覆寫
│   │   └── app.scss            # 全域樣式
│   │
│   └── assets/                 # 靜態資源
│       └── icons/              # 自訂圖示
│
├── quasar.config.js            # Quasar 配置
└── package.json                # 依賴更新
```

## Components and Interfaces

### 1. ActivityRing 元件

活動環是 Apple Fitness 風格的核心視覺元素，用於顯示進度。

```typescript
// ActivityRing.vue Props Interface
interface ActivityRingProps {
  // 進度值 (0-100)
  progress: number;
  // 環的顏色（支援漸層）
  color: string | { start: string; end: string };
  // 環的粗細 (px)
  strokeWidth?: number;
  // 環的大小 (px)
  size?: number;
  // 是否顯示動畫
  animated?: boolean;
  // 中心顯示的內容
  label?: string;
  // 副標籤
  sublabel?: string;
}

// 使用範例
<ActivityRing
  :progress="75"
  :color="{ start: '#FF2D55', end: '#FF9500' }"
  :size="200"
  :stroke-width="20"
  label="75%"
  sublabel="專注時間"
  animated
/>
```

### 2. TaskCard 元件

卡片式任務顯示，支援滑動操作。

```typescript
// TaskCard.vue Props Interface
interface TaskCardProps {
  task: {
    id: number;
    task: string;
    date: string;
    completed: boolean;
    priority?: 'high' | 'medium' | 'low';
  };
}

// Events
interface TaskCardEmits {
  (e: 'toggle', id: number): void;
  (e: 'delete', id: number): void;
  (e: 'edit', id: number): void;
}

// 使用範例
<TaskCard
  :task="task"
  @toggle="handleToggle"
  @delete="handleDelete"
/>
```

### 3. StatChart 元件

Apple Fitness 風格的統計圖表。

```typescript
// StatChart.vue Props Interface
interface StatChartProps {
  // 圖表類型
  type: 'bar' | 'line' | 'ring';
  // 數據
  data: Array<{ label: string; value: number }>;
  // 標題
  title: string;
  // 顏色
  color: string;
  // 時間範圍
  period: 'week' | 'month';
}
```

### 4. AchievementBadge 元件

成就徽章顯示。

```typescript
// AchievementBadge.vue Props Interface
interface AchievementBadgeProps {
  achievement: {
    id: string;
    name: string;
    description: string;
    icon: string;
    unlocked: boolean;
    unlockedAt?: string;
    category: 'focus' | 'task' | 'diary' | 'meal';
  };
}
```

## Data Models

### 1. 目標設定 (Goals)

```sql
-- 新增資料表: goals
CREATE TABLE IF NOT EXISTS goals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  type TEXT NOT NULL,           -- 'focus' | 'task' | 'calories'
  target_value INTEGER NOT NULL, -- 目標值
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

```typescript
// TypeScript Interface
interface Goal {
  id: number;
  userId: number;
  type: 'focus' | 'task' | 'calories';
  targetValue: number;
  createdAt: string;
  updatedAt: string;
}
```

### 2. 成就系統 (Achievements)

```sql
-- 新增資料表: achievements
CREATE TABLE IF NOT EXISTS achievements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  achievement_id TEXT NOT NULL,  -- 成就識別碼
  unlocked_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE(user_id, achievement_id)
);
```

```typescript
// 成就定義（前端常數）
const ACHIEVEMENTS = {
  // 專注類
  FOCUS_FIRST: { id: 'focus_first', name: '初次專注', description: '完成第一次番茄鐘', icon: 'timer', category: 'focus' },
  FOCUS_10: { id: 'focus_10', name: '專注達人', description: '累計專注 10 小時', icon: 'timer', category: 'focus' },
  FOCUS_50: { id: 'focus_50', name: '專注大師', description: '累計專注 50 小時', icon: 'timer', category: 'focus' },
  
  // 任務類
  TASK_FIRST: { id: 'task_first', name: '任務新手', description: '完成第一個任務', icon: 'check_circle', category: 'task' },
  TASK_10: { id: 'task_10', name: '任務達人', description: '累計完成 10 個任務', icon: 'check_circle', category: 'task' },
  TASK_100: { id: 'task_100', name: '任務大師', description: '累計完成 100 個任務', icon: 'check_circle', category: 'task' },
  
  // 日記類
  DIARY_FIRST: { id: 'diary_first', name: '日記新手', description: '撰寫第一篇日記', icon: 'book', category: 'diary' },
  DIARY_7: { id: 'diary_7', name: '連續七天', description: '連續 7 天撰寫日記', icon: 'book', category: 'diary' },
  DIARY_30: { id: 'diary_30', name: '月度堅持', description: '連續 30 天撰寫日記', icon: 'book', category: 'diary' },
  
  // 飲食類
  MEAL_FIRST: { id: 'meal_first', name: '飲食記錄', description: '記錄第一餐', icon: 'restaurant', category: 'meal' },
  MEAL_GOAL: { id: 'meal_goal', name: '營養達標', description: '達成每日熱量目標', icon: 'restaurant', category: 'meal' },
};

interface UserAchievement {
  id: number;
  userId: number;
  achievementId: string;
  unlockedAt: string;
}
```

### 3. 統計數據結構

```typescript
// 每週/每月統計
interface Statistics {
  period: 'week' | 'month';
  startDate: string;
  endDate: string;
  
  focus: {
    totalMinutes: number;
    dailyAverage: number;
    trend: Array<{ date: string; minutes: number }>;
  };
  
  tasks: {
    completed: number;
    total: number;
    completionRate: number;
    trend: Array<{ date: string; completed: number; total: number }>;
  };
  
  meals: {
    totalCalories: number;
    dailyAverage: number;
    trend: Array<{ date: string; calories: number; protein: number; fat: number; carb: number }>;
  };
  
  diary: {
    entriesCount: number;
    streak: number;
    trend: Array<{ date: string; hasEntry: boolean }>;
  };
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: 功能完整性保留

*For any* 用戶操作（登入、新增待辦、撰寫日記、上傳飲食、使用番茄鐘），在 UI 框架遷移後，該操作應產生與遷移前相同的數據結果。

**Validates: Requirements 1.3**

### Property 2: 活動環進度計算正確性

*For any* 目標值 T > 0 和當前值 C >= 0，活動環顯示的進度百分比應等於 min(100, (C / T) * 100)，且當 C >= T 時進度應顯示為 100%。

**Validates: Requirements 4.2, 10.5**

### Property 3: 統計趨勢計算正確性

*For any* 時間範圍內的數據集合，統計模組計算的趨勢值（總和、平均、完成率）應與原始數據的數學計算結果一致。

**Validates: Requirements 8.3, 8.4, 8.5**

### Property 4: 成就解鎖觸發正確性

*For any* 成就條件和用戶數據，當用戶數據滿足成就條件時，系統應觸發成就解鎖通知，且解鎖時間應被正確記錄。

**Validates: Requirements 9.2, 9.5**

### Property 5: 目標達成通知正確性

*For any* 目標設定和當前進度，當進度達到或超過目標值時，系統應觸發達成通知。

**Validates: Requirements 10.4**

### Property 6: 觸控目標尺寸合規性

*For any* 可互動元素（按鈕、輸入框、連結），其觸控區域尺寸應至少為 44x44 像素。

**Validates: Requirements 12.3**

### Property 7: 無 Emoji 合規性

*For any* 介面文字和元件，不應包含 Unicode Emoji 字符（U+1F600-U+1F64F, U+1F300-U+1F5FF 等範圍）。

**Validates: Requirements 11.6**

### Property 8: 優先級顏色指示正確性

*For any* 具有優先級的任務，其卡片應顯示對應的顏色指示：high=紅色, medium=橙色, low=綠色。

**Validates: Requirements 6.3**

### Property 9: 歷史數據趨勢顯示正確性

*For any* 歷史數據查詢，返回的趨勢數據應按日期排序，且每個數據點應對應正確的日期和數值。

**Validates: Requirements 7.5**

## Error Handling

### API 錯誤處理

```typescript
// 統一錯誤處理
const handleApiError = (error: any, toast: any) => {
  if (error.response?.status === 401) {
    // 未授權，重新導向登入
    router.push('/login');
    return;
  }
  
  const message = error.response?.data?.error || '操作失敗，請稍後再試';
  toast.add({
    severity: 'error',
    summary: '錯誤',
    detail: message,
    life: 4000
  });
};
```

### 表單驗證

```typescript
// 目標設定驗證
const validateGoal = (goal: Partial<Goal>): string[] => {
  const errors: string[] = [];
  
  if (!goal.type) {
    errors.push('請選擇目標類型');
  }
  
  if (!goal.targetValue || goal.targetValue <= 0) {
    errors.push('目標值必須大於 0');
  }
  
  if (goal.type === 'focus' && goal.targetValue > 1440) {
    errors.push('每日專注時間不能超過 24 小時');
  }
  
  return errors;
};
```

### 離線處理

```typescript
// 網路狀態監測
const useNetworkStatus = () => {
  const isOnline = ref(navigator.onLine);
  
  onMounted(() => {
    window.addEventListener('online', () => isOnline.value = true);
    window.addEventListener('offline', () => isOnline.value = false);
  });
  
  return { isOnline };
};
```

## Testing Strategy

### 單元測試

使用 Vitest 進行單元測試：

- **元件測試**: 測試 ActivityRing、TaskCard、StatChart 等元件的渲染和互動
- **Composable 測試**: 測試 useActivityRing、useStatistics 等組合式函數的邏輯
- **工具函數測試**: 測試日期格式化、進度計算等工具函數

### 屬性測試

使用 fast-check 進行屬性測試，每個測試至少執行 100 次迭代：

- **Property 1**: 功能完整性 - 測試所有 CRUD 操作
- **Property 2**: 活動環進度計算 - 生成隨機目標值和當前值
- **Property 3**: 統計趨勢計算 - 生成隨機數據集合
- **Property 4**: 成就解鎖觸發 - 模擬各種成就條件
- **Property 5**: 目標達成通知 - 生成隨機目標和進度
- **Property 6**: 觸控目標尺寸 - 檢查所有互動元素
- **Property 7**: 無 Emoji 合規性 - 掃描所有介面文字
- **Property 8**: 優先級顏色指示 - 測試所有優先級組合
- **Property 9**: 歷史數據趨勢 - 生成隨機歷史數據

### 視覺回歸測試

使用 Playwright 進行視覺回歸測試：

- 登入頁面截圖比對
- 各功能頁面在不同螢幕尺寸下的截圖比對
- 深色主題一致性檢查

### 測試配置

```javascript
// vitest.config.js
export default {
  test: {
    environment: 'jsdom',
    coverage: {
      reporter: ['text', 'html'],
      exclude: ['node_modules/', 'tests/']
    }
  }
};
```


## Visual Design Specifications

### 色彩系統

```scss
// quasar-variables.scss
$dark: #000000;
$dark-page: #000000;

// Apple Fitness 風格色彩
$primary: #FF2D55;      // 紅色（活動環 - Move）
$secondary: #30D158;    // 綠色（活動環 - Exercise）
$accent: #0A84FF;       // 藍色（活動環 - Stand）

// 輔助色彩
$orange: #FF9500;
$purple: #BF5AF2;
$yellow: #FFD60A;
$teal: #64D2FF;

// 背景色彩
$bg-primary: #000000;
$bg-secondary: #1C1C1E;
$bg-tertiary: #2C2C2E;
$bg-card: #1C1C1E;

// 文字色彩
$text-primary: #FFFFFF;
$text-secondary: #8E8E93;
$text-tertiary: #636366;

// 邊框色彩
$border-color: #38383A;
```

### 間距系統

```scss
// 基於 8px 的間距系統
$space-xs: 4px;
$space-sm: 8px;
$space-md: 16px;
$space-lg: 24px;
$space-xl: 32px;
$space-xxl: 48px;
```

### 圓角系統

```scss
$radius-sm: 8px;
$radius-md: 12px;
$radius-lg: 16px;
$radius-xl: 20px;
$radius-full: 9999px;
```

### 字體系統

```scss
// 使用系統字體堆疊（接近 SF Pro）
$font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 
              'Helvetica Neue', 'Segoe UI', Roboto, sans-serif;

// 字體大小
$font-size-xs: 11px;
$font-size-sm: 13px;
$font-size-md: 15px;
$font-size-lg: 17px;
$font-size-xl: 20px;
$font-size-xxl: 28px;
$font-size-display: 34px;
```

### 動畫系統

```scss
// 過渡時長
$transition-fast: 0.15s;
$transition-normal: 0.25s;
$transition-slow: 0.35s;

// 緩動函數
$ease-out: cubic-bezier(0.25, 0.1, 0.25, 1);
$ease-in-out: cubic-bezier(0.42, 0, 0.58, 1);
$spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);
```

### 活動環設計規格

```
┌─────────────────────────────────────┐
│                                     │
│         ╭───────────────╮           │
│        ╱   ╭─────────╮   ╲          │
│       │   ╱  ╭─────╮  ╲   │         │
│       │  │  │  75% │  │   │         │
│       │  │  │專注時間│  │   │         │
│       │   ╲  ╰─────╯  ╱   │         │
│        ╲   ╰─────────╯   ╱          │
│         ╰───────────────╯           │
│                                     │
│   外環: 紅色漸層 (Move/專注)         │
│   中環: 綠色漸層 (Exercise/任務)     │
│   內環: 藍色漸層 (Stand/日記)        │
│                                     │
└─────────────────────────────────────┘
```

### 卡片設計規格

```
┌─────────────────────────────────────┐
│  ┌─────────────────────────────┐    │
│  │ ● 完成專案報告              │    │
│  │   2026-01-04                │    │
│  │                    [刪除]   │    │
│  └─────────────────────────────┘    │
│                                     │
│  背景: #1C1C1E                      │
│  邊框: 1px solid #38383A            │
│  圓角: 12px                         │
│  內邊距: 16px                       │
│  優先級指示: 左側 4px 色條          │
│    - high: #FF2D55                  │
│    - medium: #FF9500                │
│    - low: #30D158                   │
│                                     │
└─────────────────────────────────────┘
```

## Quasar Configuration

```javascript
// quasar.config.js
module.exports = function (ctx) {
  return {
    framework: {
      config: {
        dark: true,  // 強制深色模式
        brand: {
          primary: '#FF2D55',
          secondary: '#30D158',
          accent: '#0A84FF',
          dark: '#000000',
          positive: '#30D158',
          negative: '#FF3B30',
          info: '#0A84FF',
          warning: '#FF9500'
        }
      },
      plugins: ['Notify', 'Dialog', 'Loading'],
      components: [
        'QLayout', 'QHeader', 'QFooter', 'QDrawer', 'QPageContainer', 'QPage',
        'QToolbar', 'QToolbarTitle', 'QBtn', 'QIcon',
        'QTabs', 'QTab', 'QRouteTab', 'QTabPanels', 'QTabPanel',
        'QCard', 'QCardSection', 'QCardActions',
        'QInput', 'QForm', 'QField',
        'QList', 'QItem', 'QItemSection', 'QItemLabel',
        'QSlideItem', 'QCheckbox', 'QToggle',
        'QCircularProgress', 'QLinearProgress',
        'QDialog', 'QMenu', 'QTooltip'
      ],
      directives: ['Ripple', 'ClosePopup', 'TouchSwipe']
    },
    
    // iOS 風格配置
    animations: 'all',
    
    // CSS 變數
    css: ['app.scss'],
    
    // 建置配置
    build: {
      vueRouterMode: 'history'
    }
  };
};
```

## Migration Plan

### Phase 1: 框架遷移準備
1. 安裝 Quasar CLI 和依賴
2. 建立 Quasar 專案結構
3. 配置深色主題和 iOS 模式

### Phase 2: 元件遷移
1. 遷移登入頁面
2. 遷移導航系統
3. 遷移各功能頁面

### Phase 3: 新元件開發
1. 開發 ActivityRing 元件
2. 開發 TaskCard 元件
3. 開發 StatChart 元件
4. 開發 AchievementBadge 元件

### Phase 4: 新功能開發
1. 實作目標設定功能
2. 實作成就徽章系統
3. 實作統計報告功能

### Phase 5: 測試與優化
1. 執行屬性測試
2. 執行視覺回歸測試
3. 效能優化

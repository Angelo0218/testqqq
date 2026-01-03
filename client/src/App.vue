<template>
  <Toast position="top-center" />
  <ConfirmDialog />
  <div v-if="!authed" class="auth-container">
    <div class="auth-logo">
      <div class="auth-logo-icon">
        <i class="pi pi-star-fill"></i>
      </div>
      <div class="auth-subtitle">開始追蹤你的夢想之旅</div>
    </div>
    <Card class="auth-card">
      <template #title>追夢系統</template>
      <template #content>
        <div class="p-fluid" style="display:grid; gap:14px;">
          <InputText v-model="username" placeholder="帳號" />
          <Password v-model="password" placeholder="密碼" toggleMask :feedback="false" @keyup.enter="login" />
          <Button label="登入" icon="pi pi-sign-in" @click="login" />
          <Button label="註冊新帳號" severity="secondary" icon="pi pi-user-plus" @click="register" />
        </div>
      </template>
    </Card>
  </div>

  <div v-else class="app-shell">
    <aside class="sidebar">
      <div class="brand">
        <span class="status-dot"></span>
        {{ UI_TEXT.brandName }}
      </div>
      <div
        v-for="item in menuItems"
        :key="item.key"
        class="menu-button"
        :class="{ active: activeSection === item.key }"
        @click="activeSection = item.key"
      >
        <i :class="item.icon"></i>
        {{ item.label }}
      </div>
      <div style="margin-top:auto;">
        <button class="sidebar-logout" @click="logout">
          <i class="pi pi-sign-out"></i>
          {{ UI_TEXT.auth.logout }}
        </button>
      </div>
    </aside>

    <div class="main">
      <header class="header">
        <div>
          <div class="greeting">{{ getGreeting() }}，{{ userName || '探險家' }}</div>
          <div class="header-date">{{ formatDateChinese(new Date()) }}</div>
        </div>
        <button class="header-logout mobile-only" @click="logout">
          <i class="pi pi-sign-out"></i>
          {{ UI_TEXT.auth.logout }}
        </button>
      </header>

      <section v-if="activeSection === 'summary'">
        <div class="hero-card">
          <div class="hero-tag">{{ UI_TEXT.summary.mainGoal }}</div>
          <div class="hero-title">Financial Freedom 2026</div>
          <div class="hero-sub">Next: 完成下一個任務</div>
          <div class="hero-metric">
            <span class="hero-percent">{{ summaryStats.todoRate }}%</span>
            <span class="hero-label">{{ UI_TEXT.summary.taskCompletion }}</span>
          </div>
          <Button class="hero-action" :label="UI_TEXT.summary.logProgress" icon="pi pi-plus" @click="refreshSummary" />
        </div>

        <div class="section-head">
          <i class="pi pi-bolt"></i>
          <span>{{ UI_TEXT.summary.dailyMotivation }}</span>
        </div>
        <div class="panel ai-panel">
          <div class="ai-quote">{{ summaryText || UI_TEXT.summary.analyzing }}</div>
          <div class="ai-author">{{ UI_TEXT.summary.aiCoach }}</div>
        </div>

        <div class="section-head">
          <span>{{ UI_TEXT.summary.quickActions }}</span>
        </div>
        <div class="action-grid">
          <button class="action-card" @click="activeSection = 'todo'">
            <i class="pi pi-check-circle"></i>
            <div>{{ UI_TEXT.summary.tasks }}</div>
            <small>{{ summaryStats.totalTodos }} {{ UI_TEXT.summary.items }}</small>
          </button>
          <button class="action-card" @click="activeSection = 'diary'">
            <i class="pi pi-book"></i>
            <div>{{ UI_TEXT.summary.journal }}</div>
            <small>{{ UI_TEXT.summary.write }}</small>
          </button>
          <button class="action-card" @click="activeSection = 'pomodoro'">
            <i class="pi pi-clock"></i>
            <div>{{ UI_TEXT.summary.focus }}</div>
            <small>{{ focusDisplay }}</small>
          </button>
          <button class="action-card" @click="activeSection = 'meal'">
            <i class="pi pi-image"></i>
            <div>{{ UI_TEXT.summary.meal }}</div>
            <small>{{ UI_TEXT.summary.analyze }}</small>
          </button>
        </div>

        <div class="section-head row-between">
          <span>{{ UI_TEXT.summary.recentWins }}</span>
          <button class="link-button" @click="activeSection = 'diary'">{{ UI_TEXT.summary.viewAll }}</button>
        </div>
        <div v-if="recentWins.length === 0" class="muted">{{ UI_TEXT.summary.noRecords }}</div>
        <div v-for="win in recentWins" :key="win.id" class="recent-card">
          <div class="recent-icon"><i :class="win.icon"></i></div>
          <div class="recent-info">
            <div class="recent-title">{{ win.title }}</div>
            <div class="recent-sub">{{ win.subtitle }}</div>
          </div>
          <div class="recent-time">{{ win.time }}</div>
        </div>
      </section>

      <section v-else-if="activeSection === 'pomodoro'">
        <div class="panel focus-panel">
          <div class="section-title">{{ UI_TEXT.pomodoro.title }}</div>
          <div class="tomato-clock" role="img" aria-label="番茄鐘">
            <svg class="tomato-svg" viewBox="0 0 260 260" aria-hidden="true">
              <defs>
                <radialGradient id="tomatoBody" cx="30%" cy="22%" r="72%">
                  <stop offset="0%" stop-color="#ffd2a1" />
                  <stop offset="35%" stop-color="#ff6b5c" />
                  <stop offset="100%" stop-color="#b31212" />
                </radialGradient>
                <radialGradient id="tomatoDeep" cx="60%" cy="75%" r="60%">
                  <stop offset="0%" stop-color="rgba(0,0,0,0)" />
                  <stop offset="100%" stop-color="rgba(0,0,0,0.35)" />
                </radialGradient>
                <linearGradient id="leafGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stop-color="#22c55e" />
                  <stop offset="100%" stop-color="#15803d" />
                </linearGradient>
              </defs>
              <ellipse class="tomato-shadow" cx="130" cy="216" rx="70" ry="18" />
              <path class="tomato-body" d="M130 42c-50 0-92 42-92 94 0 57 44 104 92 104s92-47 92-104c0-52-42-94-92-94z" />
              <path class="tomato-deep" d="M130 42c-50 0-92 42-92 94 0 57 44 104 92 104s92-47 92-104c0-52-42-94-92-94z" />
              <ellipse class="tomato-top" cx="130" cy="58" rx="32" ry="10" />
              <path class="tomato-leaf" d="M130 22c-16 0-32 7-44 20 20 1 30 10 44 20 14-10 24-19 44-20-12-13-28-20-44-20z" />
              <path class="tomato-stem" d="M130 8c-10 12-10 32 0 50" />
              <path class="tomato-highlight" d="M92 98c-14 20-10 46 10 60 8 6 18 8 28 8-18-16-28-32-38-68z" />
              <path class="tomato-highlight-2" d="M150 78c10 6 16 14 18 26-6-2-12-6-18-14-2-4-2-8 0-12z" />
            </svg>
            <div class="timer-text">{{ timerDisplay }}</div>
          </div>
          <div class="focus-actions">
            <Button :label="UI_TEXT.pomodoro.start" icon="pi pi-play" @click="startTimer" />
            <Button :label="UI_TEXT.pomodoro.pause" icon="pi pi-pause" severity="secondary" @click="pauseTimer" />
            <Button :label="UI_TEXT.pomodoro.reset" icon="pi pi-refresh" severity="help" @click="resetTimer" />
          </div>
        </div>
      </section>

      <section v-else-if="activeSection === 'todo'">
        <div class="panel" style="display:grid; gap:12px; margin-bottom:18px;">
          <div class="todo-inputs">
            <InputText v-model="newTask" :placeholder="UI_TEXT.todo.inputPlaceholder" />
            <Calendar v-model="newTaskDate" dateFormat="yy-mm-dd" showIcon />
            <Button :label="UI_TEXT.todo.add" icon="pi pi-plus" @click="addTodo" />
          </div>
          <div class="todo-filter">
            <Calendar v-model="selectedDate" dateFormat="yy-mm-dd" showIcon :placeholder="UI_TEXT.todo.filterPlaceholder" />
            <Button :label="UI_TEXT.todo.clearFilter" severity="secondary" @click="selectedDate = null" />
          </div>
        </div>

        <div v-if="isLoading" class="muted">{{ UI_TEXT.common.loading }}</div>
        <div v-else-if="groupedTodos.length === 0" class="muted">{{ UI_TEXT.todo.noTasks }}</div>
        <div v-for="group in groupedTodos" :key="group.date">
          <div class="todo-date">{{ formatDateShort(group.date) }}</div>
          <div v-for="todo in group.items" :key="todo.id" class="todo-item">
            <div class="todo-row" :class="{ completed: todo.completed }">
              <input type="checkbox" :checked="todo.completed" @change="toggleTodo(todo, $event)" />
              <div class="title">{{ todo.task }}</div>
              <Button icon="pi pi-trash" severity="danger" text @click="deleteTodo(todo.id)" />
            </div>
          </div>
        </div>
      </section>

      <section v-else-if="activeSection === 'diary'">
        <div class="panel" style="margin-bottom:18px;">
          <Textarea v-model="diaryContent" rows="4" :placeholder="UI_TEXT.diary.inputPlaceholder" style="width:100%;" :disabled="isAnalyzing" />
          <div style="display:flex; justify-content:flex-end; margin-top:10px;">
            <Button :label="isAnalyzing ? UI_TEXT.summary.analyzing : UI_TEXT.diary.submit" icon="pi pi-send" @click="saveDiary" :disabled="isAnalyzing" :loading="isAnalyzing" />
          </div>
        </div>

        <div v-if="isLoading" class="muted">{{ UI_TEXT.common.loading }}</div>
        <div v-else-if="diaryEntries.length === 0" class="muted">{{ UI_TEXT.diary.noEntries }}</div>
        <div v-for="entry in diaryEntries" :key="entry.id" class="diary-item">
          <div class="muted" style="font-size:12px;">{{ formatDateShort(entry.date) }}</div>
          <div style="margin:8px 0;">{{ entry.content }}</div>
          <div v-if="entry.aiResponse" class="ai-box">
            <div class="ai-reply-label">{{ UI_TEXT.diary.aiReply }}</div>
            {{ entry.aiResponse }}
          </div>
          <div style="display:flex; justify-content:flex-end; margin-top:8px;">
            <Button icon="pi pi-trash" severity="danger" text @click="deleteDiary(entry.id)" />
          </div>
        </div>
      </section>

      <section v-else-if="activeSection === 'meal'">
        <div class="panel" style="margin-bottom:18px;">
          <div class="meal-upload">
            <input ref="mealInput" type="file" accept="image/*" style="display:none" @change="uploadMeal" />
            <Button :label="isAnalyzing ? UI_TEXT.summary.analyzing : UI_TEXT.meal.upload" icon="pi pi-camera" @click="triggerMealUpload" :disabled="isAnalyzing" :loading="isAnalyzing" />
            <span class="muted">{{ UI_TEXT.meal.description }}</span>
          </div>
        </div>

        <div v-if="isLoading" class="muted">{{ UI_TEXT.common.loading }}</div>
        <div v-else-if="meals.length === 0" class="muted">{{ UI_TEXT.meal.noRecords }}</div>
        <div v-for="meal in meals" :key="meal.id" class="meal-item">
          <div class="muted" style="font-size:12px;">{{ formatDateShort(meal.date) }}</div>
          <div class="stat" style="font-size:28px;">{{ meal.nutrients.calories }} {{ UI_TEXT.meal.kcal }}</div>
          <div class="muted">{{ UI_TEXT.meal.protein }} {{ meal.nutrients.protein }}{{ UI_TEXT.meal.gram }} · {{ UI_TEXT.meal.fat }} {{ meal.nutrients.fat }}{{ UI_TEXT.meal.gram }} · {{ UI_TEXT.meal.carbs }} {{ meal.nutrients.carb }}{{ UI_TEXT.meal.gram }}</div>
          <div v-if="meal.summary || meal.nutrients?.summary" class="ai-box" style="margin-top:10px;">
            {{ meal.summary || meal.nutrients?.summary }}
          </div>
          <div style="display:flex; justify-content:flex-end; margin-top:8px;">
            <Button icon="pi pi-trash" severity="danger" text @click="deleteMeal(meal.id)" />
          </div>
        </div>
      </section>
    </div>

    <nav class="bottom-nav">
      <button
        v-for="item in menuItems"
        :key="item.key"
        class="bottom-item"
        :class="{ active: activeSection === item.key }"
        @click="activeSection = item.key"
      >
        <i :class="item.icon"></i>
        <span>{{ item.label }}</span>
      </button>
    </nav>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';

// 中文化文字常數
const UI_TEXT = {
  // 品牌
  brandName: '追夢系統',
  
  // 導航選單
  menu: {
    summary: 'AI 總覽中心',
    pomodoro: '番茄鐘',
    todo: '日期待辦清單',
    diary: '冒險日記',
    meal: 'AI 飲食分析'
  },
  
  // 登入頁面
  auth: {
    title: '追夢系統登入',
    username: '帳號',
    password: '密碼',
    login: '登入',
    register: '註冊新帳號',
    logout: '登出',
    loginFailed: '登入失敗',
    registerSuccess: '註冊成功，請登入',
    registerFailed: '註冊失敗'
  },
  
  // AI 總覽中心
  summary: {
    mainGoal: '主要目標',
    progress: '進度',
    taskCompletion: '任務完成率',
    logProgress: '記錄進度',
    dailyMotivation: '每日激勵',
    aiCoach: 'AI 教練',
    quickActions: '快速操作',
    recentWins: '最近成就',
    viewAll: '查看全部',
    tasks: '任務',
    journal: '日記',
    focus: '專注',
    meal: '飲食',
    items: '項任務',
    write: '撰寫',
    analyze: '分析',
    noRecords: '尚無紀錄',
    analyzing: 'AI 正在分析中...'
  },
  
  // 番茄鐘
  pomodoro: {
    title: '專注計時',
    start: '開始',
    pause: '暫停',
    reset: '重置',
    completed: '專注完成！'
  },
  
  // 待辦清單
  todo: {
    inputPlaceholder: '輸入任務',
    add: '新增',
    filterPlaceholder: '選擇日期篩選',
    clearFilter: '清除篩選',
    noTasks: '目前沒有待辦事項'
  },
  
  // 冒險日記
  diary: {
    inputPlaceholder: '寫下今日的冒險故事...',
    submit: '送出日記',
    aiReply: 'AI 回覆',
    noEntries: '尚無日記紀錄'
  },
  
  // 飲食分析
  meal: {
    upload: '上傳餐點照片',
    description: 'AI 將分析熱量與營養成分',
    calories: '熱量',
    protein: '蛋白質',
    fat: '脂肪',
    carbs: '碳水化合物',
    kcal: '大卡',
    gram: '克',
    noRecords: '尚無飲食紀錄'
  },
  
  // 通用
  common: {
    loading: '載入中...',
    confirmDelete: '確定要刪除嗎？',
    confirmDeleteHeader: '刪除確認',
    confirm: '確定',
    cancel: '取消',
    refresh: '重新整理'
  }
};

// 根據時間返回中文問候語
function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return '早安';
  if (hour >= 12 && hour < 18) return '午安';
  return '晚安';
}

// 格式化日期為中文格式
function formatDateChinese(date) {
  const d = new Date(date);
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const weekday = weekdays[d.getDay()];
  return `${year}年${month}月${day}日 星期${weekday}`;
}

// 格式化日期為簡短中文格式（用於列表）
function formatDateShort(date) {
  const d = new Date(date);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

const authed = ref(false);
const userName = ref('');
const username = ref('');
const password = ref('');
const toast = useToast();
const confirm = useConfirm();

// 載入狀態
const isLoading = ref(false);
const isAnalyzing = ref(false);

const menuItems = [
  { key: 'summary', label: UI_TEXT.menu.summary, icon: 'pi pi-chart-line' },
  { key: 'pomodoro', label: UI_TEXT.menu.pomodoro, icon: 'pi pi-clock' },
  { key: 'todo', label: UI_TEXT.menu.todo, icon: 'pi pi-check-square' },
  { key: 'diary', label: UI_TEXT.menu.diary, icon: 'pi pi-book' },
  { key: 'meal', label: UI_TEXT.menu.meal, icon: 'pi pi-image' }
];

const activeSection = ref('summary');

const summaryText = ref('');
const summaryStats = ref({
  focusMinutes: 0,
  todoRate: 0,
  completedTodos: 0,
  totalTodos: 0,
  todayCalories: 0,
  diaryCount: 0
});

const focusDisplay = computed(() => {
  const baseSeconds = Math.max(0, Number(summaryStats.value.focusMinutes || 0)) * 60;
  const totalSeconds = baseSeconds + Math.max(0, liveFocusSeconds.value);
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
});

const todos = ref([]);
const newTask = ref('');
const newTaskDate = ref(new Date());
const selectedDate = ref(null);

const diaryContent = ref('');
const diaryEntries = ref([]);

const meals = ref([]);
const mealInput = ref(null);

const timerSeconds = ref(25 * 60);
const liveFocusSeconds = ref(0);
let timerHandle = null;

const timerDisplay = computed(() => {
  const m = String(Math.floor(timerSeconds.value / 60)).padStart(2, '0');
  const s = String(timerSeconds.value % 60).padStart(2, '0');
  return `${m}:${s}`;
});

const groupedTodos = computed(() => {
  const list = [...todos.value];
  let filtered = list;
  if (selectedDate.value) {
    const selected = formatDate(selectedDate.value);
    filtered = list.filter((item) => item.date === selected);
  }
  const groups = {};
  filtered.forEach((item) => {
    if (!groups[item.date]) groups[item.date] = [];
    groups[item.date].push(item);
  });
  return Object.keys(groups)
    .sort()
    .map((date) => ({ date, items: groups[date] }));
});

const recentWins = computed(() => {
  const items = [];
  todos.value
    .filter((item) => item.completed)
    .slice(0, 3)
    .forEach((item) => {
      items.push({
        id: `todo-${item.id}`,
        title: item.task,
        subtitle: '完成任務',
        time: item.date,
        icon: 'pi pi-check-circle'
      });
    });
  diaryEntries.value.slice(0, 2).forEach((entry) => {
    items.push({
      id: `diary-${entry.id}`,
      title: '完成日記',
      subtitle: entry.content.slice(0, 18) + (entry.content.length > 18 ? '...' : ''),
      time: entry.date,
      icon: 'pi pi-book'
    });
  });
  meals.value.slice(0, 2).forEach((meal) => {
    items.push({
      id: `meal-${meal.id}`,
      title: `${meal.nutrients.calories} ${UI_TEXT.meal.kcal}`,
      subtitle: '飲食分析完成',
      time: meal.date,
      icon: 'pi pi-image'
    });
  });
  return items.slice(0, 4);
});

function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// API helper with RESTful conventions
async function api(path, options = {}) {
  const res = await fetch(path, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  if (res.status === 401) {
    authed.value = false;
    throw new Error('unauthorized');
  }
  return res;
}

async function checkAuth() {
  try {
    const res = await api('/api/auth/me');
    const data = await res.json();
    authed.value = data?.authenticated === true;
    userName.value = data?.user?.username || '';
  } catch {
    authed.value = false;
  }
}

async function login() {
  try {
    const res = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: username.value, password: password.value })
    });
    const data = await res.json();
    if (res.ok) {
      authed.value = true;
      userName.value = data.user?.username || username.value;
      toast.add({ severity: 'success', summary: '登入成功', detail: `歡迎回來，${userName.value}！`, life: 3000 });
      await refreshAll();
    } else {
      toast.add({ severity: 'error', summary: '登入失敗', detail: data.error || '請檢查帳號密碼', life: 4000 });
    }
  } catch {
    toast.add({ severity: 'error', summary: '登入失敗', detail: '網路連線錯誤，請稍後再試', life: 4000 });
  }
}

async function register() {
  try {
    const res = await api('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username: username.value, password: password.value })
    });
    const data = await res.json();
    if (res.ok) {
      toast.add({ severity: 'success', summary: '註冊成功', detail: '請使用新帳號登入', life: 4000 });
    } else {
      toast.add({ severity: 'error', summary: '註冊失敗', detail: data.error || '帳號可能已存在', life: 4000 });
    }
  } catch {
    toast.add({ severity: 'error', summary: '註冊失敗', detail: '網路連線錯誤，請稍後再試', life: 4000 });
  }
}

async function logout() {
  await api('/api/auth/logout', { method: 'POST' });
  authed.value = false;
}

async function refreshSummary() {
  isAnalyzing.value = true;
  try {
    const res = await api('/api/summary');
    const data = await res.json();
    summaryText.value = data.summary || '';
    summaryStats.value = data.stats || summaryStats.value;
  } finally {
    isAnalyzing.value = false;
  }
}

async function loadTodos() {
  isLoading.value = true;
  try {
    const res = await api('/api/todos');
    todos.value = await res.json();
  } finally {
    isLoading.value = false;
  }
}

async function addTodo() {
  if (!newTask.value) return;
  const date = formatDate(newTaskDate.value);
  await api('/api/todos', {
    method: 'POST',
    body: JSON.stringify({ task: newTask.value, date })
  });
  newTask.value = '';
  await loadTodos();
  await refreshSummary();
}

async function toggleTodo(todo, event) {
  await api(`/api/todos/${todo.id}`, {
    method: 'PATCH',
    body: JSON.stringify({ completed: event.target.checked })
  });
  await loadTodos();
  await refreshSummary();
}

function deleteTodo(id) {
  confirm.require({
    message: UI_TEXT.common.confirmDelete,
    header: UI_TEXT.common.confirmDeleteHeader,
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: UI_TEXT.common.confirm,
    rejectLabel: UI_TEXT.common.cancel,
    accept: async () => {
      await api(`/api/todos/${id}`, { method: 'DELETE' });
      await loadTodos();
      await refreshSummary();
    }
  });
}

async function loadDiary() {
  isLoading.value = true;
  try {
    const res = await api('/api/diaries');
    diaryEntries.value = await res.json();
  } finally {
    isLoading.value = false;
  }
}

async function saveDiary() {
  if (!diaryContent.value) return;
  isAnalyzing.value = true;
  try {
    await api('/api/diaries', {
      method: 'POST',
      body: JSON.stringify({ content: diaryContent.value })
    });
    diaryContent.value = '';
    await loadDiary();
    await refreshSummary();
  } finally {
    isAnalyzing.value = false;
  }
}

function deleteDiary(id) {
  confirm.require({
    message: UI_TEXT.common.confirmDelete,
    header: UI_TEXT.common.confirmDeleteHeader,
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: UI_TEXT.common.confirm,
    rejectLabel: UI_TEXT.common.cancel,
    accept: async () => {
      await api(`/api/diaries/${id}`, { method: 'DELETE' });
      await loadDiary();
      await refreshSummary();
    }
  });
}

function triggerMealUpload() {
  mealInput.value?.click();
}

async function uploadMeal(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  isAnalyzing.value = true;
  const reader = new FileReader();
  reader.onload = async () => {
    try {
      await api('/api/meals', {
        method: 'POST',
        body: JSON.stringify({ image: reader.result })
      });
      await loadMeals();
      await refreshSummary();
      event.target.value = '';
    } finally {
      isAnalyzing.value = false;
    }
  };
  reader.readAsDataURL(file);
}

async function loadMeals() {
  isLoading.value = true;
  try {
    const res = await api('/api/meals');
    meals.value = await res.json();
  } finally {
    isLoading.value = false;
  }
}

function deleteMeal(id) {
  confirm.require({
    message: UI_TEXT.common.confirmDelete,
    header: UI_TEXT.common.confirmDeleteHeader,
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: UI_TEXT.common.confirm,
    rejectLabel: UI_TEXT.common.cancel,
    accept: async () => {
      await api(`/api/meals/${id}`, { method: 'DELETE' });
      await loadMeals();
      await refreshSummary();
    }
  });
}

function startTimer() {
  if (timerHandle) return;
  timerHandle = setInterval(async () => {
    if (timerSeconds.value > 0) {
      timerSeconds.value -= 1;
      liveFocusSeconds.value += 1;
    } else {
      clearInterval(timerHandle);
      timerHandle = null;
      await api('/api/focus', {
        method: 'POST',
        body: JSON.stringify({ minutes: 25 })
      });
      liveFocusSeconds.value = 0;
      toast.add({ severity: 'success', summary: UI_TEXT.pomodoro.completed, detail: '休息一下吧！', life: 5000 });
      resetTimer();
      await refreshSummary();
    }
  }, 1000);
}

function pauseTimer() {
  if (timerHandle) {
    clearInterval(timerHandle);
    timerHandle = null;
  }
}

function resetTimer() {
  pauseTimer();
  timerSeconds.value = 25 * 60;
  liveFocusSeconds.value = 0;
}

async function refreshAll() {
  if (!authed.value) return;
  await Promise.all([refreshSummary(), loadTodos(), loadDiary(), loadMeals()]);
}

onMounted(async () => {
  await checkAuth();
  if (authed.value) {
    await refreshAll();
  }
});
</script>

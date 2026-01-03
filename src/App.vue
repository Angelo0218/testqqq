<template>
  <div v-if="!authed" class="auth-container">
    <Card class="auth-card">
      <template #title>追夢系統登入</template>
      <template #content>
        <div class="p-fluid" style="display:grid; gap:12px;">
          <InputText v-model="username" placeholder="帳號" />
          <Password v-model="password" placeholder="密碼" toggleMask :feedback="false" />
          <Button label="登入" icon="pi pi-sign-in" @click="login" />
          <Button label="註冊" severity="secondary" icon="pi pi-user-plus" @click="register" />
          <div v-if="authError" class="muted" style="font-size:12px;">{{ authError }}</div>
        </div>
      </template>
    </Card>
  </div>

  <div v-else class="app-shell">
    <aside class="sidebar">
      <div class="brand">
        <span class="status-dot"></span>
        追夢系統
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
        <Button label="登出" severity="danger" icon="pi pi-sign-out" @click="logout" />
      </div>
    </aside>

    <div class="main">
      <header class="header">
        <div>
          <div class="greeting">Good Morning,</div>
          <div class="username">{{ userName || 'Explorer' }}</div>
        </div>
        <div class="header-actions">
          <span class="header-date">{{ today }}</span>
          <Button class="icon-button" icon="pi pi-bell" @click="refreshAll" />
        </div>
      </header>

      <section v-if="activeSection === 'summary'">
        <div class="hero-card">
          <div class="hero-tag">Main Goal</div>
          <div class="hero-title">Financial Freedom 2024</div>
          <div class="hero-sub">Next: 完成下一個任務</div>
          <div class="hero-metric">
            <span class="hero-percent">{{ summaryStats.todoRate }}%</span>
            <span class="hero-label">進度</span>
          </div>
          <Button class="hero-action" label="Log Progress" icon="pi pi-plus" @click="refreshSummary" />
        </div>

        <div class="section-head">
          <i class="pi pi-bolt"></i>
          <span>Daily Motivation</span>
        </div>
        <div class="panel ai-panel">
          <div class="ai-quote">{{ summaryText || '正在彙整所有資料並分析...' }}</div>
          <div class="ai-author">AI COACH</div>
        </div>

        <div class="section-head">
          <span>Quick Actions</span>
        </div>
        <div class="action-grid">
          <button class="action-card" @click="activeSection = 'todo'">
            <i class="pi pi-check-circle"></i>
            <div>Tasks</div>
            <small>{{ summaryStats.totalTodos }} items</small>
          </button>
          <button class="action-card" @click="activeSection = 'diary'">
            <i class="pi pi-book"></i>
            <div>Journal</div>
            <small>Write</small>
          </button>
          <button class="action-card" @click="activeSection = 'pomodoro'">
            <i class="pi pi-clock"></i>
            <div>Focus</div>
            <small>{{ focusDisplay }}</small>
          </button>
          <button class="action-card" @click="activeSection = 'meal'">
            <i class="pi pi-image"></i>
            <div>Meal</div>
            <small>Analyze</small>
          </button>
        </div>

        <div class="section-head row-between">
          <span>Recent Wins</span>
          <button class="link-button" @click="activeSection = 'diary'">View All</button>
        </div>
        <div v-if="recentWins.length === 0" class="muted">尚無紀錄</div>
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
          <div class="section-title">番茄鐘</div>
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
            <Button label="開始" icon="pi pi-play" @click="startTimer" />
            <Button label="暫停" icon="pi pi-pause" severity="secondary" @click="pauseTimer" />
            <Button label="重置" icon="pi pi-refresh" severity="help" @click="resetTimer" />
          </div>
        </div>
      </section>

      <section v-else-if="activeSection === 'todo'">
        <div class="panel" style="display:grid; gap:12px; margin-bottom:18px;">
          <div class="todo-inputs">
            <InputText v-model="newTask" placeholder="輸入任務" />
            <Calendar v-model="newTaskDate" dateFormat="yy-mm-dd" showIcon />
            <Button label="新增" icon="pi pi-plus" @click="addTodo" />
          </div>
          <div class="todo-filter">
            <Calendar v-model="selectedDate" dateFormat="yy-mm-dd" showIcon placeholder="選擇日期篩選" />
            <Button label="清除日期" severity="secondary" @click="selectedDate = null" />
          </div>
        </div>

        <div v-if="groupedTodos.length === 0" class="muted">目前沒有待辦</div>
        <div v-for="group in groupedTodos" :key="group.date">
          <div class="todo-date">{{ group.date }}</div>
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
          <Textarea v-model="diaryContent" rows="4" placeholder="寫下今日冒險內容" style="width:100%;" />
          <div style="display:flex; justify-content:flex-end; margin-top:10px;">
            <Button label="送出日記" icon="pi pi-send" @click="saveDiary" />
          </div>
        </div>

        <div v-for="entry in diaryEntries" :key="entry.id" class="diary-item">
          <div class="muted" style="font-size:12px;">{{ entry.date }}</div>
          <div style="margin:8px 0;">{{ entry.content }}</div>
          <div class="ai-box">{{ entry.aiResponse }}</div>
          <div style="display:flex; justify-content:flex-end; margin-top:8px;">
            <Button icon="pi pi-trash" severity="danger" text @click="deleteDiary(entry.id)" />
          </div>
        </div>
      </section>

      <section v-else-if="activeSection === 'meal'">
        <div class="panel" style="margin-bottom:18px;">
          <div class="meal-upload">
            <input ref="mealInput" type="file" accept="image/*" style="display:none" @change="uploadMeal" />
            <Button label="上傳餐點照片" icon="pi pi-camera" @click="triggerMealUpload" />
            <span class="muted">AI 會分析熱量與營養素</span>
          </div>
        </div>

        <div v-for="meal in meals" :key="meal.id" class="meal-item">
          <div class="muted" style="font-size:12px;">{{ meal.date }}</div>
          <div class="stat" style="font-size:28px;">{{ meal.nutrients.calories }} kcal</div>
          <div class="muted">P {{ meal.nutrients.protein }}g · F {{ meal.nutrients.fat }}g · C {{ meal.nutrients.carb }}g</div>
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

const authed = ref(false);
const userName = ref('');
const authError = ref('');
const username = ref('');
const password = ref('');
const today = new Date().toLocaleDateString('zh-TW');

const menuItems = [
  { key: 'summary', label: 'AI 總覽中心', icon: 'pi pi-chart-line' },
  { key: 'pomodoro', label: '番茄鐘', icon: 'pi pi-clock' },
  { key: 'todo', label: '日期待辦清單', icon: 'pi pi-check-square' },
  { key: 'diary', label: '冒險日記', icon: 'pi pi-book' },
  { key: 'meal', label: 'AI 飲食分析', icon: 'pi pi-image' }
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
      title: `${meal.nutrients.calories} kcal`,
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
    const res = await api('/api/me');
    const data = await res.json();
    authed.value = data?.authenticated === true;
    userName.value = data?.user || '';
  } catch {
    authed.value = false;
  }
}

async function login() {
  authError.value = '';
  try {
    const res = await api('/api/login', {
      method: 'POST',
      body: JSON.stringify({ username: username.value, password: password.value })
    });
    const data = await res.json();
    if (data.success) {
      authed.value = true;
      await refreshAll();
    } else {
      authError.value = data.message || '登入失敗';
    }
  } catch {
    authError.value = '登入失敗';
  }
}

async function register() {
  authError.value = '';
  try {
    const res = await api('/api/register', {
      method: 'POST',
      body: JSON.stringify({ username: username.value, password: password.value })
    });
    const data = await res.json();
    authError.value = data.message || '註冊完成';
  } catch {
    authError.value = '註冊失敗';
  }
}

async function logout() {
  await api('/api/logout', { method: 'POST' });
  authed.value = false;
}

async function refreshSummary() {
  const res = await api('/api/summary');
  const data = await res.json();
  summaryText.value = data.summary || '';
  summaryStats.value = data.stats || summaryStats.value;
}

async function loadTodos() {
  const res = await api('/api/todo');
  todos.value = await res.json();
}

async function addTodo() {
  if (!newTask.value) return;
  const date = formatDate(newTaskDate.value);
  await api('/api/todo', {
    method: 'POST',
    body: JSON.stringify({ task: newTask.value, date })
  });
  newTask.value = '';
  await loadTodos();
  await refreshSummary();
}

async function toggleTodo(todo, event) {
  await api('/api/todo/toggle', {
    method: 'POST',
    body: JSON.stringify({ id: todo.id, completed: event.target.checked })
  });
  await loadTodos();
  await refreshSummary();
}

async function deleteTodo(id) {
  await api('/api/todo/delete', {
    method: 'POST',
    body: JSON.stringify({ id })
  });
  await loadTodos();
  await refreshSummary();
}

async function loadDiary() {
  const res = await api('/api/diary');
  diaryEntries.value = await res.json();
}

async function saveDiary() {
  if (!diaryContent.value) return;
  await api('/api/diary', {
    method: 'POST',
    body: JSON.stringify({ content: diaryContent.value })
  });
  diaryContent.value = '';
  await loadDiary();
  await refreshSummary();
}

async function deleteDiary(id) {
  await api('/api/diary/delete', {
    method: 'POST',
    body: JSON.stringify({ id })
  });
  await loadDiary();
  await refreshSummary();
}

function triggerMealUpload() {
  mealInput.value?.click();
}

async function uploadMeal(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async () => {
    await api('/api/meal', {
      method: 'POST',
      body: JSON.stringify({ image: reader.result })
    });
    await loadMeals();
    await refreshSummary();
    event.target.value = '';
  };
  reader.readAsDataURL(file);
}

async function loadMeals() {
  const res = await api('/api/meal');
  meals.value = await res.json();
}

async function deleteMeal(id) {
  await api('/api/meal/delete', {
    method: 'POST',
    body: JSON.stringify({ id })
  });
  await loadMeals();
  await refreshSummary();
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

<template>
  <q-layout view="lHh Lpr lFf" class="bg-dark">
    <!-- 登入頁面 - Apple Fitness 風格 -->
    <div v-if="!authed" class="auth-container">
      <!-- 背景裝飾環 -->
      <div class="auth-bg-rings">
        <div class="auth-ring auth-ring-1"></div>
        <div class="auth-ring auth-ring-2"></div>
        <div class="auth-ring auth-ring-3"></div>
      </div>
      
      <!-- Logo 區域 -->
      <div class="auth-logo">
        <div class="auth-logo-icon">
          <q-icon name="fitness_center" size="48px" color="white" />
        </div>
        <div class="auth-title">追夢系統</div>
        <div class="auth-subtitle">開始追蹤你的夢想之旅</div>
      </div>
      
      <!-- 登入卡片 -->
      <q-card class="auth-card" dark flat>
        <q-card-section class="q-pt-lg">
          <q-form @submit.prevent="login">
            <!-- 帳號輸入 -->
            <q-input
              v-model="username"
              dark
              filled
              label="帳號"
              :class="{ 'input-focused': usernameFocused }"
              @focus="usernameFocused = true"
              @blur="usernameFocused = false"
            >
              <template v-slot:prepend>
                <q-icon name="person" color="grey-6" />
              </template>
            </q-input>
            
            <!-- 密碼輸入 -->
            <q-input
              v-model="password"
              dark
              filled
              label="密碼"
              :type="showPassword ? 'text' : 'password'"
              :class="{ 'input-focused': passwordFocused }"
              @focus="passwordFocused = true"
              @blur="passwordFocused = false"
              @keyup.enter="login"
            >
              <template v-slot:prepend>
                <q-icon name="lock" color="grey-6" />
              </template>
              <template v-slot:append>
                <q-icon
                  :name="showPassword ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  color="grey-6"
                  @click="showPassword = !showPassword"
                />
              </template>
            </q-input>
            
            <!-- 登入按鈕 -->
            <q-btn
              type="submit"
              color="primary"
              class="auth-btn auth-btn-primary"
              unelevated
              :loading="isLoggingIn"
              icon="login"
              label="登入"
            />
            
            <!-- 分隔線 -->
            <div class="auth-divider">
              <span>或</span>
            </div>
            
            <!-- 註冊按鈕 -->
            <q-btn
              color="primary"
              class="auth-btn auth-btn-secondary"
              outline
              @click="register"
              :loading="isRegistering"
              icon="person_add"
              label="註冊新帳號"
            />
          </q-form>
        </q-card-section>
      </q-card>
      
      <!-- 底部裝飾 -->
      <div class="auth-footer">
        <q-icon name="auto_awesome" size="16px" color="grey-7" />
        <span>Dream Tracker</span>
      </div>
    </div>

    <!-- 主應用程式 -->
    <template v-else>
      <!-- 側邊欄 (桌面版) - iOS 風格 -->
      <q-drawer
        v-model="leftDrawerOpen"
        show-if-above
        bordered
        class="nav-drawer"
        :width="260"
        :breakpoint="1100"
      >
        <div class="drawer-content">
          <!-- 品牌標題 -->
          <div class="nav-brand">
            <div class="nav-brand-icon">
              <q-icon name="fitness_center" size="24px" color="white" />
            </div>
            <span class="nav-brand-text">{{ UI_TEXT.brandName }}</span>
          </div>
          
          <!-- 導航選單 -->
          <q-list class="nav-list" dark>
            <q-item
              v-for="item in menuItems"
              :key="item.key"
              clickable
              v-ripple
              :active="activeSection === item.key"
              :class="['nav-item', { 'nav-item-active': activeSection === item.key }]"
              @click="navigateTo(item.key)"
            >
              <q-item-section avatar>
                <div :class="['nav-icon-wrapper', { 'nav-icon-active': activeSection === item.key }]">
                  <q-icon :name="item.icon" :color="activeSection === item.key ? 'white' : 'grey-5'" />
                </div>
              </q-item-section>
              <q-item-section :class="{ 'text-white': activeSection === item.key, 'text-grey-5': activeSection !== item.key }">
                {{ item.label }}
              </q-item-section>
              <q-item-section side v-if="activeSection === item.key">
                <div class="nav-indicator"></div>
              </q-item-section>
            </q-item>
          </q-list>
          
          <q-space />
          
          <!-- 用戶資訊與登出 -->
          <div class="nav-footer">
            <div class="nav-user">
              <q-avatar size="36px" color="primary" text-color="white">
                <q-icon name="person" />
              </q-avatar>
              <div class="nav-user-info">
                <div class="nav-user-name">{{ userName || '探險家' }}</div>
                <div class="nav-user-status">
                  <span class="status-dot-small"></span>
                  線上
                </div>
              </div>
            </div>
            <q-btn
              flat
              round
              icon="logout"
              color="grey-6"
              @click="logout"
              class="nav-logout-btn"
            >
              <q-tooltip>{{ UI_TEXT.auth.logout }}</q-tooltip>
            </q-btn>
          </div>
        </div>
      </q-drawer>

      <!-- 主內容區 -->
      <q-page-container>
        <!-- 手機版登出按鈕 - 固定右上角 -->
        <q-btn
          flat
          round
          icon="logout"
          class="mobile-logout-btn mobile-only"
          @click="logout"
        >
          <q-tooltip>{{ UI_TEXT.auth.logout }}</q-tooltip>
        </q-btn>
        
        <q-page class="q-pa-md">
          <!-- 頁首 -->
          <header class="header q-mb-lg">
            <div>
              <div class="greeting">{{ getGreeting() }}，{{ userName || '探險家' }}</div>
              <div class="header-date">{{ formatDateChinese(new Date()) }}</div>
            </div>
          </header>

          <!-- 總覽頁面 - Apple Fitness 風格 -->
          <section v-if="activeSection === 'summary'" class="summary-section">
            <!-- 活動環中心區域 -->
            <div class="activity-rings-container q-mb-lg">
              <div class="rings-wrapper">
                <!-- 三層活動環 -->
                <ActivityRing
                  :progress="focusProgress"
                  :color="{ start: '#FF2D55', end: '#FF9500' }"
                  :size="ringSize"
                  :stroke-width="ringStrokeWidth"
                  class="ring-outer"
                />
                <ActivityRing
                  :progress="taskProgress"
                  :color="{ start: '#30D158', end: '#64D2FF' }"
                  :size="ringSize - ringGap"
                  :stroke-width="ringStrokeWidth"
                  class="ring-middle"
                />
                <ActivityRing
                  :progress="diaryProgress"
                  :color="{ start: '#0A84FF', end: '#BF5AF2' }"
                  :size="ringSize - ringGap * 2"
                  :stroke-width="ringStrokeWidth"
                  class="ring-inner"
                />
                <!-- 中心數據 -->
                <div class="rings-center">
                  <div class="rings-center-value">{{ summaryStats.todoRate }}%</div>
                  <div class="rings-center-label">今日進度</div>
                </div>
              </div>
              
              <!-- 活動環圖例 -->
              <div class="rings-legend">
                <div class="legend-item">
                  <span class="legend-dot legend-dot-focus"></span>
                  <span class="legend-label">專注時間</span>
                  <span class="legend-value">{{ formatFocusMinutes(summaryStats.focusMinutes) }}</span>
                </div>
                <div class="legend-item">
                  <span class="legend-dot legend-dot-task"></span>
                  <span class="legend-label">任務完成</span>
                  <span class="legend-value">{{ summaryStats.completedTodos }}/{{ summaryStats.totalTodos }}</span>
                </div>
                <div class="legend-item">
                  <span class="legend-dot legend-dot-diary"></span>
                  <span class="legend-label">日記天數</span>
                  <span class="legend-value">{{ summaryStats.diaryCount }} 天</span>
                </div>
              </div>
            </div>

            <!-- 數據摘要區塊 -->
            <div class="stats-summary q-mb-lg">
              <q-card dark class="stat-card">
                <q-card-section class="stat-card-content">
                  <q-icon name="timer" size="24px" color="primary" />
                  <div class="stat-info">
                    <div class="stat-value">{{ focusDisplay }}</div>
                    <div class="stat-label">專注時間</div>
                  </div>
                </q-card-section>
              </q-card>
              <q-card dark class="stat-card">
                <q-card-section class="stat-card-content">
                  <q-icon name="check_circle" size="24px" color="secondary" />
                  <div class="stat-info">
                    <div class="stat-value">{{ summaryStats.todoRate }}%</div>
                    <div class="stat-label">任務完成率</div>
                  </div>
                </q-card-section>
              </q-card>
              <q-card dark class="stat-card">
                <q-card-section class="stat-card-content">
                  <q-icon name="local_fire_department" size="24px" color="warning" />
                  <div class="stat-info">
                    <div class="stat-value">{{ summaryStats.todayCalories || 0 }}</div>
                    <div class="stat-label">今日熱量</div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- AI 每日激勵 -->
            <div class="section-head row-between">
              <div class="section-head-left">
                <q-icon name="bolt" />
                <span>{{ UI_TEXT.summary.dailyMotivation }}</span>
              </div>
              <q-btn
                flat
                dense
                round
                icon="refresh"
                color="grey-6"
                size="sm"
                :loading="isAnalyzing"
                @click="refreshSummary(true)"
              >
                <q-tooltip>重新生成</q-tooltip>
              </q-btn>
            </div>
            <q-card dark class="ai-panel q-mb-md">
              <q-card-section>
                <div class="ai-quote">{{ summaryText || UI_TEXT.summary.analyzing }}</div>
                <div class="ai-author">{{ UI_TEXT.summary.aiCoach }}</div>
              </q-card-section>
            </q-card>

            <!-- 快速操作區塊 - Apple Fitness 風格 -->
            <div class="section-head">
              <span>{{ UI_TEXT.summary.quickActions }}</span>
            </div>
            <div class="action-grid q-mb-lg">
              <q-card dark clickable v-ripple class="action-card action-card-tasks" @click="activeSection = 'todo'">
                <q-card-section class="action-card-content">
                  <div class="action-icon-wrapper action-icon-tasks">
                    <q-icon name="check_circle" size="28px" />
                  </div>
                  <div class="action-text">
                    <div class="action-title">{{ UI_TEXT.summary.tasks }}</div>
                    <div class="action-subtitle">{{ summaryStats.totalTodos }} {{ UI_TEXT.summary.items }}</div>
                  </div>
                </q-card-section>
              </q-card>
              <q-card dark clickable v-ripple class="action-card action-card-diary" @click="activeSection = 'diary'">
                <q-card-section class="action-card-content">
                  <div class="action-icon-wrapper action-icon-diary">
                    <q-icon name="book" size="28px" />
                  </div>
                  <div class="action-text">
                    <div class="action-title">{{ UI_TEXT.summary.journal }}</div>
                    <div class="action-subtitle">{{ UI_TEXT.summary.write }}</div>
                  </div>
                </q-card-section>
              </q-card>
              <q-card dark clickable v-ripple class="action-card action-card-focus" @click="activeSection = 'pomodoro'">
                <q-card-section class="action-card-content">
                  <div class="action-icon-wrapper action-icon-focus">
                    <q-icon name="timer" size="28px" />
                  </div>
                  <div class="action-text">
                    <div class="action-title">{{ UI_TEXT.summary.focus }}</div>
                    <div class="action-subtitle">{{ focusDisplay }}</div>
                  </div>
                </q-card-section>
              </q-card>
              <q-card dark clickable v-ripple class="action-card action-card-meal" @click="activeSection = 'meal'">
                <q-card-section class="action-card-content">
                  <div class="action-icon-wrapper action-icon-meal">
                    <q-icon name="restaurant" size="28px" />
                  </div>
                  <div class="action-text">
                    <div class="action-title">{{ UI_TEXT.summary.meal }}</div>
                    <div class="action-subtitle">{{ UI_TEXT.summary.analyze }}</div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- 最近成就區塊 - Apple Fitness 風格 -->
            <div class="section-head row-between">
              <span>{{ UI_TEXT.summary.recentWins }}</span>
              <q-btn flat dense color="primary" :label="UI_TEXT.summary.viewAll" @click="activeSection = 'diary'" />
            </div>
            <div v-if="recentWins.length === 0" class="empty-state">
              <q-icon name="emoji_events" size="48px" color="grey-7" />
              <div class="empty-state-text">{{ UI_TEXT.summary.noRecords }}</div>
            </div>
            <q-list dark class="recent-wins-list" v-else>
              <q-item v-for="win in recentWins" :key="win.id" class="recent-win-item">
                <q-item-section avatar>
                  <div :class="['win-icon-wrapper', `win-icon-${getWinType(win.icon)}`]">
                    <q-icon :name="win.icon" size="20px" />
                  </div>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="win-title">{{ win.title }}</q-item-label>
                  <q-item-label caption class="win-subtitle">{{ win.subtitle }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label class="win-time">{{ formatDateShort(win.time) }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </section>

          <!-- 番茄鐘頁面 - Apple Fitness 風格 -->
          <section v-else-if="activeSection === 'pomodoro'" class="pomodoro-section">
            <q-card dark flat class="pomodoro-panel">
              <q-card-section class="pomodoro-content">
                <div class="pomodoro-header">
                  <div class="pomodoro-title">{{ UI_TEXT.pomodoro.title }}</div>
                  <div class="pomodoro-subtitle">{{ isTimerRunning ? '專注中' : (isBreakTime ? '休息時間' : '準備開始') }}</div>
                </div>
                
                <!-- TomatoTimer 元件 -->
                <div class="pomodoro-timer-wrapper">
                  <TomatoTimer
                    :duration="totalDuration"
                    :remaining="timerSeconds"
                    :is-running="isTimerRunning"
                    :is-break="isBreakTime"
                    @complete="onTimerComplete"
                  />
                </div>
                
                <!-- 控制按鈕 - 使用 QBtn -->
                <div class="pomodoro-controls">
                  <q-btn
                    v-if="!isTimerRunning"
                    unelevated
                    color="primary"
                    class="pomodoro-btn pomodoro-btn-start"
                    icon="play_arrow"
                    :label="UI_TEXT.pomodoro.start"
                    @click="startTimer"
                  />
                  <q-btn
                    v-else
                    unelevated
                    color="grey-8"
                    class="pomodoro-btn pomodoro-btn-pause"
                    icon="pause"
                    :label="UI_TEXT.pomodoro.pause"
                    @click="pauseTimer"
                  />
                  <q-btn
                    outline
                    color="grey-6"
                    class="pomodoro-btn pomodoro-btn-reset"
                    icon="refresh"
                    :label="UI_TEXT.pomodoro.reset"
                    @click="resetTimer"
                  />
                </div>
                
                <!-- 今日專注統計 -->
                <div class="pomodoro-stats">
                  <div class="pomodoro-stat">
                    <q-icon name="timer" size="20px" color="primary" />
                    <div class="pomodoro-stat-info">
                      <span class="pomodoro-stat-value">{{ focusDisplay }}</span>
                      <span class="pomodoro-stat-label">今日專注</span>
                    </div>
                  </div>
                  <div class="pomodoro-stat">
                    <q-icon name="local_fire_department" size="20px" color="warning" />
                    <div class="pomodoro-stat-info">
                      <span class="pomodoro-stat-value">{{ completedPomodoros }}</span>
                      <span class="pomodoro-stat-label">完成番茄</span>
                    </div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </section>

          <!-- 待辦清單頁面 - Apple Fitness 風格 -->
          <section v-else-if="activeSection === 'todo'" class="todo-section">
            <!-- 新增任務區塊 -->
            <q-card dark flat class="todo-input-panel q-mb-lg">
              <q-card-section>
                <div class="todo-input-header">
                  <q-icon name="add_task" size="24px" color="secondary" />
                  <span class="todo-input-title">新增任務</span>
                </div>
                <div class="todo-input-form">
                  <q-input
                    v-model="newTask"
                    dark
                    filled
                    dense
                    :placeholder="UI_TEXT.todo.inputPlaceholder"
                    class="todo-task-input"
                    @keyup.enter="addTodo"
                  >
                    <template v-slot:prepend>
                      <q-icon name="edit" color="grey-6" />
                    </template>
                  </q-input>
                  <q-input
                    v-model="newTaskDate"
                    dark
                    filled
                    dense
                    type="date"
                    class="todo-date-input"
                  >
                    <template v-slot:prepend>
                      <q-icon name="event" color="grey-6" />
                    </template>
                  </q-input>
                  <q-select
                    v-model="newTaskPriority"
                    dark
                    filled
                    dense
                    :options="priorityOptions"
                    option-value="value"
                    option-label="label"
                    emit-value
                    map-options
                    class="todo-priority-input"
                  >
                    <template v-slot:prepend>
                      <q-icon name="flag" :color="getPriorityColor(newTaskPriority)" />
                    </template>
                  </q-select>
                  <q-btn
                    unelevated
                    color="secondary"
                    icon="add"
                    :label="UI_TEXT.todo.add"
                    class="todo-add-btn"
                    @click="addTodo"
                  />
                </div>
              </q-card-section>
            </q-card>

            <!-- 篩選區塊 -->
            <div class="todo-filter-bar q-mb-md">
              <q-input
                v-model="selectedDate"
                dark
                filled
                dense
                type="date"
                :placeholder="UI_TEXT.todo.filterPlaceholder"
                clearable
                class="todo-filter-input"
              >
                <template v-slot:prepend>
                  <q-icon name="filter_list" color="grey-6" />
                </template>
              </q-input>
              <q-btn
                flat
                color="grey-6"
                :label="UI_TEXT.todo.clearFilter"
                icon="clear_all"
                @click="selectedDate = null"
                class="todo-clear-btn"
              />
            </div>

            <!-- 任務列表 -->
            <div v-if="isLoading" class="todo-loading">
              <q-spinner-dots color="primary" size="40px" />
              <span>{{ UI_TEXT.common.loading }}</span>
            </div>
            <div v-else-if="groupedTodos.length === 0" class="todo-empty">
              <q-icon name="task_alt" size="64px" color="grey-7" />
              <div class="todo-empty-text">{{ UI_TEXT.todo.noTasks }}</div>
              <div class="todo-empty-hint">點擊上方新增你的第一個任務</div>
            </div>
            <div v-else class="todo-groups">
              <div v-for="group in groupedTodos" :key="group.date" class="todo-group">
                <div class="todo-group-header">
                  <q-icon name="event" size="16px" color="grey-6" />
                  <span class="todo-group-date">{{ formatDateShort(group.date) }}</span>
                  <span class="todo-group-count">{{ group.items.length }} 項任務</span>
                </div>
                <div class="todo-group-items">
                  <TaskCard
                    v-for="todo in group.items"
                    :key="todo.id"
                    :task="todo"
                    @toggle="handleTodoToggle"
                    @delete="handleTodoDelete"
                    @edit="handleTodoEdit"
                  />
                </div>
              </div>
            </div>
          </section>

          <!-- 日記頁面 - Apple Fitness 風格 -->
          <section v-else-if="activeSection === 'diary'" class="diary-section">
            <!-- 撰寫日記區塊 -->
            <q-card dark flat class="diary-input-panel q-mb-lg">
              <q-card-section>
                <div class="diary-input-header">
                  <q-icon name="edit_note" size="24px" color="accent" />
                  <span class="diary-input-title">撰寫今日日記</span>
                  <span class="diary-input-date">{{ formatDateChinese(new Date()) }}</span>
                </div>
                <q-input
                  v-model="diaryContent"
                  dark
                  filled
                  type="textarea"
                  rows="5"
                  :placeholder="UI_TEXT.diary.inputPlaceholder"
                  :disable="isAnalyzing"
                  class="diary-textarea"
                  autogrow
                />
                <div class="diary-input-footer">
                  <div class="diary-char-count">
                    <q-icon name="text_fields" size="14px" />
                    <span>{{ diaryContent.length }} 字</span>
                  </div>
                  <q-btn
                    unelevated
                    color="accent"
                    :label="isAnalyzing ? UI_TEXT.summary.analyzing : UI_TEXT.diary.submit"
                    icon="send"
                    :loading="isAnalyzing"
                    :disable="isAnalyzing || !diaryContent.trim()"
                    class="diary-submit-btn"
                    @click="saveDiary"
                  />
                </div>
              </q-card-section>
            </q-card>

            <!-- 撰寫頻率圖表 -->
            <q-card dark flat class="diary-chart-panel q-mb-lg">
              <q-card-section>
                <div class="diary-chart-header">
                  <div class="diary-chart-title">
                    <q-icon name="bar_chart" size="20px" color="accent" />
                    <span>撰寫頻率</span>
                  </div>
                  <q-btn-toggle
                    v-model="diaryChartPeriod"
                    toggle-color="accent"
                    :options="[
                      { label: '7 天', value: 'week' },
                      { label: '30 天', value: 'month' }
                    ]"
                    unelevated
                    dense
                    class="diary-chart-toggle"
                    @update:model-value="loadDiaryChartData"
                  />
                </div>
                <div class="diary-chart-summary">
                  <span class="diary-chart-count">{{ diaryChartSummary.count }}</span>
                  <span class="diary-chart-unit">篇日記</span>
                  <span v-if="diaryChartSummary.streak > 0" class="diary-chart-streak">
                    <q-icon name="local_fire_department" size="14px" />
                    連續 {{ diaryChartSummary.streak }} 天
                  </span>
                </div>
                <BarChart
                  :data="diaryFrequencyChartData"
                  color="#0A84FF"
                  :height="120"
                  label="日記"
                />
              </q-card-section>
            </q-card>

            <!-- 日記列表 -->
            <div class="diary-list-header q-mb-md">
              <q-icon name="history" size="20px" color="grey-6" />
              <span class="diary-list-title">歷史日記</span>
              <span class="diary-list-count">{{ diaryEntries.length }} 篇</span>
            </div>

            <div v-if="isLoading" class="diary-loading">
              <q-spinner-dots color="accent" size="40px" />
              <span>{{ UI_TEXT.common.loading }}</span>
            </div>
            <div v-else-if="diaryEntries.length === 0" class="diary-empty">
              <q-icon name="auto_stories" size="64px" color="grey-7" />
              <div class="diary-empty-text">{{ UI_TEXT.diary.noEntries }}</div>
              <div class="diary-empty-hint">開始記錄你的冒險故事吧</div>
            </div>
            <div v-else class="diary-entries">
              <q-card
                v-for="entry in diaryEntries"
                :key="entry.id"
                dark
                flat
                class="diary-entry-card q-mb-md"
              >
                <q-card-section>
                  <div class="diary-entry-header">
                    <div class="diary-entry-date">
                      <q-icon name="event" size="14px" />
                      <span>{{ formatDateShort(entry.date) }}</span>
                    </div>
                    <q-btn
                      flat
                      round
                      dense
                      icon="delete"
                      color="grey-6"
                      size="sm"
                      @click="deleteDiary(entry.id)"
                    >
                      <q-tooltip>刪除日記</q-tooltip>
                    </q-btn>
                  </div>
                  <div class="diary-entry-content">{{ entry.content }}</div>
                  
                  <!-- AI 回覆 - 漸層邊框 -->
                  <div v-if="entry.aiResponse" class="diary-ai-reply">
                    <div class="diary-ai-reply-inner">
                      <div class="diary-ai-header">
                        <q-icon name="psychology" size="18px" color="accent" />
                        <span class="diary-ai-label">{{ UI_TEXT.diary.aiReply }}</span>
                      </div>
                      <div class="diary-ai-content">{{ entry.aiResponse }}</div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </section>

          <!-- 飲食分析頁面 - Apple Fitness 風格 -->
          <section v-else-if="activeSection === 'meal'" class="meal-section">
            <!-- 上傳區塊 -->
            <q-card dark flat class="meal-upload-panel q-mb-lg">
              <q-card-section>
                <div class="meal-upload-header">
                  <q-icon name="restaurant" size="24px" color="warning" />
                  <span class="meal-upload-title">AI 飲食分析</span>
                </div>
                <div class="meal-upload-content">
                  <div class="meal-upload-icon">
                    <q-icon name="add_a_photo" size="48px" color="grey-6" />
                  </div>
                  <div class="meal-upload-text">
                    <div class="meal-upload-main">{{ UI_TEXT.meal.description }}</div>
                    <div class="meal-upload-hint">支援 JPG、PNG 格式</div>
                  </div>
                  <input
                    ref="mealInput"
                    type="file"
                    accept="image/*"
                    style="display:none"
                    @change="uploadMeal"
                  />
                  <q-btn
                    unelevated
                    color="warning"
                    :label="isAnalyzing ? UI_TEXT.summary.analyzing : UI_TEXT.meal.upload"
                    icon="photo_camera"
                    :loading="isAnalyzing"
                    :disable="isAnalyzing"
                    class="meal-upload-btn"
                    @click="triggerMealUpload"
                  />
                </div>
              </q-card-section>
            </q-card>

            <!-- 今日營養摘要 -->
            <div v-if="meals.length > 0" class="meal-summary q-mb-lg">
              <div class="meal-summary-title">今日營養攝取</div>
              <div class="meal-summary-stats">
                <div class="meal-summary-stat">
                  <div class="meal-summary-value text-warning">{{ todayNutrients.calories }}</div>
                  <div class="meal-summary-label">{{ UI_TEXT.meal.kcal }}</div>
                </div>
                <div class="meal-summary-stat">
                  <div class="meal-summary-value text-primary">{{ todayNutrients.protein }}{{ UI_TEXT.meal.gram }}</div>
                  <div class="meal-summary-label">{{ UI_TEXT.meal.protein }}</div>
                </div>
                <div class="meal-summary-stat">
                  <div class="meal-summary-value text-accent">{{ todayNutrients.fat }}{{ UI_TEXT.meal.gram }}</div>
                  <div class="meal-summary-label">{{ UI_TEXT.meal.fat }}</div>
                </div>
                <div class="meal-summary-stat">
                  <div class="meal-summary-value text-secondary">{{ todayNutrients.carb }}{{ UI_TEXT.meal.gram }}</div>
                  <div class="meal-summary-label">{{ UI_TEXT.meal.carbs }}</div>
                </div>
              </div>
            </div>

            <!-- 營養攝取趨勢圖表 -->
            <NutritionChart
              :data="nutritionTrendData"
              :initial-period="mealChartPeriod"
              class="q-mb-lg"
              @period-change="handleNutritionPeriodChange"
            />

            <!-- 飲食記錄列表 -->
            <div class="meal-list-header q-mb-md">
              <q-icon name="history" size="20px" color="grey-6" />
              <span class="meal-list-title">飲食記錄</span>
              <span class="meal-list-count">{{ meals.length }} 筆</span>
            </div>

            <div v-if="isLoading" class="meal-loading">
              <q-spinner-dots color="warning" size="40px" />
              <span>{{ UI_TEXT.common.loading }}</span>
            </div>
            <div v-else-if="meals.length === 0" class="meal-empty">
              <q-icon name="no_meals" size="64px" color="grey-7" />
              <div class="meal-empty-text">{{ UI_TEXT.meal.noRecords }}</div>
              <div class="meal-empty-hint">上傳餐點照片開始追蹤營養</div>
            </div>
            <div v-else class="meal-records">
              <q-card
                v-for="meal in meals"
                :key="meal.id"
                dark
                flat
                class="meal-record-card q-mb-md"
              >
                <q-card-section>
                  <div class="meal-record-header">
                    <div class="meal-record-date">
                      <q-icon name="schedule" size="14px" />
                      <span>{{ formatDateShort(meal.date) }}</span>
                    </div>
                    <q-btn
                      flat
                      round
                      dense
                      icon="delete"
                      color="grey-6"
                      size="sm"
                      @click="deleteMeal(meal.id)"
                    >
                      <q-tooltip>刪除記錄</q-tooltip>
                    </q-btn>
                  </div>
                  
                  <!-- 營養數據 -->
                  <div class="meal-nutrients">
                    <div class="meal-nutrient meal-nutrient-calories">
                      <q-icon name="local_fire_department" size="20px" />
                      <span class="meal-nutrient-value">{{ meal.nutrients.calories }}</span>
                      <span class="meal-nutrient-unit">{{ UI_TEXT.meal.kcal }}</span>
                    </div>
                    <div class="meal-nutrient-details">
                      <div class="meal-nutrient-item">
                        <span class="meal-nutrient-label">{{ UI_TEXT.meal.protein }}</span>
                        <span class="meal-nutrient-data">{{ meal.nutrients.protein }}{{ UI_TEXT.meal.gram }}</span>
                      </div>
                      <div class="meal-nutrient-item">
                        <span class="meal-nutrient-label">{{ UI_TEXT.meal.fat }}</span>
                        <span class="meal-nutrient-data">{{ meal.nutrients.fat }}{{ UI_TEXT.meal.gram }}</span>
                      </div>
                      <div class="meal-nutrient-item">
                        <span class="meal-nutrient-label">{{ UI_TEXT.meal.carbs }}</span>
                        <span class="meal-nutrient-data">{{ meal.nutrients.carb }}{{ UI_TEXT.meal.gram }}</span>
                      </div>
                    </div>
                  </div>
                  
                  <!-- AI 分析摘要 -->
                  <div v-if="meal.summary || meal.nutrients?.summary" class="meal-ai-summary">
                    <div class="meal-ai-header">
                      <q-icon name="psychology" size="16px" color="warning" />
                      <span class="meal-ai-label">AI 分析</span>
                    </div>
                    <div class="meal-ai-content">{{ meal.summary || meal.nutrients?.summary }}</div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </section>

          <!-- 統計報告頁面 - Apple Fitness 風格 -->
          <section v-else-if="activeSection === 'statistics'" class="statistics-section">
            <!-- 時間範圍切換 -->
            <div class="statistics-header q-mb-lg">
              <div class="statistics-title">
                <q-icon name="bar_chart" size="24px" color="primary" />
                <span>統計報告</span>
              </div>
              <q-btn-toggle
                v-model="statisticsPeriod"
                toggle-color="primary"
                :options="[
                  { label: '週報', value: 'week' },
                  { label: '月報', value: 'month' }
                ]"
                unelevated
                class="statistics-toggle"
                @update:model-value="switchStatisticsPeriod"
              />
            </div>

            <div v-if="isLoadingStatistics" class="statistics-loading">
              <q-spinner-dots color="primary" size="40px" />
              <span>載入統計數據中...</span>
            </div>

            <div v-else-if="statisticsData" class="statistics-content">
              <!-- 專注時間統計 -->
              <q-card dark flat class="statistics-card q-mb-md">
                <q-card-section>
                  <div class="statistics-card-header">
                    <div class="statistics-card-title">
                      <q-icon name="timer" size="20px" color="primary" />
                      <span>專注時間</span>
                    </div>
                    <div class="statistics-card-summary">
                      <span class="statistics-total">{{ statisticsData.focus?.totalMinutes || 0 }}</span>
                      <span class="statistics-unit">分鐘</span>
                    </div>
                  </div>
                  <BarChart
                    :data="focusChartData"
                    color="#FF2D55"
                    :height="150"
                    label="專注時間 (分鐘)"
                  />
                </q-card-section>
              </q-card>

              <!-- 任務完成統計 -->
              <q-card dark flat class="statistics-card q-mb-md">
                <q-card-section>
                  <div class="statistics-card-header">
                    <div class="statistics-card-title">
                      <q-icon name="check_circle" size="20px" color="secondary" />
                      <span>任務完成</span>
                    </div>
                    <div class="statistics-card-summary">
                      <span class="statistics-total">{{ statisticsData.tasks?.completionRate || 0 }}</span>
                      <span class="statistics-unit">%</span>
                    </div>
                  </div>
                  <LineChart
                    :data="taskChartData"
                    color="#30D158"
                    :height="150"
                    label="完成率 (%)"
                  />
                </q-card-section>
              </q-card>

              <!-- 飲食營養統計 -->
              <q-card dark flat class="statistics-card q-mb-md">
                <q-card-section>
                  <div class="statistics-card-header">
                    <div class="statistics-card-title">
                      <q-icon name="restaurant" size="20px" color="warning" />
                      <span>熱量攝取</span>
                    </div>
                    <div class="statistics-card-summary">
                      <span class="statistics-total">{{ statisticsData.meals?.dailyAverage || 0 }}</span>
                      <span class="statistics-unit">大卡/日</span>
                    </div>
                  </div>
                  <BarChart
                    :data="mealChartData"
                    color="#FF9500"
                    :height="150"
                    label="熱量 (大卡)"
                  />
                </q-card-section>
              </q-card>

              <!-- 日記撰寫統計 -->
              <q-card dark flat class="statistics-card q-mb-md">
                <q-card-section>
                  <div class="statistics-card-header">
                    <div class="statistics-card-title">
                      <q-icon name="book" size="20px" color="accent" />
                      <span>日記撰寫</span>
                    </div>
                    <div class="statistics-card-summary">
                      <span class="statistics-total">{{ statisticsData.diary?.entriesCount || 0 }}</span>
                      <span class="statistics-unit">篇</span>
                      <span v-if="statisticsData.diary?.streak > 0" class="statistics-streak">
                        <q-icon name="local_fire_department" size="14px" />
                        連續 {{ statisticsData.diary.streak }} 天
                      </span>
                    </div>
                  </div>
                  <BarChart
                    :data="statisticsDiaryChartData"
                    color="#0A84FF"
                    :height="150"
                    label="日記"
                  />
                </q-card-section>
              </q-card>
            </div>

            <div v-else class="statistics-empty">
              <q-icon name="bar_chart" size="64px" color="grey-7" />
              <div class="statistics-empty-text">尚無統計數據</div>
              <q-btn
                unelevated
                color="primary"
                label="載入統計"
                icon="refresh"
                @click="loadStatistics"
              />
            </div>
          </section>

          <!-- 成就徽章頁面 - Apple Fitness 風格 -->
          <section v-else-if="activeSection === 'achievements'" class="achievements-section">
            <div class="achievements-header q-mb-lg">
              <div class="achievements-title">
                <q-icon name="emoji_events" size="24px" color="warning" />
                <span>成就徽章</span>
              </div>
              <div class="achievements-count">
                <span class="achievements-unlocked">{{ unlockedCount }}</span>
                <span class="achievements-total">/ {{ achievements.length }}</span>
              </div>
            </div>

            <!-- 分類篩選 -->
            <div class="achievements-filter q-mb-md">
              <q-btn-toggle
                v-model="achievementFilter"
                toggle-color="primary"
                :options="achievementCategories"
                unelevated
                spread
                class="achievements-filter-toggle"
              />
            </div>

            <div v-if="isLoadingAchievements" class="achievements-loading">
              <q-spinner-dots color="warning" size="40px" />
              <span>載入成就中...</span>
            </div>

            <div v-else-if="filteredAchievements.length > 0" class="achievements-grid">
              <AchievementBadge
                v-for="achievement in filteredAchievements"
                :key="achievement.id"
                :achievement="achievement"
                class="achievement-item"
              />
            </div>

            <div v-else class="achievements-empty">
              <q-icon name="emoji_events" size="64px" color="grey-7" />
              <div class="achievements-empty-text">尚無成就</div>
              <q-btn
                unelevated
                color="warning"
                label="載入成就"
                icon="refresh"
                @click="loadAchievements"
              />
            </div>
          </section>

          <!-- 目標設定頁面 - Apple Fitness 風格 -->
          <section v-else-if="activeSection === 'goals'" class="goals-section">
            <div class="goals-header q-mb-lg">
              <div class="goals-title">
                <q-icon name="flag" size="24px" color="secondary" />
                <span>目標設定</span>
              </div>
            </div>

            <!-- 新增目標 -->
            <q-card dark flat class="goals-add-panel q-mb-lg">
              <q-card-section>
                <div class="goals-add-header">
                  <q-icon name="add_circle" size="20px" color="secondary" />
                  <span>新增目標</span>
                </div>
                <div class="goals-add-form">
                  <q-select
                    v-model="newGoalType"
                    dark
                    filled
                    dense
                    :options="goalTypeOptions"
                    option-value="value"
                    option-label="label"
                    emit-value
                    map-options
                    class="goals-type-select"
                  >
                    <template v-slot:prepend>
                      <q-icon :name="getGoalIcon(newGoalType)" color="secondary" />
                    </template>
                  </q-select>
                  <q-input
                    v-model.number="newGoalValue"
                    dark
                    filled
                    dense
                    type="number"
                    :suffix="getGoalUnit(newGoalType)"
                    class="goals-value-input"
                  />
                  <q-btn
                    unelevated
                    color="secondary"
                    icon="add"
                    label="新增"
                    @click="saveGoal"
                  />
                </div>
              </q-card-section>
            </q-card>

            <div v-if="isLoadingGoals" class="goals-loading">
              <q-spinner-dots color="secondary" size="40px" />
              <span>載入目標中...</span>
            </div>

            <div v-else-if="userGoals.length > 0" class="goals-list">
              <q-card
                v-for="goal in userGoals"
                :key="goal.id"
                dark
                flat
                class="goal-card q-mb-md"
              >
                <q-card-section>
                  <div class="goal-card-header">
                    <div class="goal-card-info">
                      <q-icon :name="getGoalIcon(goal.type)" size="24px" color="secondary" />
                      <div class="goal-card-details">
                        <div class="goal-card-label">{{ getGoalLabel(goal.type) }}</div>
                        <div class="goal-card-target">
                          目標: {{ goal.targetValue }} {{ getGoalUnit(goal.type) }}
                        </div>
                      </div>
                    </div>
                    <q-btn
                      flat
                      round
                      dense
                      icon="delete"
                      color="grey-6"
                      @click="deleteGoal(goal.id)"
                    />
                  </div>
                  <div class="goal-card-progress">
                    <ActivityRing
                      :progress="getGoalProgress(goal)"
                      :color="{ start: '#30D158', end: '#64D2FF' }"
                      :size="80"
                      :stroke-width="8"
                      :label="`${getGoalProgress(goal)}%`"
                    />
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <div v-else class="goals-empty">
              <q-icon name="flag" size="64px" color="grey-7" />
              <div class="goals-empty-text">尚未設定目標</div>
              <div class="goals-empty-hint">設定每日目標來追蹤你的進度</div>
            </div>
          </section>
        </q-page>
      </q-page-container>

      <!-- 底部導航 (行動版) - iOS Tab Bar 風格 -->
      <q-footer class="bottom-nav" bordered>
        <q-tabs
          v-model="activeSection"
          dense
          class="bottom-tabs"
          active-color="primary"
          indicator-color="transparent"
          narrow-indicator
          switch-indicator
        >
          <q-tab
            v-for="item in menuItems"
            :key="item.key"
            :name="item.key"
            :ripple="false"
            class="bottom-tab"
          >
            <div :class="['tab-content', { 'tab-active': activeSection === item.key }]">
              <div :class="['tab-icon-wrapper', { 'tab-icon-active': activeSection === item.key }]">
                <q-icon :name="item.icon" size="24px" />
              </div>
              <span class="tab-label">{{ item.shortLabel || item.label }}</span>
            </div>
          </q-tab>
        </q-tabs>
      </q-footer>
    </template>
  </q-layout>
</template>


<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import ActivityRing from './components/ActivityRing.vue';
import TomatoTimer from './components/TomatoTimer.vue';
import TaskCard from './components/TaskCard.vue';
import StatChart from './components/StatChart.vue';
import NutritionChart from './components/NutritionChart.vue';
import LineChart from './components/LineChart.vue';
import BarChart from './components/BarChart.vue';
import AchievementBadge from './components/AchievementBadge.vue';

const $q = useQuasar();

// 中文化文字常數
const UI_TEXT = {
  brandName: '追夢系統',
  menu: {
    summary: 'AI 總覽中心',
    pomodoro: '番茄鐘',
    todo: '日期待辦清單',
    diary: '冒險日記',
    meal: 'AI 飲食分析'
  },
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
  pomodoro: {
    title: '專注計時',
    start: '開始',
    pause: '暫停',
    reset: '重置',
    completed: '專注完成！'
  },
  todo: {
    inputPlaceholder: '輸入任務',
    add: '新增',
    filterPlaceholder: '選擇日期篩選',
    clearFilter: '清除篩選',
    noTasks: '目前沒有待辦事項'
  },
  diary: {
    inputPlaceholder: '寫下今日的冒險故事...',
    submit: '送出日記',
    aiReply: 'AI 回覆',
    noEntries: '尚無日記紀錄'
  },
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
  common: {
    loading: '載入中...',
    confirmDelete: '確定要刪除嗎？',
    confirmDeleteHeader: '刪除確認',
    confirm: '確定',
    cancel: '取消',
    refresh: '重新整理'
  }
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return '早安';
  if (hour >= 12 && hour < 18) return '午安';
  return '晚安';
}

function formatDateChinese(date) {
  const d = new Date(date);
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const weekday = weekdays[d.getDay()];
  return `${year}年${month}月${day}日 星期${weekday}`;
}

function formatDateShort(date) {
  const d = new Date(date);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

const authed = ref(false);
const userName = ref('');
const username = ref('');
const password = ref('');
const showPassword = ref(false);
const usernameFocused = ref(false);
const passwordFocused = ref(false);
const isLoggingIn = ref(false);
const isRegistering = ref(false);
const leftDrawerOpen = ref(false);

const isLoading = ref(false);
const isAnalyzing = ref(false);

const menuItems = [
  { key: 'summary', label: UI_TEXT.menu.summary, shortLabel: '總覽', icon: 'insights' },
  { key: 'pomodoro', label: UI_TEXT.menu.pomodoro, shortLabel: '專注', icon: 'timer' },
  { key: 'todo', label: UI_TEXT.menu.todo, shortLabel: '待辦', icon: 'checklist' },
  { key: 'diary', label: UI_TEXT.menu.diary, shortLabel: '日記', icon: 'book' },
  { key: 'meal', label: UI_TEXT.menu.meal, shortLabel: '飲食', icon: 'restaurant' },
  { key: 'statistics', label: '統計報告', shortLabel: '統計', icon: 'bar_chart' },
  { key: 'achievements', label: '成就徽章', shortLabel: '成就', icon: 'emoji_events' },
  { key: 'goals', label: '目標設定', shortLabel: '目標', icon: 'flag' }
];

const activeSection = ref('summary');

// 導航函數 - 帶動畫效果
function navigateTo(section) {
  if (activeSection.value !== section) {
    activeSection.value = section;
  }
}

const summaryText = ref('');
const summaryNeedsRefresh = ref(false); // 標記是否需要刷新總覽
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

// 活動環尺寸配置
const ringSize = ref(220);
const ringStrokeWidth = ref(16);
const ringGap = ref(44);

// 目標設定（預設值，未來可從 API 獲取）
const goals = ref({
  focusMinutes: 120, // 每日專注目標：120 分鐘
  taskCount: 5,      // 每日任務目標：5 個
  diaryDays: 7       // 日記連續天數目標：7 天
});

// 活動環進度計算
const focusProgress = computed(() => {
  const current = summaryStats.value.focusMinutes || 0;
  const target = goals.value.focusMinutes;
  if (target <= 0) return 0;
  return Math.min(100, (current / target) * 100);
});

const taskProgress = computed(() => {
  const completed = summaryStats.value.completedTodos || 0;
  const total = summaryStats.value.totalTodos || 0;
  if (total <= 0) return 0;
  return Math.min(100, (completed / total) * 100);
});

const diaryProgress = computed(() => {
  const current = summaryStats.value.diaryCount || 0;
  const target = goals.value.diaryDays;
  if (target <= 0) return 0;
  return Math.min(100, (current / target) * 100);
});

// 格式化專注時間顯示
function formatFocusMinutes(minutes) {
  const mins = Math.max(0, Number(minutes || 0));
  if (mins >= 60) {
    const hours = Math.floor(mins / 60);
    const remainMins = mins % 60;
    return `${hours}h ${remainMins}m`;
  }
  return `${mins}m`;
}

// 獲取成就類型（用於樣式）
function getWinType(icon) {
  switch (icon) {
    case 'check_circle':
      return 'task';
    case 'book':
      return 'diary';
    case 'restaurant':
      return 'meal';
    case 'timer':
      return 'focus';
    default:
      return 'default';
  }
}

const todos = ref([]);
const newTask = ref('');
const newTaskDate = ref(formatDate(new Date()));
const newTaskPriority = ref('medium');
const selectedDate = ref(null);

// 優先級選項
const priorityOptions = [
  { value: 'high', label: '高優先' },
  { value: 'medium', label: '中優先' },
  { value: 'low', label: '低優先' }
];

// 獲取優先級顏色
function getPriorityColor(priority) {
  switch (priority) {
    case 'high': return 'negative';
    case 'medium': return 'warning';
    case 'low': return 'positive';
    default: return 'warning';
  }
}

const diaryContent = ref('');
const diaryEntries = ref([]);

const meals = ref([]);
const mealInput = ref(null);

// Statistics data
const statisticsPeriod = ref('week');
const statisticsData = ref(null);
const isLoadingStatistics = ref(false);

// Diary chart data
const diaryChartPeriod = ref('week');
const diaryChartData = ref(null);

// Meal chart data
const mealChartPeriod = ref('week');
const mealNutritionChartData = ref(null);

// Achievements data
const achievements = ref([]);
const achievementFilter = ref('all');
const isLoadingAchievements = ref(false);

// Goals data
const userGoals = ref([]);
const goalProgressMap = ref({}); // 儲存目標進度資料
const isLoadingGoals = ref(false);
const editingGoal = ref(null);
const newGoalType = ref('focus');
const newGoalValue = ref(60);

// Goal type options
const goalTypeOptions = [
  { value: 'focus', label: '每日專注時間 (分鐘)', icon: 'timer' },
  { value: 'task', label: '每日任務完成數', icon: 'check_circle' },
  { value: 'calories', label: '每日熱量攝取', icon: 'local_fire_department' }
];

// Achievement categories
const achievementCategories = [
  { value: 'all', label: '全部' },
  { value: 'focus', label: '專注' },
  { value: 'task', label: '任務' },
  { value: 'diary', label: '日記' },
  { value: 'meal', label: '飲食' }
];

// 今日營養攝取計算
const todayNutrients = computed(() => {
  const today = formatDate(new Date());
  const todayMeals = meals.value.filter(m => m.date === today);
  return todayMeals.reduce((acc, meal) => {
    acc.calories += meal.nutrients?.calories || 0;
    acc.protein += meal.nutrients?.protein || 0;
    acc.fat += meal.nutrients?.fat || 0;
    acc.carb += meal.nutrients?.carb || 0;
    return acc;
  }, { calories: 0, protein: 0, fat: 0, carb: 0 });
});

const timerSeconds = ref(25 * 60);
const liveFocusSeconds = ref(0);
const isTimerRunning = ref(false);
const isBreakTime = ref(false);
const totalDuration = ref(25 * 60);
const completedPomodoros = computed(() => Math.floor((summaryStats.value.focusMinutes || 0) / 25));
let timerHandle = null;

const groupedTodos = computed(() => {
  const list = [...todos.value];
  let filtered = list;
  if (selectedDate.value) {
    filtered = list.filter((item) => item.date === selectedDate.value);
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
        icon: 'check_circle'
      });
    });
  diaryEntries.value.slice(0, 2).forEach((entry) => {
    items.push({
      id: `diary-${entry.id}`,
      title: '完成日記',
      subtitle: entry.content.slice(0, 18) + (entry.content.length > 18 ? '...' : ''),
      time: entry.date,
      icon: 'book'
    });
  });
  meals.value.slice(0, 2).forEach((meal) => {
    items.push({
      id: `meal-${meal.id}`,
      title: `${meal.nutrients.calories} ${UI_TEXT.meal.kcal}`,
      subtitle: '飲食分析完成',
      time: meal.date,
      icon: 'restaurant'
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
  // 只有在非登入相關的 API 返回 401 時才登出
  if (res.status === 401 && !path.includes('/api/auth/')) {
    // 先嘗試重新驗證
    try {
      const authRes = await fetch('/api/auth/me', { credentials: 'include' });
      const authData = await authRes.json();
      if (!authData?.authenticated) {
        authed.value = false;
        throw new Error('unauthorized');
      }
    } catch {
      authed.value = false;
      throw new Error('unauthorized');
    }
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
  isLoggingIn.value = true;
  try {
    const res = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: username.value, password: password.value })
    });
    const data = await res.json();
    if (res.ok) {
      authed.value = true;
      userName.value = data.user?.username || username.value;
      $q.notify({ type: 'positive', message: `歡迎回來，${userName.value}！`, icon: 'check_circle' });
      await refreshAll();
    } else {
      // 根據 HTTP 狀態碼顯示適當的錯誤訊息
      const errorMsg = data.error || (res.status === 401 ? '帳號或密碼錯誤' : '登入失敗，請稍後再試');
      $q.notify({ type: 'negative', message: errorMsg, icon: 'error' });
    }
  } catch (err) {
    // 只有真正的網路錯誤才顯示網路連線錯誤
    const isNetworkError = err instanceof TypeError && err.message.includes('fetch');
    $q.notify({ 
      type: 'negative', 
      message: isNetworkError ? '網路連線錯誤，請稍後再試' : '登入失敗，請檢查帳號密碼', 
      icon: isNetworkError ? 'wifi_off' : 'error' 
    });
  } finally {
    isLoggingIn.value = false;
  }
}

async function register() {
  isRegistering.value = true;
  try {
    const res = await api('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username: username.value, password: password.value })
    });
    const data = await res.json();
    if (res.ok) {
      $q.notify({ type: 'positive', message: '註冊成功，請使用新帳號登入', icon: 'check_circle' });
    } else {
      $q.notify({ type: 'negative', message: data.error || '帳號可能已存在', icon: 'error' });
    }
  } catch (err) {
    const isNetworkError = err instanceof TypeError && err.message.includes('fetch');
    $q.notify({ 
      type: 'negative', 
      message: isNetworkError ? '網路連線錯誤，請稍後再試' : '註冊失敗，請稍後再試', 
      icon: isNetworkError ? 'wifi_off' : 'error' 
    });
  } finally {
    isRegistering.value = false;
  }
}

async function logout() {
  await api('/api/auth/logout', { method: 'POST' });
  authed.value = false;
}

async function refreshSummary(forceRefresh = false) {
  const today = new Date().toISOString().split('T')[0];
  const cacheKey = `summary_${userName.value}_${today}`;
  const statsCacheKey = `summary_stats_${userName.value}_${today}`;
  
  // 檢查快取（只有非強制刷新且不需要刷新時才使用快取）
  if (!forceRefresh && !summaryNeedsRefresh.value) {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const data = JSON.parse(cached);
        summaryText.value = data.summary || '';
        summaryStats.value = data.stats || summaryStats.value;
        // 載入快取的目標進度
        if (data.goals) {
          const progressMap = {};
          data.goals.forEach(g => {
            progressMap[g.id] = g.percentage || 0;
          });
          goalProgressMap.value = progressMap;
        }
        return;
      } catch (e) {
        // 快取無效，繼續呼叫 API
      }
    }
  }
  
  isAnalyzing.value = true;
  try {
    const res = await api('/api/summary');
    if (res.ok) {
      const data = await res.json();
      
      // 檢查數據是否有變化
      const oldStats = localStorage.getItem(statsCacheKey);
      const newStatsStr = JSON.stringify(data.stats);
      const statsChanged = oldStats !== newStatsStr;
      
      // 更新統計數據
      summaryStats.value = data.stats || summaryStats.value;
      localStorage.setItem(statsCacheKey, newStatsStr);
      
      // 更新目標進度
      if (data.goals) {
        const progressMap = {};
        data.goals.forEach(g => {
          progressMap[g.id] = g.percentage || 0;
        });
        goalProgressMap.value = progressMap;
      }
      
      // 只有在強制刷新或數據有變化時才更新 AI 激勵文字
      if (forceRefresh || statsChanged || summaryNeedsRefresh.value) {
        summaryText.value = data.summary || '';
        // 儲存完整快取
        localStorage.setItem(cacheKey, JSON.stringify(data));
      }
      
      // 重置刷新標記
      summaryNeedsRefresh.value = false;
    }
  } catch (err) {
    if (err.message !== 'unauthorized') {
      console.error('Failed to refresh summary:', err);
    }
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
  try {
    const res = await api('/api/todos', {
      method: 'POST',
      body: JSON.stringify({ 
        task: newTask.value, 
        date: newTaskDate.value,
        priority: newTaskPriority.value
      })
    });
    if (res.ok) {
      newTask.value = '';
      newTaskPriority.value = 'medium';
      await loadTodos();
      // 標記數據已更新，下次進入總覽時刷新
      summaryNeedsRefresh.value = true;
      $q.notify({ type: 'positive', message: '任務已新增', icon: 'check_circle' });
    } else {
      const data = await res.json();
      $q.notify({ type: 'negative', message: data.error || '新增失敗', icon: 'error' });
    }
  } catch (err) {
    if (err.message !== 'unauthorized') {
      $q.notify({ type: 'negative', message: '新增任務失敗，請稍後再試', icon: 'error' });
    }
  }
}

async function toggleTodo(todo, completed) {
  try {
    const res = await api(`/api/todos/${todo.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ completed })
    });
    if (res.ok) {
      await loadTodos();
      summaryNeedsRefresh.value = true;
    }
  } catch (err) {
    if (err.message !== 'unauthorized') {
      $q.notify({ type: 'negative', message: '更新任務失敗', icon: 'error' });
    }
  }
}

// TaskCard 事件處理
function handleTodoToggle(id) {
  const todo = todos.value.find(t => t.id === id);
  if (todo) {
    toggleTodo(todo, !todo.completed);
  }
}

function handleTodoDelete(id) {
  deleteTodo(id);
}

function handleTodoEdit(id) {
  // 編輯功能 - 可以用 Dialog 實現
  const todo = todos.value.find(t => t.id === id);
  if (todo) {
    $q.dialog({
      title: '編輯任務',
      message: '修改任務內容：',
      prompt: {
        model: todo.task,
        type: 'text'
      },
      cancel: true,
      persistent: true
    }).onOk(async (newTaskText) => {
      if (newTaskText && newTaskText !== todo.task) {
        await api(`/api/todos/${id}`, {
          method: 'PATCH',
          body: JSON.stringify({ task: newTaskText })
        });
        await loadTodos();
      }
    });
  }
}

function deleteTodo(id) {
  $q.dialog({
    title: UI_TEXT.common.confirmDeleteHeader,
    message: UI_TEXT.common.confirmDelete,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    await api(`/api/todos/${id}`, { method: 'DELETE' });
    await loadTodos();
    await refreshSummary();
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
  $q.dialog({
    title: UI_TEXT.common.confirmDeleteHeader,
    message: UI_TEXT.common.confirmDelete,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    await api(`/api/diaries/${id}`, { method: 'DELETE' });
    await loadDiary();
    await refreshSummary();
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
      const res = await api('/api/meals', {
        method: 'POST',
        body: JSON.stringify({ image: reader.result })
      });
      if (res.ok) {
        await loadMeals();
        // 標記需要刷新，並強制刷新總覽數據
        summaryNeedsRefresh.value = true;
        await refreshSummary(true);
        $q.notify({ type: 'positive', message: '飲食分析完成', icon: 'check_circle' });
      } else {
        const data = await res.json();
        $q.notify({ type: 'negative', message: data.error || '分析失敗', icon: 'error' });
      }
      event.target.value = '';
    } catch (err) {
      if (err.message !== 'unauthorized') {
        $q.notify({ type: 'negative', message: '上傳失敗，請稍後再試', icon: 'error' });
      }
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
  $q.dialog({
    title: UI_TEXT.common.confirmDeleteHeader,
    message: UI_TEXT.common.confirmDelete,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    await api(`/api/meals/${id}`, { method: 'DELETE' });
    await loadMeals();
    await refreshSummary();
  });
}

function startTimer() {
  if (timerHandle) return;
  isTimerRunning.value = true;
  timerHandle = setInterval(async () => {
    if (timerSeconds.value > 0) {
      timerSeconds.value -= 1;
      liveFocusSeconds.value += 1;
    } else {
      clearInterval(timerHandle);
      timerHandle = null;
      isTimerRunning.value = false;
      await api('/api/focus', {
        method: 'POST',
        body: JSON.stringify({ minutes: 25 })
      });
      liveFocusSeconds.value = 0;
      $q.notify({ type: 'positive', message: UI_TEXT.pomodoro.completed, icon: 'celebration' });
      resetTimer();
      await refreshSummary();
    }
  }, 1000);
}

function pauseTimer() {
  if (timerHandle) {
    clearInterval(timerHandle);
    timerHandle = null;
    isTimerRunning.value = false;
  }
}

function resetTimer() {
  pauseTimer();
  timerSeconds.value = 25 * 60;
  liveFocusSeconds.value = 0;
  isBreakTime.value = false;
  totalDuration.value = 25 * 60;
}

function onTimerComplete() {
  // 慶祝動畫由 TomatoTimer 元件處理
  $q.notify({ type: 'positive', message: UI_TEXT.pomodoro.completed, icon: 'celebration' });
}

// Statistics functions
async function loadStatistics() {
  isLoadingStatistics.value = true;
  try {
    const endpoint = statisticsPeriod.value === 'week' 
      ? '/api/statistics/weekly' 
      : '/api/statistics/monthly';
    const res = await api(endpoint);
    statisticsData.value = await res.json();
  } catch (error) {
    console.error('Failed to load statistics:', error);
  } finally {
    isLoadingStatistics.value = false;
  }
}

function switchStatisticsPeriod(period) {
  statisticsPeriod.value = period;
  loadStatistics();
}

// Format statistics chart data
const focusChartData = computed(() => {
  if (!statisticsData.value?.focus?.trend) return [];
  return statisticsData.value.focus.trend.map(item => ({
    label: formatChartLabel(item.date),
    value: item.minutes
  }));
});

const taskChartData = computed(() => {
  if (!statisticsData.value?.tasks?.trend) return [];
  return statisticsData.value.tasks.trend.map(item => ({
    label: formatChartLabel(item.date),
    value: item.completed
  }));
});

const mealChartData = computed(() => {
  if (!statisticsData.value?.meals?.trend) return [];
  return statisticsData.value.meals.trend.map(item => ({
    label: formatChartLabel(item.date),
    value: item.calories
  }));
});

const statisticsDiaryChartData = computed(() => {
  if (!statisticsData.value?.diary?.trend) return [];
  return statisticsData.value.diary.trend.map(item => ({
    label: formatChartLabel(item.date),
    value: item.hasEntry ? 1 : 0
  }));
});

// Diary page frequency chart data
const diaryFrequencyChartData = computed(() => {
  if (!diaryChartData.value?.trend) {
    // Fallback: generate from local diary entries
    return generateDiaryFrequencyData();
  }
  return diaryChartData.value.trend.map(item => ({
    label: formatChartLabel(item.date),
    value: item.hasEntry ? 1 : 0
  }));
});

// Generate diary frequency data from local entries
function generateDiaryFrequencyData() {
  const days = diaryChartPeriod.value === 'week' ? 7 : 30;
  const dates = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = formatDate(date);
    dates.push({
      date: dateStr,
      label: formatChartLabel(dateStr),
      value: diaryEntries.value.some(entry => entry.date === dateStr) ? 1 : 0
    });
  }
  
  return dates;
}

// Diary chart summary
const diaryChartSummary = computed(() => {
  const data = generateDiaryFrequencyData();
  const count = data.filter(d => d.value > 0).length;
  
  // Calculate streak
  let streak = 0;
  for (let i = data.length - 1; i >= 0; i--) {
    if (data[i].value > 0) {
      streak++;
    } else if (streak > 0) {
      break;
    }
  }
  
  return { count, streak };
});

// Load diary chart data
async function loadDiaryChartData() {
  // Data is computed from local entries, no API call needed
  // This function is called when period changes to trigger reactivity
}

// Meal page nutrition chart data
const caloriesChartData = computed(() => {
  return generateMealNutritionData('calories');
});

const proteinChartData = computed(() => {
  return generateMealNutritionData('protein');
});

const fatChartData = computed(() => {
  return generateMealNutritionData('fat');
});

const carbChartData = computed(() => {
  return generateMealNutritionData('carb');
});

// Generate meal nutrition data from local entries
function generateMealNutritionData(nutrientType) {
  const days = mealChartPeriod.value === 'week' ? 7 : 30;
  const dates = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = formatDate(date);
    
    // Sum nutrients for this date
    const dayMeals = meals.value.filter(meal => meal.date === dateStr);
    const total = dayMeals.reduce((sum, meal) => {
      return sum + (meal.nutrients?.[nutrientType] || 0);
    }, 0);
    
    dates.push({
      date: dateStr,
      label: formatChartLabel(dateStr),
      value: total
    });
  }
  
  return dates;
}

// Meal chart summary
const mealChartSummary = computed(() => {
  const caloriesData = generateMealNutritionData('calories');
  const proteinData = generateMealNutritionData('protein');
  const fatData = generateMealNutritionData('fat');
  const carbData = generateMealNutritionData('carb');
  
  const daysWithData = caloriesData.filter(d => d.value > 0).length;
  
  const avgCalories = daysWithData > 0 
    ? Math.round(caloriesData.reduce((sum, d) => sum + d.value, 0) / daysWithData)
    : 0;
  const avgProtein = daysWithData > 0
    ? Math.round(proteinData.reduce((sum, d) => sum + d.value, 0) / daysWithData)
    : 0;
  const avgFat = daysWithData > 0
    ? Math.round(fatData.reduce((sum, d) => sum + d.value, 0) / daysWithData)
    : 0;
  const avgCarb = daysWithData > 0
    ? Math.round(carbData.reduce((sum, d) => sum + d.value, 0) / daysWithData)
    : 0;
  
  return { avgCalories, avgProtein, avgFat, avgCarb };
});

// Load meal chart data
async function loadMealChartData() {
  // Data is computed from local entries, no API call needed
  // This function is called when period changes to trigger reactivity
}

// Nutrition trend data for NutritionChart component
const nutritionTrendData = computed(() => {
  const days = mealChartPeriod.value === 'week' ? 7 : 30;
  const result = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = formatDate(date);
    
    const dayMeals = meals.value.filter(m => m.date === dateStr);
    const dayData = dayMeals.reduce((acc, meal) => {
      acc.calories += meal.nutrients?.calories || 0;
      acc.protein += meal.nutrients?.protein || 0;
      acc.fat += meal.nutrients?.fat || 0;
      acc.carb += meal.nutrients?.carb || 0;
      return acc;
    }, { calories: 0, protein: 0, fat: 0, carb: 0 });
    
    result.push({
      date: dateStr,
      ...dayData
    });
  }
  
  return result;
});

function handleNutritionPeriodChange(period) {
  mealChartPeriod.value = period;
}

function formatChartLabel(dateStr) {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

// Achievements functions
async function loadAchievements() {
  isLoadingAchievements.value = true;
  try {
    const res = await api('/api/achievements');
    const data = await res.json();
    
    // API 已經返回完整的成就列表（含 unlocked 狀態）
    achievements.value = data;
  } catch (error) {
    console.error('Failed to load achievements:', error);
  } finally {
    isLoadingAchievements.value = false;
  }
}

const filteredAchievements = computed(() => {
  if (achievementFilter.value === 'all') {
    return achievements.value;
  }
  return achievements.value.filter(a => a.category === achievementFilter.value);
});

const unlockedCount = computed(() => {
  return achievements.value.filter(a => a.unlocked).length;
});

// Goals functions
async function loadGoals() {
  isLoadingGoals.value = true;
  try {
    const res = await api('/api/goals');
    userGoals.value = await res.json();
  } catch (error) {
    console.error('Failed to load goals:', error);
  } finally {
    isLoadingGoals.value = false;
  }
}

async function saveGoal() {
  if (newGoalValue.value <= 0) {
    $q.notify({ type: 'warning', message: '目標值必須大於 0', icon: 'warning' });
    return;
  }
  
  try {
    await api('/api/goals', {
      method: 'POST',
      body: JSON.stringify({
        type: newGoalType.value,
        targetValue: newGoalValue.value
      })
    });
    await loadGoals();
    $q.notify({ type: 'positive', message: '目標已儲存', icon: 'check_circle' });
  } catch (error) {
    $q.notify({ type: 'negative', message: '儲存失敗', icon: 'error' });
  }
}

async function deleteGoal(goalId) {
  $q.dialog({
    title: '刪除目標',
    message: '確定要刪除這個目標嗎？',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await api(`/api/goals/${goalId}`, { method: 'DELETE' });
      await loadGoals();
      $q.notify({ type: 'positive', message: '目標已刪除', icon: 'check_circle' });
    } catch (error) {
      $q.notify({ type: 'negative', message: '刪除失敗', icon: 'error' });
    }
  });
}

function getGoalIcon(type) {
  const icons = { focus: 'timer', task: 'check_circle', calories: 'local_fire_department' };
  return icons[type] || 'flag';
}

function getGoalLabel(type) {
  const labels = { focus: '專注時間', task: '任務完成', calories: '熱量攝取' };
  return labels[type] || type;
}

function getGoalUnit(type) {
  const units = { focus: '分鐘', task: '個', calories: '大卡' };
  return units[type] || '';
}

function getGoalProgress(goal) {
  // 從 goalProgressMap 取得進度，如果沒有則回傳 0
  return goalProgressMap.value[goal.id] || 0;
}

async function refreshAll() {
  if (!authed.value) return;
  await Promise.all([
    refreshSummary(), 
    loadTodos(), 
    loadDiary(), 
    loadMeals(),
    loadStatistics(),
    loadAchievements(),
    loadGoals()
  ]);
}

onMounted(async () => {
  await checkAuth();
  if (authed.value) {
    await refreshAll();
  }
});

// 監聽頁面切換，進入總覽時檢查是否需要刷新
watch(activeSection, async (newSection) => {
  if (newSection === 'summary' && summaryNeedsRefresh.value && authed.value) {
    await refreshSummary(true);
  }
});
</script>

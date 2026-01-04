# Requirements Document

## Introduction

本專案旨在將 Dream Tracker 應用程式進行全面升級，包含：
1. **UI 框架遷移**：從 PrimeVue 遷移至 Quasar Framework（iOS 風格模式）
2. **視覺設計升級**：採用 Apple Fitness 風格的現代化設計
3. **新功能開發**：活動環進度顯示、統計報告、成就徽章、目標設定

目標是讓所有用戶（手機和電腦）都能享受到美觀、直覺且符合現代設計趨勢的使用體驗。

## Glossary

- **UI_System**: Dream Tracker 應用程式的使用者介面系統
- **Quasar_Framework**: Vue 3 的 UI 框架，支援 iOS 風格模式
- **Login_Page**: 用戶登入與註冊的頁面
- **Navigation_System**: 包含側邊欄（桌面版）和底部導航（行動版）的導航系統
- **Card_Component**: 用於顯示內容的卡片式容器元件
- **Activity_Ring**: 類似 Apple Fitness 的彩色圓環進度指示器
- **Pomodoro_Timer**: 番茄鐘專注計時器介面，結合番茄造型與活動環
- **Summary_Page**: 總覽頁面，顯示活動環和快速操作
- **Statistics_Module**: 每週/每月統計報告模組
- **Achievement_System**: 成就徽章系統
- **Goal_Setting**: 目標設定功能

## Requirements

### Requirement 1: UI 框架遷移至 Quasar

**User Story:** As a 開發者, I want 將 UI 框架從 PrimeVue 遷移至 Quasar, so that 可以使用 iOS 風格元件並支援未來的跨平台打包。

#### Acceptance Criteria

1. THE UI_System SHALL 使用 Quasar Framework 作為主要 UI 框架
2. THE UI_System SHALL 配置為 iOS 風格模式
3. WHEN 遷移完成 THEN THE UI_System SHALL 保留所有現有功能（登入、待辦、日記、飲食、番茄鐘）
4. THE UI_System SHALL 移除所有 PrimeVue 相關依賴
5. THE UI_System SHALL 使用 Quasar 的內建元件替換所有 PrimeVue 元件

### Requirement 2: 登入頁面 Apple Fitness 風格

**User Story:** As a 用戶, I want 看到類似 Apple Fitness 風格的登入頁面, so that 我對這個 App 有良好的第一印象。

#### Acceptance Criteria

1. THE Login_Page SHALL 使用深色背景（#000000 或接近黑色）
2. THE Login_Page SHALL 顯示具有微妙漸層效果的登入卡片
3. WHEN 用戶與輸入框互動 THEN THE Login_Page SHALL 提供平滑的聚焦動畫效果
4. THE Login_Page SHALL 使用圓潤的邊角設計（border-radius 至少 16px）
5. THE Login_Page SHALL 使用多彩的強調色元素（紅、綠、藍漸層）

### Requirement 3: 導航系統 iOS 風格

**User Story:** As a 用戶, I want 使用類似 iOS 原生的導航系統, so that 我能直覺地切換不同功能。

#### Acceptance Criteria

1. WHEN 用戶在桌面版使用 THEN THE Navigation_System SHALL 顯示 iOS 風格的側邊欄
2. WHEN 用戶在行動版使用 THEN THE Navigation_System SHALL 顯示 iOS 風格的底部 Tab Bar
3. WHEN 用戶選擇導航項目 THEN THE Navigation_System SHALL 顯示平滑的選中狀態過渡動畫
4. THE Navigation_System SHALL 使用 SF Symbols 風格的圖示
5. WHEN 導航項目被選中 THEN THE Navigation_System SHALL 顯示彩色高亮效果

### Requirement 4: 總覽頁面活動環設計

**User Story:** As a 用戶, I want 在總覽頁面看到類似 Apple Fitness 的活動環, so that 我能直覺地了解今日進度。

#### Acceptance Criteria

1. THE Summary_Page SHALL 顯示活動環作為主視覺元素
2. THE Activity_Ring SHALL 顯示今日專注時間的進度
3. THE Activity_Ring SHALL 使用多彩漸層（紅、綠、藍）
4. WHEN 進度更新 THEN THE Activity_Ring SHALL 顯示平滑的動畫效果
5. THE Summary_Page SHALL 在活動環下方顯示數據摘要（專注分鐘、任務完成率）
6. THE Summary_Page SHALL 重新設計佈局，以活動環為中心

### Requirement 5: 番茄鐘結合活動環

**User Story:** As a 用戶, I want 番茄鐘結合活動環設計, so that 專注時有更好的視覺體驗。

#### Acceptance Criteria

1. THE Pomodoro_Timer SHALL 保留番茄造型作為背景元素
2. THE Pomodoro_Timer SHALL 在番茄周圍顯示圓形進度環
3. WHEN 計時器運行中 THEN THE Pomodoro_Timer SHALL 顯示進度環的平滑動畫
4. THE Pomodoro_Timer SHALL 使用清晰易讀的大字體顯示剩餘時間
5. WHEN 專注完成 THEN THE Pomodoro_Timer SHALL 顯示慶祝動畫效果

### Requirement 6: 待辦清單卡片式設計

**User Story:** As a 用戶, I want 待辦清單以卡片形式呈現, so that 每個任務更加清晰可見。

#### Acceptance Criteria

1. THE UI_System SHALL 以卡片形式顯示每個待辦任務
2. THE Card_Component SHALL 使用深色背景搭配微妙的邊框
3. THE Card_Component SHALL 顯示優先級顏色指示（可選）
4. WHEN 任務完成 THEN THE Card_Component SHALL 顯示完成動畫效果
5. THE Card_Component SHALL 支援滑動操作（刪除、編輯）

### Requirement 7: 日記與飲食數據視覺化

**User Story:** As a 用戶, I want 看到日記和飲食的數據視覺化, so that 我能更好地追蹤我的進度。

#### Acceptance Criteria

1. THE UI_System SHALL 在日記頁面顯示撰寫頻率圖表
2. THE UI_System SHALL 在飲食頁面顯示營養攝取圖表
3. THE UI_System SHALL 使用 Apple Fitness 風格的圖表設計
4. WHEN 顯示 AI 回覆 THEN THE Card_Component SHALL 使用特殊的漸層邊框突顯
5. THE UI_System SHALL 支援查看歷史數據趨勢

### Requirement 8: 每週/每月統計報告

**User Story:** As a 用戶, I want 查看每週和每月的統計報告, so that 我能了解長期的進度趨勢。

#### Acceptance Criteria

1. THE Statistics_Module SHALL 提供每週統計報告視圖
2. THE Statistics_Module SHALL 提供每月統計報告視圖
3. THE Statistics_Module SHALL 顯示專注時間趨勢圖
4. THE Statistics_Module SHALL 顯示任務完成率趨勢圖
5. THE Statistics_Module SHALL 顯示飲食營養趨勢圖
6. WHEN 用戶切換時間範圍 THEN THE Statistics_Module SHALL 平滑更新圖表

### Requirement 9: 成就徽章系統

**User Story:** As a 用戶, I want 獲得成就徽章, so that 我有動力持續使用這個 App。

#### Acceptance Criteria

1. THE Achievement_System SHALL 定義多種成就類型（專注、任務、日記、飲食）
2. WHEN 用戶達成成就條件 THEN THE Achievement_System SHALL 顯示徽章解鎖通知
3. THE Achievement_System SHALL 提供成就展示頁面
4. THE Achievement_System SHALL 使用 Apple Fitness 風格的徽章設計
5. THE Achievement_System SHALL 記錄成就解鎖時間

### Requirement 10: 目標設定功能

**User Story:** As a 用戶, I want 設定個人目標, so that 我能追蹤自己的進度。

#### Acceptance Criteria

1. THE Goal_Setting SHALL 支援設定每日專注時間目標
2. THE Goal_Setting SHALL 支援設定每日任務完成數目標
3. THE Goal_Setting SHALL 支援設定每日熱量攝取目標
4. WHEN 用戶達成目標 THEN THE UI_System SHALL 顯示達成通知
5. THE Activity_Ring SHALL 根據目標設定顯示進度百分比

### Requirement 11: 整體視覺風格 Apple Fitness

**User Story:** As a 用戶, I want 整個 App 有一致的 Apple Fitness 視覺風格, so that 使用體驗更加流暢統一。

#### Acceptance Criteria

1. THE UI_System SHALL 使用深色主題（黑色背景）
2. THE UI_System SHALL 使用多彩強調色系統（紅、綠、藍、橙、紫）
3. THE UI_System SHALL 使用一致的間距系統（8px 為基礎單位）
4. THE UI_System SHALL 使用 SF Pro 或類似的系統字體
5. WHEN 任何元素狀態改變 THEN THE UI_System SHALL 使用一致的過渡動畫時長（0.2-0.3 秒）
6. THE UI_System SHALL 禁止在介面中使用 Emoji 表情符號
7. THE UI_System SHALL 使用圖示（icons）替代 Emoji 來表達視覺元素

### Requirement 12: 響應式設計

**User Story:** As a 用戶, I want 在手機和電腦上都有良好的體驗, so that 我可以隨時隨地使用這個 App。

#### Acceptance Criteria

1. WHEN 用戶在手機上使用 THEN THE UI_System SHALL 自動調整為行動版佈局
2. WHEN 用戶在電腦上使用 THEN THE UI_System SHALL 顯示桌面版佈局
3. THE UI_System SHALL 確保所有觸控目標至少 44x44 像素
4. THE UI_System SHALL 支援安全區域（safe area）以適應各種裝置
5. WHEN 螢幕寬度改變 THEN THE UI_System SHALL 平滑過渡佈局變化

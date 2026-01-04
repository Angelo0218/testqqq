# Implementation Plan: UI Modernization

## Overview

本實作計畫將 Dream Tracker 從 PrimeVue 遷移至 Quasar Framework，採用 Apple Fitness 風格設計，並新增統計報告、成就徽章和目標設定功能。採用分階段實作，確保每個階段都有可運行的成果。

## Tasks

- [x] 1. Quasar 框架設置與基礎配置
  - [x] 1.1 安裝 Quasar 依賴並移除 PrimeVue
    - 安裝 @quasar/extras, quasar
    - 移除 primevue, primeicons 依賴
    - 更新 package.json
    - _Requirements: 1.1, 1.4_

  - [x] 1.2 配置 Quasar 深色主題和 iOS 模式
    - 建立 quasar.config.js
    - 配置深色主題為預設
    - 設定 Apple Fitness 風格色彩變數
    - _Requirements: 1.2, 11.1, 11.2_

  - [x] 1.3 建立全域樣式系統
    - 建立 src/styles/quasar-variables.scss
    - 定義間距、圓角、字體系統
    - 配置動畫過渡時長
    - _Requirements: 11.3, 11.4, 11.5_

  - [x] 1.4 更新 main.js 入口點
    - 引入 Quasar 插件
    - 移除 PrimeVue 相關引入
    - 配置 Quasar 元件
    - _Requirements: 1.5_

- [x] 2. 核心元件開發
  - [x] 2.1 開發 ActivityRing 活動環元件
    - 建立 src/components/ActivityRing.vue
    - 實作 SVG 圓環繪製
    - 實作漸層色彩支援
    - 實作進度動畫
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [x] 2.2 撰寫 ActivityRing 屬性測試
    - **Property 2: 活動環進度計算正確性**
    - **Validates: Requirements 4.2, 10.5**

  - [x] 2.3 開發 ProgressRing 進度環元件
    - 建立 src/components/ProgressRing.vue
    - 用於番茄鐘計時顯示
    - 支援倒數計時動畫
    - _Requirements: 5.2, 5.3_

  - [x] 2.4 開發 TaskCard 任務卡片元件
    - 建立 src/components/TaskCard.vue
    - 使用 QSlideItem 實作滑動操作
    - 實作優先級顏色指示
    - 實作完成動畫效果
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 2.5 撰寫 TaskCard 屬性測試
    - **Property 8: 優先級顏色指示正確性**
    - **Validates: Requirements 6.3**

  - [x] 2.6 開發 TomatoTimer 番茄鐘元件
    - 建立 src/components/TomatoTimer.vue
    - 保留番茄 SVG 造型
    - 整合 ProgressRing 進度環
    - 實作慶祝動畫
    - _Requirements: 5.1, 5.4, 5.5_

- [x] 3. Checkpoint - 核心元件完成
  - 確保所有核心元件可獨立運作
  - 執行元件單元測試
  - 如有問題請詢問用戶

- [x] 4. 頁面遷移 - 登入與導航
  - [x] 4.1 遷移登入頁面至 Quasar
    - 使用 QCard, QInput, QBtn 重構
    - 實作深色背景和漸層效果
    - 實作聚焦動畫
    - 移除所有 Emoji，使用 QIcon
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 11.6_

  - [x] 4.2 實作導航系統
    - 使用 QLayout, QDrawer 實作側邊欄
    - 使用 QTabs 實作底部導航
    - 實作響應式切換邏輯
    - 實作選中狀態動畫
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 4.3 撰寫無 Emoji 合規性測試
    - **Property 7: 無 Emoji 合規性**
    - **Validates: Requirements 11.6**

- [x] 5. 頁面遷移 - 總覽頁面
  - [x] 5.1 重構總覽頁面佈局
    - 以 ActivityRing 為中心設計
    - 顯示專注時間、任務完成率、日記天數
    - 實作數據摘要區塊
    - _Requirements: 4.5, 4.6_

  - [x] 5.2 遷移快速操作區塊
    - 使用 QCard 重構操作卡片
    - 實作 Apple Fitness 風格設計
    - _Requirements: 11.1, 11.2_

  - [x] 5.3 遷移最近成就區塊
    - 使用 QList 重構列表
    - 移除 Emoji，使用 QIcon
    - _Requirements: 11.6, 11.7_

- [x] 6. 頁面遷移 - 功能頁面
  - [x] 6.1 遷移番茄鐘頁面
    - 整合 TomatoTimer 元件
    - 使用 QBtn 重構控制按鈕
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [x] 6.2 遷移待辦清單頁面
    - 整合 TaskCard 元件
    - 使用 QInput, QDate 重構輸入區
    - 實作日期分組顯示
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 6.3 遷移日記頁面
    - 使用 QInput (textarea) 重構
    - 使用 QCard 重構日記列表
    - 實作 AI 回覆漸層邊框
    - _Requirements: 7.4_

  - [x] 6.4 遷移飲食分析頁面
    - 使用 QCard 重構飲食記錄
    - 使用 QBtn 重構上傳按鈕
    - _Requirements: 7.4_

- [x] 7. Checkpoint - 頁面遷移完成
  - 確保所有現有功能正常運作
  - 執行功能完整性測試
  - 如有問題請詢問用戶

- [x] 7.1 撰寫功能完整性屬性測試
  - **Property 1: 功能完整性保留**
  - **Validates: Requirements 1.3**

- [x] 8. 資料庫結構擴展
  - [x] 8.1 新增 goals 資料表
    - 在 server/src/db/schema.sql 新增 goals 表定義
    - 欄位: id, user_id, type, target_value, created_at, updated_at
    - 建立外鍵關聯到 users 表
    - _Requirements: 10.1, 10.2, 10.3_

  - [x] 8.2 新增 achievements 資料表
    - 在 server/src/db/schema.sql 新增 achievements 表定義
    - 欄位: id, user_id, achievement_id, unlocked_at
    - 建立唯一約束 (user_id, achievement_id)
    - 建立外鍵關聯到 users 表
    - _Requirements: 9.1, 9.5_

  - [x] 8.3 新增 todos 表的 priority 欄位
    - 在 todos 表新增 priority 欄位 (TEXT: 'high', 'medium', 'low')
    - 設定預設值為 'medium'
    - _Requirements: 6.3_

  - [x] 8.4 更新資料庫初始化腳本
    - 更新 server/src/db/init.js
    - 確保新表格正確建立
    - 處理既有資料庫的遷移
    - _Requirements: 8.1, 8.2_

- [x] 9. 後端 API - 目標設定
  - [x] 9.1 建立 goals 路由檔案
    - 建立 server/src/routes/goals.js
    - 設定路由前綴 /api/goals
    - 引入認證中間件
    - _Requirements: 10.1, 10.2, 10.3_

  - [x] 9.2 實作 GET /api/goals
    - 查詢當前用戶的所有目標設定
    - 返回目標類型和目標值
    - _Requirements: 10.1, 10.2, 10.3_

  - [x] 9.3 實作 POST /api/goals
    - 新增或更新目標設定
    - 驗證目標類型 (focus, task, calories)
    - 驗證目標值大於 0
    - _Requirements: 10.1, 10.2, 10.3_

  - [x] 9.4 實作 PUT /api/goals/:id
    - 更新指定目標設定
    - 驗證目標屬於當前用戶
    - _Requirements: 10.1, 10.2, 10.3_

  - [x] 9.5 實作 DELETE /api/goals/:id
    - 刪除指定目標設定
    - 驗證目標屬於當前用戶
    - _Requirements: 10.1, 10.2, 10.3_

- [x] 10. 後端 API - 成就系統
  - [x] 10.1 建立 achievements 路由檔案
    - 建立 server/src/routes/achievements.js
    - 設定路由前綴 /api/achievements
    - 引入認證中間件
    - _Requirements: 9.1, 9.2, 9.5_

  - [x] 10.2 建立成就定義服務
    - 建立 server/src/services/achievements.js
    - 定義所有成就類型和條件
    - 實作成就條件檢查函數
    - _Requirements: 9.1, 9.2_

  - [x] 10.3 實作 GET /api/achievements
    - 查詢當前用戶已解鎖的成就
    - 返回成就 ID 和解鎖時間
    - 合併成就定義資訊
    - _Requirements: 9.3_

  - [x] 10.4 實作 POST /api/achievements/check
    - 檢查用戶是否達成新成就
    - 自動解鎖符合條件的成就
    - 返回新解鎖的成就列表
    - _Requirements: 9.2_

  - [x] 10.5 實作成就解鎖邏輯
    - 在相關操作後觸發成就檢查
    - 番茄鐘完成後檢查專注類成就
    - 任務完成後檢查任務類成就
    - 日記儲存後檢查日記類成就
    - 飲食記錄後檢查飲食類成就
    - _Requirements: 9.2, 9.5_

- [x] 11. 後端 API - 統計報告
  - [x] 11.1 建立 statistics 路由檔案
    - 建立 server/src/routes/statistics.js
    - 設定路由前綴 /api/statistics
    - 引入認證中間件
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

  - [x] 11.2 實作 GET /api/statistics/weekly
    - 計算過去 7 天的統計數據
    - 專注時間總計和每日明細
    - 任務完成數和完成率
    - 飲食營養攝取趨勢
    - 日記撰寫天數
    - _Requirements: 8.1, 8.3, 8.4, 8.5_

  - [x] 11.3 實作 GET /api/statistics/monthly
    - 計算過去 30 天的統計數據
    - 專注時間總計和每日明細
    - 任務完成數和完成率
    - 飲食營養攝取趨勢
    - 日記撰寫天數和連續天數
    - _Requirements: 8.2, 8.3, 8.4, 8.5_

  - [x] 11.4 實作統計計算服務
    - 建立 server/src/services/statistics.js
    - 實作專注時間聚合查詢
    - 實作任務完成率計算
    - 實作營養攝取聚合查詢
    - 實作日記連續天數計算
    - _Requirements: 8.3, 8.4, 8.5_

- [x] 12. 後端 API - 待辦清單擴展
  - [x] 12.1 更新 todos 路由支援優先級
    - 修改 POST /api/todos 支援 priority 參數
    - 修改 PATCH /api/todos/:id 支援更新 priority
    - 修改 GET /api/todos 返回 priority 欄位
    - _Requirements: 6.3_

- [x] 13. 後端 API - 目標達成通知
  - [x] 13.1 實作目標進度檢查
    - 在 summary API 中計算目標達成狀態
    - 比較當前進度與目標值
    - 返回達成狀態標記
    - _Requirements: 10.4, 10.5_

  - [x] 13.2 更新 GET /api/summary
    - 整合目標設定資訊
    - 計算各項目標的達成百分比
    - 返回是否達成目標的標記
    - _Requirements: 10.4, 10.5_

- [x] 14. Checkpoint - 後端 API 完成
  - 測試所有新增 API 端點
  - 確保資料庫操作正確
  - 如有問題請詢問用戶

- [x] 15. 新功能前端實作
  - [x] 15.1 開發 StatChart 統計圖表元件
    - 建立 src/components/StatChart.vue
    - 實作長條圖和折線圖
    - 實作 Apple Fitness 風格設計
    - _Requirements: 7.1, 7.2, 7.3_

  - [x] 15.2 撰寫統計趨勢計算屬性測試
    - **Property 3: 統計趨勢計算正確性**
    - **Validates: Requirements 8.3, 8.4, 8.5**

  - [x] 15.3 開發 AchievementBadge 徽章元件
    - 建立 src/components/AchievementBadge.vue
    - 實作解鎖/未解鎖狀態
    - 實作 Apple Fitness 風格設計
    - _Requirements: 9.3, 9.4_

  - [x] 15.4 實作統計報告頁面
    - 建立統計報告視圖
    - 整合 StatChart 元件
    - 實作週/月切換功能
    - _Requirements: 8.1, 8.2, 8.6_

  - [x] 15.5 撰寫歷史數據趨勢屬性測試
    - **Property 9: 歷史數據趨勢顯示正確性**
    - **Validates: Requirements 7.5**

  - [x] 15.6 實作成就展示頁面
    - 建立成就展示視圖
    - 整合 AchievementBadge 元件
    - 實作分類篩選功能
    - _Requirements: 9.3_

  - [x] 15.7 撰寫成就解鎖觸發屬性測試
    - **Property 4: 成就解鎖觸發正確性**
    - **Validates: Requirements 9.2, 9.5**

  - [x] 15.8 實作目標設定頁面
    - 建立目標設定視圖
    - 實作專注時間、任務數、熱量目標設定
    - 整合 ActivityRing 顯示進度
    - _Requirements: 10.1, 10.2, 10.3, 10.5_

  - [x] 15.9 撰寫目標達成通知屬性測試
    - **Property 5: 目標達成通知正確性**
    - **Validates: Requirements 10.4**

- [x] 16. 日記與飲食數據視覺化
  - [x] 16.1 在日記頁面新增撰寫頻率圖表
    - 整合 StatChart 元件
    - 顯示過去 7 天/30 天撰寫記錄
    - _Requirements: 7.1_

  - [x] 16.2 在飲食頁面新增營養攝取圖表
    - 整合 StatChart 元件
    - 顯示熱量、蛋白質、脂肪、碳水趨勢
    - _Requirements: 7.2_

- [x] 17. Checkpoint - 新功能完成
  - 確保所有新功能正常運作
  - 執行屬性測試
  - 如有問題請詢問用戶

- [x] 18. 響應式設計與觸控優化
  - [x] 18.1 優化行動版佈局
    - 調整元件在小螢幕的顯示
    - 確保底部導航正確顯示
    - _Requirements: 12.1_

  - [x] 18.2 優化桌面版佈局
    - 調整元件在大螢幕的顯示
    - 確保側邊欄正確顯示
    - _Requirements: 12.2_

  - [x] 18.3 確保觸控目標尺寸
    - 檢查所有按鈕、輸入框尺寸
    - 確保至少 44x44 像素
    - _Requirements: 12.3_

  - [x] 18.4 撰寫觸控目標尺寸屬性測試
    - **Property 6: 觸控目標尺寸合規性**
    - **Validates: Requirements 12.3**

  - [x] 18.5 實作安全區域支援
    - 配置 safe-area-inset CSS
    - 確保內容不被裝置邊緣遮擋
    - _Requirements: 12.4_

- [x] 19. 導航系統整合
  - [x] 19.1 新增統計報告導航項目
    - 在側邊欄和底部導航新增入口
    - 使用適當的圖示
    - _Requirements: 3.4_

  - [x] 19.2 新增成就展示導航項目
    - 在側邊欄和底部導航新增入口
    - 使用適當的圖示
    - _Requirements: 3.4_

  - [x] 19.3 新增目標設定導航項目
    - 在側邊欄和底部導航新增入口
    - 使用適當的圖示
    - _Requirements: 3.4_

- [x] 20. Final Checkpoint - 全部完成
  - 執行所有屬性測試
  - 執行視覺檢查
  - 確保所有功能正常運作
  - 如有問題請詢問用戶

## Notes

- 每個 Checkpoint 都是確認點，確保階段性成果可運行
- 屬性測試使用 fast-check 庫，每個測試至少執行 100 次迭代
- 所有元件都應遵循無 Emoji 規範，使用 Quasar 圖示替代
- 所有測試任務都是必要的，確保完整的測試覆蓋

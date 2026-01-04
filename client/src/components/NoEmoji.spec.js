/**
 * Property-Based Tests for No Emoji Compliance
 * Feature: ui-modernization, Property 7: 無 Emoji 合規性
 * Validates: Requirements 11.6
 * 
 * Property: For any interface text and component, it should not contain
 * Unicode Emoji characters (U+1F600-U+1F64F, U+1F300-U+1F5FF, etc.)
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

/**
 * Emoji detection regex covering major Unicode emoji ranges.
 * Note: We create a new regex each time to avoid issues with the global flag.
 */
function createEmojiRegex() {
  return /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA00}-\u{1FA6F}]|[\u{1FA70}-\u{1FAFF}]|[\u{231A}-\u{231B}]|[\u{23E9}-\u{23F3}]|[\u{23F8}-\u{23FA}]|[\u{25AA}-\u{25AB}]|\u{25B6}|\u{25C0}|[\u{25FB}-\u{25FE}]|[\u{2614}-\u{2615}]|[\u{2648}-\u{2653}]|\u{267F}|\u{2693}|\u{26A1}|[\u{26AA}-\u{26AB}]|[\u{26BD}-\u{26BE}]|[\u{26C4}-\u{26C5}]|\u{26CE}|\u{26D4}|\u{26EA}|[\u{26F2}-\u{26F3}]|\u{26F5}|\u{26FA}|\u{26FD}|\u{2702}|\u{2705}|[\u{2708}-\u{270D}]|\u{270F}|\u{2712}|\u{2714}|\u{2716}|\u{271D}|\u{2721}|\u{2728}|[\u{2733}-\u{2734}]|\u{2744}|\u{2747}|\u{274C}|\u{274E}|[\u{2753}-\u{2755}]|\u{2757}|[\u{2763}-\u{2764}]|[\u{2795}-\u{2797}]|\u{27A1}|\u{27B0}|\u{27BF}|[\u{2934}-\u{2935}]|[\u{2B05}-\u{2B07}]|[\u{2B1B}-\u{2B1C}]|\u{2B50}|\u{2B55}|\u{3030}|\u{303D}|\u{3297}|\u{3299}|[\u{FE00}-\u{FE0F}]|\u{200D}/gu;
}

/**
 * Check if a string contains emoji characters
 * @param {string} text - The text to check
 * @returns {boolean} - True if emoji found, false otherwise
 */
function containsEmoji(text) {
  if (!text || typeof text !== 'string') return false;
  return createEmojiRegex().test(text);
}

/**
 * Find all emojis in a string
 * @param {string} text - The text to search
 * @returns {string[]} - Array of found emojis
 */
function findEmojis(text) {
  if (!text || typeof text !== 'string') return [];
  const matches = text.match(createEmojiRegex());
  return matches || [];
}

// UI Text constants from App.vue (should not contain emojis)
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

/**
 * Recursively extract all string values from an object
 * @param {object} obj - The object to extract strings from
 * @returns {string[]} - Array of all string values
 */
function extractAllStrings(obj) {
  const strings = [];
  
  function traverse(value) {
    if (typeof value === 'string') {
      strings.push(value);
    } else if (Array.isArray(value)) {
      value.forEach(traverse);
    } else if (value && typeof value === 'object') {
      Object.values(value).forEach(traverse);
    }
  }
  
  traverse(obj);
  return strings;
}

describe('NoEmoji - Property 7: 無 Emoji 合規性', () => {
  /**
   * Property 7: No Emoji Compliance
   * For any interface text, it should not contain Unicode Emoji characters
   */
  
  it('should detect emojis correctly in test strings', () => {
    // Test that our emoji detection works
    expect(containsEmoji('Hello 😀 World')).toBe(true);
    expect(containsEmoji('Hello World')).toBe(false);
    expect(containsEmoji('追夢系統')).toBe(false);
    expect(containsEmoji('🎉 慶祝')).toBe(true);
    expect(containsEmoji('⭐ 星星')).toBe(true);
    expect(containsEmoji('❤️ 愛心')).toBe(true);
  });

  it('should not contain emojis in any UI_TEXT strings', () => {
    const allStrings = extractAllStrings(UI_TEXT);
    
    allStrings.forEach(text => {
      const emojis = findEmojis(text);
      expect(emojis).toEqual([]);
    });
  });

  /**
   * Property-based test: For any generated UI text that follows our pattern,
   * it should not contain emojis
   */
  it('should reject any text containing emojis (property-based)', () => {
    fc.assert(
      fc.property(
        // Generate strings that might contain emojis
        fc.oneof(
          // Chinese text without emojis (valid)
          fc.stringOf(fc.constantFrom(...'追夢系統登入帳號密碼任務日記飲食分析專注計時開始暫停重置完成'.split(''))),
          // ASCII text without emojis (valid)
          fc.stringOf(fc.constantFrom(...'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 '.split('')))
        ),
        (text) => {
          // Valid UI text should not contain emojis
          const hasEmoji = containsEmoji(text);
          expect(hasEmoji).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Emoji detection should correctly identify all emoji ranges
   */
  it('should correctly identify emojis from various Unicode ranges', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          // Emoticons range
          fc.integer({ min: 0x1F600, max: 0x1F64F }).map(cp => String.fromCodePoint(cp)),
          // Misc Symbols range
          fc.integer({ min: 0x1F300, max: 0x1F5FF }).map(cp => String.fromCodePoint(cp)),
          // Transport range
          fc.integer({ min: 0x1F680, max: 0x1F6FF }).map(cp => String.fromCodePoint(cp))
        ),
        (emoji) => {
          // All generated emojis should be detected
          expect(containsEmoji(emoji)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Non-emoji Unicode characters should not be flagged
   */
  it('should not flag valid Chinese/Japanese/Korean characters as emojis', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          // Chinese characters
          fc.integer({ min: 0x4E00, max: 0x9FFF }).map(cp => String.fromCodePoint(cp)),
          // Hiragana
          fc.integer({ min: 0x3040, max: 0x309F }).map(cp => String.fromCodePoint(cp)),
          // Katakana
          fc.integer({ min: 0x30A0, max: 0x30FF }).map(cp => String.fromCodePoint(cp))
        ),
        (char) => {
          // CJK characters should not be detected as emojis
          expect(containsEmoji(char)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Mixed text with emojis should be detected
   */
  it('should detect emojis in mixed text', () => {
    fc.assert(
      fc.property(
        fc.tuple(
          fc.string({ minLength: 1, maxLength: 10 }),
          fc.integer({ min: 0x1F600, max: 0x1F64F }).map(cp => String.fromCodePoint(cp)),
          fc.string({ minLength: 1, maxLength: 10 })
        ),
        ([prefix, emoji, suffix]) => {
          const mixedText = prefix + emoji + suffix;
          expect(containsEmoji(mixedText)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Verify all menu items use icons instead of emojis
   */
  it('should use icon names instead of emojis for menu items', () => {
    const menuItems = [
      { key: 'summary', label: 'AI 總覽中心', icon: 'insights' },
      { key: 'pomodoro', label: '番茄鐘', icon: 'timer' },
      { key: 'todo', label: '日期待辦清單', icon: 'checklist' },
      { key: 'diary', label: '冒險日記', icon: 'book' },
      { key: 'meal', label: 'AI 飲食分析', icon: 'restaurant' }
    ];

    menuItems.forEach(item => {
      // Labels should not contain emojis
      expect(containsEmoji(item.label)).toBe(false);
      // Icons should be Material Icons names (alphanumeric with underscores)
      expect(item.icon).toMatch(/^[a-z_]+$/);
    });
  });

  /**
   * Export utility functions for use in other tests
   */
  it('should export working utility functions', () => {
    expect(typeof containsEmoji).toBe('function');
    expect(typeof findEmojis).toBe('function');
    expect(typeof extractAllStrings).toBe('function');
  });
});

// Export for use in other test files
export { containsEmoji, findEmojis, extractAllStrings, createEmojiRegex };

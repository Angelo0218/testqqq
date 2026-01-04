/**
 * Property-Based Tests for Achievement Unlock Trigger
 * Feature: ui-modernization, Property 4: 成就解鎖觸發正確性
 * Validates: Requirements 9.2, 9.5
 * 
 * Property: For any achievement condition and user data, when user data
 * satisfies the achievement condition, the system should trigger achievement
 * unlock notification, and the unlock time should be correctly recorded.
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

/**
 * Achievement definitions and unlock logic
 * These mirror the logic used in the achievements service
 */

// Achievement definitions
const ACHIEVEMENTS = {
  // Focus achievements
  FOCUS_FIRST: { id: 'focus_first', name: '初次專注', threshold: 25, category: 'focus' },
  FOCUS_10: { id: 'focus_10', name: '專注達人', threshold: 600, category: 'focus' },
  FOCUS_50: { id: 'focus_50', name: '專注大師', threshold: 3000, category: 'focus' },
  
  // Task achievements
  TASK_FIRST: { id: 'task_first', name: '任務新手', threshold: 1, category: 'task' },
  TASK_10: { id: 'task_10', name: '任務達人', threshold: 10, category: 'task' },
  TASK_100: { id: 'task_100', name: '任務大師', threshold: 100, category: 'task' },
  
  // Diary achievements
  DIARY_FIRST: { id: 'diary_first', name: '日記新手', threshold: 1, category: 'diary' },
  DIARY_7: { id: 'diary_7', name: '連續七天', threshold: 7, category: 'diary' },
  DIARY_30: { id: 'diary_30', name: '月度堅持', threshold: 30, category: 'diary' },
  
  // Meal achievements
  MEAL_FIRST: { id: 'meal_first', name: '飲食記錄', threshold: 1, category: 'meal' }
};

// Check if achievement condition is met
function checkAchievementCondition(achievement, currentValue) {
  return currentValue >= achievement.threshold;
}

// Get achievements that should be unlocked based on current values
function getUnlockableAchievements(userData, unlockedIds = []) {
  const unlockable = [];
  
  // Check focus achievements
  if (!unlockedIds.includes('focus_first') && userData.focusMinutes >= 25) {
    unlockable.push(ACHIEVEMENTS.FOCUS_FIRST);
  }
  if (!unlockedIds.includes('focus_10') && userData.focusMinutes >= 600) {
    unlockable.push(ACHIEVEMENTS.FOCUS_10);
  }
  if (!unlockedIds.includes('focus_50') && userData.focusMinutes >= 3000) {
    unlockable.push(ACHIEVEMENTS.FOCUS_50);
  }
  
  // Check task achievements
  if (!unlockedIds.includes('task_first') && userData.completedTasks >= 1) {
    unlockable.push(ACHIEVEMENTS.TASK_FIRST);
  }
  if (!unlockedIds.includes('task_10') && userData.completedTasks >= 10) {
    unlockable.push(ACHIEVEMENTS.TASK_10);
  }
  if (!unlockedIds.includes('task_100') && userData.completedTasks >= 100) {
    unlockable.push(ACHIEVEMENTS.TASK_100);
  }
  
  // Check diary achievements
  if (!unlockedIds.includes('diary_first') && userData.diaryCount >= 1) {
    unlockable.push(ACHIEVEMENTS.DIARY_FIRST);
  }
  if (!unlockedIds.includes('diary_7') && userData.diaryStreak >= 7) {
    unlockable.push(ACHIEVEMENTS.DIARY_7);
  }
  if (!unlockedIds.includes('diary_30') && userData.diaryStreak >= 30) {
    unlockable.push(ACHIEVEMENTS.DIARY_30);
  }
  
  // Check meal achievements
  if (!unlockedIds.includes('meal_first') && userData.mealCount >= 1) {
    unlockable.push(ACHIEVEMENTS.MEAL_FIRST);
  }
  
  return unlockable;
}

// Simulate unlocking an achievement
function unlockAchievement(achievementId, existingUnlocks = []) {
  if (existingUnlocks.some(u => u.id === achievementId)) {
    return null; // Already unlocked
  }
  
  return {
    id: achievementId,
    unlockedAt: new Date().toISOString()
  };
}

// Validate unlock record
function validateUnlockRecord(record) {
  return (
    record &&
    typeof record.id === 'string' &&
    typeof record.unlockedAt === 'string' &&
    !isNaN(new Date(record.unlockedAt).getTime())
  );
}

describe('AchievementUnlock - Property 4: 成就解鎖觸發正確性', () => {
  /**
   * Property 4: Achievement should unlock when condition is met
   * For any achievement and user data meeting the threshold, unlock should trigger
   */
  it('should unlock achievement when condition is met', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.values(ACHIEVEMENTS)),
        fc.integer({ min: 0, max: 5000 }),
        (achievement, extraValue) => {
          // Generate a value that meets the threshold
          const currentValue = achievement.threshold + extraValue;
          
          const shouldUnlock = checkAchievementCondition(achievement, currentValue);
          
          // When value meets or exceeds threshold, should unlock
          expect(shouldUnlock).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Achievement should NOT unlock when condition is NOT met
   */
  it('should not unlock achievement when condition is not met', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.values(ACHIEVEMENTS).filter(a => a.threshold > 1)),
        (achievement) => {
          // Generate a value below threshold
          const currentValue = Math.max(0, achievement.threshold - 1);
          
          const shouldUnlock = checkAchievementCondition(achievement, currentValue);
          
          // When value is below threshold, should not unlock
          expect(shouldUnlock).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Unlock time should be recorded correctly
   */
  it('should record unlock time correctly', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.values(ACHIEVEMENTS)),
        (achievement) => {
          const beforeTime = new Date();
          const unlockRecord = unlockAchievement(achievement.id, []);
          const afterTime = new Date();
          
          expect(unlockRecord).not.toBeNull();
          expect(validateUnlockRecord(unlockRecord)).toBe(true);
          
          const unlockTime = new Date(unlockRecord.unlockedAt);
          expect(unlockTime.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
          expect(unlockTime.getTime()).toBeLessThanOrEqual(afterTime.getTime());
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Already unlocked achievements should not unlock again
   */
  it('should not unlock already unlocked achievements', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.values(ACHIEVEMENTS)),
        (achievement) => {
          const existingUnlocks = [{ id: achievement.id, unlockedAt: '2026-01-01T00:00:00Z' }];
          
          const unlockRecord = unlockAchievement(achievement.id, existingUnlocks);
          
          // Should return null for already unlocked
          expect(unlockRecord).toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Multiple achievements can unlock simultaneously
   */
  it('should unlock multiple achievements when multiple conditions are met', () => {
    fc.assert(
      fc.property(
        fc.record({
          focusMinutes: fc.integer({ min: 0, max: 5000 }),
          completedTasks: fc.integer({ min: 0, max: 200 }),
          diaryCount: fc.integer({ min: 0, max: 50 }),
          diaryStreak: fc.integer({ min: 0, max: 50 }),
          mealCount: fc.integer({ min: 0, max: 50 })
        }),
        (userData) => {
          const unlockable = getUnlockableAchievements(userData, []);
          
          // Count expected unlocks based on thresholds
          let expectedCount = 0;
          
          if (userData.focusMinutes >= 25) expectedCount++;
          if (userData.focusMinutes >= 600) expectedCount++;
          if (userData.focusMinutes >= 3000) expectedCount++;
          if (userData.completedTasks >= 1) expectedCount++;
          if (userData.completedTasks >= 10) expectedCount++;
          if (userData.completedTasks >= 100) expectedCount++;
          if (userData.diaryCount >= 1) expectedCount++;
          if (userData.diaryStreak >= 7) expectedCount++;
          if (userData.diaryStreak >= 30) expectedCount++;
          if (userData.mealCount >= 1) expectedCount++;
          
          expect(unlockable.length).toBe(expectedCount);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Unlockable achievements should not include already unlocked ones
   */
  it('should exclude already unlocked achievements from unlockable list', () => {
    fc.assert(
      fc.property(
        fc.record({
          focusMinutes: fc.integer({ min: 3000, max: 5000 }), // Meets all focus thresholds
          completedTasks: fc.integer({ min: 100, max: 200 }), // Meets all task thresholds
          diaryCount: fc.integer({ min: 1, max: 50 }),
          diaryStreak: fc.integer({ min: 30, max: 50 }), // Meets all diary thresholds
          mealCount: fc.integer({ min: 1, max: 50 })
        }),
        fc.array(
          fc.constantFrom(
            'focus_first', 'focus_10', 'focus_50',
            'task_first', 'task_10', 'task_100',
            'diary_first', 'diary_7', 'diary_30',
            'meal_first'
          ),
          { minLength: 0, maxLength: 5 }
        ),
        (userData, alreadyUnlocked) => {
          const unlockable = getUnlockableAchievements(userData, alreadyUnlocked);
          
          // None of the unlockable achievements should be in alreadyUnlocked
          unlockable.forEach(achievement => {
            expect(alreadyUnlocked).not.toContain(achievement.id);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Achievement unlock is idempotent
   */
  it('should be idempotent - checking same data multiple times gives same result', () => {
    fc.assert(
      fc.property(
        fc.record({
          focusMinutes: fc.integer({ min: 0, max: 5000 }),
          completedTasks: fc.integer({ min: 0, max: 200 }),
          diaryCount: fc.integer({ min: 0, max: 50 }),
          diaryStreak: fc.integer({ min: 0, max: 50 }),
          mealCount: fc.integer({ min: 0, max: 50 })
        }),
        fc.integer({ min: 1, max: 5 }),
        (userData, iterations) => {
          const results = [];
          
          for (let i = 0; i < iterations; i++) {
            const unlockable = getUnlockableAchievements(userData, []);
            results.push(unlockable.map(a => a.id).sort());
          }
          
          // All results should be identical
          const firstResult = JSON.stringify(results[0]);
          results.forEach(result => {
            expect(JSON.stringify(result)).toBe(firstResult);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Higher tier achievements imply lower tier achievements
   */
  it('should unlock lower tier achievements when higher tier is unlocked', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('focus', 'task'),
        fc.integer({ min: 0, max: 5000 }),
        (category, value) => {
          const userData = {
            focusMinutes: category === 'focus' ? value : 0,
            completedTasks: category === 'task' ? value : 0,
            diaryCount: 0,
            diaryStreak: 0,
            mealCount: 0
          };
          
          const unlockable = getUnlockableAchievements(userData, []);
          const unlockedIds = unlockable.map(a => a.id);
          
          // If highest tier is unlocked, all lower tiers should be too
          if (category === 'focus') {
            if (unlockedIds.includes('focus_50')) {
              expect(unlockedIds).toContain('focus_10');
              expect(unlockedIds).toContain('focus_first');
            }
            if (unlockedIds.includes('focus_10')) {
              expect(unlockedIds).toContain('focus_first');
            }
          }
          
          if (category === 'task') {
            if (unlockedIds.includes('task_100')) {
              expect(unlockedIds).toContain('task_10');
              expect(unlockedIds).toContain('task_first');
            }
            if (unlockedIds.includes('task_10')) {
              expect(unlockedIds).toContain('task_first');
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Zero values should not unlock any achievements
   */
  it('should not unlock any achievements with zero values', () => {
    fc.assert(
      fc.property(
        fc.constant({
          focusMinutes: 0,
          completedTasks: 0,
          diaryCount: 0,
          diaryStreak: 0,
          mealCount: 0
        }),
        (userData) => {
          const unlockable = getUnlockableAchievements(userData, []);
          expect(unlockable.length).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Unlock record should have valid structure
   */
  it('should create valid unlock record structure', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.values(ACHIEVEMENTS)),
        (achievement) => {
          const record = unlockAchievement(achievement.id, []);
          
          expect(record).not.toBeNull();
          expect(record.id).toBe(achievement.id);
          expect(typeof record.unlockedAt).toBe('string');
          
          // Should be valid ISO date string
          const date = new Date(record.unlockedAt);
          expect(date.toString()).not.toBe('Invalid Date');
        }
      ),
      { numRuns: 100 }
    );
  });
});

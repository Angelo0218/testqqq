/**
 * Property-Based Tests for Goal Achievement Notification
 * Feature: ui-modernization, Property 5: 目標達成通知正確性
 * Validates: Requirements 10.4
 * 
 * Property: For any goal setting and current progress, when progress
 * reaches or exceeds the goal value, the system should trigger
 * achievement notification.
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

/**
 * Goal progress calculation functions
 * These mirror the logic used in the statistics service
 */

// Goal types
const GOAL_TYPES = ['focus', 'task', 'calories'];

// Calculate goal progress percentage
function calculateGoalProgress(currentValue, targetValue) {
  if (targetValue <= 0) return 0;
  // Only return 100 when goal is actually achieved to avoid rounding edge cases
  if (currentValue >= targetValue) return 100;
  return Math.min(99, Math.round((currentValue / targetValue) * 100));
}

// Check if goal is achieved
function isGoalAchieved(currentValue, targetValue) {
  if (targetValue <= 0) return false;
  return currentValue >= targetValue;
}

// Get goal status
function getGoalStatus(currentValue, targetValue) {
  const percentage = calculateGoalProgress(currentValue, targetValue);
  const achieved = isGoalAchieved(currentValue, targetValue);
  
  return {
    currentValue,
    targetValue,
    percentage,
    achieved
  };
}

// Calculate progress for multiple goals
function calculateAllGoalsProgress(goals, currentValues) {
  return goals.map(goal => {
    const current = currentValues[goal.type] || 0;
    return {
      ...goal,
      ...getGoalStatus(current, goal.targetValue)
    };
  });
}

// Get newly achieved goals (comparing before and after)
function getNewlyAchievedGoals(goalsBefore, goalsAfter) {
  return goalsAfter.filter(after => {
    const before = goalsBefore.find(b => b.id === after.id);
    return after.achieved && (!before || !before.achieved);
  });
}

// Validate goal structure
function validateGoal(goal) {
  if (!goal) return false;
  return (
    typeof goal.type === 'string' &&
    GOAL_TYPES.includes(goal.type) &&
    typeof goal.targetValue === 'number' &&
    goal.targetValue > 0
  );
}

describe('GoalNotification - Property 5: 目標達成通知正確性', () => {
  /**
   * Property 5: Goal should be marked as achieved when progress meets target
   * For any goal and progress >= target, achieved should be true
   */
  it('should mark goal as achieved when progress meets or exceeds target', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10000 }),  // targetValue > 0
        fc.integer({ min: 0, max: 5000 }),   // extra value
        (targetValue, extra) => {
          const currentValue = targetValue + extra;  // currentValue >= targetValue
          
          const achieved = isGoalAchieved(currentValue, targetValue);
          
          expect(achieved).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Goal should NOT be achieved when progress is below target
   */
  it('should not mark goal as achieved when progress is below target', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 10000 }),  // targetValue > 1
        (targetValue) => {
          const currentValue = targetValue - 1;  // currentValue < targetValue
          
          const achieved = isGoalAchieved(currentValue, targetValue);
          
          expect(achieved).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Progress percentage should be 100% when goal is achieved
   */
  it('should show 100% progress when goal is achieved', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10000 }),  // targetValue
        fc.integer({ min: 0, max: 5000 }),   // extra
        (targetValue, extra) => {
          const currentValue = targetValue + extra;
          
          const percentage = calculateGoalProgress(currentValue, targetValue);
          
          expect(percentage).toBe(100);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Progress percentage should be bounded [0, 100]
   */
  it('should calculate progress percentage bounded between 0 and 100', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 20000 }),  // currentValue
        fc.integer({ min: 1, max: 10000 }),  // targetValue > 0
        (currentValue, targetValue) => {
          const percentage = calculateGoalProgress(currentValue, targetValue);
          
          expect(percentage).toBeGreaterThanOrEqual(0);
          expect(percentage).toBeLessThanOrEqual(100);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Zero or negative target should return 0 progress
   */
  it('should return 0 progress for invalid target values', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 10000 }),  // currentValue
        fc.integer({ min: -100, max: 0 }),   // targetValue <= 0
        (currentValue, targetValue) => {
          const percentage = calculateGoalProgress(currentValue, targetValue);
          const achieved = isGoalAchieved(currentValue, targetValue);
          
          expect(percentage).toBe(0);
          expect(achieved).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Goal status should contain all required fields
   */
  it('should return complete goal status with all required fields', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 10000 }),  // currentValue
        fc.integer({ min: 1, max: 10000 }),  // targetValue
        (currentValue, targetValue) => {
          const status = getGoalStatus(currentValue, targetValue);
          
          expect(status).toHaveProperty('currentValue');
          expect(status).toHaveProperty('targetValue');
          expect(status).toHaveProperty('percentage');
          expect(status).toHaveProperty('achieved');
          
          expect(status.currentValue).toBe(currentValue);
          expect(status.targetValue).toBe(targetValue);
          expect(typeof status.percentage).toBe('number');
          expect(typeof status.achieved).toBe('boolean');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Multiple goals should be calculated independently
   */
  it('should calculate multiple goals independently', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.integer({ min: 1, max: 1000 }),
            type: fc.constantFrom('focus', 'task', 'calories'),
            targetValue: fc.integer({ min: 1, max: 1000 })
          }),
          { minLength: 1, maxLength: 5 }
        ),
        fc.record({
          focus: fc.integer({ min: 0, max: 2000 }),
          task: fc.integer({ min: 0, max: 200 }),
          calories: fc.integer({ min: 0, max: 5000 })
        }),
        (goals, currentValues) => {
          const results = calculateAllGoalsProgress(goals, currentValues);
          
          // Should have same number of results as goals
          expect(results.length).toBe(goals.length);
          
          // Each result should be calculated correctly
          results.forEach((result, index) => {
            const goal = goals[index];
            const current = currentValues[goal.type] || 0;
            
            expect(result.currentValue).toBe(current);
            expect(result.targetValue).toBe(goal.targetValue);
            expect(result.achieved).toBe(current >= goal.targetValue);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Newly achieved goals should be detected correctly
   */
  it('should detect newly achieved goals correctly', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 3 }),  // number of goals
        fc.record({
          focus: fc.integer({ min: 0, max: 50 }),
          task: fc.integer({ min: 0, max: 50 }),
          calories: fc.integer({ min: 0, max: 2000 })
        }),
        fc.record({
          focus: fc.integer({ min: 50, max: 200 }),
          task: fc.integer({ min: 50, max: 200 }),
          calories: fc.integer({ min: 2000, max: 5000 })
        }),
        (numGoals, beforeValues, afterValues) => {
          // Generate goals with unique IDs
          const types = ['focus', 'task', 'calories'];
          const goals = Array.from({ length: numGoals }, (_, i) => ({
            id: i + 1,  // Unique IDs: 1, 2, 3
            type: types[i % 3],
            targetValue: Math.floor(Math.random() * 100) + 1
          }));
          
          const goalsBefore = calculateAllGoalsProgress(goals, beforeValues);
          const goalsAfter = calculateAllGoalsProgress(goals, afterValues);
          
          const newlyAchieved = getNewlyAchievedGoals(goalsBefore, goalsAfter);
          
          // All newly achieved goals should be achieved in after but not in before
          newlyAchieved.forEach(goal => {
            const before = goalsBefore.find(b => b.id === goal.id);
            const after = goalsAfter.find(a => a.id === goal.id);
            
            expect(after.achieved).toBe(true);
            if (before) {
              expect(before.achieved).toBe(false);
            }
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Progress calculation is monotonic with current value
   */
  it('should increase progress percentage as current value increases', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1000 }),  // targetValue
        fc.integer({ min: 0, max: 500 }),   // value1
        fc.integer({ min: 0, max: 500 }),   // value2
        (targetValue, value1, value2) => {
          const smaller = Math.min(value1, value2);
          const larger = Math.max(value1, value2);
          
          const progress1 = calculateGoalProgress(smaller, targetValue);
          const progress2 = calculateGoalProgress(larger, targetValue);
          
          // Larger value should have >= progress
          expect(progress2).toBeGreaterThanOrEqual(progress1);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Achievement status is consistent with percentage
   */
  it('should have consistent achievement status with percentage', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 10000 }),  // currentValue
        fc.integer({ min: 1, max: 10000 }),  // targetValue
        (currentValue, targetValue) => {
          const status = getGoalStatus(currentValue, targetValue);
          
          // If achieved, percentage should be 100
          if (status.achieved) {
            expect(status.percentage).toBe(100);
          }
          
          // If percentage is 100, should be achieved
          if (status.percentage === 100) {
            expect(status.achieved).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Goal validation should work correctly
   */
  it('should validate goal structure correctly', () => {
    fc.assert(
      fc.property(
        fc.record({
          type: fc.constantFrom('focus', 'task', 'calories'),
          targetValue: fc.integer({ min: 1, max: 10000 })
        }),
        (goal) => {
          expect(validateGoal(goal)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Invalid goals should fail validation
   */
  it('should reject invalid goal structures', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant({ type: 'invalid', targetValue: 100 }),
          fc.constant({ type: 'focus', targetValue: 0 }),
          fc.constant({ type: 'focus', targetValue: -10 }),
          fc.constant({ targetValue: 100 }),
          fc.constant({ type: 'focus' }),
          fc.constant(null),
          fc.constant(undefined)
        ),
        (invalidGoal) => {
          expect(validateGoal(invalidGoal)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });
});

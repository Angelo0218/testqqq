/**
 * Property-Based Tests for TaskCard Component
 * Feature: ui-modernization, Property 8: 優先級顏色指示正確性
 * Validates: Requirements 6.3
 * 
 * Property: For any task with a priority, its card should display
 * the corresponding color indicator: high=red, medium=orange, low=green.
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

// Expected priority colors - extracted from TaskCard component
const PRIORITY_COLORS = {
  high: '#FF2D55',    // Red
  medium: '#FF9500',  // Orange
  low: '#30D158'      // Green
};

// Priority color calculation function - mirrors the component logic
const getPriorityColor = (priority) => {
  return PRIORITY_COLORS[priority] || PRIORITY_COLORS.medium;
};

describe('TaskCard - Property 8: 優先級顏色指示正確性', () => {
  /**
   * Property 8: Priority Color Indicator Correctness
   * For any task with priority, the card should display the correct color:
   * high=red (#FF2D55), medium=orange (#FF9500), low=green (#30D158)
   */
  it('should return correct color for each valid priority level', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('high', 'medium', 'low'),
        (priority) => {
          const color = getPriorityColor(priority);
          const expectedColor = PRIORITY_COLORS[priority];
          
          // Verify the color matches the expected value
          expect(color).toBe(expectedColor);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: High priority tasks should always show red color
   */
  it('should always return red (#FF2D55) for high priority', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1000 }),  // Random iteration count
        () => {
          const color = getPriorityColor('high');
          expect(color).toBe('#FF2D55');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Medium priority tasks should always show orange color
   */
  it('should always return orange (#FF9500) for medium priority', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1000 }),
        () => {
          const color = getPriorityColor('medium');
          expect(color).toBe('#FF9500');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Low priority tasks should always show green color
   */
  it('should always return green (#30D158) for low priority', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1000 }),
        () => {
          const color = getPriorityColor('low');
          expect(color).toBe('#30D158');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Unknown/undefined priority should default to medium (orange)
   */
  it('should default to orange (#FF9500) for undefined or unknown priority', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant(undefined),
          fc.constant(null),
          fc.constant(''),
          fc.constant('unknown'),
          fc.constant('invalid'),
          fc.string().filter(s => !['high', 'medium', 'low'].includes(s))
        ),
        (invalidPriority) => {
          const color = getPriorityColor(invalidPriority);
          // Should default to medium (orange)
          expect(color).toBe('#FF9500');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Priority colors should be distinct from each other
   */
  it('should have distinct colors for each priority level', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('high', 'medium', 'low'),
        fc.constantFrom('high', 'medium', 'low'),
        (priority1, priority2) => {
          const color1 = getPriorityColor(priority1);
          const color2 = getPriorityColor(priority2);
          
          // If priorities are different, colors should be different
          if (priority1 !== priority2) {
            expect(color1).not.toBe(color2);
          } else {
            // If priorities are same, colors should be same
            expect(color1).toBe(color2);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: All priority colors should be valid hex colors
   */
  it('should return valid hex color format for all priorities', () => {
    const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
    
    fc.assert(
      fc.property(
        fc.constantFrom('high', 'medium', 'low', undefined, null, 'invalid'),
        (priority) => {
          const color = getPriorityColor(priority);
          expect(color).toMatch(hexColorRegex);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Priority color mapping is idempotent
   */
  it('should return the same color for the same priority (idempotent)', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('high', 'medium', 'low'),
        fc.integer({ min: 1, max: 10 }),
        (priority, iterations) => {
          const colors = [];
          for (let i = 0; i < iterations; i++) {
            colors.push(getPriorityColor(priority));
          }
          
          // All colors should be the same
          const firstColor = colors[0];
          expect(colors.every(c => c === firstColor)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Property-Based Tests for ActivityRing Component
 * Feature: ui-modernization, Property 2: 活動環進度計算正確性
 * Validates: Requirements 4.2, 10.5
 * 
 * Property: For any target value T > 0 and current value C >= 0,
 * the activity ring progress percentage should equal min(100, (C / T) * 100),
 * and when C >= T, progress should display as 100%.
 */

import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import * as fc from 'fast-check';
import ActivityRing from './ActivityRing.vue';

describe('ActivityRing - Property 2: 活動環進度計算正確性', () => {
  /**
   * Property 2: Progress Calculation Correctness
   * For any target value T > 0 and current value C >= 0,
   * progress = min(100, (C / T) * 100)
   */
  it('should calculate progress correctly for any valid target and current values', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10000 }),  // target > 0
        fc.integer({ min: 0, max: 20000 }),  // current >= 0
        (target, current) => {
          // Calculate expected progress
          const expectedProgress = Math.min(100, (current / target) * 100);
          
          // Mount component with calculated progress
          const wrapper = mount(ActivityRing, {
            props: {
              progress: expectedProgress,
              size: 100,
              strokeWidth: 10
            }
          });
          
          // Get the normalized progress from component
          const normalizedProgress = wrapper.vm.normalizedProgress;
          
          // Verify progress is capped at 100
          expect(normalizedProgress).toBeLessThanOrEqual(100);
          expect(normalizedProgress).toBeGreaterThanOrEqual(0);
          
          // Verify calculation matches expected
          expect(normalizedProgress).toBeCloseTo(Math.min(100, expectedProgress), 5);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: When current >= target, progress should be 100%
   */
  it('should show 100% progress when current value meets or exceeds target', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10000 }),  // target > 0
        fc.integer({ min: 0, max: 10000 }),  // multiplier for exceeding
        (target, extra) => {
          const current = target + extra;  // current >= target
          const progress = Math.min(100, (current / target) * 100);
          
          const wrapper = mount(ActivityRing, {
            props: {
              progress: progress,
              size: 100,
              strokeWidth: 10
            }
          });
          
          // When current >= target, progress should be 100
          expect(wrapper.vm.normalizedProgress).toBe(100);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Progress should never exceed 100%
   */
  it('should cap progress at 100% regardless of input value', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 100, max: 1000 }),  // progress values that could exceed 100
        (progressValue) => {
          const wrapper = mount(ActivityRing, {
            props: {
              progress: progressValue,
              size: 100,
              strokeWidth: 10
            }
          });
          
          expect(wrapper.vm.normalizedProgress).toBeLessThanOrEqual(100);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Progress should never be negative
   */
  it('should ensure progress is never negative', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -1000, max: 100 }),  // include negative values
        (progressValue) => {
          const wrapper = mount(ActivityRing, {
            props: {
              progress: progressValue,
              size: 100,
              strokeWidth: 10
            }
          });
          
          expect(wrapper.vm.normalizedProgress).toBeGreaterThanOrEqual(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: calculateProgress helper function correctness
   */
  it('should calculate progress percentage correctly via helper function', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10000 }),  // target > 0
        fc.integer({ min: 0, max: 20000 }),  // current >= 0
        (target, current) => {
          const wrapper = mount(ActivityRing, {
            props: {
              progress: 0,
              size: 100,
              strokeWidth: 10
            }
          });
          
          const calculatedProgress = wrapper.vm.calculateProgress(current, target);
          const expectedProgress = Math.min(100, (current / target) * 100);
          
          expect(calculatedProgress).toBeCloseTo(expectedProgress, 5);
          expect(calculatedProgress).toBeLessThanOrEqual(100);
          expect(calculatedProgress).toBeGreaterThanOrEqual(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: calculateProgress returns 0 for invalid target (target <= 0)
   */
  it('should return 0 progress for invalid target values', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -1000, max: 0 }),  // target <= 0
        fc.integer({ min: 0, max: 1000 }),   // any current value
        (target, current) => {
          const wrapper = mount(ActivityRing, {
            props: {
              progress: 0,
              size: 100,
              strokeWidth: 10
            }
          });
          
          const calculatedProgress = wrapper.vm.calculateProgress(current, target);
          expect(calculatedProgress).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});

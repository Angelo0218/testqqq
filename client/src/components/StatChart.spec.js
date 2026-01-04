/**
 * Property-Based Tests for StatChart Component
 * Feature: ui-modernization, Property 3: 統計趨勢計算正確性
 * Validates: Requirements 8.3, 8.4, 8.5
 * 
 * Property: For any data set within a time range, the statistics module's
 * calculated trend values (sum, average, completion rate) should match
 * the mathematical calculation results of the original data.
 */

import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import * as fc from 'fast-check';
import StatChart from './StatChart.vue';

/**
 * Statistics calculation functions - mirrors the logic used in statistics service
 */

// Calculate sum of trend data
function calculateTrendSum(data) {
  if (!data || data.length === 0) return 0;
  return data.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
}

// Calculate average of trend data
function calculateTrendAverage(data) {
  if (!data || data.length === 0) return 0;
  const sum = data.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
  return sum / data.length;
}

// Calculate completion rate
function calculateCompletionRate(completed, total) {
  if (total <= 0) return 0;
  return Math.round((completed / total) * 100);
}

// Calculate daily average (only counting days with data)
function calculateDailyAverage(data) {
  if (!data || data.length === 0) return 0;
  const daysWithData = data.filter(d => d.value > 0);
  if (daysWithData.length === 0) return 0;
  const sum = daysWithData.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
  return Math.round(sum / daysWithData.length);
}

describe('StatChart - Property 3: 統計趨勢計算正確性', () => {
  /**
   * Property 3: Trend Sum Calculation Correctness
   * For any data set, the calculated sum should equal the mathematical sum
   */
  it('should calculate trend sum correctly for any data set', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            label: fc.string({ minLength: 1, maxLength: 10 }),
            value: fc.integer({ min: 0, max: 10000 })
          }),
          { minLength: 0, maxLength: 30 }
        ),
        (data) => {
          const wrapper = mount(StatChart, {
            props: {
              type: 'bar',
              data: data,
              color: '#FF2D55'
            }
          });
          
          // Calculate expected sum
          const expectedSum = data.reduce((sum, item) => sum + (item.value || 0), 0);
          
          // Use component's calculation function
          const calculatedSum = wrapper.vm.calculateTrendSum(data);
          
          expect(calculatedSum).toBe(expectedSum);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Trend Average Calculation Correctness
   * For any non-empty data set, average = sum / count
   */
  it('should calculate trend average correctly for any data set', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            label: fc.string({ minLength: 1, maxLength: 10 }),
            value: fc.integer({ min: 0, max: 10000 })
          }),
          { minLength: 1, maxLength: 30 }
        ),
        (data) => {
          const wrapper = mount(StatChart, {
            props: {
              type: 'line',
              data: data,
              color: '#30D158'
            }
          });
          
          // Calculate expected average
          const sum = data.reduce((sum, item) => sum + (item.value || 0), 0);
          const expectedAverage = sum / data.length;
          
          // Use component's calculation function
          const calculatedAverage = wrapper.vm.calculateTrendAverage(data);
          
          expect(calculatedAverage).toBeCloseTo(expectedAverage, 5);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Completion Rate Calculation Correctness
   * For any completed/total pair, rate = round((completed/total) * 100)
   */
  it('should calculate completion rate correctly', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 1000 }),  // completed
        fc.integer({ min: 1, max: 1000 }),  // total > 0
        (completed, total) => {
          // Ensure completed <= total for realistic scenario
          const actualCompleted = Math.min(completed, total);
          
          const wrapper = mount(StatChart, {
            props: {
              type: 'ring',
              data: [],
              color: '#0A84FF'
            }
          });
          
          // Calculate expected rate
          const expectedRate = Math.round((actualCompleted / total) * 100);
          
          // Use component's calculation function
          const calculatedRate = wrapper.vm.calculateCompletionRate(actualCompleted, total);
          
          expect(calculatedRate).toBe(expectedRate);
          expect(calculatedRate).toBeGreaterThanOrEqual(0);
          expect(calculatedRate).toBeLessThanOrEqual(100);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Sum should be non-negative for non-negative inputs
   */
  it('should return non-negative sum for non-negative data', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            label: fc.string({ minLength: 1, maxLength: 10 }),
            value: fc.integer({ min: 0, max: 10000 })
          }),
          { minLength: 0, maxLength: 30 }
        ),
        (data) => {
          const sum = calculateTrendSum(data);
          expect(sum).toBeGreaterThanOrEqual(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Average should be bounded by min and max values
   */
  it('should calculate average bounded by min and max values', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            label: fc.string({ minLength: 1, maxLength: 10 }),
            value: fc.integer({ min: 0, max: 10000 })
          }),
          { minLength: 1, maxLength: 30 }
        ),
        (data) => {
          const values = data.map(d => d.value);
          const minValue = Math.min(...values);
          const maxValue = Math.max(...values);
          const average = calculateTrendAverage(data);
          
          expect(average).toBeGreaterThanOrEqual(minValue);
          expect(average).toBeLessThanOrEqual(maxValue);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Empty data should return 0 for sum and average
   */
  it('should return 0 for empty data sets', () => {
    fc.assert(
      fc.property(
        fc.constant([]),
        (emptyData) => {
          const sum = calculateTrendSum(emptyData);
          const average = calculateTrendAverage(emptyData);
          
          expect(sum).toBe(0);
          expect(average).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Completion rate should be 0 for zero or negative total
   */
  it('should return 0 completion rate for invalid total', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 1000 }),  // completed
        fc.integer({ min: -100, max: 0 }),  // total <= 0
        (completed, total) => {
          const rate = calculateCompletionRate(completed, total);
          expect(rate).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Daily average calculation with days having data
   */
  it('should calculate daily average correctly (only days with data)', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            label: fc.string({ minLength: 1, maxLength: 10 }),
            value: fc.integer({ min: 0, max: 5000 })
          }),
          { minLength: 1, maxLength: 30 }
        ),
        (data) => {
          const daysWithData = data.filter(d => d.value > 0);
          
          if (daysWithData.length === 0) {
            expect(calculateDailyAverage(data)).toBe(0);
          } else {
            const sum = daysWithData.reduce((s, d) => s + d.value, 0);
            const expectedAverage = Math.round(sum / daysWithData.length);
            const calculatedAverage = calculateDailyAverage(data);
            
            expect(calculatedAverage).toBe(expectedAverage);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Normalized data should preserve all items
   */
  it('should normalize data while preserving all items', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            label: fc.string({ minLength: 1, maxLength: 10 }),
            value: fc.integer({ min: 0, max: 10000 })
          }),
          { minLength: 0, maxLength: 30 }
        ),
        (data) => {
          const wrapper = mount(StatChart, {
            props: {
              type: 'bar',
              data: data,
              color: '#FF2D55'
            }
          });
          
          const normalizedData = wrapper.vm.normalizedData;
          
          // Should have same length
          expect(normalizedData.length).toBe(data.length);
          
          // Each item should have label and value
          normalizedData.forEach((item, index) => {
            expect(item).toHaveProperty('label');
            expect(item).toHaveProperty('value');
            expect(typeof item.value).toBe('number');
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Max value should be the maximum of all values or 100 if empty
   */
  it('should calculate max value correctly for scaling', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            label: fc.string({ minLength: 1, maxLength: 10 }),
            value: fc.integer({ min: 0, max: 10000 })
          }),
          { minLength: 0, maxLength: 30 }
        ),
        (data) => {
          const wrapper = mount(StatChart, {
            props: {
              type: 'bar',
              data: data,
              color: '#FF2D55'
            }
          });
          
          const maxValue = wrapper.vm.maxValue;
          
          if (data.length === 0) {
            expect(maxValue).toBe(100);
          } else {
            const expectedMax = Math.max(...data.map(d => d.value));
            if (expectedMax > 0) {
              expect(maxValue).toBe(expectedMax);
            } else {
              expect(maxValue).toBe(100);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Line points should be calculated correctly
   */
  it('should calculate line points within chart bounds', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            label: fc.string({ minLength: 1, maxLength: 10 }),
            value: fc.integer({ min: 0, max: 10000 })
          }),
          { minLength: 2, maxLength: 10 }
        ),
        (data) => {
          const chartHeight = 200;
          const chartWidth = 300;
          const padding = 20;
          
          const wrapper = mount(StatChart, {
            props: {
              type: 'line',
              data: data,
              color: '#30D158',
              height: chartHeight,
              width: chartWidth
            }
          });
          
          const linePoints = wrapper.vm.linePoints;
          
          // Should have same number of points as data
          expect(linePoints.length).toBe(data.length);
          
          // All points should be within bounds
          linePoints.forEach(point => {
            expect(point.x).toBeGreaterThanOrEqual(padding);
            expect(point.x).toBeLessThanOrEqual(chartWidth - padding);
            expect(point.y).toBeGreaterThanOrEqual(padding);
            expect(point.y).toBeLessThanOrEqual(chartHeight - padding);
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});

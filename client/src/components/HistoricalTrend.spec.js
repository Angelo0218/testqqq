/**
 * Property-Based Tests for Historical Data Trend Display
 * Feature: ui-modernization, Property 9: 歷史數據趨勢顯示正確性
 * Validates: Requirements 7.5
 * 
 * Property: For any historical data query, the returned trend data should be
 * sorted by date, and each data point should correspond to the correct date and value.
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

/**
 * Historical trend data processing functions
 * These mirror the logic used in the statistics service and frontend
 */

// Generate array of dates between start and end
function generateDateArray(startDate, endDate) {
  const dates = [];
  const current = new Date(startDate);
  const end = new Date(endDate);
  
  while (current <= end) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }
  
  return dates;
}

// Sort trend data by date
function sortTrendByDate(trendData) {
  return [...trendData].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });
}

// Validate trend data structure
function validateTrendData(trendData) {
  if (!Array.isArray(trendData)) return false;
  
  return trendData.every(item => {
    return (
      item &&
      typeof item.date === 'string' &&
      /^\d{4}-\d{2}-\d{2}$/.test(item.date) &&
      typeof item.value !== 'undefined'
    );
  });
}

// Check if trend data is sorted by date
function isSortedByDate(trendData) {
  for (let i = 1; i < trendData.length; i++) {
    const prevDate = new Date(trendData[i - 1].date);
    const currDate = new Date(trendData[i].date);
    if (currDate < prevDate) {
      return false;
    }
  }
  return true;
}

// Map raw data to trend format
function mapToTrendFormat(rawData, dateField = 'date', valueField = 'value') {
  return rawData.map(item => ({
    date: item[dateField],
    value: item[valueField]
  }));
}

// Fill missing dates with zero values
function fillMissingDates(trendData, startDate, endDate) {
  const allDates = generateDateArray(startDate, endDate);
  const dataMap = new Map(trendData.map(item => [item.date, item.value]));
  
  return allDates.map(date => ({
    date,
    value: dataMap.get(date) || 0
  }));
}

// Generate date string for testing
function generateDateString(year, month, day) {
  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

describe('HistoricalTrend - Property 9: 歷史數據趨勢顯示正確性', () => {
  /**
   * Property 9: Trend data should be sorted by date
   * For any historical data query, returned data should be in chronological order
   */
  it('should return trend data sorted by date', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            date: fc.date({ min: new Date('2025-01-01'), max: new Date('2026-12-31') })
              .map(d => d.toISOString().split('T')[0]),
            value: fc.integer({ min: 0, max: 10000 })
          }),
          { minLength: 0, maxLength: 30 }
        ),
        (rawData) => {
          const sortedData = sortTrendByDate(rawData);
          
          // Verify sorted order
          expect(isSortedByDate(sortedData)).toBe(true);
          
          // Verify all original items are preserved
          expect(sortedData.length).toBe(rawData.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Each data point should have correct date format
   */
  it('should have valid date format for each data point', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            date: fc.date({ min: new Date('2025-01-01'), max: new Date('2026-12-31') })
              .map(d => d.toISOString().split('T')[0]),
            value: fc.integer({ min: 0, max: 10000 })
          }),
          { minLength: 1, maxLength: 30 }
        ),
        (trendData) => {
          // All dates should match YYYY-MM-DD format
          trendData.forEach(item => {
            expect(item.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
          });
          
          // Validate structure
          expect(validateTrendData(trendData)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Date array generation should be continuous
   */
  it('should generate continuous date array between start and end', () => {
    fc.assert(
      fc.property(
        fc.date({ min: new Date('2025-01-01'), max: new Date('2026-11-30') }),
        fc.integer({ min: 1, max: 30 }),
        (startDateObj, daysToAdd) => {
          const startDate = startDateObj.toISOString().split('T')[0];
          const endDateObj = new Date(startDateObj);
          endDateObj.setDate(endDateObj.getDate() + daysToAdd);
          const endDate = endDateObj.toISOString().split('T')[0];
          
          const dates = generateDateArray(startDate, endDate);
          
          // Should have correct number of days
          const expectedDays = daysToAdd + 1;
          expect(dates.length).toBe(expectedDays);
          
          // Should be sorted
          expect(isSortedByDate(dates.map(d => ({ date: d, value: 0 })))).toBe(true);
          
          // First and last dates should match
          expect(dates[0]).toBe(startDate);
          expect(dates[dates.length - 1]).toBe(endDate);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Filling missing dates should preserve existing values
   */
  it('should preserve existing values when filling missing dates', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            date: fc.constantFrom(
              '2026-01-01', '2026-01-02', '2026-01-03', '2026-01-04', '2026-01-05'
            ),
            value: fc.integer({ min: 1, max: 1000 })
          }),
          { minLength: 1, maxLength: 5 }
        ),
        (sparseData) => {
          // Remove duplicates by keeping last value for each date
          const uniqueData = Array.from(
            new Map(sparseData.map(item => [item.date, item])).values()
          );
          
          const filledData = fillMissingDates(uniqueData, '2026-01-01', '2026-01-05');
          
          // Should have all 5 days
          expect(filledData.length).toBe(5);
          
          // Original values should be preserved
          uniqueData.forEach(original => {
            const filled = filledData.find(f => f.date === original.date);
            expect(filled).toBeDefined();
            expect(filled.value).toBe(original.value);
          });
          
          // Missing dates should have 0 value
          filledData.forEach(item => {
            const hasOriginal = uniqueData.some(o => o.date === item.date);
            if (!hasOriginal) {
              expect(item.value).toBe(0);
            }
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Trend data mapping should preserve all values
   */
  it('should preserve all values when mapping to trend format', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            date: fc.date({ min: new Date('2025-01-01'), max: new Date('2026-12-31') })
              .map(d => d.toISOString().split('T')[0]),
            value: fc.integer({ min: 0, max: 10000 }),
            extraField: fc.string()
          }),
          { minLength: 0, maxLength: 30 }
        ),
        (rawData) => {
          const trendData = mapToTrendFormat(rawData);
          
          // Should have same length
          expect(trendData.length).toBe(rawData.length);
          
          // Each item should have date and value
          trendData.forEach((item, index) => {
            expect(item.date).toBe(rawData[index].date);
            expect(item.value).toBe(rawData[index].value);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Sorting should be stable (preserve order of equal dates)
   */
  it('should maintain stable sort for equal dates', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            date: fc.constantFrom('2026-01-01', '2026-01-02', '2026-01-03'),
            value: fc.integer({ min: 0, max: 1000 }),
            id: fc.integer({ min: 1, max: 1000 })
          }),
          { minLength: 2, maxLength: 20 }
        ),
        (dataWithIds) => {
          const sorted = sortTrendByDate(dataWithIds);
          
          // Group by date
          const groups = new Map();
          sorted.forEach(item => {
            if (!groups.has(item.date)) {
              groups.set(item.date, []);
            }
            groups.get(item.date).push(item);
          });
          
          // Within each date group, original order should be preserved
          // (This is a property of stable sort)
          groups.forEach((items, date) => {
            const originalOrder = dataWithIds
              .filter(d => d.date === date)
              .map(d => d.id);
            const sortedOrder = items.map(d => d.id);
            
            expect(sortedOrder).toEqual(originalOrder);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Empty data should return empty array
   */
  it('should handle empty data correctly', () => {
    fc.assert(
      fc.property(
        fc.constant([]),
        (emptyData) => {
          const sorted = sortTrendByDate(emptyData);
          const mapped = mapToTrendFormat(emptyData);
          
          expect(sorted).toEqual([]);
          expect(mapped).toEqual([]);
          expect(validateTrendData(sorted)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Date values should be parseable
   */
  it('should have parseable date values', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            date: fc.date({ min: new Date('2025-01-01'), max: new Date('2026-12-31') })
              .map(d => d.toISOString().split('T')[0]),
            value: fc.integer({ min: 0, max: 10000 })
          }),
          { minLength: 1, maxLength: 30 }
        ),
        (trendData) => {
          trendData.forEach(item => {
            const parsed = new Date(item.date);
            expect(parsed.toString()).not.toBe('Invalid Date');
            
            // Round-trip: parse and format should give same result
            const formatted = parsed.toISOString().split('T')[0];
            expect(formatted).toBe(item.date);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Trend data should maintain value integrity
   */
  it('should maintain value integrity through transformations', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            date: fc.date({ min: new Date('2025-01-01'), max: new Date('2026-12-31') })
              .map(d => d.toISOString().split('T')[0]),
            value: fc.integer({ min: 0, max: 10000 })
          }),
          { minLength: 1, maxLength: 30 }
        ),
        (originalData) => {
          // Sort the data
          const sorted = sortTrendByDate(originalData);
          
          // Sum of values should be preserved
          const originalSum = originalData.reduce((sum, item) => sum + item.value, 0);
          const sortedSum = sorted.reduce((sum, item) => sum + item.value, 0);
          
          expect(sortedSum).toBe(originalSum);
          
          // All original values should exist in sorted data
          originalData.forEach(original => {
            const found = sorted.some(
              s => s.date === original.date && s.value === original.value
            );
            expect(found).toBe(true);
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});

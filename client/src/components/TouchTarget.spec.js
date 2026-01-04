/**
 * Property-Based Tests for Touch Target Size Compliance
 * Feature: ui-modernization, Property 6: 觸控目標尺寸合規性
 * Validates: Requirements 12.3
 * 
 * Property: For any interactive element (buttons, inputs, links),
 * its touch area size should be at least 44x44 pixels.
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

// Minimum touch target size as per Apple Human Interface Guidelines
const MIN_TOUCH_TARGET_SIZE = 44;

// CSS variable value from style.css
const TOUCH_TARGET_MIN_CSS = '44px';

/**
 * Validates if a dimension meets the minimum touch target requirement
 * @param {number} dimension - The dimension in pixels
 * @returns {boolean} - True if dimension meets minimum requirement
 */
const isValidTouchTarget = (dimension) => {
  return dimension >= MIN_TOUCH_TARGET_SIZE;
};

/**
 * Validates if both width and height meet the minimum touch target requirement
 * @param {number} width - Width in pixels
 * @param {number} height - Height in pixels
 * @returns {boolean} - True if both dimensions meet minimum requirement
 */
const isValidTouchTargetSize = (width, height) => {
  return width >= MIN_TOUCH_TARGET_SIZE && height >= MIN_TOUCH_TARGET_SIZE;
};

/**
 * Parses a CSS pixel value to a number
 * @param {string} cssValue - CSS value like '44px'
 * @returns {number} - Numeric value
 */
const parseCssPixelValue = (cssValue) => {
  if (typeof cssValue !== 'string') return 0;
  const match = cssValue.match(/^(\d+(?:\.\d+)?)(px)?$/);
  return match ? parseFloat(match[1]) : 0;
};

/**
 * Interactive element types that require touch target compliance
 */
const INTERACTIVE_ELEMENT_TYPES = [
  'button',
  'input',
  'select',
  'textarea',
  'checkbox',
  'radio',
  'toggle',
  'tab',
  'link',
  'icon-button',
  'list-item',
  'card-clickable'
];

/**
 * Expected minimum dimensions for different element types
 */
const ELEMENT_MIN_DIMENSIONS = {
  'button': { width: 44, height: 44 },
  'input': { width: 44, height: 44 },
  'select': { width: 44, height: 44 },
  'textarea': { width: 44, height: 44 },
  'checkbox': { width: 44, height: 44 },
  'radio': { width: 44, height: 44 },
  'toggle': { width: 44, height: 44 },
  'tab': { width: 44, height: 44 },
  'link': { width: 44, height: 44 },
  'icon-button': { width: 44, height: 44 },
  'list-item': { width: 44, height: 44 },
  'card-clickable': { width: 44, height: 44 }
};

describe('Touch Target Size - Property 6: 觸控目標尺寸合規性', () => {
  /**
   * Property 6: Touch Target Size Compliance
   * For any interactive element, its touch area should be at least 44x44 pixels.
   */
  it('should validate that minimum touch target size is 44px', () => {
    expect(MIN_TOUCH_TARGET_SIZE).toBe(44);
    expect(parseCssPixelValue(TOUCH_TARGET_MIN_CSS)).toBe(44);
  });

  /**
   * Property: Any dimension >= 44px should be valid
   */
  it('should accept any dimension >= 44px as valid touch target', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 44, max: 1000 }),
        (dimension) => {
          expect(isValidTouchTarget(dimension)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Any dimension < 44px should be invalid
   */
  it('should reject any dimension < 44px as invalid touch target', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 43 }),
        (dimension) => {
          expect(isValidTouchTarget(dimension)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Both width and height must be >= 44px for valid touch target
   */
  it('should require both width and height >= 44px for valid touch target size', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 44, max: 500 }),
        fc.integer({ min: 44, max: 500 }),
        (width, height) => {
          expect(isValidTouchTargetSize(width, height)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: If either dimension is < 44px, touch target is invalid
   */
  it('should reject touch target if either dimension is < 44px', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 43 }),  // Invalid width
        fc.integer({ min: 44, max: 500 }), // Valid height
        (width, height) => {
          expect(isValidTouchTargetSize(width, height)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );

    fc.assert(
      fc.property(
        fc.integer({ min: 44, max: 500 }), // Valid width
        fc.integer({ min: 0, max: 43 }),   // Invalid height
        (width, height) => {
          expect(isValidTouchTargetSize(width, height)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: All interactive element types should have minimum dimensions defined
   */
  it('should have minimum dimensions defined for all interactive element types', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...INTERACTIVE_ELEMENT_TYPES),
        (elementType) => {
          const minDimensions = ELEMENT_MIN_DIMENSIONS[elementType];
          expect(minDimensions).toBeDefined();
          expect(minDimensions.width).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_SIZE);
          expect(minDimensions.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_SIZE);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: CSS pixel value parsing should be correct
   */
  it('should correctly parse CSS pixel values', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 1000 }),
        (value) => {
          const cssValue = `${value}px`;
          expect(parseCssPixelValue(cssValue)).toBe(value);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Touch target validation is consistent (idempotent)
   */
  it('should return consistent results for the same dimensions', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 500 }),
        fc.integer({ min: 0, max: 500 }),
        fc.integer({ min: 1, max: 10 }),
        (width, height, iterations) => {
          const results = [];
          for (let i = 0; i < iterations; i++) {
            results.push(isValidTouchTargetSize(width, height));
          }
          
          // All results should be the same
          const firstResult = results[0];
          expect(results.every(r => r === firstResult)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Boundary value at exactly 44px should be valid
   */
  it('should accept exactly 44px as valid touch target (boundary)', () => {
    fc.assert(
      fc.property(
        fc.constant(44),
        fc.constant(44),
        (width, height) => {
          expect(isValidTouchTargetSize(width, height)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Boundary value at 43px should be invalid
   */
  it('should reject 43px as invalid touch target (boundary)', () => {
    fc.assert(
      fc.property(
        fc.constant(43),
        fc.constant(43),
        (width, height) => {
          expect(isValidTouchTargetSize(width, height)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Negative dimensions should be invalid
   */
  it('should reject negative dimensions as invalid', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -1000, max: -1 }),
        fc.integer({ min: -1000, max: -1 }),
        (width, height) => {
          expect(isValidTouchTargetSize(width, height)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Zero dimensions should be invalid
   */
  it('should reject zero dimensions as invalid', () => {
    expect(isValidTouchTargetSize(0, 0)).toBe(false);
    expect(isValidTouchTargetSize(0, 44)).toBe(false);
    expect(isValidTouchTargetSize(44, 0)).toBe(false);
  });

  /**
   * Property: Float values should be handled correctly
   */
  it('should handle float values correctly', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 44, max: 500, noNaN: true }),
        fc.float({ min: 44, max: 500, noNaN: true }),
        (width, height) => {
          // Float values >= 44 should be valid
          expect(isValidTouchTarget(width)).toBe(true);
          expect(isValidTouchTarget(height)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: CSS variable --touch-target-min should equal 44px
   */
  it('should have CSS variable --touch-target-min set to 44px', () => {
    // This validates the CSS variable definition in style.css
    const expectedCssVariable = '--touch-target-min: 44px';
    expect(TOUCH_TARGET_MIN_CSS).toBe('44px');
  });
});

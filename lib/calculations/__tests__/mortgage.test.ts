/**
 * Basic Tests for Mortgage Calculation Functions
 * Tests core mortgage calculations to catch obvious errors
 */

import {
  calculateMonthlyPayment,
  calculateRemainingBalance,
  validateMortgageInputs
} from '../mortgage';

describe('Mortgage Calculations', () => {
  describe('calculateMonthlyPayment', () => {
    test('should calculate standard 30-year mortgage payment correctly', () => {
      // $200,000 loan at 6% for 30 years should be ~$1,199.10
      const payment = calculateMonthlyPayment(200000, 0.06, 30);
      expect(payment).toBeCloseTo(1199.10, 1);
    });

    test('should handle zero interest rate', () => {
      // $120,000 loan at 0% for 10 years should be $1,000/month
      const payment = calculateMonthlyPayment(120000, 0, 10);
      expect(payment).toBeCloseTo(1000, 1);
    });

    test('should throw error for invalid inputs', () => {
      expect(() => calculateMonthlyPayment(-100000, 0.06, 30)).toThrow('Invalid loan parameters');
      expect(() => calculateMonthlyPayment(200000, -0.01, 30)).toThrow('Invalid loan parameters');
      expect(() => calculateMonthlyPayment(200000, 0.06, 0)).toThrow('Invalid loan parameters');
    });

    test('should handle typical refinance scenario', () => {
      // $100,000 loan at 5.5% for 15 years
      const payment = calculateMonthlyPayment(100000, 0.055, 15);
      expect(payment).toBeGreaterThan(800);
      expect(payment).toBeLessThan(900);
    });
  });

  describe('calculateRemainingBalance', () => {
    test('should calculate remaining balance after payments', () => {
      // $200,000 loan at 6% for 30 years, after 12 payments
      const remaining = calculateRemainingBalance(200000, 0.06, 30, 12);
      expect(remaining).toBeGreaterThan(190000); // Should have paid down some principal
      expect(remaining).toBeLessThan(200000);
    });

    test('should return zero when loan is paid off', () => {
      const remaining = calculateRemainingBalance(100000, 0.06, 10, 120); // 10 years = 120 payments
      expect(remaining).toBeCloseTo(0, 1);
    });

    test('should handle edge cases', () => {
      // Function doesn't throw - just test it returns reasonable values
      const result1 = calculateRemainingBalance(100000, 0.06, 30, 0);
      expect(result1).toBe(100000); // No payments made

      const result2 = calculateRemainingBalance(100000, 0.06, 30, 360);
      expect(result2).toBe(0); // All payments made
    });
  });

  describe('validateMortgageInputs', () => {
    test('should accept valid inputs', () => {
      const result = validateMortgageInputs(100000, 0.06, 30);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject negative loan amount', () => {
      const result = validateMortgageInputs(-100000, 0.06, 30);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('should reject invalid interest rate', () => {
      const result = validateMortgageInputs(100000, -0.01, 30);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('should reject invalid term', () => {
      const result = validateMortgageInputs(100000, 0.06, 0);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});
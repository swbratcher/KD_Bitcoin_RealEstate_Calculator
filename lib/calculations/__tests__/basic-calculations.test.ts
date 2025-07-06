/**
 * Basic Tests for Core Calculation Functions
 * Simple tests to catch obvious errors in critical calculations
 */

import { calculateMonthlyPayment, validateMortgageInputs } from '../mortgage';
import { validateAmortizationInputs } from '../comprehensive-amortization';

describe('Basic Calculation Tests', () => {
  describe('Monthly Payment Calculations', () => {
    test('should calculate reasonable payment for typical mortgage', () => {
      const payment = calculateMonthlyPayment(200000, 0.06, 30);
      expect(payment).toBeGreaterThan(1000);
      expect(payment).toBeLessThan(1500);
      expect(payment).toBeCloseTo(1199, 0);
    });

    test('should handle zero interest correctly', () => {
      const payment = calculateMonthlyPayment(120000, 0, 10);
      expect(payment).toBe(1000); // Simple division
    });

    test('should throw error for invalid parameters', () => {
      expect(() => calculateMonthlyPayment(-100000, 0.06, 30)).toThrow();
      expect(() => calculateMonthlyPayment(100000, -0.01, 30)).toThrow();
      expect(() => calculateMonthlyPayment(100000, 0.06, 0)).toThrow();
    });
  });

  describe('Input Validation', () => {
    test('should validate basic mortgage inputs', () => {
      const result = validateMortgageInputs(200000, 0.06, 30);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject clearly invalid inputs', () => {
      const result = validateMortgageInputs(-100000, 0.06, 30);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Comprehensive Validation', () => {
    test('should handle basic input validation structure', () => {
      const mockInputs = {
        property: { currentValue: 200000, purchasePrice: 150000, purchaseYear: 2020, appreciationRate: 0.03 },
        currentMortgage: { currentBalance: 100000, monthlyPayment: 1000, interestRate: 0.06, remainingYears: 15 },
        propertyIncome: { monthlyRentalIncome: 1200, monthlyTaxes: 200, monthlyInsurance: 100, monthlyHOA: 0, netMonthlyCashFlow: 900 },
        refinanceScenario: { type: 'cash-out-refinance' as const, cashOutAmount: 50000, newLoanAmount: 150000, newInterestRate: 0.065, newLoanTermYears: 30, newMonthlyPayment: 950, closingCosts: 3000, monthlyPaymentIncrease: -50 },
        bitcoinInvestment: { investmentAmount: 50000, currentBitcoinPrice: 50000, targetScenarios: [], performanceSettings: { model: 'steady' as const, customAnnualGrowthRate: 0.20, useSeasonalFactors: false, maxDrawdownPercent: 70 } },
        payoffTrigger: { type: 'percentage' as const, value: 200 }
      };

      // Just test that validation function exists and runs
      expect(() => {
        const result = validateAmortizationInputs(mockInputs);
        expect(result).toHaveProperty('isValid');
        expect(result).toHaveProperty('errors');
      }).not.toThrow();
    });
  });
});
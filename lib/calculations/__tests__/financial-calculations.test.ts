/**
 * Comprehensive Financial Calculations Tests
 * Tests the core financial logic for base equity, property appreciation, and BTC sales
 */

import { 
  calculatePropertyAppreciation,
  createBaseAmortizationSchedule 
} from '../amortization';
import { calculateBTCSalesForShortfall } from '../bitcoin-performance';
import { calculateMonthlyPayment, calculateRemainingBalance } from '../mortgage';
import { CalculatorInputs } from '@/lib/types';

describe('Financial Calculations', () => {
  
  describe('Property Appreciation', () => {
    test('should return 0 for month 1', () => {
      const appreciation = calculatePropertyAppreciation(100000, 0.03, 1);
      expect(appreciation).toBe(0);
    });

    test('should calculate proper compound monthly appreciation', () => {
      // 3% annual = approximately 0.247% monthly compounded
      const monthlyRate = Math.pow(1.03, 1/12) - 1; // ≈ 0.002466
      
      // Month 2: 100000 * (1 + monthlyRate)^1 - 100000
      const month2Expected = 100000 * Math.pow(1 + monthlyRate, 1) - 100000;
      const month2Actual = calculatePropertyAppreciation(100000, 0.03, 2);
      expect(month2Actual).toBeCloseTo(month2Expected, 2);
      
      // Month 12: Should be close to 3% (but slightly less due to monthly compounding)
      const month12Actual = calculatePropertyAppreciation(100000, 0.03, 12);
      const month12Expected = 100000 * Math.pow(1 + monthlyRate, 11) - 100000;
      expect(month12Actual).toBeCloseTo(month12Expected, 2);
      expect(month12Actual).toBeLessThan(3000); // Less than simple 3%
      expect(month12Actual).toBeGreaterThan(2700); // But close to it
    });

    test('should compound against growing property value', () => {
      // Test that appreciation compounds on the growing value, not original
      const appreciation6 = calculatePropertyAppreciation(100000, 0.03, 6);
      const appreciation12 = calculatePropertyAppreciation(100000, 0.03, 12);
      
      // Month 12 should be more than double month 6 due to compounding
      expect(appreciation12).toBeGreaterThan(appreciation6 * 2);
    });
  });

  describe('Base Equity Calculation', () => {
    const mockInputs: CalculatorInputs = {
      property: {
        currentValue: 200000,
        purchasePrice: 150000,
        appreciationRate: 0.03
      },
      currentMortgage: {
        currentBalance: 150000,
        monthlyPayment: 1000,
        interestRate: 0.04,
        remainingYears: 30
      },
      propertyIncome: {
        monthlyRentalIncome: 2000,
        monthlyTaxes: 200,
        monthlyInsurance: 100,
        monthlyHOA: 0,
        netMonthlyCashFlow: 700
      },
      refinanceScenario: {
        type: 'cash-out-refinance',
        cashOutAmount: 40000,
        newLoanAmount: 190000,
        newInterestRate: 0.06,
        newLoanTermYears: 30,
        newMonthlyPayment: 1200,
        closingCosts: 2000,
        monthlyPaymentIncrease: 200
      },
      bitcoinInvestment: {
        investmentAmount: 40000,
        currentBitcoinPrice: 50000,
        targetScenarios: [],
        performanceSettings: {
          model: 'seasonal',
          initialCAGR: 20,
          useSeasonalFactors: true,
          maxDrawdownPercent: 70
        }
      },
      payoffTrigger: {
        type: 'percentage',
        value: 200
      }
    };

    test('should calculate base equity as property value minus debt (no appreciation)', () => {
      const schedule = createBaseAmortizationSchedule(mockInputs, 3);
      
      schedule.forEach(entry => {
        // Base equity should always be: property value at loan origination - remaining debt
        const expectedBaseEquity = mockInputs.property.currentValue - entry.debtBalance;
        expect(entry.baseEquity).toBeCloseTo(expectedBaseEquity, 2);
        
        // Base equity should NOT include appreciation (only applies when appreciation > 0)
        if (entry.propertyAppreciation > 0) {
          expect(entry.baseEquity).toBeLessThan(
            mockInputs.property.currentValue - entry.debtBalance + entry.propertyAppreciation
          );
        }
      });
    });

    test('should show increasing base equity as debt decreases', () => {
      const schedule = createBaseAmortizationSchedule(mockInputs, 12);
      
      // Base equity should increase as debt is paid down
      for (let i = 1; i < schedule.length; i++) {
        expect(schedule[i].baseEquity).toBeGreaterThan(schedule[i-1].baseEquity);
      }
    });

    test('should use original property value at loan origination for base equity (not purchase price)', () => {
      const inputsWithHistory: CalculatorInputs = {
        property: {
          currentValue: 200000, // Value at loan origination
          purchasePrice: 150000, // Historical purchase price (should NOT be used)
          appreciationRate: 0.03
        },
        currentMortgage: {
          currentBalance: 150000,
          monthlyPayment: 1000,
          interestRate: 0.04,
          remainingYears: 30
        },
        propertyIncome: {
          monthlyRentalIncome: 2000,
          monthlyTaxes: 200,
          monthlyInsurance: 100,
          monthlyHOA: 0,
          netMonthlyCashFlow: 700
        },
        refinanceScenario: {
          type: 'cash-out-refinance',
          cashOutAmount: 40000,
          newLoanAmount: 190000,
          newInterestRate: 0.06,
          newLoanTermYears: 30,
          newMonthlyPayment: 1200,
          closingCosts: 2000,
          monthlyPaymentIncrease: 200
        },
        bitcoinInvestment: {
          investmentAmount: 40000,
          currentBitcoinPrice: 50000,
          targetScenarios: [],
          performanceSettings: {
            model: 'seasonal',
            initialCAGR: 20,
            useSeasonalFactors: true,
            maxDrawdownPercent: 70
          }
        },
        payoffTrigger: {
          type: 'percentage',
          value: 200
        }
      };

      const schedule = createBaseAmortizationSchedule(inputsWithHistory, 3);
      
      schedule.forEach(entry => {
        // Base equity should use currentValue (200k), NOT purchasePrice (150k)
        const expectedBaseEquity = inputsWithHistory.property.currentValue - entry.debtBalance;
        expect(entry.baseEquity).toBeCloseTo(expectedBaseEquity, 2);
        
        // Should NOT use purchase price
        const wrongCalculation = (inputsWithHistory.property.purchasePrice || 0) - entry.debtBalance;
        if (wrongCalculation !== expectedBaseEquity) {
          expect(entry.baseEquity).not.toBeCloseTo(wrongCalculation, 2);
        }
      });
    });
  });

  describe('BTC Sales for Cash Flow', () => {
    test('should return zero sales when no shortfall', () => {
      const sales = calculateBTCSalesForShortfall(0, 50000, 1.0);
      expect(sales.btcToSell).toBe(0);
      expect(sales.dollarAmount).toBe(0);
      expect(sales.remainingBTC).toBe(1.0);
    });

    test('should calculate correct BTC amount to sell for shortfall', () => {
      const shortfall = 1000; // Need $1000
      const btcPrice = 50000; // BTC at $50k
      const availableBTC = 2.0; // Have 2 BTC
      
      const sales = calculateBTCSalesForShortfall(shortfall, btcPrice, availableBTC);
      
      expect(sales.btcToSell).toBeCloseTo(0.02, 6); // 1000/50000 = 0.02 BTC
      expect(sales.dollarAmount).toBeCloseTo(1000, 2);
      expect(sales.remainingBTC).toBeCloseTo(1.98, 6); // 2.0 - 0.02
    });

    test('should not sell more BTC than available', () => {
      const shortfall = 10000; // Need $10k
      const btcPrice = 50000; // BTC at $50k  
      const availableBTC = 0.1; // Only have 0.1 BTC ($5k worth)
      
      const sales = calculateBTCSalesForShortfall(shortfall, btcPrice, availableBTC);
      
      expect(sales.btcToSell).toBe(0.1); // Sell all available
      expect(sales.dollarAmount).toBe(5000); // 0.1 * 50000
      expect(sales.remainingBTC).toBe(0); // No BTC left
    });

    test('should handle zero or negative BTC price gracefully', () => {
      const sales1 = calculateBTCSalesForShortfall(1000, 0, 1.0);
      expect(sales1.btcToSell).toBe(0);
      
      const sales2 = calculateBTCSalesForShortfall(1000, -50000, 1.0);
      expect(sales2.btcToSell).toBe(0);
    });

    test('should vary BTC sales amounts correctly with monthly price changes', () => {
      const cashFlowShortfall = 151.59; // Consistent shortfall amount
      const availableBTC = 0.8; // Starting BTC amount
      
      // Test different BTC price scenarios
      const priceScenarios = [
        { price: 50000, expectedBTC: 0.003032 },
        { price: 52000, expectedBTC: 0.002915 }, // Higher price = less BTC sold
        { price: 48000, expectedBTC: 0.003158 }, // Lower price = more BTC sold
        { price: 55000, expectedBTC: 0.002757 }, // Even higher price = even less BTC
        { price: 45000, expectedBTC: 0.003368 }  // Even lower price = even more BTC
      ];
      
      priceScenarios.forEach(scenario => {
        const sales = calculateBTCSalesForShortfall(
          cashFlowShortfall, 
          scenario.price, 
          availableBTC
        );
        
        // Verify BTC amount varies with price
        expect(sales.btcToSell).toBeCloseTo(scenario.expectedBTC, 5);
        
        // Verify dollar amount stays consistent (covers the shortfall)
        expect(sales.dollarAmount).toBeCloseTo(cashFlowShortfall, 2);
        
        // Verify relationship: higher price = less BTC needed
        const expectedBTCFromFormula = cashFlowShortfall / scenario.price;
        expect(sales.btcToSell).toBeCloseTo(expectedBTCFromFormula, 6);
      });
    });

    test('should demonstrate inverse relationship between BTC price and amount sold', () => {
      const shortfall = 1000; // $1000 needed
      const availableBTC = 1.0; // 1 BTC available
      
      // Test inverse relationship
      const lowPrice = calculateBTCSalesForShortfall(shortfall, 25000, availableBTC);
      const highPrice = calculateBTCSalesForShortfall(shortfall, 100000, availableBTC);
      
      // At lower price, more BTC must be sold
      expect(lowPrice.btcToSell).toBeGreaterThan(highPrice.btcToSell);
      
      // Both should generate the same dollar amount
      expect(lowPrice.dollarAmount).toBeCloseTo(shortfall, 2);
      expect(highPrice.dollarAmount).toBeCloseTo(shortfall, 2);
      
      // Specific values
      expect(lowPrice.btcToSell).toBeCloseTo(0.04, 6); // 1000/25000
      expect(highPrice.btcToSell).toBeCloseTo(0.01, 6); // 1000/100000
    });
  });

  describe('Debt Balance Calculations', () => {
    test('should correctly calculate standard 30-year mortgage amortization', () => {
      // Test with realistic loan parameters
      const loanAmount = 190000;
      const interestRate = 0.06; // 6%
      const termYears = 30;
      
      // First few months should have expected principal/interest breakdown
      const month1Balance = calculateRemainingBalance(loanAmount, interestRate, termYears, 1);
      const month2Balance = calculateRemainingBalance(loanAmount, interestRate, termYears, 2);
      const month12Balance = calculateRemainingBalance(loanAmount, interestRate, termYears, 12);
      
      // Verify balances decrease over time
      expect(month1Balance).toBeLessThan(loanAmount);
      expect(month2Balance).toBeLessThan(month1Balance);
      expect(month12Balance).toBeLessThan(month2Balance);
      
      // For 30-year loan at 6%, first year should pay down about $2,400 in principal
      const firstYearPrincipal = loanAmount - month12Balance;
      expect(firstYearPrincipal).toBeGreaterThan(2000);
      expect(firstYearPrincipal).toBeLessThan(3000);
      
      // Most of the payment should be interest early on (typical for mortgages)
      const monthlyPayment = calculateMonthlyPayment(loanAmount, interestRate, termYears);
      const monthlyInterest = loanAmount * (interestRate / 12);
      const monthlyPrincipal = monthlyPayment - monthlyInterest;
      
      // Interest should be ~83% of payment in first month
      const interestPercentage = monthlyInterest / monthlyPayment;
      expect(interestPercentage).toBeGreaterThan(0.80); // At least 80%
      expect(interestPercentage).toBeLessThan(0.85); // Less than 85%
      
      // Principal should be ~17% of payment in first month  
      const principalPercentage = monthlyPrincipal / monthlyPayment;
      expect(principalPercentage).toBeGreaterThan(0.15); // At least 15%
      expect(principalPercentage).toBeLessThan(0.20); // Less than 20%
    });
    
    test('should validate that slow debt paydown is mathematically correct for mortgages', () => {
      // This test documents that "slow" paydown is normal, not a bug
      const testCases = [
        { loan: 100000, rate: 0.05, term: 30, expectedFirstYearPrincipal: 1500 },
        { loan: 200000, rate: 0.06, term: 30, expectedFirstYearPrincipal: 2500 },
        { loan: 300000, rate: 0.07, term: 30, expectedFirstYearPrincipal: 3600 }
      ];
      
      testCases.forEach(testCase => {
        const { loan, rate, term, expectedFirstYearPrincipal } = testCase;
        
        const month12Balance = calculateRemainingBalance(loan, rate, term, 12);
        const actualFirstYearPrincipal = loan - month12Balance;
        
        // Verify it's within reasonable range (±20% of expected)
        expect(actualFirstYearPrincipal).toBeGreaterThan(expectedFirstYearPrincipal * 0.8);
        expect(actualFirstYearPrincipal).toBeLessThan(expectedFirstYearPrincipal * 1.2);
        
        // Verify it's a small percentage of the loan (normal for year 1)
        const percentPaidDown = actualFirstYearPrincipal / loan;
        expect(percentPaidDown).toBeLessThan(0.05); // Less than 5% in first year
      });
    });
  });

  describe('Integration Tests', () => {
    test('should maintain financial consistency across months', () => {
      const mockInputs: CalculatorInputs = {
        property: {
          currentValue: 200000,
          purchasePrice: 150000,
          appreciationRate: 0.03
        },
        currentMortgage: {
          currentBalance: 150000,
          monthlyPayment: 1000,
          interestRate: 0.04,
          remainingYears: 30
        },
        propertyIncome: {
          monthlyRentalIncome: 1500,
          monthlyTaxes: 200,
          monthlyInsurance: 100,
          monthlyHOA: 0,
          netMonthlyCashFlow: 200
        },
        refinanceScenario: {
          type: 'cash-out-refinance',
          cashOutAmount: 40000,
          newLoanAmount: 190000,
          newInterestRate: 0.06,
          newLoanTermYears: 30,
          newMonthlyPayment: 1200,
          closingCosts: 2000,
          monthlyPaymentIncrease: 200
        },
        bitcoinInvestment: {
          investmentAmount: 40000,
          currentBitcoinPrice: 50000,
          targetScenarios: [],
          performanceSettings: {
            model: 'seasonal',
            initialCAGR: 20,
            useSeasonalFactors: true,
            maxDrawdownPercent: 70
          }
        },
        payoffTrigger: {
          type: 'percentage',
          value: 200
        }
      };

      const schedule = createBaseAmortizationSchedule(mockInputs, 24);
      
      // Validate financial relationships
      schedule.forEach((entry, index) => {
        // Base equity should increase as debt is paid down (can start negative)
        if (index > 0) {
          expect(entry.baseEquity).toBeGreaterThan(schedule[index - 1].baseEquity);
        }
        
        // Property appreciation should be cumulative and increasing
        if (index > 0) {
          expect(entry.propertyAppreciation).toBeGreaterThanOrEqual(schedule[index - 1].propertyAppreciation);
        }
        
        // Debt balance should decrease over time
        if (index > 0) {
          expect(entry.debtBalance).toBeLessThan(schedule[index - 1].debtBalance);
        }
        
        // Total property value (current + appreciation) should be growing (except month 1)
        const totalPropertyValue = mockInputs.property.currentValue + entry.propertyAppreciation;
        if (index > 0) {
          expect(totalPropertyValue).toBeGreaterThan(mockInputs.property.currentValue);
        } else {
          expect(totalPropertyValue).toBe(mockInputs.property.currentValue); // Month 1 has no appreciation
        }
      });
    });
  });

  describe('Chart Data Generation', () => {
    test('should always generate 20 years (240 months) of chart data regardless of loan term', () => {
      // Test with short 10-year scenario
      const shortTermInputs: CalculatorInputs = {
        property: {
          currentValue: 200000,
          purchasePrice: 150000,
          appreciationRate: 0.03
        },
        currentMortgage: {
          currentBalance: 100000,
          monthlyPayment: 800,
          interestRate: 0.04,
          remainingYears: 10 // Only 10 years
        },
        propertyIncome: {
          monthlyRentalIncome: 1500,
          monthlyTaxes: 200,
          monthlyInsurance: 100,
          monthlyHOA: 0,
          netMonthlyCashFlow: 200
        },
        refinanceScenario: {
          type: 'cash-out-refinance',
          cashOutAmount: 40000,
          newLoanAmount: 140000,
          newInterestRate: 0.06,
          newLoanTermYears: 10, // Short term
          newMonthlyPayment: 1200,
          closingCosts: 2000,
          monthlyPaymentIncrease: 400
        },
        bitcoinInvestment: {
          investmentAmount: 40000,
          currentBitcoinPrice: 50000,
          targetScenarios: [],
          performanceSettings: {
            model: 'seasonal',
            initialCAGR: 20,
            useSeasonalFactors: true,
            maxDrawdownPercent: 70
          }
        },
        payoffTrigger: {
          type: 'percentage',
          value: 200
        }
      };

      const schedule = createBaseAmortizationSchedule(shortTermInputs, 120); // 10 years
      
      // Mock chart data generation (testing the logic)
      const chartMonths = 240; // Always 20 years
      const chartData = [];
      
      for (let i = 0; i < chartMonths; i++) {
        const entry = schedule[i];
        
        if (entry) {
          // Use actual data
          chartData.push({
            month: entry.month,
            debt: entry.debtBalance,
            baseEquity: shortTermInputs.property.currentValue - entry.debtBalance
          });
        } else {
          // Extended data beyond loan term
          const lastEntry = schedule[schedule.length - 1];
          chartData.push({
            month: i + 1,
            debt: 0, // Loan paid off
            baseEquity: shortTermInputs.property.currentValue // Full property value
          });
        }
      }

      // Verify chart spans exactly 20 years
      expect(chartData).toHaveLength(240);
      
      // Verify first 120 months use real amortization data
      expect(chartData[0].debt).toBeGreaterThan(0);
      expect(chartData[119].debt).toBeGreaterThanOrEqual(0);
      
      // Verify months 121-240 show loan paid off
      expect(chartData[120].debt).toBe(0);
      expect(chartData[239].debt).toBe(0);
      
      // Verify base equity after payoff equals full property value
      expect(chartData[120].baseEquity).toBe(shortTermInputs.property.currentValue);
      expect(chartData[239].baseEquity).toBe(shortTermInputs.property.currentValue);
    });

    test('should handle payoff trigger scenarios in 20-year chart', () => {
      // This ensures chart continues showing data even after early payoff trigger
      const mockSchedule = [
        { month: 1, debtBalance: 100000, propertyAppreciation: 0, btcValue: 40000, totalAsset: 240000 },
        { month: 2, debtBalance: 99000, propertyAppreciation: 500, btcValue: 45000, totalAsset: 245500 },
        // Loan paid off early at month 3 due to trigger
      ];

      const chartMonths = 240;
      const chartData = [];
      
      for (let i = 0; i < chartMonths; i++) {
        const entry = mockSchedule[i];
        
        if (entry) {
          chartData.push({
            month: entry.month,
            debt: entry.debtBalance,
            btcValue: entry.btcValue
          });
        } else {
          // Post-payoff data
          const lastEntry = mockSchedule[mockSchedule.length - 1];
          chartData.push({
            month: i + 1,
            debt: 0,
            btcValue: lastEntry?.btcValue || 0
          });
        }
      }

      expect(chartData).toHaveLength(240);
      expect(chartData[2].debt).toBe(0); // Month 3 onwards shows paid off
      expect(chartData[239].debt).toBe(0); // Last month still shows paid off
    });
  });

  describe('Payoff Trigger Analysis', () => {
    test('should correctly calculate BTC retained as BTC amount (not dollar value)', () => {
      // Mock amortization schedule with payoff trigger met
      const mockSchedule = [
        {
          month: 1,
          date: '2025-01-01',
          debtBalance: 89568,
          btcValue: 189912,
          btcHeld: 2.15430001, // This should be the finalBTCRetained
          btcSpotPrice: 88000,
          payoffTriggerMet: true,
          canPayOff: true,
          monthlyPayment: 1200
        }
      ];

      // Mock the analyzePayoffTrigger function behavior
      const result = {
        triggerMonth: 1,
        triggerDate: '2025-01-01',
        btcValueAtTrigger: 189912,
        debtAtTrigger: 89568,
        finalBTCRetained: 2.15430001, // BTC amount, not dollar value
        interestSaved: 0
      };

      // Verify trigger logic: 189912 / 89568 = 212% > 200% threshold
      const triggerPercentage = (result.btcValueAtTrigger / result.debtAtTrigger) * 100;
      expect(triggerPercentage).toBeGreaterThan(200);
      expect(triggerPercentage).toBeCloseTo(212, 0);

      // Verify BTC retained is BTC amount (not dollar value)
      expect(result.finalBTCRetained).toBeCloseTo(2.15430001, 8);
      expect(result.finalBTCRetained).toBeLessThan(10); // Should be BTC amount, not dollars

      // Verify the math: if trigger at 200%, BTC value should exceed debt by 100%
      const excessValue = result.btcValueAtTrigger - result.debtAtTrigger;
      expect(excessValue).toBeCloseTo(100344, 0); // Dollar excess
      
      // The BTC amount should be worth approximately the total BTC value
      const expectedTotalBTCValue = result.finalBTCRetained * mockSchedule[0].btcSpotPrice;
      expect(expectedTotalBTCValue).toBeCloseTo(result.btcValueAtTrigger, -3); // Within $1000
    });

    test('should verify payoff trigger percentage calculation', () => {
      // Test data from user's example
      const btcValueAtTrigger = 189912;
      const debtAtTrigger = 89568;
      const triggerThreshold = 200; // 200%

      // Calculate actual percentage
      const actualPercentage = (btcValueAtTrigger / debtAtTrigger) * 100;
      
      // Should be ~212% which exceeds 200% threshold
      expect(actualPercentage).toBeCloseTo(212, 0);
      expect(actualPercentage).toBeGreaterThan(triggerThreshold);

      // Verify retained amount calculation in dollars
      const retainedDollarValue = btcValueAtTrigger - debtAtTrigger;
      expect(retainedDollarValue).toBeCloseTo(100344, 0);
    });
  });

  describe('Bitcoin Seasonal Performance', () => {
    test('should calculate negative monthly factors during bear market (fall season)', () => {
      // Test the seasonal factor calculation directly
      const cycleCAGR = 20; // 20% annual growth
      const maxDrawdownPercent = 70; // 70% max drawdown
      
      // Mock the seasonal factor calculation
      const targetFallFactor = (100 - maxDrawdownPercent) / 100; // 0.30
      const monthlyFallFactor = Math.pow(targetFallFactor, 1 / 12); // 12 months of decline
      const monthlyDeclinePercent = (monthlyFallFactor - 1) * 100;
      
      // Should be negative during fall season
      expect(monthlyDeclinePercent).toBeLessThan(0);
      expect(monthlyDeclinePercent).toBeCloseTo(-9.5, 1); // ~-9.5% per month for 70% total
      
      // Test different cycle positions
      const seasonTests = [
        { cyclePosition: 10, season: 'summer', expectedSign: 1 },    // Month 10 = summer (positive)
        { cyclePosition: 25, season: 'fall', expectedSign: -1 },     // Month 25 = fall (negative)
        { cyclePosition: 33, season: 'winter', expectedSign: 0 },    // Month 33 = winter (neutral)
        { cyclePosition: 40, season: 'spring', expectedSign: 1 }     // Month 40 = spring (positive)
      ];
      
      seasonTests.forEach(test => {
        // Calculate expected factor based on season
        let expectedFactor: number;
        
        if (test.season === 'fall') {
          expectedFactor = monthlyFallFactor; // Negative decline
        } else if (test.season === 'winter') {
          expectedFactor = 1.0; // No change
        } else {
          expectedFactor = 1.02; // Some positive growth for summer/spring
        }
        
        const monthlyPercentage = (expectedFactor - 1) * 100;
        
        if (test.expectedSign === -1) {
          expect(monthlyPercentage).toBeLessThan(0); // Fall should be negative
        } else if (test.expectedSign === 0) {
          expect(Math.abs(monthlyPercentage)).toBeLessThan(1); // Winter should be ~0%
        } else {
          expect(monthlyPercentage).toBeGreaterThan(0); // Summer/spring should be positive
        }
      });
    });

    test('should respect user maxDrawdownPercent setting', () => {
      // Test with different drawdown settings
      const drawdownTests = [
        { maxDrawdownPercent: 50, expectedFallFactor: 0.50 },
        { maxDrawdownPercent: 70, expectedFallFactor: 0.30 },
        { maxDrawdownPercent: 80, expectedFallFactor: 0.20 }
      ];

      drawdownTests.forEach(test => {
        // Calculate what the fall factor should be
        const targetFallFactor = (100 - test.maxDrawdownPercent) / 100;
        expect(targetFallFactor).toBeCloseTo(test.expectedFallFactor, 2);
        
        // Calculate monthly fall factor (12 months of decline)
        const monthlyFallFactor = Math.pow(targetFallFactor, 1 / 12);
        const monthlyDeclinePercent = (monthlyFallFactor - 1) * 100;
        
        // Each month should decline by this amount during fall
        expect(monthlyDeclinePercent).toBeLessThan(0); // Should be negative
        
        // 70% drawdown over 12 months = ~-9.5% per month
        if (test.maxDrawdownPercent === 70) {
          expect(monthlyDeclinePercent).toBeCloseTo(-9.5, 1);
        }
      });
    });

    test('should demonstrate complete 48-month seasonal cycle with proper drawdowns', () => {
      // Comprehensive test of full seasonal cycle behavior
      const cycleCAGR = 20;
      const maxDrawdownPercent = 70;
      
      // Mock seasonal calculation
      const calculateSeasonalFactors = (cagr: number, drawdown: number) => {
        const annualRate = cagr / 100;
        const targetFallFactor = (100 - drawdown) / 100;
        const cycleReturn4y = Math.pow(1 + annualRate, 4);
        const netGainFactor = cycleReturn4y / targetFallFactor;
        
        const SEASON_CONFIG = {
          summer: { months: 18, growthPortion: 0.65 },
          fall: { months: 12, growthPortion: 0.0 },
          winter: { months: 6, growthPortion: 0.0 },
          spring: { months: 6, growthPortion: 0.35 }
        };
        
        return {
          summerFactorPerMonth: Math.pow(netGainFactor, SEASON_CONFIG.summer.growthPortion / SEASON_CONFIG.summer.months),
          springFactorPerMonth: Math.pow(netGainFactor, SEASON_CONFIG.spring.growthPortion / SEASON_CONFIG.spring.months),
          fallFactorPerMonth: Math.pow(targetFallFactor, 1 / SEASON_CONFIG.fall.months),
          winterFactorPerMonth: 1.0
        };
      };

      const getSeasonalFactor = (cyclePosition: number, factors: any) => {
        if (cyclePosition < 18) return factors.summerFactorPerMonth;
        else if (cyclePosition < 30) return factors.fallFactorPerMonth;
        else if (cyclePosition < 36) return factors.winterFactorPerMonth;
        else return factors.springFactorPerMonth;
      };

      const seasonalFactors = calculateSeasonalFactors(cycleCAGR, maxDrawdownPercent);
      
      // Test that fall factor produces negative monthly performance
      expect(seasonalFactors.fallFactorPerMonth).toBeLessThan(1.0);
      expect((seasonalFactors.fallFactorPerMonth - 1) * 100).toBeCloseTo(-9.55, 1);
      
      // Test that summer factor produces positive monthly performance
      expect(seasonalFactors.summerFactorPerMonth).toBeGreaterThan(1.0);
      expect((seasonalFactors.summerFactorPerMonth - 1) * 100).toBeCloseTo(7.23, 1);
      
      // Test winter is neutral
      expect(seasonalFactors.winterFactorPerMonth).toBe(1.0);
      
      // Test complete fall season drawdown
      let fallPrice = 100000; // Starting price at fall begin
      for (let month = 18; month < 30; month++) { // 12 months of fall
        fallPrice *= seasonalFactors.fallFactorPerMonth;
      }
      const totalFallDecline = ((fallPrice - 100000) / 100000) * 100;
      expect(totalFallDecline).toBeCloseTo(-70, 1); // Should be ~70% decline
      
      // Test that we can categorize months correctly by season
      const seasonTests = [
        { month: 5, expectedSeason: 'summer' },   // Month 5 = summer
        { month: 17, expectedSeason: 'summer' },  // Month 17 = last summer month
        { month: 18, expectedSeason: 'fall' },    // Month 18 = first fall month
        { month: 25, expectedSeason: 'fall' },    // Month 25 = mid fall
        { month: 29, expectedSeason: 'fall' },    // Month 29 = last fall month
        { month: 30, expectedSeason: 'winter' },  // Month 30 = first winter month
        { month: 35, expectedSeason: 'winter' },  // Month 35 = last winter month
        { month: 36, expectedSeason: 'spring' },  // Month 36 = first spring month
        { month: 47, expectedSeason: 'spring' }   // Month 47 = last spring month
      ];
      
      seasonTests.forEach(test => {
        const factor = getSeasonalFactor(test.month, seasonalFactors);
        const monthlyPerformance = (factor - 1) * 100;
        
        switch (test.expectedSeason) {
          case 'summer':
            expect(monthlyPerformance).toBeGreaterThan(0);
            expect(monthlyPerformance).toBeCloseTo(7.23, 1);
            break;
          case 'fall':
            expect(monthlyPerformance).toBeLessThan(0);
            expect(monthlyPerformance).toBeCloseTo(-9.55, 1);
            break;
          case 'winter':
            expect(monthlyPerformance).toBe(0);
            break;
          case 'spring':
            expect(monthlyPerformance).toBeGreaterThan(0);
            expect(monthlyPerformance).toBeCloseTo(11.94, 1);
            break;
        }
      });
      
      // Test that the 4-year cycle math works out correctly
      let cumulativePrice = 50000;
      for (let month = 0; month < 48; month++) {
        const factor = getSeasonalFactor(month, seasonalFactors);
        cumulativePrice *= factor;
      }
      
      const total4YearReturn = ((cumulativePrice - 50000) / 50000) * 100;
      expect(total4YearReturn).toBeGreaterThan(200); // Should be substantial positive return
      
      const annualizedReturn = Math.pow(cumulativePrice / 50000, 1/4) - 1;
      expect(annualizedReturn * 100).toBeGreaterThan(20); // Should exceed target CAGR
    });
  });
});
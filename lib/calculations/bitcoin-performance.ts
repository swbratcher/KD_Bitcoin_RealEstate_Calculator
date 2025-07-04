/**
 * Complex Bitcoin Performance Calculation Engine
 * for KD Bitcoin Real Estate Calculator
 * 
 * This module implements the sophisticated Bitcoin performance model
 * from the Google Sheet, including:
 * - 48-month market cycles (4 years)
 * - Seasonal factors (Summer/Fall/Spring phases)
 * - Complex mathematical factors for realistic market simulation
 */

import { 
  BitcoinPerformanceData,
  BitcoinPerformanceSettings,
  CalculatorInputs
} from '@/lib/types';

/**
 * Calculate Bitcoin performance rate for a specific month
 * Based on the complex Google Sheet formula:
 * 
 * LET(offset,MOD((YEAR*12+MONTH)-(2024*12+4),48),
 *     annualFactor,(1+rate)^4,
 *     Q,annualFactor/0.3,
 *     summerFactor,Q^(0.65/18),
 *     springFactor,Q^(0.35/8),
 *     fallFactor,0.3^(1/14),
 *     rateSummer,summerFactor-1,
 *     rateFall,fallFactor-1,
 *     rateSpring,springFactor-1,
 *     IF(offset<18,rateSummer,IF(offset<32,rateFall,IF(offset<40,0,rateSpring))))
 */
export function calculateBitcoinPerformanceRate(
  monthNumber: number,
  annualGrowthRate: number,
  startDate: Date = new Date(2024, 3, 1) // April 2024
): BitcoinPerformanceData {
  // Calculate the current date for this month
  const currentDate = new Date(startDate);
  currentDate.setMonth(startDate.getMonth() + monthNumber - 1);
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1; // 1-12
  
  // Calculate offset within 48-month cycle
  // offset = MOD((YEAR*12+MONTH)-(2024*12+4), 48)
  const referenceMonth = 2024 * 12 + 4; // April 2024
  const currentMonth = year * 12 + month;
  const offset = (currentMonth - referenceMonth) % 48;
  
  // Calculate base factors
  // annualFactor = (1 + rate)^4 
  const annualFactor = Math.pow(1 + annualGrowthRate, 4);
  
  // Q = annualFactor / 0.3
  const Q = annualFactor / 0.3;
  
  // Calculate seasonal factors
  // summerFactor = Q^(0.65/18)
  const summerFactor = Math.pow(Q, 0.65 / 18);
  
  // springFactor = Q^(0.35/8)  
  const springFactor = Math.pow(Q, 0.35 / 8);
  
  // fallFactor = 0.3^(1/14)
  const fallFactor = Math.pow(0.3, 1 / 14);
  
  // Calculate rates (subtract 1 to get rate from factor)
  const rateSummer = summerFactor - 1;
  const rateFall = fallFactor - 1;
  const rateSpring = springFactor - 1;
  
  // Determine which phase and rate to use
  let monthlyPerformanceRate: number;
  let cyclePhase: 'summer' | 'fall' | 'spring' | 'steady';
  let seasonalFactor: number;
  
  if (offset < 18) {
    // Summer phase (months 0-17 of cycle)
    monthlyPerformanceRate = rateSummer;
    cyclePhase = 'summer';
    seasonalFactor = summerFactor;
  } else if (offset < 32) {
    // Fall phase (months 18-31 of cycle)  
    monthlyPerformanceRate = rateFall;
    cyclePhase = 'fall';
    seasonalFactor = fallFactor;
  } else if (offset < 40) {
    // Winter/sideways phase (months 32-39 of cycle)
    monthlyPerformanceRate = 0;
    cyclePhase = 'steady';
    seasonalFactor = 1;
  } else {
    // Spring phase (months 40-47 of cycle)
    monthlyPerformanceRate = rateSpring;
    cyclePhase = 'spring';
    seasonalFactor = springFactor;
  }
  
  return {
    monthlyPerformanceRate,
    seasonalFactor,
    cyclePhase,
    cycleOffset: offset,
    spotPrice: 0 // Will be calculated separately
  };
}

/**
 * Calculate Bitcoin spot price using SCAN-like functionality
 * Based on the Google Sheet formula:
 * SCAN(initialPrice, performanceRates, LAMBDA(prior,rate,prior*(1+rate)))
 */
export function calculateBitcoinSpotPrices(
  initialPrice: number,
  performanceData: BitcoinPerformanceData[],
  maxMonths: number = 360
): number[] {
  const spotPrices: number[] = [initialPrice];
  
  for (let i = 0; i < Math.min(performanceData.length, maxMonths - 1); i++) {
    const previousPrice = spotPrices[spotPrices.length - 1];
    const rate = performanceData[i].monthlyPerformanceRate;
    const newPrice = previousPrice * (1 + rate);
    spotPrices.push(newPrice);
  }
  
  return spotPrices;
}

/**
 * Generate complete Bitcoin performance timeline
 * Combines performance rates and spot prices
 */
export function generateBitcoinPerformanceTimeline(
  inputs: CalculatorInputs,
  maxMonths: number = 360
): BitcoinPerformanceData[] {
  const { bitcoinInvestment } = inputs;
  const { performanceSettings } = bitcoinInvestment;
  const initialPrice = bitcoinInvestment.currentBitcoinPrice;
  
  let annualGrowthRate: number;
  
  // Determine growth rate based on performance model
  switch (performanceSettings.model) {
    case 'seasonal':
      // Use a base rate for seasonal calculations (typically 25% annually)
      annualGrowthRate = 0.25;
      break;
    case 'custom':
      annualGrowthRate = (performanceSettings.customAnnualGrowthRate || 25) / 100;
      break;
    case 'steady':
    default:
      annualGrowthRate = 0.25; // 25% default
      break;
  }
  
  const performanceData: BitcoinPerformanceData[] = [];
  
  // Generate performance data for each month
  for (let month = 1; month <= maxMonths; month++) {
    if (performanceSettings.model === 'seasonal' && performanceSettings.useSeasonalFactors) {
      // Use complex seasonal model
      const data = calculateBitcoinPerformanceRate(month, annualGrowthRate);
      performanceData.push(data);
    } else {
      // Use steady growth model
      const monthlyRate = Math.pow(1 + annualGrowthRate, 1/12) - 1;
      performanceData.push({
        monthlyPerformanceRate: monthlyRate,
        seasonalFactor: 1,
        cyclePhase: 'steady',
        cycleOffset: 0,
        spotPrice: 0
      });
    }
  }
  
  // Calculate spot prices
  const spotPrices = calculateBitcoinSpotPrices(initialPrice, performanceData, maxMonths);
  
  // Add spot prices to performance data
  performanceData.forEach((data, index) => {
    data.spotPrice = spotPrices[index + 1] || spotPrices[spotPrices.length - 1];
  });
  
  return performanceData;
}

/**
 * Calculate Bitcoin value at a specific month
 * Accounts for BTC sales due to cash flow shortfalls
 */
export function calculateBitcoinValueAtMonth(
  initialInvestment: number,
  initialPrice: number,
  spotPrice: number,
  btcSoldAmount: number = 0
): {
  initialBTC: number;
  remainingBTC: number;
  btcValue: number;
} {
  const initialBTC = initialInvestment / initialPrice;
  const remainingBTC = Math.max(0, initialBTC - btcSoldAmount);
  const btcValue = remainingBTC * spotPrice;
  
  return {
    initialBTC,
    remainingBTC,
    btcValue
  };
}

/**
 * Calculate cumulative BTC sales needed to cover shortfalls
 * This tracks how much BTC needs to be sold monthly to cover negative cash flow
 */
export function calculateBTCSalesForShortfall(
  monthlyCashFlowShortfall: number,
  spotPrice: number,
  availableBTC: number
): {
  btcToSell: number;
  dollarAmount: number;
  remainingBTC: number;
} {
  if (monthlyCashFlowShortfall <= 0 || availableBTC <= 0) {
    return {
      btcToSell: 0,
      dollarAmount: 0,
      remainingBTC: availableBTC
    };
  }
  
  const btcToSell = Math.min(
    monthlyCashFlowShortfall / spotPrice, // BTC needed to cover shortfall
    availableBTC // Can't sell more than we have
  );
  
  const dollarAmount = btcToSell * spotPrice;
  const remainingBTC = availableBTC - btcToSell;
  
  return {
    btcToSell,
    dollarAmount,
    remainingBTC
  };
}

/**
 * Validate Bitcoin performance settings
 */
export function validateBitcoinPerformanceSettings(
  settings: BitcoinPerformanceSettings
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (settings.model === 'custom') {
    const customRate = settings.customAnnualGrowthRate;
    if (!customRate || customRate < -50 || customRate > 500) {
      errors.push('Custom annual growth rate must be between -50% and 500%');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Get human-readable description of performance model
 */
export function getPerformanceModelDescription(
  settings: BitcoinPerformanceSettings
): string {
  switch (settings.model) {
    case 'seasonal':
      return 'Seasonal market cycles with summer bull runs, fall corrections, and spring recoveries over 48-month periods';
    case 'steady':
      return 'Steady compound growth without seasonal variations';
    case 'custom':
      return `Custom growth rate of ${settings.customAnnualGrowthRate}% annually`;
    default:
      return 'Unknown performance model';
  }
} 
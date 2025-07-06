/**
 * Smooth Bitcoin Performance Calculation Engine
 * for KD Bitcoin Real Estate Calculator
 * 
 * This module implements a smooth, realistic Bitcoin performance model with:
 * - 48-month halving cycles (4 years)
 * - User-configurable drawdown percentages
 * - Smooth transitions between bull and bear phases
 * - Realistic stock-like price action
 */

import { 
  BitcoinPerformanceData,
  BitcoinPerformanceSettings,
  CalculatorInputs
} from '@/lib/types';

/**
 * Calculate smooth Bitcoin performance for each month using a 48-month cycle
 * Creates realistic stock-like price action with smooth trends
 * 
 * Cycle phases:
 * - Months 0-11: Accumulation phase (0.5x-1.0x base growth)
 * - Months 12-23: Early bull phase (1.0x-2.0x base growth)
 * - Months 24-35: Peak bull phase (2.0x-3.0x base growth)
 * - Months 36-47: Bear phase (decline and recovery)
 */
export function calculateBitcoinPerformanceRate(
  monthNumber: number,
  annualGrowthRate: number,
  maxDrawdownPercent: number = 70,
  startDate: Date = new Date(2024, 3, 1) // April 2024
): BitcoinPerformanceData {
  // Calculate cycle position (0-47 months)
  const cyclePosition = (monthNumber - 1) % 48;
  
  // Convert annual growth rate to monthly base rate
  const baseMonthlyRate = Math.pow(1 + annualGrowthRate, 1/12) - 1;
  
  let monthlyPerformanceRate: number;
  let cyclePhase: 'summer' | 'fall' | 'winter' | 'spring' | 'steady';
  let seasonalFactor: number;
  
  if (cyclePosition < 12) {
    // Accumulation phase - slow, steady growth with smooth progression
    cyclePhase = 'winter';
    const phaseProgress = cyclePosition / 12; // 0 to 1
    // Smooth curve from 0.5x to 1.0x base rate
    const multiplier = 0.5 + (0.5 * Math.pow(phaseProgress, 0.5));
    monthlyPerformanceRate = baseMonthlyRate * multiplier;
    seasonalFactor = multiplier;
    
  } else if (cyclePosition < 24) {
    // Early bull phase - accelerating growth with smooth curve
    cyclePhase = 'spring';
    const phaseProgress = (cyclePosition - 12) / 12; // 0 to 1
    // Smooth acceleration from 1.0x to 2.0x base rate
    const multiplier = 1.0 + (1.0 * Math.pow(phaseProgress, 0.8));
    monthlyPerformanceRate = baseMonthlyRate * multiplier;
    seasonalFactor = multiplier;
    
  } else if (cyclePosition < 36) {
    // Peak bull phase - peak growth with smooth plateau
    cyclePhase = 'summer';
    const phaseProgress = (cyclePosition - 24) / 12; // 0 to 1
    // Smooth curve that peaks at 3x then gradually reduces to 2x
    const multiplier = 2.0 + (1.0 * Math.sin(phaseProgress * Math.PI));
    monthlyPerformanceRate = baseMonthlyRate * multiplier;
    seasonalFactor = multiplier;
    
  } else {
    // Bear phase - smooth decline and recovery
    cyclePhase = 'fall';
    const phaseProgress = (cyclePosition - 36) / 12; // 0 to 1
    
    // Create smooth S-curve for decline and recovery
    const drawdownDepth = maxDrawdownPercent / 100;
    
    if (phaseProgress < 0.6) {
      // Decline phase - smooth curve down
      const declineProgress = phaseProgress / 0.6; // 0 to 1
      const multiplier = 1.0 - (drawdownDepth * Math.pow(declineProgress, 1.5));
      monthlyPerformanceRate = baseMonthlyRate * Math.max(multiplier, 0.1);
      seasonalFactor = Math.max(multiplier, 0.1);
    } else {
      // Recovery phase - smooth curve back up
      const recoveryProgress = (phaseProgress - 0.6) / 0.4; // 0 to 1
      const multiplier = (1.0 - drawdownDepth) + (drawdownDepth * Math.pow(recoveryProgress, 0.7));
      monthlyPerformanceRate = baseMonthlyRate * multiplier;
      seasonalFactor = multiplier;
    }
  }
  
  return {
    monthlyPerformanceRate,
    seasonalFactor,
    cyclePhase,
    cycleOffset: cyclePosition,
    spotPrice: 0 // Will be calculated separately
  };
}

/**
 * Calculate Bitcoin spot price using smooth compound growth
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
    
    // Ensure smooth price progression with reasonable bounds
    const newPrice = previousPrice * (1 + rate);
    const boundedPrice = Math.max(newPrice, previousPrice * 0.8); // Prevent more than 20% drop in one month
    
    spotPrices.push(boundedPrice);
  }
  
  return spotPrices;
}

/**
 * Generate complete Bitcoin performance timeline with smooth cycles
 */
export function generateBitcoinPerformanceTimeline(
  inputs: CalculatorInputs,
  maxMonths: number = 360
): BitcoinPerformanceData[] {
  const { bitcoinInvestment } = inputs;
  const { performanceSettings } = bitcoinInvestment;
  const initialPrice = bitcoinInvestment.currentBitcoinPrice;
  
  let annualGrowthRate: number;
  const maxDrawdownPercent = performanceSettings.maxDrawdownPercent || 70;
  
  // Determine growth rate based on performance model
  switch (performanceSettings.model) {
    case 'seasonal':
      annualGrowthRate = (performanceSettings.initialCAGR || 25) / 100;
      break;
    case 'custom':
      annualGrowthRate = (performanceSettings.initialCAGR || 25) / 100;
      break;
    case 'steady':
    default:
      annualGrowthRate = (performanceSettings.initialCAGR || 25) / 100;
      break;
  }
  
  const performanceData: BitcoinPerformanceData[] = [];
  
  // Generate performance data for each month
  for (let month = 1; month <= maxMonths; month++) {
    if (performanceSettings.model === 'seasonal' && performanceSettings.useSeasonalFactors) {
      // Use smooth cyclical model
      const data = calculateBitcoinPerformanceRate(
        month, 
        annualGrowthRate, 
        maxDrawdownPercent
      );
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
 * Calculate how much BTC needs to be sold to cover cash flow shortfall
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
  if (monthlyCashFlowShortfall <= 0 || spotPrice <= 0) {
    return {
      btcToSell: 0,
      dollarAmount: 0,
      remainingBTC: availableBTC
    };
  }
  
  const btcToSell = Math.min(
    monthlyCashFlowShortfall / spotPrice,
    availableBTC
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
  
  if (settings.initialCAGR !== undefined) {
    if (settings.initialCAGR < -50 || settings.initialCAGR > 200) {
      errors.push('Custom annual growth rate must be between -50% and 200%');
    }
  }
  
  if (settings.maxDrawdownPercent !== undefined) {
    if (settings.maxDrawdownPercent < 10 || settings.maxDrawdownPercent > 90) {
      errors.push('Maximum drawdown must be between 10% and 90%');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Get a description of the performance model
 */
export function getPerformanceModelDescription(
  settings: BitcoinPerformanceSettings
): string {
  switch (settings.model) {
    case 'seasonal':
      return `Cyclical model with ${settings.maxDrawdownPercent || 70}% max drawdown over 48-month cycles`;
    case 'steady':
      return 'Steady compound growth model';
    case 'custom':
      return `Custom model with ${settings.initialCAGR}% annual growth`;
    default:
      return 'Unknown performance model';
  }
} 
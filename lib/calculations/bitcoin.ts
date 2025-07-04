/**
 * Bitcoin Calculation Functions
 * for KD Bitcoin Real Estate Calculator
 */

import { BitcoinPriceScenario, HistoricalPricePoint } from '@/lib/types';

/**
 * Calculate Bitcoin value after compound appreciation
 */
export function calculateBitcoinAppreciation(
  initialInvestment: number,
  currentPrice: number,
  targetPrice: number,
  timeInYears: number,
  compoundingPeriods: number = 12 // Monthly compounding
): {
  finalValue: number;
  totalReturn: number;
  annualizedReturn: number;
  bitcoinAmount: number;
} {
  const bitcoinAmount = initialInvestment / currentPrice;
  const finalValue = bitcoinAmount * targetPrice;
  const totalReturn = finalValue - initialInvestment;
  
  // Calculate annualized return
  const annualizedReturn = timeInYears > 0 
    ? Math.pow(finalValue / initialInvestment, 1 / timeInYears) - 1 
    : 0;
  
  return {
    finalValue,
    totalReturn,
    annualizedReturn,
    bitcoinAmount,
  };
}

/**
 * Calculate Bitcoin value at specific point in time using compound growth
 */
export function calculateBitcoinValueAtTime(
  initialInvestment: number,
  currentPrice: number,
  annualGrowthRate: number,
  months: number
): {
  bitcoinValue: number;
  bitcoinPrice: number;
  bitcoinAmount: number;
} {
  const bitcoinAmount = initialInvestment / currentPrice;
  const timeInYears = months / 12;
  const bitcoinPrice = currentPrice * Math.pow(1 + annualGrowthRate, timeInYears);
  const bitcoinValue = bitcoinAmount * bitcoinPrice;
  
  return {
    bitcoinValue,
    bitcoinPrice,
    bitcoinAmount,
  };
}

/**
 * Generate Bitcoin price projection timeline
 */
export function generateBitcoinTimeline(
  initialInvestment: number,
  currentPrice: number,
  annualGrowthRate: number,
  totalMonths: number,
  startDate: Date = new Date()
): Array<{
  month: number;
  date: string;
  bitcoinPrice: number;
  bitcoinValue: number;
  bitcoinAmount: number;
  monthlyGrowth: number;
}> {
  const timeline = [];
  const bitcoinAmount = initialInvestment / currentPrice;
  const monthlyGrowthRate = Math.pow(1 + annualGrowthRate, 1/12) - 1;
  
  for (let month = 0; month <= totalMonths; month++) {
    const timeInYears = month / 12;
    const bitcoinPrice = currentPrice * Math.pow(1 + annualGrowthRate, timeInYears);
    const bitcoinValue = bitcoinAmount * bitcoinPrice;
    
    const projectionDate = new Date(startDate);
    projectionDate.setMonth(projectionDate.getMonth() + month);
    
    timeline.push({
      month,
      date: projectionDate.toISOString().substr(0, 7), // YYYY-MM format
      bitcoinPrice,
      bitcoinValue,
      bitcoinAmount,
      monthlyGrowth: month === 0 ? 0 : monthlyGrowthRate,
    });
  }
  
  return timeline;
}

/**
 * Calculate multiple Bitcoin price scenarios
 */
export function calculateMultipleScenarios(
  initialInvestment: number,
  currentPrice: number,
  scenarios: BitcoinPriceScenario[],
  timeHorizonMonths: number
): Array<{
  scenario: BitcoinPriceScenario;
  timeline: Array<{
    month: number;
    bitcoinPrice: number;
    bitcoinValue: number;
    canPayOffAmount: number;
  }>;
  finalValue: number;
  totalReturn: number;
  annualizedReturn: number;
  probabilityOfSuccess: number;
}> {
  return scenarios.map(scenario => {
    const timeline = [];
    const bitcoinAmount = initialInvestment / currentPrice;
    const monthlyGrowthRate = Math.pow(1 + scenario.annualGrowthRate, 1/12) - 1;
    
    for (let month = 0; month <= timeHorizonMonths; month++) {
      const timeInYears = month / 12;
      const bitcoinPrice = currentPrice * Math.pow(1 + scenario.annualGrowthRate, timeInYears);
      const bitcoinValue = bitcoinAmount * bitcoinPrice;
      
      timeline.push({
        month,
        bitcoinPrice,
        bitcoinValue,
        canPayOffAmount: bitcoinValue, // This will be compared to remaining mortgage balance
      });
    }
    
    const finalValue = timeline[timeline.length - 1].bitcoinValue;
    const totalReturn = finalValue - initialInvestment;
    const annualizedReturn = timeHorizonMonths > 0
      ? Math.pow(finalValue / initialInvestment, 12 / timeHorizonMonths) - 1
      : 0;
    
    // Simple probability calculation based on scenario conservativeness
    const probabilityOfSuccess = calculateScenarioProbability(scenario);
    
    return {
      scenario,
      timeline,
      finalValue,
      totalReturn,
      annualizedReturn,
      probabilityOfSuccess,
    };
  });
}

/**
 * Calculate probability of success for a given scenario
 * This is a simplified model - in real implementation, this would use historical data
 */
function calculateScenarioProbability(scenario: BitcoinPriceScenario): number {
  // Simple heuristic based on annual growth rate
  const annualGrowthPercent = scenario.annualGrowthRate * 100;
  
  if (annualGrowthPercent <= 10) return 0.8; // Conservative
  if (annualGrowthPercent <= 25) return 0.6; // Moderate
  if (annualGrowthPercent <= 50) return 0.4; // Aggressive
  if (annualGrowthPercent <= 100) return 0.2; // Very aggressive
  return 0.1; // Extremely aggressive
}

/**
 * Calculate Bitcoin metrics and statistics
 */
export function calculateBitcoinMetrics(
  initialInvestment: number,
  currentPrice: number,
  targetPrice: number,
  timeInYears: number
): {
  bitcoinAmount: number;
  priceAppreciation: number;
  priceAppreciationPercent: number;
  valueAppreciation: number;
  valueAppreciationPercent: number;
  annualizedReturn: number;
  compoundAnnualGrowthRate: number;
  breakEvenPrice: number;
  doubleValuePrice: number;
  tenXValuePrice: number;
} {
  const bitcoinAmount = initialInvestment / currentPrice;
  const priceAppreciation = targetPrice - currentPrice;
  const priceAppreciationPercent = (priceAppreciation / currentPrice) * 100;
  
  const finalValue = bitcoinAmount * targetPrice;
  const valueAppreciation = finalValue - initialInvestment;
  const valueAppreciationPercent = (valueAppreciation / initialInvestment) * 100;
  
  const annualizedReturn = timeInYears > 0 
    ? Math.pow(finalValue / initialInvestment, 1 / timeInYears) - 1 
    : 0;
  
  const compoundAnnualGrowthRate = timeInYears > 0
    ? Math.pow(targetPrice / currentPrice, 1 / timeInYears) - 1
    : 0;
  
  return {
    bitcoinAmount,
    priceAppreciation,
    priceAppreciationPercent,
    valueAppreciation,
    valueAppreciationPercent,
    annualizedReturn,
    compoundAnnualGrowthRate,
    breakEvenPrice: currentPrice, // Price needed to break even
    doubleValuePrice: currentPrice * 2, // Price needed to double investment
    tenXValuePrice: currentPrice * 10, // Price needed for 10x return
  };
}

/**
 * Calculate the time needed to reach a target value
 */
export function calculateTimeToTarget(
  initialInvestment: number,
  currentPrice: number,
  targetValue: number,
  annualGrowthRate: number
): {
  timeInYears: number;
  timeInMonths: number;
  requiredPrice: number;
  isReachable: boolean;
} {
  const bitcoinAmount = initialInvestment / currentPrice;
  const requiredPrice = targetValue / bitcoinAmount;
  
  if (requiredPrice <= currentPrice) {
    return {
      timeInYears: 0,
      timeInMonths: 0,
      requiredPrice,
      isReachable: true,
    };
  }
  
  if (annualGrowthRate <= 0) {
    return {
      timeInYears: Infinity,
      timeInMonths: Infinity,
      requiredPrice,
      isReachable: false,
    };
  }
  
  // Calculate time using compound growth formula: t = ln(final/initial) / ln(1 + r)
  const timeInYears = Math.log(requiredPrice / currentPrice) / Math.log(1 + annualGrowthRate);
  const timeInMonths = timeInYears * 12;
  
  return {
    timeInYears,
    timeInMonths,
    requiredPrice,
    isReachable: timeInYears > 0 && timeInYears < 100, // Reasonable time frame
  };
}

/**
 * Calculate volatility-adjusted scenarios
 */
export function calculateVolatilityScenarios(
  initialInvestment: number,
  currentPrice: number,
  baseAnnualGrowthRate: number,
  volatility: number,
  timeHorizonMonths: number
): {
  optimistic: number;
  expected: number;
  pessimistic: number;
  worstCase: number;
} {
  const bitcoinAmount = initialInvestment / currentPrice;
  const timeInYears = timeHorizonMonths / 12;
  
  // Calculate different scenarios based on volatility
  const optimisticRate = baseAnnualGrowthRate + volatility;
  const expectedRate = baseAnnualGrowthRate;
  const pessimisticRate = baseAnnualGrowthRate - volatility;
  const worstCaseRate = baseAnnualGrowthRate - (volatility * 2);
  
  const optimisticPrice = currentPrice * Math.pow(1 + optimisticRate, timeInYears);
  const expectedPrice = currentPrice * Math.pow(1 + expectedRate, timeInYears);
  const pessimisticPrice = currentPrice * Math.pow(1 + pessimisticRate, timeInYears);
  const worstCasePrice = currentPrice * Math.pow(1 + worstCaseRate, timeInYears);
  
  return {
    optimistic: bitcoinAmount * optimisticPrice,
    expected: bitcoinAmount * expectedPrice,
    pessimistic: bitcoinAmount * pessimisticPrice,
    worstCase: bitcoinAmount * Math.max(worstCasePrice, currentPrice * 0.1), // Floor at 90% loss
  };
}

/**
 * Validate Bitcoin calculation inputs
 */
export function validateBitcoinInputs(
  investment: number,
  currentPrice: number,
  targetPrice: number,
  timeInYears: number
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (investment <= 0) {
    errors.push('Investment amount must be greater than zero');
  }
  
  if (currentPrice <= 0) {
    errors.push('Current Bitcoin price must be greater than zero');
  }
  
  if (targetPrice <= 0) {
    errors.push('Target Bitcoin price must be greater than zero');
  }
  
  if (timeInYears <= 0 || timeInYears > 100) {
    errors.push('Time horizon must be between 0 and 100 years');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
} 
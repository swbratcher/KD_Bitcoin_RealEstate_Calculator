/**
 * Enhanced Bitcoin Performance Engine
 * for KD Bitcoin Real Estate Calculator
 * 
 * Implements season-based Bitcoin performance modeling with:
 * - Real halving date alignment
 * - Asymmetric seasonal cycles (18/12/6/6 months)
 * - Diminishing returns across multiple cycles
 * - Exact loan term length compliance
 * - Smooth multiplicative factors for realistic price action
 */

import { 
  BitcoinPerformanceData,
  BitcoinPerformanceSettings,
  CalculatorInputs
} from '@/lib/types';

import {
  getLoanStartCyclePosition,
  getCurrentSeason,
  addMonths,
  getCycleInfo
} from '@/lib/utils/halving-date-utils';

// Season configuration based on original algorithm
const SEASON_CONFIG = {
  summer: { months: 18, growthPortion: 0.65 },  // Bull market
  fall: { months: 12, growthPortion: 0.0 },     // Bear market decline
  winter: { months: 6, growthPortion: 0.0 },    // Consolidation
  spring: { months: 6, growthPortion: 0.35 }    // Recovery/preparation
};

const TARGET_FALL_FACTOR = 0.30; // 70% total drop over fall months

/**
 * Calculate CAGR for a specific cycle with diminishing returns
 */
export function calculateCycleCAGR(
  cycleNumber: number,
  totalCycles: number,
  initialCAGR: number,
  finalCAGR?: number | null
): number {
  if (!finalCAGR || finalCAGR === null || totalCycles <= 1) {
    return initialCAGR; // Flat rate for all cycles
  }
  
  // Linear interpolation between first and last cycle
  const progress = (cycleNumber - 1) / (totalCycles - 1); // 0 to 1
  const currentCAGR = initialCAGR + (finalCAGR - initialCAGR) * progress;
  
  return Math.max(currentCAGR, 1); // Minimum 1% to prevent negative growth
}

/**
 * Calculate seasonal factors for a given cycle CAGR
 */
function calculateSeasonalFactors(cycleCAGR: number): {
  summerFactorPerMonth: number;
  springFactorPerMonth: number;
  fallFactorPerMonth: number;
  winterFactorPerMonth: number;
} {
  // Convert percentage to decimal
  const annualRate = cycleCAGR / 100;
  
  // Compute 4-year cycle return
  const cycleReturn4y = Math.pow(1 + annualRate, 4);
  const netGainFactor = cycleReturn4y / TARGET_FALL_FACTOR;
  
  // Calculate per-month factors for each season
  const summerFactorPerMonth = Math.pow(netGainFactor, SEASON_CONFIG.summer.growthPortion / SEASON_CONFIG.summer.months);
  const springFactorPerMonth = Math.pow(netGainFactor, SEASON_CONFIG.spring.growthPortion / SEASON_CONFIG.spring.months);
  const fallFactorPerMonth = Math.pow(TARGET_FALL_FACTOR, 1 / SEASON_CONFIG.fall.months);
  const winterFactorPerMonth = 1.0; // No change in winter
  
  return {
    summerFactorPerMonth,
    springFactorPerMonth,
    fallFactorPerMonth,
    winterFactorPerMonth
  };
}

/**
 * Get monthly performance factor with smooth transitions between seasons
 */
function getMonthlyPerformanceFactor(
  cyclePosition: number,
  seasonalFactors: ReturnType<typeof calculateSeasonalFactors>
): number {
  const { summer, fall, winter, spring } = SEASON_CONFIG;
  
  // Calculate annual growth factor (smooth baseline)
  const annualGrowthFactor = Math.pow(seasonalFactors.summerFactorPerMonth, 12);
  const baseMonthlyFactor = Math.pow(annualGrowthFactor, 1/12);
  
  // Add gentle seasonal variation (±10% max) instead of harsh transitions
  let seasonalMultiplier = 1.0;
  
  if (cyclePosition < summer.months) {
    // Summer (months 0-17): Slightly above average
    seasonalMultiplier = 1.05;
  } else if (cyclePosition < summer.months + fall.months) {
    // Fall (months 18-29): Slightly below average
    seasonalMultiplier = 0.98;
  } else if (cyclePosition < summer.months + fall.months + winter.months) {
    // Winter (months 30-35): Neutral
    seasonalMultiplier = 1.0;
  } else {
    // Spring (months 36-47): Moderate recovery
    seasonalMultiplier = 1.02;
  }
  
  return baseMonthlyFactor * seasonalMultiplier;
}

/**
 * Generate Bitcoin performance timeline for exact loan term
 */
export function generateEnhancedBitcoinPerformanceTimeline(
  inputs: CalculatorInputs,
  maxMonths?: number
): BitcoinPerformanceData[] {
  const { bitcoinInvestment, refinanceScenario } = inputs;
  const { performanceSettings } = bitcoinInvestment;
  
  // Calculate exact loan term length
  const loanTermMonths = maxMonths || (
    refinanceScenario.type === 'cash-out-refinance' ? 
      refinanceScenario.newLoanTermYears * 12 :
      30 * 12 // Default to 30 years for HELOC
  );
  const totalCycles = Math.ceil(loanTermMonths / 48);
  
  // Use loan start date from UI settings or default to current month
  const loanStartDate = performanceSettings.loanStartDate || (() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1); // First day of current month
  })();
  const initialCyclePosition = getLoanStartCyclePosition(loanStartDate);
  
  
  const performanceData: BitcoinPerformanceData[] = [];
  
  // Generate data for each month of the loan term
  for (let month = 0; month < loanTermMonths; month++) {
    const currentDate = addMonths(loanStartDate, month);
    
    // Calculate which cycle we're in
    const absoluteMonthInGlobalCycle = initialCyclePosition + month;
    const currentCycle = Math.floor(absoluteMonthInGlobalCycle / 48) + 1;
    const cyclePosition = absoluteMonthInGlobalCycle % 48;
    
    
    // Get CAGR for this cycle (with diminishing returns)
    const initialCAGR = performanceSettings.initialCAGR;
    const cycleCAGR = calculateCycleCAGR(
      currentCycle,
      totalCycles,
      initialCAGR,
      performanceSettings.finalCAGR
    );
    
    // Calculate seasonal factors for this cycle
    const seasonalFactors = calculateSeasonalFactors(cycleCAGR);
    
    // Get monthly performance factor (default to seasonal factors if undefined)
    const useSeasonalFactors = performanceSettings.useSeasonalFactors !== false;
    const monthlyFactor = useSeasonalFactors 
      ? getMonthlyPerformanceFactor(cyclePosition, seasonalFactors)
      : Math.pow(1 + (cycleCAGR / 100), 1/12); // Flat growth if seasonal disabled
    
    // Calculate monthly percentage change
    const monthlyPerformanceRate = month === 0 ? 0 : (monthlyFactor - 1);
    
    // Debug: Add safety check for NaN and log seasonal behavior
    if (isNaN(monthlyPerformanceRate) || isNaN(monthlyFactor)) {
      console.log(`DEBUG month ${month}: cycleCAGR=${cycleCAGR}, monthlyFactor=${monthlyFactor}, seasonalFactors=`, seasonalFactors);
    }
    
    // Get current season info
    const seasonInfo = getCurrentSeason(cyclePosition);
    
    
    // Create performance data entry
    const performanceEntry: BitcoinPerformanceData = {
      cycleOffset: cyclePosition,
      cyclePhase: seasonInfo.season,
      monthlyPerformanceRate,
      seasonalFactor: monthlyFactor,
      spotPrice: 0, // Will be calculated in calculateEnhancedBitcoinValueAtMonth
      currentCycle,
      cycleCAGR,
      monthInLoanTerm: month + 1,
      absoluteMonthInGlobalCycle
    };
    
    performanceData.push(performanceEntry);
  }
  
  return performanceData;
}

/**
 * Calculate Bitcoin value progression with enhanced algorithm
 */
export function calculateEnhancedBitcoinValueAtMonth(
  month: number,
  initialInvestment: number,
  initialPrice: number,
  performanceTimeline: BitcoinPerformanceData[]
): {
  totalValue: number;
  bitcoinHeld: number;
  averagePrice: number;
  currentSpotPrice: number;
} {
  if (month === 0) {
    // Month 0: Use live Bitcoin price
    return {
      totalValue: initialInvestment,
      bitcoinHeld: initialInvestment / initialPrice,
      averagePrice: initialPrice,
      currentSpotPrice: initialPrice
    };
  }
  
  // Apply performance timeline up to current month
  let currentPrice = initialPrice;
  
  for (let i = 1; i <= month && i <= performanceTimeline.length; i++) {
    const monthData = performanceTimeline[i - 1];
    if (monthData && monthData.monthlyPerformanceRate !== undefined) {
      // Apply monthly growth rate
      const growthFactor = 1 + monthData.monthlyPerformanceRate;
      currentPrice = currentPrice * growthFactor;
      
      // Apply safety bounds to prevent extreme volatility
      const previousPrice = i > 1 ? currentPrice / growthFactor : initialPrice;
      currentPrice = Math.max(currentPrice, previousPrice * 0.8); // Max 20% monthly drop
    }
  }
  
  // Calculate current holdings (assuming no sales for now)
  const bitcoinHeld = initialInvestment / initialPrice;
  const totalValue = bitcoinHeld * currentPrice;
  
  return {
    totalValue,
    bitcoinHeld,
    averagePrice: initialPrice, // Simplified - could track weighted average
    currentSpotPrice: currentPrice
  };
}

/**
 * Validate enhanced Bitcoin performance settings
 */
export function validateEnhancedBitcoinPerformanceSettings(
  settings: BitcoinPerformanceSettings
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Validate initial CAGR
  if (!settings.initialCAGR || settings.initialCAGR < 1 || settings.initialCAGR > 200) {
    errors.push('Initial CAGR must be between 1% and 200%');
  }
  
  // Validate final CAGR if provided
  if (settings.finalCAGR !== null && settings.finalCAGR !== undefined) {
    if (settings.finalCAGR < 1 || settings.finalCAGR > 200) {
      errors.push('Final CAGR must be between 1% and 200%');
    }
  }
  
  // Validate drawdown percentage
  if (settings.maxDrawdownPercent < 30 || settings.maxDrawdownPercent > 90) {
    errors.push('Maximum drawdown must be between 30% and 90%');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Get algorithm information for debugging/display
 */
export function getAlgorithmInfo(inputs: CalculatorInputs) {
  const { bitcoinInvestment, refinanceScenario } = inputs;
  const { performanceSettings } = bitcoinInvestment;
  
  const loanTermMonths = refinanceScenario.type === 'cash-out-refinance' ? 
    refinanceScenario.newLoanTermYears * 12 :
    30 * 12; // Default to 30 years for HELOC
  const totalCycles = Math.ceil(loanTermMonths / 48);
  const loanStartDate = performanceSettings.loanStartDate || new Date();
  const cycleInfo = getCycleInfo(loanStartDate);
  
  return {
    loanTermMonths,
    totalCycles,
    initialCyclePosition: getLoanStartCyclePosition(loanStartDate),
    diminishingReturnsEnabled: !!performanceSettings.finalCAGR,
    seasonalFactorsEnabled: performanceSettings.useSeasonalFactors,
    cycleInfo,
    cagrProgression: Array.from({ length: totalCycles }, (_, i) => ({
      cycle: i + 1,
      cagr: calculateCycleCAGR(i + 1, totalCycles, performanceSettings.initialCAGR, performanceSettings.finalCAGR)
    }))
  };
}
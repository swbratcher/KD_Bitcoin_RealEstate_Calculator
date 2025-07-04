/**
 * Calculation Functions Index
 * for KD Bitcoin Real Estate Calculator
 * 
 * This file re-exports all calculation functions from the various modules
 * to provide a centralized import point for the entire application.
 */

// Main Calculator Functions (temporarily disabled - using new comprehensive system)
// export {
//   calculatePayoffScenarios,
//   calculateDetailedMonthlyBreakdown,
//   calculateBreakEvenAnalysis,
//   validateCalculatorInputs,
// } from './calculator';

// Mortgage Calculation Functions
export {
  calculateMonthlyPayment,
  calculateRemainingBalance,
  calculateTotalInterest,
  calculateInterestSaved,
  generateAmortizationSchedule,
  calculateEquityData,
  calculateRefinancePayment,
  calculateHELOCPayment,
  calculateRefinanceBreakEven,
  validateMortgageInputs,
} from './mortgage';

// Bitcoin Calculation Functions
export {
  calculateBitcoinAppreciation,
  calculateBitcoinValueAtTime,
  generateBitcoinTimeline,
  calculateMultipleScenarios,
  calculateBitcoinMetrics,
  calculateTimeToTarget,
  calculateVolatilityScenarios,
  validateBitcoinInputs,
} from './bitcoin';

// NEW: Comprehensive Amortization Functions
export {
  calculateMonthlyPayment as calculateAmortizationPayment,
  calculateRemainingBalance as calculateAmortizationBalance,
  calculateMonthlyPrincipalInterest,
  calculatePropertyAppreciation,
  createBaseAmortizationSchedule,
  calculateDebtToIncomeRatio,
  estimateRequiredIncomeForApproval,
  generateLoanApprovalGuidance,
} from './amortization';

// NEW: Complex Bitcoin Performance Functions  
export {
  calculateBitcoinPerformanceRate,
  calculateBitcoinSpotPrices,
  generateBitcoinPerformanceTimeline,
  calculateBitcoinValueAtMonth,
  calculateBTCSalesForShortfall,
  validateBitcoinPerformanceSettings,
  getPerformanceModelDescription,
} from './bitcoin-performance';

// NEW: Comprehensive Amortization Table Generator
export {
  generateComprehensiveAmortizationTable,
  generateStackedChartData,
  analyzePayoffTrigger,
  calculatePerformanceSummary,
  generateAmortizationResults,
  validateAmortizationInputs,
} from './comprehensive-amortization';

// Utility functions for common calculations
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatPercent = (decimal: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  }).format(decimal);
};

export const formatNumber = (number: number): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(number);
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatMonthYear = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
  });
};

// Constants used throughout calculations
export const CALCULATION_CONSTANTS = {
  // Standard mortgage parameters
  DEFAULT_LOAN_TERM_YEARS: 30,
  DEFAULT_DOWN_PAYMENT_PERCENT: 0.20,
  DEFAULT_MAX_LTV: 0.80,
  DEFAULT_MAX_CASH_OUT_LTV: 0.80,
  
  // Bitcoin parameters
  BITCOIN_DECIMALS: 8,
  MIN_BITCOIN_PRICE: 1000,
  MAX_BITCOIN_PRICE: 10000000,
  
  // Interest rate bounds
  MIN_INTEREST_RATE: 0.01, // 1%
  MAX_INTEREST_RATE: 0.20, // 20%
  
  // Time horizons
  MIN_LOAN_TERM_YEARS: 1,
  MAX_LOAN_TERM_YEARS: 50,
  
  // Calculation precision
  CURRENCY_PRECISION: 2,
  PERCENT_PRECISION: 4,
  
  // Risk assessment thresholds
  RISK_THRESHOLDS: {
    LOW_GROWTH_RATE: 0.10,    // 10% annual growth
    MEDIUM_GROWTH_RATE: 0.25, // 25% annual growth
    HIGH_GROWTH_RATE: 0.50,   // 50% annual growth
    VERY_HIGH_GROWTH_RATE: 1.00, // 100% annual growth
  },
  
  // Scenario probabilities (simplified model)
  SCENARIO_PROBABILITIES: {
    CONSERVATIVE: 0.80,
    MODERATE: 0.60,
    AGGRESSIVE: 0.40,
    VERY_AGGRESSIVE: 0.20,
    EXTREMELY_AGGRESSIVE: 0.10,
  },
}; 
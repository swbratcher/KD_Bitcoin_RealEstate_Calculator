/**
 * Calculation Results Type Definitions
 * for KD Bitcoin Real Estate Calculator
 */

export interface PayoffTimelineEntry {
  /** Month number from start */
  month: number;
  /** Year and month (e.g., "2024-03") */
  date: string;
  /** Remaining mortgage balance */
  remainingBalance: number;
  /** Monthly mortgage payment */
  monthlyPayment: number;
  /** Bitcoin value at this point */
  bitcoinValue: number;
  /** Bitcoin price at this point */
  bitcoinPrice: number;
  /** Can Bitcoin pay off remaining mortgage? */
  canPayOff: boolean;
  /** Surplus if Bitcoin value exceeds remaining balance */
  surplus: number;
}

export interface ScenarioResult {
  /** Scenario name */
  scenarioName: string;
  /** When mortgage can be paid off (in months) */
  payoffMonth: number | null;
  /** When mortgage can be paid off (date string) */
  payoffDate: string | null;
  /** Total interest saved by early payoff */
  interestSaved: number;
  /** Final Bitcoin value at payoff */
  finalBitcoinValue: number;
  /** Final Bitcoin price at payoff */
  finalBitcoinPrice: number;
  /** Surplus after paying off mortgage */
  surplus: number;
  /** Month-by-month timeline */
  timeline: PayoffTimelineEntry[];
  /** Summary statistics */
  summary: {
    totalMonthsToPayoff: number;
    totalYearsToPayoff: number;
    bitcoinReturnRate: number;
    effectiveAnnualReturn: number;
  };
}

export interface CalculationResults {
  /** Results for each Bitcoin price scenario */
  scenarios: ScenarioResult[];
  /** Baseline scenario (no Bitcoin investment) */
  baseline: {
    totalInterestPaid: number;
    totalMonthsToPayoff: number;
    totalYearsToPayoff: number;
    finalPayoffDate: string;
  };
  /** Comparison summary */
  comparison: {
    bestScenario: string;
    worstScenario: string;
    averagePayoffTime: number;
    probabilityOfSuccess: number;
  };
  /** Input parameters used for calculations */
  inputs: CalculatorInputs;
  /** Calculation timestamp */
  calculatedAt: string;
}

export interface MonthlyBreakdown {
  /** Monthly mortgage payment */
  mortgagePayment: number;
  /** Monthly payment breakdown */
  paymentBreakdown: {
    principal: number;
    interest: number;
    taxes: number;
    insurance: number;
    pmi?: number;
  };
  /** Remaining balance after payment */
  remainingBalance: number;
  /** Cumulative interest paid */
  cumulativeInterest: number;
  /** Bitcoin value this month */
  bitcoinValue: number;
  /** Bitcoin price this month */
  bitcoinPrice: number;
}

export interface RiskAnalysis {
  /** Probability of success for each scenario */
  scenarioProbabilities: {
    scenarioName: string;
    probability: number;
    confidenceLevel: number;
  }[];
  /** Risk factors */
  riskFactors: {
    bitcoinVolatility: number;
    interestRateRisk: number;
    propertyValueRisk: number;
    liquidityRisk: number;
  };
  /** Stress test results */
  stressTest: {
    bitcoinPriceDown50Percent: ScenarioResult;
    bitcoinPriceDown25Percent: ScenarioResult;
    interestRateUp2Percent: ScenarioResult;
  };
}

// Import the CalculatorInputs type from property.ts
import { CalculatorInputs } from './property';

// NEW: Comprehensive amortization data structures
export interface MonthlyAmortizationEntry {
  /** Entry number (month from start) */
  month: number;
  /** Date (YYYY-MM-DD format) */
  date: string;
  /** Year and month (for easy filtering) */
  yearMonth: string;
  
  // Debt/Mortgage data
  /** Remaining debt balance */
  debtBalance: number;
  /** Base equity in property */
  baseEquity: number;
  /** Property appreciation this month */
  propertyAppreciation: number;
  
  // Bitcoin data
  /** Amount of BTC held */
  btcHeld: number;
  /** BTC value at current spot price */
  btcValue: number;
  /** BTC spot price this month */
  btcSpotPrice: number;
  /** BTC performance percentage this month */
  btcPerformed: number;
  /** Total asset value (property + BTC) */
  totalAsset: number;
  
  // Payment and cash flow data
  /** Required monthly payment */
  monthlyPayment: number;
  /** Net cash flow from property */
  netCashFlow: number;
  /** BTC sold this month to cover shortfall */
  btcSoldMonthly: number;
  /** Remaining BTC after sales */
  remainingBTC: number;
  
  // Trigger and payoff data
  /** Is payoff trigger met this month? */
  payoffTriggerMet: boolean;
  /** Can mortgage be paid off? */
  canPayOff: boolean;
  /** Amount needed for full payoff */
  payoffAmount: number;
  /** Surplus after payoff (if applicable) */
  surplus: number;
  /** BTC value at trigger point (before payoff execution) */
  btcValueAtTrigger?: number;
  /** Debt balance at trigger point (before payoff execution) */
  debtBalanceAtTrigger?: number;
}

// NEW: Bitcoin performance calculation data
export interface BitcoinPerformanceData {
  /** Monthly performance rate */
  monthlyPerformanceRate: number;
  /** Seasonal factor applied */
  seasonalFactor: number;
  /** Market cycle phase (summer/fall/winter/spring) */
  cyclePhase: 'summer' | 'fall' | 'winter' | 'spring' | 'steady';
  /** Offset within 48-month cycle (0-47) */
  cycleOffset: number;
  /** Calculated spot price */
  spotPrice: number;
  /** Current 4-year cycle number */
  currentCycle?: number;
  /** CAGR for current cycle */
  cycleCAGR?: number;
  /** Month number within loan term */
  monthInLoanTerm?: number;
  /** Absolute month in global cycle timeline */
  absoluteMonthInGlobalCycle?: number;
}

// NEW: Stacked area chart data point
export interface StackedChartDataPoint {
  /** Month from start */
  month: number;
  /** Date string */
  date: string;
  /** Debt amount (red in chart) */
  debt: number;
  /** Base equity amount (green in chart) */
  baseEquity: number;
  /** Property appreciation amount (light green in chart) */
  appreciation: number;
  /** Bitcoin value amount (gold in chart) */
  btcValue: number;
  /** Total value (sum of all layers) */
  totalValue: number;
}

// NEW: Comprehensive amortization results
export interface AmortizationResults {
  /** Full monthly amortization schedule */
  monthlySchedule: MonthlyAmortizationEntry[];
  /** Stacked chart data (20-year view) */
  stackedChartData: StackedChartDataPoint[];
  /** Payoff trigger analysis */
  payoffAnalysis: {
    /** Month when trigger is first met */
    triggerMonth: number | null;
    /** Date when trigger is first met */
    triggerDate: string | null;
    /** BTC value at trigger */
    btcValueAtTrigger: number;
    /** Debt remaining at trigger */
    debtAtTrigger: number;
    /** Total interest saved */
    interestSaved: number;
    /** Final BTC retained */
    finalBTCRetained: number;
  };
  /** Performance summary */
  performanceSummary: {
    /** Total asset value at end */
    finalTotalAsset: number;
    /** Property value at end */
    finalPropertyValue: number;
    /** BTC value at end */
    finalBTCValue: number;
    /** Total return on investment */
    totalROI: number;
    /** Annualized return */
    annualizedReturn: number;
  };
}

export interface DetailedCalculationResults extends CalculationResults {
  /** Detailed monthly breakdown for each scenario */
  monthlyBreakdowns: {
    [scenarioName: string]: MonthlyBreakdown[];
  };
  /** Risk analysis */
  riskAnalysis: RiskAnalysis;
  /** Alternative scenarios */
  alternativeScenarios: {
    partialPayoff: ScenarioResult[];
    refinanceAgain: ScenarioResult[];
    sellAndReinvest: ScenarioResult[];
  };
} 
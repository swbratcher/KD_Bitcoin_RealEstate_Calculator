/**
 * Property and Mortgage Type Definitions
 * for KD Bitcoin Real Estate Calculator
 */

export interface PropertyData {
  /** Current market value of the property */
  currentValue: number;
  /** Original purchase price */
  purchasePrice?: number;
  /** Year the property was purchased */
  purchaseYear?: number;
  /** Property address or description */
  address?: string;
  /** Property type (single family, condo, etc.) */
  propertyType?: 'single-family' | 'condo' | 'townhouse' | 'multi-family' | 'other';
}

export interface CurrentMortgageData {
  /** Current outstanding mortgage balance */
  currentBalance: number;
  /** Monthly payment amount */
  monthlyPayment: number;
  /** Current interest rate (as decimal, e.g., 0.065 for 6.5%) */
  interestRate: number;
  /** Remaining years on the mortgage */
  remainingYears: number;
  /** Monthly payment breakdown */
  paymentBreakdown?: {
    principal: number;
    interest: number;
    taxes: number;
    insurance: number;
    pmi?: number;
  };
}

export interface EquityData {
  /** Total available equity (property value - mortgage balance) */
  totalEquity: number;
  /** Maximum equity that can be tapped (usually 80-90% of property value) */
  maxTappableEquity: number;
  /** Loan-to-value ratio */
  currentLTV: number;
  /** Maximum LTV allowed for cash-out refinance */
  maxLTV: number;
}

export interface RefinanceScenario {
  /** Type of equity tapping method */
  type: 'cash-out-refinance' | 'heloc';
  /** Amount of cash being extracted */
  cashOutAmount: number;
  /** New loan amount (for cash-out refinance) */
  newLoanAmount: number;
  /** New interest rate */
  newInterestRate: number;
  /** New loan term in years */
  newLoanTermYears: number;
  /** New monthly payment */
  newMonthlyPayment: number;
  /** Closing costs */
  closingCosts?: number;
  /** Monthly payment increase from current mortgage */
  monthlyPaymentIncrease: number;
}

export interface HELOCScenario {
  /** Type identifier */
  type: 'heloc';
  /** HELOC credit limit */
  creditLimit: number;
  /** Amount being drawn from HELOC */
  drawAmount: number;
  /** HELOC interest rate */
  interestRate: number;
  /** Monthly payment on HELOC */
  monthlyPayment: number;
  /** Combined monthly payment (original mortgage + HELOC) */
  combinedMonthlyPayment: number;
}

export type EquityTappingScenario = RefinanceScenario | HELOCScenario;

// NEW: Property income and expense data
export interface PropertyIncomeData {
  /** Monthly rental income or desired payment amount */
  monthlyRentalIncome: number;
  /** Monthly property taxes */
  monthlyTaxes: number;
  /** Monthly insurance costs */
  monthlyInsurance: number;
  /** Monthly HOA or other fees */
  monthlyHOA: number;
  /** Calculated net monthly cash flow */
  netMonthlyCashFlow: number;
}

// NEW: Bitcoin performance settings
export interface BitcoinPerformanceSettings {
  /** Performance model type */
  model: 'seasonal' | 'steady' | 'custom';
  /** Custom annual growth rate (if model is 'custom') */
  customAnnualGrowthRate?: number;
  /** Enable seasonal market cycle calculations */
  useSeasonalFactors: boolean;
}

// NEW: Payoff trigger settings
export interface PayoffTriggerSettings {
  /** Trigger type */
  type: 'percentage' | 'retained_amount';
  /** Trigger value (percentage of debt or dollar amount) */
  value: number;
}

export interface CalculatorInputs {
  /** Property information */
  property: PropertyData;
  /** Current mortgage details */
  currentMortgage: CurrentMortgageData;
  /** Property income and expenses */
  propertyIncome: PropertyIncomeData;
  /** Chosen refinance scenario */
  refinanceScenario: EquityTappingScenario;
  /** Bitcoin investment parameters */
  bitcoinInvestment: {
    /** Amount to invest in Bitcoin (from cash-out) */
    investmentAmount: number;
    /** Current Bitcoin price */
    currentBitcoinPrice: number;
    /** Target Bitcoin price scenarios */
    targetScenarios: BitcoinPriceScenario[];
    /** Performance settings */
    performanceSettings: BitcoinPerformanceSettings;
  };
  /** Payoff trigger settings */
  payoffTrigger: PayoffTriggerSettings;
}

export interface BitcoinPriceScenario {
  /** Scenario name (e.g., "Conservative", "Moderate", "Aggressive") */
  name: string;
  /** Target Bitcoin price */
  targetPrice: number;
  /** Annual growth rate assumption */
  annualGrowthRate: number;
  /** Time horizon in years */
  timeHorizonYears: number;
} 
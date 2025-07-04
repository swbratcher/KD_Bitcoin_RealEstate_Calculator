/**
 * Type Definitions Index
 * for KD Bitcoin Real Estate Calculator
 * 
 * This file re-exports all types from the various type definition modules
 * to provide a centralized import point for the entire application.
 */

// Property and Mortgage Types
export type {
  PropertyData,
  CurrentMortgageData,
  EquityData,
  RefinanceScenario,
  HELOCScenario,
  EquityTappingScenario,
  CalculatorInputs,
  BitcoinPriceScenario,
  // NEW: Comprehensive data structures
  PropertyIncomeData,
  BitcoinPerformanceSettings,
  PayoffTriggerSettings,
} from './property';

// Calculation Results Types
export type {
  PayoffTimelineEntry,
  ScenarioResult,
  CalculationResults,
  MonthlyBreakdown,
  RiskAnalysis,
  DetailedCalculationResults,
  // NEW: Comprehensive amortization types
  MonthlyAmortizationEntry,
  BitcoinPerformanceData,
  StackedChartDataPoint,
  AmortizationResults,
} from './calculations';

// API Types
export type {
  CoinGeckoSimplePrice,
  CoinGeckoHistoricalPrice,
  CoinGeckoMarketData,
  BitcoinPriceData,
  HistoricalPricePoint,
  PriceProjection,
  APIError,
  APIResponse,
  RateLimitInfo,
  BitcoinAPIResponse,
  HistoricalDataRequest,
  HistoricalDataResponse,
  PriceAlert,
} from './api';

// Common utility types used throughout the application
export type Currency = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD';

export type TimeRange = 
  | '1d'
  | '7d'
  | '30d'
  | '90d'
  | '1y'
  | '2y'
  | '5y'
  | 'max';

export type ChartType = 
  | 'line'
  | 'bar'
  | 'area'
  | 'candlestick';

export type CalculationStatus = 
  | 'idle'
  | 'calculating'
  | 'completed'
  | 'error';

export type Theme = 'light' | 'dark' | 'system';

// Form validation types
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface FormState {
  isValid: boolean;
  errors: ValidationError[];
  touched: Set<string>;
  dirty: boolean;
}

// Application state types
export interface AppState {
  /** Current calculation inputs */
  inputs: import('./property').CalculatorInputs | null;
  /** Current calculation results */
  results: import('./calculations').CalculationResults | null;
  /** Current Bitcoin price data */
  bitcoinPrice: import('./api').BitcoinPriceData | null;
  /** Calculation status */
  calculationStatus: CalculationStatus;
  /** Form state */
  formState: FormState;
  /** UI theme */
  theme: Theme;
  /** Error state */
  error: string | null;
  /** Loading states */
  loading: {
    bitcoinPrice: boolean;
    calculation: boolean;
    historicalData: boolean;
  };
}

// Component prop types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface InputFieldProps extends BaseComponentProps {
  label: string;
  value: string | number;
  onChange: (value: string | number) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  type?: 'text' | 'number' | 'email' | 'password';
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
} 
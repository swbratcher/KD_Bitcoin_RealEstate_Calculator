/**
 * Comprehensive Amortization Calculation Engine
 * for KD Bitcoin Real Estate Calculator
 * 
 * This module implements the sophisticated financial modeling
 * seen in the Google Sheet, including:
 * - Monthly mortgage amortization with P&I breakdown
 * - Property appreciation tracking
 * - Integration points for Bitcoin performance calculations
 */

import { 
  MonthlyAmortizationEntry,
  CalculatorInputs,
  AmortizationResults,
  BitcoinPerformanceData,
  StackedChartDataPoint
} from '@/lib/types';

/**
 * Calculate monthly mortgage payment using standard amortization formula
 * Formula: PMT = P * [r(1+r)^n] / [(1+r)^n - 1]
 */
export function calculateMonthlyPayment(
  principal: number,
  annualInterestRate: number,
  termYears: number
): number {
  const monthlyRate = annualInterestRate / 12;
  const numberOfPayments = termYears * 12;
  
  if (monthlyRate === 0) {
    return principal / numberOfPayments;
  }
  
  const payment = principal * 
    (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    
  return payment;
}

/**
 * Calculate remaining balance using the Google Sheet formula
 * Formula from user: -PV(rate/12, (term*12)-(month-1), PMT(rate/12,term*12,-principal), 0)
 */
export function calculateRemainingBalance(
  originalPrincipal: number,
  annualInterestRate: number,
  termYears: number,
  monthNumber: number
): number {
  const monthlyRate = annualInterestRate / 12;
  const totalMonths = termYears * 12;
  const remainingMonths = totalMonths - (monthNumber - 1);
  
  if (remainingMonths <= 0) return 0;
  
  const monthlyPayment = calculateMonthlyPayment(originalPrincipal, annualInterestRate, termYears);
  
  if (monthlyRate === 0) {
    return originalPrincipal - (monthlyPayment * (monthNumber - 1));
  }
  
  // PV calculation: -PV(rate, nper, pmt, fv)
  const presentValue = monthlyPayment * 
    (1 - Math.pow(1 + monthlyRate, -remainingMonths)) / monthlyRate;
    
  return Math.max(0, presentValue);
}

/**
 * Calculate monthly principal and interest breakdown
 */
export function calculateMonthlyPrincipalInterest(
  remainingBalance: number,
  monthlyPayment: number,
  monthlyInterestRate: number
): { principal: number; interest: number } {
  const interestPayment = remainingBalance * monthlyInterestRate;
  const principalPayment = monthlyPayment - interestPayment;
  
  return {
    principal: Math.max(0, principalPayment),
    interest: Math.max(0, interestPayment)
  };
}

/**
 * Calculate property appreciation for a given month
 * Assumes steady appreciation rate
 */
export function calculatePropertyAppreciation(
  initialValue: number,
  annualAppreciationRate: number,
  monthNumber: number
): number {
  const monthlyRate = annualAppreciationRate / 12;
  const appreciatedValue = initialValue * Math.pow(1 + monthlyRate, monthNumber);
  return appreciatedValue - initialValue;
}

/**
 * Create base amortization schedule without Bitcoin calculations
 * This provides the foundation for the comprehensive model
 */
export function createBaseAmortizationSchedule(
  inputs: CalculatorInputs,
  maxMonths: number = 360 // 30 years max
): Omit<MonthlyAmortizationEntry, 'btcHeld' | 'btcValue' | 'btcSpotPrice' | 'btcPerformed' | 'totalAsset' | 'btcSoldMonthly' | 'remainingBTC' | 'payoffTriggerMet'>[] {
  const schedule: Omit<MonthlyAmortizationEntry, 'btcHeld' | 'btcValue' | 'btcSpotPrice' | 'btcPerformed' | 'totalAsset' | 'btcSoldMonthly' | 'remainingBTC' | 'payoffTriggerMet'>[] = [];
  
  const { property, currentMortgage, refinanceScenario, propertyIncome } = inputs;
  
  // Determine loan details based on scenario type
  const isRefinance = refinanceScenario.type === 'cash-out-refinance';
  
  let loanAmount: number;
  let interestRate: number;
  let termYears: number;
  
  if (isRefinance) {
    // Cast to RefinanceScenario to access refinance-specific properties
    const refiScenario = refinanceScenario as any;
    loanAmount = refiScenario.newLoanAmount;
    interestRate = refiScenario.newInterestRate;
    termYears = refiScenario.newLoanTermYears;
  } else {
    // HELOC scenario
    const helocScenario = refinanceScenario as any;
    loanAmount = currentMortgage.currentBalance;
    interestRate = helocScenario.interestRate;
    termYears = helocScenario.newLoanTermYears || 10; // Default HELOC term
  }
  
  // Calculate monthly payment
  const monthlyPayment = calculateMonthlyPayment(loanAmount, interestRate, termYears);
  
  // Property appreciation rate (assume 3% annually for now)
  const propertyAppreciationRate = 0.03;
  
  const startDate = new Date(2024, 3, 1); // Start from April 2024
  
  for (let month = 1; month <= maxMonths; month++) {
    const currentDate = new Date(startDate);
    currentDate.setMonth(startDate.getMonth() + month - 1);
    
    const dateString = currentDate.toISOString().split('T')[0];
    const yearMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    
    // Calculate remaining balance
    const debtBalance = calculateRemainingBalance(loanAmount, interestRate, termYears, month);
    
    // If loan is paid off, stop the schedule
    if (debtBalance <= 0.01) break;
    
    // Calculate P&I breakdown
    const monthlyInterestRate = interestRate / 12;
    const piBreakdown = calculateMonthlyPrincipalInterest(
      debtBalance, 
      monthlyPayment, 
      monthlyInterestRate
    );
    
    // Calculate property values
    const propertyAppreciation = calculatePropertyAppreciation(
      property.currentValue,
      propertyAppreciationRate,
      month
    );
    const baseEquity = property.currentValue - debtBalance + propertyAppreciation;
    
    // Net cash flow calculation
    const netCashFlow = propertyIncome.monthlyRentalIncome - 
      (propertyIncome.monthlyTaxes + propertyIncome.monthlyInsurance + propertyIncome.monthlyHOA + monthlyPayment);
    
    const entry: Omit<MonthlyAmortizationEntry, 'btcHeld' | 'btcValue' | 'btcSpotPrice' | 'btcPerformed' | 'totalAsset' | 'btcSoldMonthly' | 'remainingBTC' | 'payoffTriggerMet'> = {
      month,
      date: dateString,
      yearMonth,
      debtBalance,
      baseEquity,
      propertyAppreciation,
      monthlyPayment,
      netCashFlow,
      canPayOff: false, // Will be determined with Bitcoin calculations
      payoffAmount: debtBalance,
      surplus: 0
    };
    
    schedule.push(entry);
  }
  
  return schedule;
}

/**
 * Calculate debt-to-income ratio for loan approval guidance
 */
export function calculateDebtToIncomeRatio(
  monthlyDebtPayments: number,
  monthlyGrossIncome: number
): number {
  return monthlyDebtPayments / monthlyGrossIncome;
}

/**
 * Estimate required income for loan approval
 * Most lenders want DTI < 36-43%
 */
export function estimateRequiredIncomeForApproval(
  newMonthlyPayment: number,
  existingMonthlyDebts: number = 0,
  maxDTIRatio: number = 0.36
): number {
  const totalMonthlyDebt = newMonthlyPayment + existingMonthlyDebts;
  return totalMonthlyDebt / maxDTIRatio;
}

/**
 * Generate loan approval guidance
 */
export function generateLoanApprovalGuidance(
  inputs: CalculatorInputs,
  estimatedMonthlyIncome?: number
): {
  estimatedPayment: number;
  requiredIncome: number;
  currentDTI?: number;
  approvalLikelihood: 'excellent' | 'good' | 'marginal' | 'poor';
  recommendations: string[];
} {
  // Handle different scenario types
  let loanAmount: number;
  let interestRate: number;
  let termYears: number;
  
  if (inputs.refinanceScenario.type === 'cash-out-refinance') {
    const refiScenario = inputs.refinanceScenario as any;
    loanAmount = refiScenario.newLoanAmount;
    interestRate = refiScenario.newInterestRate;
    termYears = refiScenario.newLoanTermYears;
  } else {
    const helocScenario = inputs.refinanceScenario as any;
    loanAmount = inputs.currentMortgage.currentBalance;
    interestRate = helocScenario.interestRate;
    termYears = helocScenario.newLoanTermYears || 10;
  }
  
  const estimatedPayment = calculateMonthlyPayment(loanAmount, interestRate, termYears);
  
  const requiredIncome = estimateRequiredIncomeForApproval(estimatedPayment);
  
  let currentDTI: number | undefined;
  let approvalLikelihood: 'excellent' | 'good' | 'marginal' | 'poor' = 'good';
  const recommendations: string[] = [];
  
  if (estimatedMonthlyIncome) {
    currentDTI = calculateDebtToIncomeRatio(estimatedPayment, estimatedMonthlyIncome);
    
    if (currentDTI <= 0.28) {
      approvalLikelihood = 'excellent';
    } else if (currentDTI <= 0.36) {
      approvalLikelihood = 'good';
    } else if (currentDTI <= 0.43) {
      approvalLikelihood = 'marginal';
      recommendations.push('Consider increasing income or reducing loan amount');
    } else {
      approvalLikelihood = 'poor';
      recommendations.push('Loan approval unlikely with current income');
      recommendations.push('Consider significant income increase or smaller loan amount');
    }
  }
  
  // Add general recommendations
  if (inputs.property.currentValue < loanAmount * 1.25) {
    recommendations.push('Consider lower loan-to-value ratio for better rates');
  }
  
  return {
    estimatedPayment,
    requiredIncome,
    currentDTI,
    approvalLikelihood,
    recommendations
  };
} 
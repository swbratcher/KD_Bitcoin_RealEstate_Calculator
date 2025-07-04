/**
 * Mortgage Calculation Functions
 * for KD Bitcoin Real Estate Calculator
 */

import { 
  CurrentMortgageData, 
  RefinanceScenario, 
  HELOCScenario, 
  EquityData,
  MonthlyBreakdown,
  PayoffTimelineEntry 
} from '@/lib/types';

/**
 * Calculate monthly mortgage payment using standard formula
 * P = L[c(1 + c)^n]/[(1 + c)^n - 1]
 * where P = monthly payment, L = loan amount, c = monthly interest rate, n = number of payments
 */
export function calculateMonthlyPayment(
  loanAmount: number,
  annualInterestRate: number,
  loanTermYears: number
): number {
  if (loanAmount <= 0 || annualInterestRate < 0 || loanTermYears <= 0) {
    throw new Error('Invalid loan parameters');
  }

  // Convert annual rate to monthly rate
  const monthlyRate = annualInterestRate / 12;
  const totalPayments = loanTermYears * 12;

  // Handle zero interest rate case
  if (monthlyRate === 0) {
    return loanAmount / totalPayments;
  }

  // Standard mortgage payment formula
  const numerator = loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalPayments);
  const denominator = Math.pow(1 + monthlyRate, totalPayments) - 1;
  
  return numerator / denominator;
}

/**
 * Calculate remaining balance after a given number of payments
 */
export function calculateRemainingBalance(
  originalLoanAmount: number,
  annualInterestRate: number,
  loanTermYears: number,
  paymentsMade: number
): number {
  if (paymentsMade <= 0) return originalLoanAmount;
  
  const monthlyRate = annualInterestRate / 12;
  const totalPayments = loanTermYears * 12;
  
  if (paymentsMade >= totalPayments) return 0;
  
  // Handle zero interest rate case
  if (monthlyRate === 0) {
    const monthlyPrincipal = originalLoanAmount / totalPayments;
    return originalLoanAmount - (monthlyPrincipal * paymentsMade);
  }
  
  // Standard remaining balance formula
  const factor = Math.pow(1 + monthlyRate, totalPayments);
  const paymentsFactor = Math.pow(1 + monthlyRate, paymentsMade);
  
  return originalLoanAmount * (factor - paymentsFactor) / (factor - 1);
}

/**
 * Calculate total interest that will be paid over the life of the loan
 */
export function calculateTotalInterest(
  loanAmount: number,
  annualInterestRate: number,
  loanTermYears: number
): number {
  const monthlyPayment = calculateMonthlyPayment(loanAmount, annualInterestRate, loanTermYears);
  const totalPayments = loanTermYears * 12;
  
  return (monthlyPayment * totalPayments) - loanAmount;
}

/**
 * Calculate interest saved by paying off loan early
 */
export function calculateInterestSaved(
  remainingBalance: number,
  annualInterestRate: number,
  remainingMonths: number
): number {
  if (remainingBalance <= 0 || remainingMonths <= 0) return 0;
  
  // Calculate what total interest would be if loan continued
  const monthlyPayment = calculateMonthlyPayment(remainingBalance, annualInterestRate, remainingMonths / 12);
  const totalPayments = monthlyPayment * remainingMonths;
  
  return totalPayments - remainingBalance;
}

/**
 * Generate complete amortization schedule
 */
export function generateAmortizationSchedule(
  loanAmount: number,
  annualInterestRate: number,
  loanTermYears: number,
  startDate: Date = new Date()
): MonthlyBreakdown[] {
  const schedule: MonthlyBreakdown[] = [];
  const monthlyPayment = calculateMonthlyPayment(loanAmount, annualInterestRate, loanTermYears);
  const monthlyRate = annualInterestRate / 12;
  const totalPayments = loanTermYears * 12;
  
  let remainingBalance = loanAmount;
  let cumulativeInterest = 0;
  
  for (let month = 1; month <= totalPayments; month++) {
    const interestPayment = remainingBalance * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;
    
    // Ensure we don't go negative on the final payment
    const actualPrincipalPayment = Math.min(principalPayment, remainingBalance);
    const actualInterestPayment = Math.min(interestPayment, monthlyPayment - actualPrincipalPayment);
    
    remainingBalance -= actualPrincipalPayment;
    cumulativeInterest += actualInterestPayment;
    
    // Ensure balance doesn't go negative due to floating point precision
    if (remainingBalance < 0.01) remainingBalance = 0;
    
    schedule.push({
      mortgagePayment: actualPrincipalPayment + actualInterestPayment,
      paymentBreakdown: {
        principal: actualPrincipalPayment,
        interest: actualInterestPayment,
        taxes: 0, // These would be added separately based on property taxes
        insurance: 0, // These would be added separately based on insurance
      },
      remainingBalance: remainingBalance,
      cumulativeInterest: cumulativeInterest,
      bitcoinValue: 0, // Will be calculated separately
      bitcoinPrice: 0, // Will be calculated separately
    });
    
    // Stop if balance is paid off
    if (remainingBalance <= 0) break;
  }
  
  return schedule;
}

/**
 * Calculate equity available for tapping
 */
export function calculateEquityData(
  propertyValue: number,
  currentMortgageBalance: number,
  maxLTV: number = 0.80
): EquityData {
  const totalEquity = propertyValue - currentMortgageBalance;
  const maxLoanAmount = propertyValue * maxLTV;
  const maxTappableEquity = maxLoanAmount - currentMortgageBalance;
  const currentLTV = currentMortgageBalance / propertyValue;
  
  return {
    totalEquity,
    maxTappableEquity: Math.max(0, maxTappableEquity),
    currentLTV,
    maxLTV,
  };
}

/**
 * Calculate new mortgage payment for cash-out refinance
 */
export function calculateRefinancePayment(
  currentBalance: number,
  cashOutAmount: number,
  newInterestRate: number,
  newLoanTermYears: number,
  closingCosts: number = 0
): RefinanceScenario {
  const newLoanAmount = currentBalance + cashOutAmount + closingCosts;
  const newMonthlyPayment = calculateMonthlyPayment(newLoanAmount, newInterestRate, newLoanTermYears);
  
  return {
    type: 'cash-out-refinance',
    cashOutAmount,
    newLoanAmount,
    newInterestRate,
    newLoanTermYears,
    newMonthlyPayment,
    closingCosts,
    monthlyPaymentIncrease: 0, // Will be calculated when comparing to current payment
  };
}

/**
 * Calculate HELOC payment scenario
 */
export function calculateHELOCPayment(
  helocAmount: number,
  helocInterestRate: number,
  helocTermYears: number,
  currentMortgagePayment: number
): HELOCScenario {
  const helocMonthlyPayment = calculateMonthlyPayment(helocAmount, helocInterestRate, helocTermYears);
  const combinedMonthlyPayment = currentMortgagePayment + helocMonthlyPayment;
  
  return {
    type: 'heloc',
    creditLimit: helocAmount * 1.2, // Assuming 20% buffer
    drawAmount: helocAmount,
    interestRate: helocInterestRate,
    monthlyPayment: helocMonthlyPayment,
    combinedMonthlyPayment,
  };
}

/**
 * Calculate the break-even point for refinancing
 */
export function calculateRefinanceBreakEven(
  currentMonthlyPayment: number,
  newMonthlyPayment: number,
  closingCosts: number
): number {
  const monthlySavings = currentMonthlyPayment - newMonthlyPayment;
  
  if (monthlySavings <= 0) {
    return Infinity; // Never breaks even if new payment is higher
  }
  
  return Math.ceil(closingCosts / monthlySavings);
}

/**
 * Validate mortgage calculation inputs
 */
export function validateMortgageInputs(
  loanAmount: number,
  interestRate: number,
  termYears: number
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (loanAmount <= 0) {
    errors.push('Loan amount must be greater than zero');
  }
  
  if (interestRate < 0 || interestRate > 1) {
    errors.push('Interest rate must be between 0 and 100% (as decimal)');
  }
  
  if (termYears <= 0 || termYears > 50) {
    errors.push('Loan term must be between 1 and 50 years');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
} 
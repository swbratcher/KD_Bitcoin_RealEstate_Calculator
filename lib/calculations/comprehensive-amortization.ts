/**
 * Comprehensive Monthly Amortization Table Generator
 * for KD Bitcoin Real Estate Calculator
 * 
 * This module combines the debt paydown engine with the Bitcoin performance engine
 * to create the detailed month-by-month amortization table that matches
 * the Google Sheet structure with all columns and calculations.
 */

import { 
  MonthlyAmortizationEntry,
  CalculatorInputs,
  AmortizationResults,
  BitcoinPerformanceData,
  StackedChartDataPoint
} from '@/lib/types';

import {
  createBaseAmortizationSchedule,
  calculateMonthlyPayment,
  calculateRemainingBalance,
  calculatePropertyAppreciation
} from './amortization';

import {
  generateEnhancedBitcoinPerformanceTimeline,
  calculateEnhancedBitcoinValueAtMonth
} from './enhanced-bitcoin-performance';

import {
  calculateBTCSalesForShortfall
} from './bitcoin-performance';

/**
 * Generate comprehensive monthly amortization table
 * Combines debt paydown + Bitcoin performance + cash flow analysis
 */
export function generateComprehensiveAmortizationTable(
  inputs: CalculatorInputs,
  maxMonths?: number
): MonthlyAmortizationEntry[] {
  const { property, refinanceScenario, bitcoinInvestment, propertyIncome, payoffTrigger } = inputs;
  
  // Always calculate minimum 20 years (240 months), even if loan is shorter or paid off early
  const loanTermMonths = maxMonths || (
    refinanceScenario.type === 'cash-out-refinance' ? 
      refinanceScenario.newLoanTermYears * 12 :
      30 * 12 // Default to 30 years for HELOC
  );
  const calculationMonths = Math.max(240, loanTermMonths); // Minimum 20 years
  
  // Get loan start date from performance settings or default to current month
  const loanStartDate = inputs.bitcoinInvestment.performanceSettings.loanStartDate || (() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  })();

  // Get base amortization schedule (debt paydown only) - use original loan term
  const baseSchedule = createBaseAmortizationSchedule(inputs, loanTermMonths, loanStartDate);
  
  // Get enhanced Bitcoin performance timeline with real halving alignment - use full calculation period
  const bitcoinPerformance = generateEnhancedBitcoinPerformanceTimeline(inputs, calculationMonths);
  
  // Initialize Bitcoin tracking variables
  const initialBTCInvestment = bitcoinInvestment.investmentAmount;
  const initialBTCPrice = bitcoinInvestment.currentBitcoinPrice;
  const initialBTCHeld = initialBTCInvestment / initialBTCPrice;
  
  
  let cumulativeBTCSold = 0;
  let remainingBTC = initialBTCHeld;
  
  const comprehensiveSchedule: MonthlyAmortizationEntry[] = [];
  
  for (let i = 0; i < calculationMonths && i < bitcoinPerformance.length; i++) {
    const baseEntry = baseSchedule[i]; // May be undefined after loan term
    const btcPerformance = bitcoinPerformance[i];
    
    // Calculate Bitcoin data for this month using enhanced algorithm
    const btcValueData = calculateEnhancedBitcoinValueAtMonth(
      i, // month number
      initialBTCInvestment,
      initialBTCPrice,
      bitcoinPerformance
    );
    
    const btcSpotPrice = btcValueData.currentSpotPrice;
    const btcValue = remainingBTC * btcSpotPrice;
    
    // Update the performance entry with calculated spot price
    bitcoinPerformance[i].spotPrice = btcSpotPrice;
    
    // Determine if we're in loan period or post-payoff period
    const isLoanActive = baseEntry && baseEntry.debtBalance > 0;
    
    // Calculate cash flow shortfall (only during loan period)
    let monthlyCashFlowShortfall = 0;
    let btcSales = { btcToSell: 0, dollarAmount: 0, remainingBTC };
    
    if (isLoanActive) {
      const totalMonthlyExpenses = baseEntry.monthlyPayment + 
        propertyIncome.monthlyTaxes + 
        propertyIncome.monthlyInsurance + 
        propertyIncome.monthlyHOA;
      
      monthlyCashFlowShortfall = Math.max(0, totalMonthlyExpenses - propertyIncome.monthlyRentalIncome);
      
      // Calculate BTC sales needed to cover shortfall
      btcSales = calculateBTCSalesForShortfall(
        monthlyCashFlowShortfall, 
        btcSpotPrice, 
        remainingBTC
      );
      
      // Update BTC holdings
      remainingBTC = btcSales.remainingBTC;
      cumulativeBTCSold += btcSales.btcToSell;
    }
    // Post-loan period: no more BTC sales, BTC continues to grow
    
    // Calculate property appreciation (continues growing even after loan payoff)
    const propertyAppreciation = calculatePropertyAppreciation(
      property.currentValue,
      property.appreciationRate || 0.03,
      i + 1 // month number (1-based)
    );
    
    // Calculate values based on loan status
    const debtBalance = isLoanActive ? baseEntry.debtBalance : 0;
    const baseEquity = property.currentValue - debtBalance;
    const propertyValue = property.currentValue + propertyAppreciation;
    const totalAsset = propertyValue + btcValue;
    
    // Calculate payoff trigger analysis (only relevant during loan period)
    const payoffTriggerMet = isLoanActive ? checkPayoffTrigger(btcValue, debtBalance, payoffTrigger) : false;
    const canPayOff = isLoanActive ? btcValue >= debtBalance : true;
    const payoffAmount = debtBalance; // Amount needed for full payoff
    const surplus = canPayOff ? btcValue - debtBalance : btcValue;
    
    // Calculate date for this month
    const currentDate = new Date(loanStartDate);
    currentDate.setMonth(loanStartDate.getMonth() + i);
    const dateString = currentDate.toISOString().split('T')[0];
    const yearMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    
    // Create comprehensive entry
    const entry: MonthlyAmortizationEntry = {
      month: i + 1,
      date: dateString,
      yearMonth,
      debtBalance,
      baseEquity,
      propertyAppreciation,
      monthlyPayment: isLoanActive ? baseEntry.monthlyPayment : 0,
      netCashFlow: isLoanActive ? baseEntry.netCashFlow : propertyIncome.monthlyRentalIncome - (propertyIncome.monthlyTaxes + propertyIncome.monthlyInsurance + propertyIncome.monthlyHOA),
      // Bitcoin data
      btcHeld: remainingBTC,
      btcValue,
      btcSpotPrice,
      btcPerformed: btcPerformance.monthlyPerformanceRate,
      totalAsset,
      // Cash flow data
      btcSoldMonthly: btcSales.btcToSell,
      remainingBTC,
      // Payoff analysis
      payoffTriggerMet,
      canPayOff,
      payoffAmount,
      surplus
    };
    
    comprehensiveSchedule.push(entry);
    
    // Continue to 20 years minimum even after payoff trigger is met
  }
  
  return comprehensiveSchedule;
}

/**
 * Check if payoff trigger conditions are met
 */
function checkPayoffTrigger(
  btcValue: number, 
  debtBalance: number, 
  payoffTrigger: { type: 'percentage' | 'retained_amount'; value: number }
): boolean {
  switch (payoffTrigger.type) {
    case 'percentage':
      // Trigger when BTC value reaches X% of remaining debt
      const percentageOfDebt = (btcValue / debtBalance) * 100;
      return percentageOfDebt >= payoffTrigger.value;
      
    case 'retained_amount':
      // Trigger when we can pay off debt while retaining X amount in BTC
      const retainedAmount = btcValue - debtBalance;
      return retainedAmount >= payoffTrigger.value;
      
    default:
      return false;
  }
}

/**
 * Generate stacked chart data for visualization
 * Creates 20-year view of debt, base equity, appreciation, and BTC value
 */
export function generateStackedChartData(
  amortizationSchedule: MonthlyAmortizationEntry[],
  property: { currentValue: number }
): StackedChartDataPoint[] {
  const chartMonths = 240; // Always 20 years regardless of loan term or payoff
  const chartData: StackedChartDataPoint[] = [];
  
  for (let i = 0; i < chartMonths; i++) {
    const entry = amortizationSchedule[i];
    
    if (entry) {
      // Use actual amortization data
      const dataPoint: StackedChartDataPoint = {
        month: entry.month,
        date: entry.date,
        debt: entry.debtBalance,
        baseEquity: property.currentValue - entry.debtBalance,
        appreciation: entry.propertyAppreciation,
        btcValue: entry.btcValue,
        totalValue: entry.totalAsset
      };
      chartData.push(dataPoint);
    } else {
      // Extend beyond amortization schedule (loan paid off or shorter term)
      const lastEntry = amortizationSchedule[amortizationSchedule.length - 1];
      const monthNumber = i + 1;
      
      // Calculate date for this month
      const startDate = new Date(lastEntry?.date || new Date());
      const currentDate = new Date(startDate);
      currentDate.setMonth(startDate.getMonth() + (monthNumber - (lastEntry?.month || 1)));
      
      // After loan payoff: debt = 0, base equity = full property value
      const dataPoint: StackedChartDataPoint = {
        month: monthNumber,
        date: currentDate.toISOString().split('T')[0],
        debt: 0, // Loan is paid off
        baseEquity: property.currentValue, // Full property value
        appreciation: lastEntry?.propertyAppreciation || 0, // Keep last appreciation value
        btcValue: lastEntry?.btcValue || 0, // Keep last BTC value
        totalValue: property.currentValue + (lastEntry?.propertyAppreciation || 0) + (lastEntry?.btcValue || 0)
      };
      chartData.push(dataPoint);
    }
  }
  
  return chartData;
}

/**
 * Analyze payoff trigger performance
 */
export function analyzePayoffTrigger(
  amortizationSchedule: MonthlyAmortizationEntry[]
): {
  triggerMonth: number | null;
  triggerDate: string | null;
  btcValueAtTrigger: number;
  debtAtTrigger: number;
  interestSaved: number;
  finalBTCRetained: number;
} {
  let triggerMonth: number | null = null;
  let triggerDate: string | null = null;
  let btcValueAtTrigger = 0;
  let debtAtTrigger = 0;
  let interestSaved = 0;
  let finalBTCRetained = 0;
  
  // Find first month where trigger is met
  for (const entry of amortizationSchedule) {
    if (entry.payoffTriggerMet && entry.canPayOff) {
      triggerMonth = entry.month;
      triggerDate = entry.date;
      btcValueAtTrigger = entry.btcValue;
      debtAtTrigger = entry.debtBalance;
      finalBTCRetained = entry.btcHeld; // Remaining BTC amount, not dollar value
      
      // Calculate interest saved (simplified - would need more complex calculation)
      const remainingMonths = (30 * 12) - entry.month; // Assuming 30-year loan
      interestSaved = remainingMonths * (entry.monthlyPayment * 0.7); // Rough estimate
      
      break;
    }
  }
  
  return {
    triggerMonth,
    triggerDate,
    btcValueAtTrigger,
    debtAtTrigger,
    interestSaved,
    finalBTCRetained
  };
}

/**
 * Calculate performance summary metrics
 */
export function calculatePerformanceSummary(
  amortizationSchedule: MonthlyAmortizationEntry[],
  inputs: CalculatorInputs
): {
  finalTotalAsset: number;
  finalPropertyValue: number;
  finalBTCValue: number;
  totalROI: number;
  annualizedReturn: number;
} {
  const lastEntry = amortizationSchedule[amortizationSchedule.length - 1];
  const initialInvestment = inputs.bitcoinInvestment.investmentAmount;
  const initialPropertyValue = inputs.property.currentValue;
  
  const finalTotalAsset = lastEntry.totalAsset;
  const finalPropertyValue = initialPropertyValue + lastEntry.propertyAppreciation;
  const finalBTCValue = lastEntry.btcValue;
  
  const totalReturn = finalTotalAsset - (initialPropertyValue + initialInvestment);
  const totalROI = totalReturn / (initialPropertyValue + initialInvestment);
  
  const yearsElapsed = lastEntry.month / 12;
  const annualizedReturn = Math.pow(1 + totalROI, 1 / yearsElapsed) - 1;
  
  return {
    finalTotalAsset,
    finalPropertyValue,
    finalBTCValue,
    totalROI,
    annualizedReturn
  };
}

/**
 * Generate complete amortization results
 * Combines all calculations into comprehensive results package
 */
export function generateAmortizationResults(
  inputs: CalculatorInputs,
  maxMonths: number = 360
): AmortizationResults {
  // Generate comprehensive amortization schedule
  const monthlySchedule = generateComprehensiveAmortizationTable(inputs, maxMonths);
  
  // Generate extended schedule for 20-year chart (240 months minimum)
  const chartMaxMonths = Math.max(240, maxMonths);
  const extendedSchedule = monthlySchedule.length < 240 
    ? generateComprehensiveAmortizationTable(inputs, chartMaxMonths)
    : monthlySchedule;
  
  // Generate stacked chart data (always 20 years)
  const stackedChartData = generateStackedChartData(extendedSchedule, inputs.property);
  
  // Analyze payoff trigger
  const payoffAnalysis = analyzePayoffTrigger(monthlySchedule);
  
  // Calculate performance summary
  const performanceSummary = calculatePerformanceSummary(monthlySchedule, inputs);
  
  return {
    monthlySchedule,
    stackedChartData,
    payoffAnalysis,
    performanceSummary
  };
}

/**
 * Validate comprehensive amortization inputs
 */
export function validateAmortizationInputs(
  inputs: CalculatorInputs
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Validate property data
  if (!inputs.property.currentValue || inputs.property.currentValue <= 0) {
    errors.push('Property current value is required and must be positive');
  }
  
  // Validate Bitcoin investment
  if (!inputs.bitcoinInvestment.investmentAmount || inputs.bitcoinInvestment.investmentAmount <= 0) {
    errors.push('Bitcoin investment amount is required and must be positive');
  }
  
  if (!inputs.bitcoinInvestment.currentBitcoinPrice || inputs.bitcoinInvestment.currentBitcoinPrice <= 0) {
    errors.push('Current Bitcoin price is required and must be positive');
  }
  
  // Validate payoff trigger
  if (!inputs.payoffTrigger.value || inputs.payoffTrigger.value <= 0) {
    errors.push('Payoff trigger value is required and must be positive');
  }
  
  if (inputs.payoffTrigger.type === 'percentage' && inputs.payoffTrigger.value > 1000) {
    errors.push('Payoff trigger percentage cannot exceed 1000%');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
} 
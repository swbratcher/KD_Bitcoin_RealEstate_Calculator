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
  let loanPaidOff = false; // Track if loan has been paid off
  
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
    let btcValue = remainingBTC * btcSpotPrice;
    
    // Update the performance entry with calculated spot price
    bitcoinPerformance[i].spotPrice = btcSpotPrice;
    
    // Determine if we're in loan period or post-payoff period
    const isLoanActive = !loanPaidOff && baseEntry && baseEntry.debtBalance > 0;
    
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
      
      // Recalculate BTC value AFTER sales for accurate trigger checking
      btcValue = remainingBTC * btcSpotPrice;
    }
    // Post-loan period: no more BTC sales, BTC continues to grow
    
    // Calculate property appreciation (continues growing even after loan payoff)
    const propertyAppreciation = calculatePropertyAppreciation(
      property.currentValue,
      property.appreciationRate || 0.03,
      i + 1 // month number (1-based)
    );
    
    // Calculate values based on loan status
    const debtBalance = loanPaidOff ? 0 : (isLoanActive ? baseEntry.debtBalance : 0);
    const baseEquity = property.currentValue - debtBalance;
    const propertyValue = property.currentValue + propertyAppreciation;
    const totalAsset = propertyValue + btcValue;
    
    // Store pre-payoff values for accurate trigger reporting
    const btcValueAtTrigger = btcValue;
    const debtBalanceAtTrigger = debtBalance;
    
    // Calculate payoff trigger analysis (only relevant during loan period)
    const payoffTriggerMet = isLoanActive ? checkPayoffTrigger(btcValue, debtBalance, payoffTrigger) : false;
    const canPayOff = isLoanActive ? btcValue >= debtBalance : true;
    const payoffAmount = debtBalance; // Amount needed for full payoff
    const surplus = canPayOff ? btcValue - debtBalance : btcValue;
    
    // Execute payoff when trigger is met
    if (payoffTriggerMet && canPayOff && !loanPaidOff) {
      // Execute the payoff: sell BTC to pay off remaining debt
      const btcToSellForPayoff = debtBalance / btcSpotPrice;
      remainingBTC = remainingBTC - btcToSellForPayoff;
      btcValue = remainingBTC * btcSpotPrice; // Update BTC value after payoff
      loanPaidOff = true; // Mark loan as paid off for all future months
    }
    
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
      monthlyPayment: debtBalance > 0 ? (baseEntry?.monthlyPayment || 0) : 0,
      netCashFlow: debtBalance > 0 ? (baseEntry?.netCashFlow || 0) : propertyIncome.monthlyRentalIncome - (propertyIncome.monthlyTaxes + propertyIncome.monthlyInsurance + propertyIncome.monthlyHOA),
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
      surplus,
      // Store pre-payoff values if trigger fired
      btcValueAtTrigger: payoffTriggerMet ? btcValueAtTrigger : undefined,
      debtBalanceAtTrigger: payoffTriggerMet ? debtBalanceAtTrigger : undefined
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
      // Use pre-payoff values if available, otherwise fall back to entry values
      btcValueAtTrigger = entry.btcValueAtTrigger || entry.btcValue;
      debtAtTrigger = entry.debtBalanceAtTrigger || entry.debtBalance;
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
 * Calculate performance summary metrics at payoff trigger point
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
  // New metrics for enhanced reporting
  componentBreakdown: {
    propertyAppreciationGain: number;
    bitcoinNetContribution: number;
    interestSavings: number;
    totalGain: number;
  };
  efficiencyMetrics: {
    payoffEfficiencyPercent: number;
    leverageRatio: number;
    timeToPayoff: number;
  };
  baselineComparison: {
    traditionalInvestmentValue: number;
    traditionalInvestmentROI: number;
    strategyOutperformance: number;
  };
} {
  const initialInvestment = inputs.bitcoinInvestment.investmentAmount;
  const initialPropertyValue = inputs.property.currentValue;
  
  // Use payoff analysis to get the correct data - it's already working properly
  const payoffAnalysis = analyzePayoffTrigger(amortizationSchedule);
  
  let targetEntry: MonthlyAmortizationEntry;
  let finalBTCValue: number;
  
  if (payoffAnalysis.triggerMonth) {
    // Payoff occurred - use the data from payoff analysis
    targetEntry = amortizationSchedule[payoffAnalysis.triggerMonth - 1];
    
    // Calculate the BTC value as: remaining BTC * spot price at payoff month
    // This avoids any issues with continued BTC growth after payoff
    finalBTCValue = payoffAnalysis.finalBTCRetained * targetEntry.btcSpotPrice;
  } else {
    // No payoff - find appropriate end point
    const loanTermMonths = inputs.refinanceScenario.type === 'cash-out-refinance' 
      ? inputs.refinanceScenario.newLoanTermYears * 12 
      : 30 * 12; // Default HELOC term
    
    targetEntry = amortizationSchedule.find(entry => entry.debtBalance === 0) || 
                 amortizationSchedule[Math.min(loanTermMonths - 1, amortizationSchedule.length - 1)] ||
                 amortizationSchedule[amortizationSchedule.length - 1];
    
    finalBTCValue = targetEntry.btcValue;
  }
  
  // Calculate property value at the target month
  const finalPropertyValue = initialPropertyValue + targetEntry.propertyAppreciation;
  
  // Total asset should be property + BTC at payoff point
  const finalTotalAsset = finalPropertyValue + finalBTCValue;
  
  const totalReturn = finalTotalAsset - (initialPropertyValue + initialInvestment);
  const totalROI = totalReturn / (initialPropertyValue + initialInvestment);
  
  const yearsElapsed = targetEntry.month / 12;
  const annualizedReturn = yearsElapsed > 0 ? Math.pow(1 + totalROI, 1 / yearsElapsed) - 1 : 0;
  
  // Calculate component breakdown
  const propertyAppreciationGain = finalPropertyValue - initialPropertyValue;
  const bitcoinNetContribution = finalBTCValue - initialInvestment;
  const interestSavings = payoffAnalysis.triggerMonth ? payoffAnalysis.interestSaved : 0;
  const totalGain = propertyAppreciationGain + bitcoinNetContribution + interestSavings;
  
  // Calculate efficiency metrics
  const payoffEfficiencyPercent = payoffAnalysis.triggerMonth ? 
    (payoffAnalysis.debtAtTrigger / (payoffAnalysis.debtAtTrigger + payoffAnalysis.btcValueAtTrigger - payoffAnalysis.debtAtTrigger)) * 100 : 0;
  const leverageRatio = totalReturn / initialInvestment;
  const timeToPayoff = yearsElapsed;
  
  // Calculate baseline comparison (traditional 7% S&P 500 investment)
  const traditionalRate = 0.07; // 7% annually
  const traditionalInvestmentValue = initialInvestment * Math.pow(1 + traditionalRate, yearsElapsed);
  const traditionalInvestmentROI = (traditionalInvestmentValue - initialInvestment) / initialInvestment;
  const strategyOutperformance = finalBTCValue - traditionalInvestmentValue;
  
  return {
    finalTotalAsset,
    finalPropertyValue,
    finalBTCValue,
    totalROI,
    annualizedReturn,
    componentBreakdown: {
      propertyAppreciationGain,
      bitcoinNetContribution,
      interestSavings,
      totalGain
    },
    efficiencyMetrics: {
      payoffEfficiencyPercent,
      leverageRatio,
      timeToPayoff
    },
    baselineComparison: {
      traditionalInvestmentValue,
      traditionalInvestmentROI,
      strategyOutperformance
    }
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
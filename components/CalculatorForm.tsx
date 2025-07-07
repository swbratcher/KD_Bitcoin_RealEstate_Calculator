'use client';

/**
 * Calculator Input Form Component
 * for KD Bitcoin Real Estate Calculator
 * 
 * This component collects all user inputs needed for the calculator:
 * - Property information
 * - Current mortgage details  
 * - Refinance vs HELOC scenario toggle
 * - Bitcoin investment parameters
 */

import React, { useState, useEffect } from 'react';
import { 
  CalculatorInputs, 
  PropertyData, 
  CurrentMortgageData, 
  RefinanceScenario, 
  BitcoinPriceScenario,
  BitcoinPriceData,
  ValidationError 
} from '@/lib/types';
import { validateAmortizationInputs, generateAmortizationResults } from '@/lib/calculations';
import AmortizationChart from './AmortizationChart';

interface CalculatorFormProps {
  onSubmit: (inputs: CalculatorInputs) => void;
  onInputChange?: (inputs: Partial<CalculatorInputs>) => void;
  loading?: boolean;
  initialValues?: Partial<CalculatorInputs>;
  realChartData?: Array<{
    date: string;
    debt: number;
    baseEquity: number;
    appreciation: number;
    btcValue: number;
    totalValue: number;
  }>;
}

export default function CalculatorForm({ 
  onSubmit, 
  onInputChange, 
  loading = false,
  initialValues,
  realChartData
}: CalculatorFormProps) {
  // Form state
  const [currentBitcoinPrice, setCurrentBitcoinPrice] = useState<number>(100000);
  const [bitcoinLoading, setBitcoinLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [loanType, setLoanType] = useState<'refinance' | 'heloc'>('refinance');

  // Property data - Easy math defaults for testing
  const [propertyValue, setPropertyValue] = useState<string>('200000');
  const [purchasePrice, setPurchasePrice] = useState<string>('100000');
  const [purchaseYear, setPurchaseYear] = useState<string>('2019');

  // Current mortgage data
  const [currentBalance, setCurrentBalance] = useState<string>('50000');
  const [monthlyPayment, setMonthlyPayment] = useState<string>('600');
  const [currentInterestRate, setCurrentInterestRate] = useState<string>('4.0');
  const [remainingYears, setRemainingYears] = useState<string>('20');

  // Refinance fields
  const [newLoanTermYears, setNewLoanTermYears] = useState<string>('30');
  const [newInterestRate, setNewInterestRate] = useState<string>('6.0');
  const [closingCosts, setClosingCosts] = useState<string>('2000');
  const [cashOutAmount, setCashOutAmount] = useState<string>('40000');
  const [cashOutPercentage, setCashOutPercentage] = useState<string>('20');
  const [estimatedNewPayment, setEstimatedNewPayment] = useState<number>(0);
  const [userDesiredPayment, setUserDesiredPayment] = useState<string>('');

  // HELOC fields
  const [helocCreditLimit, setHelocCreditLimit] = useState<string>('');
  const [helocInterestRate, setHelocInterestRate] = useState<string>('8.5');
  const [helocTermYears, setHelocTermYears] = useState<string>('10');
  const [equityTargetPercent, setEquityTargetPercent] = useState<string>('20');

  // NEW: Property income and payment breakdown
  const [monthlyTaxesInsurance, setMonthlyTaxesInsurance] = useState<string>('200');
  const [monthlyHOA, setMonthlyHOA] = useState<string>('0');
  
  // NEW: Payoff trigger settings
  const [payoffTriggerType, setPayoffTriggerType] = useState<'hodl_only' | 'percentage' | 'retained_amount'>('percentage');
  const [payoffTriggerValue, setPayoffTriggerValue] = useState<string>('2.0'); // 2x multiplier (200% of debt) or BTC amount retained
  
  // NEW: Bitcoin performance settings
  const [bitcoinPerformanceModel, setBitcoinPerformanceModel] = useState<string>('cycles'); // cycles, flat
  const [bitcoinDrawdownPercent, setBitcoinDrawdownPercent] = useState<string>('60'); // Default to match Bullish config
  const [bitcoinPerformanceSentiment, setBitcoinPerformanceSentiment] = useState<string>('bullish'); // bearish, realist, bullish, 3xmaxi, custom
  const [customAnnualGrowthRate, setCustomAnnualGrowthRate] = useState<string>('60');
  
  // NEW: Enhanced Bitcoin algorithm settings
  const [enableDiminishingReturns, setEnableDiminishingReturns] = useState<boolean>(true);
  const [finalCAGR, setFinalCAGR] = useState<string>('15'); // Final CAGR for diminishing returns
  const [enableFlatteningCycles, setEnableFlatteningCycles] = useState<boolean>(true);
  const [flatteningCyclePercent, setFlatteningCyclePercent] = useState<string>('25'); // Flattening cycle percentage
  
  // NEW: Property appreciation setting
  const [propertyAppreciationRate, setPropertyAppreciationRate] = useState<string>('3'); // 3% annual default
  
  // NEW: Bitcoin Price Modeling UI state
  const [isCustomConfigExpanded, setIsCustomConfigExpanded] = useState<boolean>(false);
  const [selectedPreset, setSelectedPreset] = useState<string>('bullish'); // Track which preset is selected

  // Calculated values
  const [availableEquity, setAvailableEquity] = useState<number>(0);
  const [maxCashOut, setMaxCashOut] = useState<number>(0);
  const [monthlyShortfall, setMonthlyShortfall] = useState<number>(0);
  const [netMonthlyCashFlow, setNetMonthlyCashFlow] = useState<number>(0);

  // Bitcoin scenarios - updated with loan term as time horizon
  const [targetScenarios, setTargetScenarios] = useState<BitcoinPriceScenario[]>([
    { name: 'Conservative', targetPrice: 200000, annualGrowthRate: 0.15, timeHorizonYears: 30 },
    { name: 'Moderate', targetPrice: 500000, annualGrowthRate: 0.25, timeHorizonYears: 30 },
    { name: 'Aggressive', targetPrice: 1000000, annualGrowthRate: 0.40, timeHorizonYears: 30 },
  ]);

  // Fetch current Bitcoin price on component mount
  useEffect(() => {
    fetchCurrentBitcoinPrice();
  }, []);

  // Calculate available equity and max cash out
  useEffect(() => {
    const propValue = parseFloat(propertyValue) || 0;
    const currentBal = parseFloat(currentBalance) || 0;
    const equity = propValue - currentBal;
    // Max cash out is full debt up to 80% of property value
    const maxLoanAmount = propValue * 0.8;
    const maxCash = Math.max(0, maxLoanAmount - currentBal);
    
    setAvailableEquity(equity);
    setMaxCashOut(maxCash);
  }, [propertyValue, currentBalance]);

  // Handlers for cash-out calculations to avoid circular dependencies
  const handleCashOutAmountChange = (value: string) => {
    setCashOutAmount(value);
    const amount = parseFloat(value) || 0;
    const propValue = parseFloat(propertyValue) || 1;
    const percentage = ((amount / propValue) * 100).toFixed(1);
    setCashOutPercentage(percentage);
  };

  const handleCashOutPercentageChange = (value: string) => {
    setCashOutPercentage(value);
    const percentage = parseFloat(value) || 0;
    const propValue = parseFloat(propertyValue) || 0;
    const amount = ((percentage / 100) * propValue).toFixed(0);
    setCashOutAmount(amount);
  };

  // Calculate estimated payments
  useEffect(() => {
    if (loanType === 'refinance') {
      const principal = (parseFloat(currentBalance) || 0) + (parseFloat(cashOutAmount) || 0) + (parseFloat(closingCosts) || 0);
      const rate = (parseFloat(newInterestRate) || 0) / 100 / 12;
      const terms = (parseFloat(newLoanTermYears) || 30) * 12;
      
      if (principal > 0 && rate > 0 && terms > 0) {
        const newPI = principal * (rate * Math.pow(1 + rate, terms)) / (Math.pow(1 + rate, terms) - 1);
        
        // Add original T&I to new P&I to get total payment
        const originalTI = parseFloat(monthlyTaxesInsurance) || 0;
        const totalNewPayment = newPI + originalTI;
        
        setEstimatedNewPayment(totalNewPayment);
      }
    } else {
      // HELOC interest-only payment estimate + keep current mortgage payment
      const helocAmount = parseFloat(cashOutAmount) || 0;
      const rate = (parseFloat(helocInterestRate) || 0) / 100 / 12;
      const interestOnly = helocAmount * rate;
      const currentMortgagePayment = parseFloat(monthlyPayment) || 0;
      setEstimatedNewPayment(currentMortgagePayment + interestOnly);
    }
  }, [loanType, currentBalance, cashOutAmount, closingCosts, newInterestRate, newLoanTermYears, helocInterestRate, monthlyTaxesInsurance, monthlyPayment]);

  // Calculate shortfall
  useEffect(() => {
    const currentMortgagePayment = parseFloat(monthlyPayment) || 0;
    const desiredPayment = parseFloat(userDesiredPayment) || estimatedNewPayment;
    const totalPayment = loanType === 'refinance' ? desiredPayment : currentMortgagePayment + desiredPayment;
    const estimatedTotal = loanType === 'refinance' ? estimatedNewPayment : currentMortgagePayment + estimatedNewPayment;
    
    setMonthlyShortfall(Math.max(0, estimatedTotal - totalPayment));
  }, [loanType, monthlyPayment, userDesiredPayment, estimatedNewPayment]);

  // Update scenario time horizons when loan term changes
  useEffect(() => {
    const horizon = parseFloat(newLoanTermYears) || 30;
    setTargetScenarios(prev => prev.map(scenario => ({ ...scenario, timeHorizonYears: horizon })));
  }, [newLoanTermYears]);

  // Set desired payment to current monthly payment as default
  useEffect(() => {
    if (!userDesiredPayment && monthlyPayment) {
      setUserDesiredPayment(monthlyPayment);
    }
  }, [monthlyPayment, userDesiredPayment]);


  // Auto-trigger calculations when key fields change
  useEffect(() => {
    const hasMinimumData = propertyValue && currentBalance && monthlyPayment && 
                          currentInterestRate && cashOutAmount && newInterestRate;
    
    // Also ensure we have a valid Bitcoin price (not the default 100000)
    const hasValidBitcoinPrice = currentBitcoinPrice !== 100000;
    
    if (hasMinimumData && hasValidBitcoinPrice) {
      const inputs = buildCalculatorInputs();
      if (inputs) {
        const validation = validateAmortizationInputs(inputs);
        if (validation.isValid) {
          // Auto-calculate without showing loading state for live updates
          onSubmit(inputs);
        }
      }
    }
  }, [propertyValue, currentBalance, monthlyPayment, currentInterestRate, remainingYears,
      monthlyTaxesInsurance, monthlyHOA, loanType,
      cashOutAmount, newLoanTermYears, newInterestRate, closingCosts, helocInterestRate,
      helocTermYears, payoffTriggerType, payoffTriggerValue, bitcoinPerformanceModel,
      bitcoinDrawdownPercent, bitcoinPerformanceSentiment, customAnnualGrowthRate, 
      enableDiminishingReturns, finalCAGR, propertyAppreciationRate, userDesiredPayment, currentBitcoinPrice]);

  // Calculate net monthly cash flow
  useEffect(() => {
    const desiredPayment = parseFloat(userDesiredPayment) || 0;
    const taxesInsurance = parseFloat(monthlyTaxesInsurance) || 0;
    const hoa = parseFloat(monthlyHOA) || 0;
    const mortgagePI = parseFloat(monthlyPayment) || 0;
    
    // Net cash flow = Desired Payment - (Taxes+Insurance + HOA + Current Mortgage P&I)
    // Negative means shortfall that will be covered by BTC sales
    const totalExpenses = taxesInsurance + hoa + mortgagePI;
    const netCashFlow = desiredPayment - totalExpenses;
    setNetMonthlyCashFlow(netCashFlow);
  }, [userDesiredPayment, monthlyTaxesInsurance, monthlyHOA, monthlyPayment]);

  const fetchCurrentBitcoinPrice = async () => {
    setBitcoinLoading(true);
    try {
      // Call CoinGecko directly (free public API)
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd'
      );
      const data = await response.json();
      
      if (data.bitcoin && data.bitcoin.usd) {
        setCurrentBitcoinPrice(data.bitcoin.usd);
      }
    } catch (error) {
      console.error('Failed to fetch Bitcoin price:', error);
      // Keep default of $100,000 if fetch fails
    } finally {
      setBitcoinLoading(false);
    }
  };

  const validateInputs = (): ValidationError[] => {
    const errors: ValidationError[] = [];

    // Property validation
    const propValue = parseFloat(propertyValue);
    if (!propValue || propValue <= 0) {
      errors.push({ field: 'propertyValue', message: 'Property value must be greater than zero', code: 'INVALID_VALUE' });
    }

    // Current mortgage validation
    const currentBal = parseFloat(currentBalance);
    if (!currentBal || currentBal <= 0) {
      errors.push({ field: 'currentBalance', message: 'Current mortgage balance must be greater than zero', code: 'INVALID_VALUE' });
    }

    const monthlyPay = parseFloat(monthlyPayment);
    if (!monthlyPay || monthlyPay <= 0) {
      errors.push({ field: 'monthlyPayment', message: 'Monthly payment must be greater than zero', code: 'INVALID_VALUE' });
    }

    const currentRate = parseFloat(currentInterestRate);
    if (isNaN(currentRate) || currentRate < 0 || currentRate > 20) {
      errors.push({ field: 'currentInterestRate', message: 'Interest rate must be between 0% and 20%', code: 'INVALID_RATE' });
    }

    // Cash out validation
    const cashOut = parseFloat(cashOutAmount);
    if (!cashOut || cashOut <= 0) {
      errors.push({ field: 'cashOutAmount', message: 'Cash-out amount must be greater than zero', code: 'INVALID_VALUE' });
    }

    if (cashOut > maxCashOut) {
      errors.push({ 
        field: 'cashOutAmount', 
        message: `Cash-out amount cannot exceed $${formatDollar(maxCashOut)} (20% of property value or available equity)`, 
        code: 'INSUFFICIENT_EQUITY' 
      });
    }

    // Loan type specific validation
    if (loanType === 'refinance') {
      const newRate = parseFloat(newInterestRate);
      if (isNaN(newRate) || newRate < 0 || newRate > 20) {
        errors.push({ field: 'newInterestRate', message: 'New interest rate must be between 0% and 20%', code: 'INVALID_RATE' });
      }
    } else {
      const helocRate = parseFloat(helocInterestRate);
      if (isNaN(helocRate) || helocRate < 0 || helocRate > 20) {
        errors.push({ field: 'helocInterestRate', message: 'HELOC interest rate must be between 0% and 20%', code: 'INVALID_RATE' });
      }
    }

    return errors;
  };

  const buildCalculatorInputs = (): CalculatorInputs | null => {
    const validationErrors = validateInputs();
    if (validationErrors.length > 0) {
      return null;
    }

    const property: PropertyData = {
      currentValue: parseFloat(propertyValue),
      purchasePrice: parseFloat(propertyValue), // Use current value as purchase price since we don't collect it
      purchaseYear: parseInt(purchaseYear),
      appreciationRate: parseFloat(propertyAppreciationRate) / 100, // Convert to decimal
    };

    const currentMortgage: CurrentMortgageData = {
      currentBalance: parseFloat(currentBalance),
      monthlyPayment: parseFloat(monthlyPayment),
      interestRate: parseFloat(currentInterestRate) / 100,
      remainingYears: parseFloat(remainingYears),
    };

    const refinanceScenario: RefinanceScenario = {
      type: loanType === 'refinance' ? 'cash-out-refinance' : 'heloc',
      cashOutAmount: parseFloat(cashOutAmount),
      newLoanAmount: loanType === 'refinance' ? parseFloat(currentBalance) + parseFloat(cashOutAmount) + parseFloat(closingCosts) : parseFloat(currentBalance),
      newInterestRate: loanType === 'refinance' ? parseFloat(newInterestRate) / 100 : parseFloat(helocInterestRate) / 100,
      newLoanTermYears: loanType === 'refinance' ? parseFloat(newLoanTermYears) : parseFloat(helocTermYears),
      newMonthlyPayment: parseFloat(userDesiredPayment) || estimatedNewPayment,
      closingCosts: parseFloat(closingCosts),
      monthlyPaymentIncrease: loanType === 'refinance' ? 
        (parseFloat(userDesiredPayment) || estimatedNewPayment) - parseFloat(monthlyPayment) :
        parseFloat(userDesiredPayment) || estimatedNewPayment,
    };

    // NEW: Property income data
    const propertyIncome = {
      monthlyRentalIncome: parseFloat(userDesiredPayment) || 0,
      monthlyTaxes: parseFloat(monthlyTaxesInsurance) || 0,
      monthlyInsurance: 0, // Now included in monthlyTaxes
      monthlyHOA: parseFloat(monthlyHOA) || 0,
      netMonthlyCashFlow: netMonthlyCashFlow,
    };

    // NEW: Payoff trigger settings
    const payoffTrigger = {
      type: payoffTriggerType,
      value: payoffTriggerType === 'hodl_only' ? 0 : 
             payoffTriggerType === 'percentage' ? parseFloat(multiplierToPercentage(payoffTriggerValue)) : 
             parseFloat(payoffTriggerValue) || 0,
    };

    // Enhanced Bitcoin investment with performance settings
    const bitcoinInvestment = {
      investmentAmount: parseFloat(cashOutAmount),
      currentBitcoinPrice,
      targetScenarios,
      performanceSettings: {
        model: (bitcoinPerformanceModel === 'cycles' ? 'seasonal' : 'steady') as 'seasonal' | 'steady' | 'custom',
        initialCAGR: getSentimentPercentage(),
        finalCAGR: enableDiminishingReturns ? parseFloat(finalCAGR) || null : null,
        useSeasonalFactors: bitcoinPerformanceModel === 'cycles',
        maxDrawdownPercent: parseFloat(bitcoinDrawdownPercent) || 70,
        loanStartDate: new Date(), // Auto-set to current date
      },
    };

    return {
      property,
      currentMortgage,
      propertyIncome,
      refinanceScenario,
      bitcoinInvestment,
      payoffTrigger,
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateInputs();
    setErrors(validationErrors);
    
    if (validationErrors.length === 0) {
      const inputs = buildCalculatorInputs();
      if (inputs) {
        onSubmit(inputs);
      }
    }
  };

  const getError = (field: string): string | undefined => {
    return errors.find(error => error.field === field)?.message;
  };

  // Helper function to format dollar amounts (rounded to nearest dollar)
  const formatDollar = (amount: number): string => {
    return Math.round(amount).toLocaleString();
  };

  // Helper function to get combined monthly expenses (T&I + HOA)
  const getTaxesInsurance = (): number => {
    return (parseFloat(monthlyTaxesInsurance) || 0) + (parseFloat(monthlyHOA) || 0);
  };

  // Helper function to get sentiment percentage
  const getSentimentPercentage = (): number => {
    switch (bitcoinPerformanceSentiment) {
      case 'bearish': return -20;
      case 'realist': return 20;
      case 'bullish': return 40;
      case '3xmaxi': return 60;
      case 'custom': return parseFloat(customAnnualGrowthRate) || 25;
      default: return 20;
    }
  };

  // Helper functions for multiplier/percentage conversion
  const percentageToMultiplier = (percentage: string): string => {
    const pct = parseFloat(percentage) || 0;
    return (pct / 100).toFixed(1);
  };

  const multiplierToPercentage = (multiplier: string): string => {
    const mult = parseFloat(multiplier) || 0;
    return (mult * 100).toFixed(0);
  };

  // Calculate retained BTC percentage from multiplier
  const calculateRetainedPercentage = (multiplier: string): string => {
    const mult = parseFloat(multiplier) || 1;
    if (mult <= 1) return "0";
    const retained = ((1 - 1/mult) * 100).toFixed(0);
    return retained;
  };

  // Analyze Bitcoin sustainability from actual amortization table data
  const analyzeBitcoinSustainability = () => {
    // If we have real chart data, analyze it. Otherwise fall back to simple logic
    if (realChartData && realChartData.length > 0) {
      // Use the actual amortization table data that's already calculated
      const formData = buildCalculatorInputs();
      
      if (!formData) {
        return getSimpleBTCAnalysis();
      }
      
      try {
        const results = generateAmortizationResults(formData);
        const schedule = results.monthlySchedule;
        
        // Find if Bitcoin ever hits zero
        const btcDepletionEntry = schedule.find(entry => entry.btcHeld <= 0);
        
        if (btcDepletionEntry) {
          const depletionMonth = btcDepletionEntry.month;
          const years = Math.floor(depletionMonth / 12);
          const months = depletionMonth % 12;
          const riskLevel = depletionMonth < schedule.length * 0.5 ? 'high' : depletionMonth < schedule.length * 0.8 ? 'medium' : 'low';
          
          return {
            sustainable: false,
            riskLevel,
            message: `Bitcoin depleted in ${years} years, ${months} months`,
            estimatedBTCRemaining: 0,
            months: depletionMonth
          };
        } else {
          // Made it through without depletion
          const finalEntry = schedule[schedule.length - 1];
          const finalBTC = finalEntry?.btcHeld || 0;
          const riskLevel = finalBTC > 0.5 ? 'low' : finalBTC > 0.2 ? 'medium' : 'high';
          
          return {
            sustainable: true,
            riskLevel,
            message: 'Sustainable through full term',
            estimatedBTCRemaining: finalBTC,
            months: schedule.length
          };
        }
      } catch (error) {
        // Fall back to simple analysis if calculation fails
        return getSimpleBTCAnalysis();
      }
    } else {
      return getSimpleBTCAnalysis();
    }
  };

  // Simple fallback analysis when no real data available
  const getSimpleBTCAnalysis = () => {
    if (monthlyShortfall <= 0) {
      return {
        sustainable: true,
        riskLevel: 'low',
        message: 'Cash flow positive - no Bitcoin sales needed',
        estimatedBTCRemaining: (parseFloat(cashOutAmount) || 40000) / currentBitcoinPrice,
        months: (parseFloat(newLoanTermYears) || 30) * 12
      };
    }
    
    // Basic check: if monthly shortfall is very high relative to investment
    const cashOut = parseFloat(cashOutAmount) || 40000;
    const initialBTC = cashOut / currentBitcoinPrice;
    const shortfallPercentage = (monthlyShortfall * 12) / cashOut;
    
    if (shortfallPercentage > 0.5) {
      return {
        sustainable: false,
        riskLevel: 'high',
        message: 'High monthly shortfall relative to Bitcoin investment',
        estimatedBTCRemaining: 0,
        months: 0
      };
    }
    
    return {
      sustainable: true,
      riskLevel: shortfallPercentage > 0.2 ? 'medium' : 'low',
      message: 'Run calculation to get detailed analysis',
      estimatedBTCRemaining: initialBTC,
      months: (parseFloat(newLoanTermYears) || 30) * 12
    };
  };

  // Generate monthly chart data with realistic amortization
  const generateSampleChartData = () => {
    const data = [];
    const startDate = new Date();
    const propertyVal = parseFloat(propertyValue) || 200000;
    const cashOut = parseFloat(cashOutAmount) || 40000;
    const currentBal = parseFloat(currentBalance) || 50000;
    const newLoanAmount = currentBal + cashOut + (parseFloat(closingCosts) || 2000);
    const btcGrowthRate = getSentimentPercentage() / 100;
    const propGrowthRate = (parseFloat(propertyAppreciationRate) || 3) / 100;
    const loanTermMonths = (parseFloat(newLoanTermYears) || 30) * 12;
    const monthlyRate = (parseFloat(newInterestRate) || 6) / 100 / 12;
    
    // Calculate monthly payment for proper amortization
    const monthlyPayment = monthlyRate > 0 
      ? newLoanAmount * (monthlyRate * Math.pow(1 + monthlyRate, loanTermMonths)) / (Math.pow(1 + monthlyRate, loanTermMonths) - 1)
      : newLoanAmount / loanTermMonths;
    
    let remainingBalance = newLoanAmount;
    
    for (let month = 0; month <= Math.min(240, loanTermMonths); month++) { // 20 years or loan term
      const yearsElapsed = month / 12;
      const date = new Date(startDate);
      date.setMonth(date.getMonth() + month);
      
      // Realistic debt amortization
      if (month > 0 && remainingBalance > 0) {
        const interestPayment = remainingBalance * monthlyRate;
        const principalPayment = Math.min(monthlyPayment - interestPayment, remainingBalance);
        remainingBalance = Math.max(0, remainingBalance - principalPayment);
      }
      
      // Property appreciation (compound monthly)
      const currentPropertyValue = propertyVal * Math.pow(1 + propGrowthRate / 12, month);
      const baseEquity = Math.max(0, propertyVal - newLoanAmount);
      const appreciation = currentPropertyValue - propertyVal;
      
      // Bitcoin value using smooth, realistic cyclical model
      let btcValue;
      if (bitcoinPerformanceModel === 'cycles') {
        // Use smooth cyclical model that creates realistic price action
        const cyclePosition = (month - 1) % 48;
        const baseMonthlyRate = Math.pow(1 + btcGrowthRate, 1/12) - 1;
        const drawdownPercent = parseFloat(bitcoinDrawdownPercent) || 70;
        
        let multiplier = 1;
        if (cyclePosition < 12) {
          // Accumulation phase - smooth progression
          const phaseProgress = cyclePosition / 12;
          multiplier = 0.5 + (0.5 * Math.pow(phaseProgress, 0.5));
        } else if (cyclePosition < 24) {
          // Early bull phase - smooth acceleration
          const phaseProgress = (cyclePosition - 12) / 12;
          multiplier = 1.0 + (1.0 * Math.pow(phaseProgress, 0.8));
        } else if (cyclePosition < 36) {
          // Peak bull phase - smooth peak
          const phaseProgress = (cyclePosition - 24) / 12;
          multiplier = 2.0 + (1.0 * Math.sin(phaseProgress * Math.PI));
        } else {
          // Bear phase - smooth decline and recovery
          const phaseProgress = (cyclePosition - 36) / 12;
          const drawdownDepth = drawdownPercent / 100;
          
          if (phaseProgress < 0.6) {
            // Decline phase
            const declineProgress = phaseProgress / 0.6;
            multiplier = Math.max(1.0 - (drawdownDepth * Math.pow(declineProgress, 1.5)), 0.1);
          } else {
            // Recovery phase
            const recoveryProgress = (phaseProgress - 0.6) / 0.4;
            multiplier = (1.0 - drawdownDepth) + (drawdownDepth * Math.pow(recoveryProgress, 0.7));
          }
        }
        
        const monthlyRate = baseMonthlyRate * multiplier;
        btcValue = cashOut * Math.pow(1 + monthlyRate, month);
      } else {
        // Flat model - steady growth
        btcValue = cashOut * Math.pow(1 + btcGrowthRate / 12, month);
      }
      
      // Format date for display
      const dateLabel = month % 12 === 0 ? date.getFullYear().toString() : date.toISOString().slice(0, 7);
      
      data.push({
        date: dateLabel,
        debt: remainingBalance,
        baseEquity: baseEquity,
        appreciation: appreciation,
        btcValue: Math.max(0, btcValue),
        totalValue: currentPropertyValue + Math.max(0, btcValue)
      });
    }
    
    return data;
  };

  const updateScenario = (index: number, field: keyof BitcoinPriceScenario, value: string | number) => {
    const newScenarios = [...targetScenarios];
    newScenarios[index] = { ...newScenarios[index], [field]: value };
    setTargetScenarios(newScenarios);
  };

  return (
    <div className="card">
      <h2 className="section-header">Real Estate & Bitcoin Calculator</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Property Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Property Information</h3>
          
          {/* First row: Property Value, Mortgage Balance, Monthly Payment */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Property Value *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={propertyValue}
                  onChange={(e) => setPropertyValue(e.target.value)}
                  className={`input-field pl-8 ${getError('propertyValue') ? 'border-red-500' : ''}`}
                  placeholder="200,000"
                  required
                />
              </div>
              {getError('propertyValue') && (
                <p className="mt-1 text-sm text-red-600">{getError('propertyValue')}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mortgage Balance *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={currentBalance}
                  onChange={(e) => setCurrentBalance(e.target.value)}
                  className={`input-field pl-8 ${getError('currentBalance') ? 'border-red-500' : ''}`}
                  placeholder="50,000"
                  required
                />
              </div>
              {getError('currentBalance') && (
                <p className="mt-1 text-sm text-red-600">{getError('currentBalance')}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center">
                  Monthly Payment (PITI) *
                  <span 
                    className="ml-1 cursor-help inline-flex items-center justify-center w-4 h-4 text-xs font-medium text-blue-600 bg-blue-100 rounded-full hover:bg-blue-200" 
                    title="Total monthly payment including Principal, Interest, Taxes & Insurance"
                  >
                    i
                  </span>
                </span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={monthlyPayment}
                  onChange={(e) => setMonthlyPayment(e.target.value)}
                  className={`input-field pl-8 ${getError('monthlyPayment') ? 'border-red-500' : ''}`}
                  placeholder="600"
                  required
                />
              </div>
              {getError('monthlyPayment') && (
                <p className="mt-1 text-sm text-red-600">{getError('monthlyPayment')}</p>
              )}
            </div>
          </div>
          
          {/* Second row: Taxes & Insurance, Monthly HOA, Property Appreciation */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Taxes & Insurance
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={monthlyTaxesInsurance}
                  onChange={(e) => setMonthlyTaxesInsurance(e.target.value)}
                  className="input-field pl-8"
                  placeholder="200"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Combined property taxes and insurance
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monthly HOA / Other
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={monthlyHOA}
                  onChange={(e) => setMonthlyHOA(e.target.value)}
                  className="input-field pl-8"
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Appreciation Rate
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={propertyAppreciationRate}
                  onChange={(e) => setPropertyAppreciationRate(e.target.value)}
                  className="input-field pr-8"
                  placeholder="3.0"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Annual property appreciation rate
              </p>
            </div>
          </div>

          {/* Side-by-side layout: Max Cash-Out (left) and Payment Breakdown (right) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Max Cash-Out block (left on desktop, bottom on mobile) */}
            <div className="bg-blue-50 p-4 rounded-lg order-2 md:order-1">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Current Equity</h4>
              <div className="text-xl font-semibold text-blue-900">
                ${formatDollar(availableEquity)} ({((availableEquity / (parseFloat(propertyValue) || 1)) * 100).toFixed(0)}%)
              </div>
              <div className="text-sm text-blue-700 mt-1">
                Max Cash-Out (80% LTV): ${formatDollar(maxCashOut)}
              </div>
            </div>

            {/* Payment breakdown calculation (right on desktop, top on mobile) */}
            <div className="bg-gray-50 p-4 rounded-lg order-1 md:order-2">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Calculated Payment Breakdown</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">P&I Amount:</span>
                  <span className="font-semibold ml-2">${formatDollar((parseFloat(monthlyPayment) || 0) - getTaxesInsurance())}</span>
                </div>
                <div>
                  <span className="text-gray-600">Monthly Exp:</span>
                  <span className="font-semibold ml-2">${formatDollar((parseFloat(monthlyTaxesInsurance) || 0) + (parseFloat(monthlyHOA) || 0))}</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                These values will be used for mortgage calculations
              </p>
            </div>
          </div>

        </div>

        {/* Available Equity Summary - moved above */}

        {/* Loan Type Toggle */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Loan Type</h3>
          
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => setLoanType('refinance')}
              className={`px-4 py-2 rounded-lg border ${
                loanType === 'refinance' 
                  ? 'bg-blue-500 text-white border-blue-500' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Cash-Out Refinance
            </button>
            <button
              type="button"
              onClick={() => setLoanType('heloc')}
              className={`px-4 py-2 rounded-lg border ${
                loanType === 'heloc' 
                  ? 'bg-blue-500 text-white border-blue-500' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              HELOC
            </button>
          </div>
          
          {/* Current Mortgage Details - Only show for HELOC */}
          {loanType === 'heloc' && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-md font-semibold text-gray-800 mb-3">Current Mortgage Details</h4>
              <p className="text-sm text-gray-600 mb-3">These details about your existing mortgage are needed for HELOC calculations</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Mortgage Interest Rate *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={currentInterestRate}
                      onChange={(e) => setCurrentInterestRate(e.target.value)}
                      className={`input-field pr-8 ${getError('currentInterestRate') ? 'border-red-500' : ''}`}
                      placeholder="4.0"
                      required
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                  </div>
                  {getError('currentInterestRate') && (
                    <p className="mt-1 text-sm text-red-600">{getError('currentInterestRate')}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Mortgage Remaining Years
                  </label>
                  <input
                    type="number"
                    value={remainingYears}
                    onChange={(e) => setRemainingYears(e.target.value)}
                    className="input-field"
                    placeholder="20"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Investment Amount and Loan Terms - Side by Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Investment Amount (Left) */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Investment Amount</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cash-Out Amount OR Equity Percentage
              </label>
              <div className="grid grid-cols-6 gap-2">
                {/* Cash-Out Amount - 6 col width */}
                <div className="col-span-3">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={cashOutAmount}
                      onChange={(e) => handleCashOutAmountChange(e.target.value)}
                      className={`input-field pl-8 ${getError('cashOutAmount') ? 'border-red-500' : ''}`}
                      placeholder="40,000"
                      max={maxCashOut}
                      required
                    />
                  </div>
                  {getError('cashOutAmount') && (
                    <p className="mt-1 text-sm text-red-600">{getError('cashOutAmount')}</p>
                  )}
                </div>

                {/* OR Equity Percentage - 8 col width */}
                <div className="col-span-3">
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      value={cashOutPercentage}
                      onChange={(e) => handleCashOutPercentageChange(e.target.value)}
                      className="input-field pr-8"
                      placeholder="20"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                  </div>
                </div>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Enter dollar amount or percentage of property value
              </p>
            </div>
          </div>

          {/* Refinance Terms (Right) */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {loanType === 'refinance' ? 'Refinance Terms' : 'HELOC Terms'}
            </h3>
            
            {/* New Loan Term and Interest Rate side by side */}
            <div className="grid grid-cols-6 gap-2">
              {/* New Loan Term - 6 col width */}
              <div className="col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {loanType === 'refinance' ? 'New Loan Term' : 'HELOC Term'}
                </label>
                <select
                  value={loanType === 'refinance' ? newLoanTermYears : helocTermYears}
                  onChange={(e) => loanType === 'refinance' ? setNewLoanTermYears(e.target.value) : setHelocTermYears(e.target.value)}
                  className="input-field"
                >
                  <option value="10">10 years</option>
                  <option value="15">15 years</option>
                  <option value="20">20 years</option>
                  <option value="25">25 years</option>
                  <option value="30">30 years</option>
                </select>
              </div>

              {/* Interest Rate - 8 col width */}
              <div className="col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interest Rate *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    value={loanType === 'refinance' ? newInterestRate : helocInterestRate}
                    onChange={(e) => loanType === 'refinance' ? setNewInterestRate(e.target.value) : setHelocInterestRate(e.target.value)}
                    className={`input-field pr-8 ${getError(loanType === 'refinance' ? 'newInterestRate' : 'helocInterestRate') ? 'border-red-500' : ''}`}
                    placeholder={loanType === 'refinance' ? '6.0' : '8.5'}
                    required
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                </div>
                {getError(loanType === 'refinance' ? 'newInterestRate' : 'helocInterestRate') && (
                  <p className="mt-1 text-sm text-red-600">{getError(loanType === 'refinance' ? 'newInterestRate' : 'helocInterestRate')}</p>
                )}
              </div>
            </div>

            {/* Closing Costs below */}
            {loanType === 'refinance' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Closing Costs
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={closingCosts}
                    onChange={(e) => setClosingCosts(e.target.value)}
                    className="input-field pl-8"
                    placeholder="2,000"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Loan Analysis */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Loan Analysis</h3>
          
          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            {/* Desired Payment - moved to top */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {loanType === 'refinance' ? 'Desired Monthly Payment' : 'Desired HELOC Payment'}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={userDesiredPayment}
                  onChange={(e) => setUserDesiredPayment(e.target.value)}
                  className="input-field pl-8"
                  placeholder={formatDollar(estimatedNewPayment)}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Leave blank to use estimated payment
              </p>
            </div>

            {/* Loan Structure Facts */}
            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200">
              <div>
                <span className="text-sm text-gray-600">Current Monthly Payment:</span>
                <div className="font-semibold">${formatDollar(parseFloat(monthlyPayment))}</div>
              </div>
              <div>
                <span className="text-sm text-gray-600">
                  {loanType === 'refinance' ? 'Estimated New Payment:' : 'Estimated Total Payment:'}
                </span>
                <div className="font-semibold">${formatDollar(estimatedNewPayment)}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {loanType === 'refinance' ? 
                    (getTaxesInsurance() > 0 ? 
                      `Includes $${formatDollar(getTaxesInsurance())} Tax & Insurance` : 
                      'P&I only - no Tax & Ins entered') :
                    'Current mortgage + HELOC payment'
                  }
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-600">
                  {loanType === 'refinance' ? 'New Loan Amount:' : 'HELOC Amount:'}
                </span>
                <div className="font-semibold">
                  ${loanType === 'refinance' 
                    ? formatDollar((parseFloat(currentBalance) || 0) + (parseFloat(cashOutAmount) || 0) + (parseFloat(closingCosts) || 0))
                    : formatDollar(parseFloat(cashOutAmount) || 0)
                  }
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-600">Interest Rate:</span>
                <div className="font-semibold">
                  {loanType === 'refinance' ? newInterestRate : helocInterestRate}%
                </div>
              </div>
            </div>

            {monthlyShortfall > 0 && (
              <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                <div className="text-sm">
                  <span className="text-yellow-800 font-medium">Monthly Shortfall:</span>
                  <span className="font-semibold ml-2">${formatDollar(monthlyShortfall)}</span>
                </div>
                <p className="text-xs text-yellow-700 mt-1">
                  Bitcoin calculated by model to be sold each month cover this shortfall
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Bitcoin Position */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Bitcoin Position</h3>
          
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
            {/* Enhanced Algorithm Status */}
            <div className="mb-4 p-3 bg-white rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Enhanced Algorithm Status:</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                  ✓ ACTIVE
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-600">
                <div>Model: <span className="font-semibold">{bitcoinPerformanceModel === 'cycles' ? 'Seasonal' : 'Steady'}</span></div>
                <div>Diminishing Returns: <span className="font-semibold">{enableDiminishingReturns ? 'ON' : 'OFF'}</span></div>
                <div>Loan Start: <span className="font-semibold">Current Month</span></div>
                <div>Max Drawdown: <span className="font-semibold">{bitcoinDrawdownPercent}%</span></div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-white p-3 rounded-lg">
                <span className="text-xs text-gray-600 font-medium">Payoff Strategy</span>
                <div className="text-lg font-bold text-blue-600">
                  {payoffTriggerType === 'hodl_only' ? 'HODL' : 
                   payoffTriggerType === 'percentage' ? `${payoffTriggerValue}x` : 
                   payoffTriggerType === 'retained_amount' ? `${payoffTriggerValue} BTC` : 
                   'N/A'}
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <span className="text-xs text-gray-600 font-medium">BTC Buy Price</span>
                <div className="text-lg font-bold text-green-600">
                  ${formatDollar(currentBitcoinPrice)}
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <span className="text-xs text-gray-600 font-medium">BTC Bought</span>
                <div className="text-lg font-bold text-orange-600">
                  {((parseFloat(cashOutAmount) || 0) / currentBitcoinPrice).toFixed(6)} BTC
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <span className="text-xs text-gray-600 font-medium">Investment</span>
                <div className="text-lg font-bold text-purple-600">
                  ${formatDollar(parseFloat(cashOutAmount) || 0)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-3 rounded-lg">
                <span className="text-xs text-gray-600 font-medium">Performance</span>
                <div className="text-lg font-bold text-indigo-600">
                  {getSentimentPercentage() > 0 ? '+' : ''}{getSentimentPercentage()}%
                  {enableDiminishingReturns && (
                    <span className="text-sm"> → {parseFloat(finalCAGR) || 10}%</span>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  {bitcoinPerformanceSentiment}
                  {enableDiminishingReturns && <span> (diminishing)</span>}
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <span className="text-xs text-gray-600 font-medium">Model Type</span>
                <div className="text-lg font-bold text-teal-600">
                  {bitcoinPerformanceModel === 'cycles' ? 'Cycles' : 'Flat'}
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <span className="text-xs text-gray-600 font-medium">Property Growth</span>
                <div className="text-lg font-bold text-emerald-600">
                  {propertyAppreciationRate}%
                </div>
                <div className="text-xs text-gray-500">Annual</div>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <span className="text-xs text-gray-600 font-medium">Monthly Shortfall</span>
                <div className={`text-lg font-bold ${monthlyShortfall > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  ${formatDollar(monthlyShortfall)}
                </div>
                <div className="text-xs text-gray-500">
                  {monthlyShortfall > 0 ? 'BTC to sell' : 'Cash positive'}
                </div>
              </div>
            </div>

            {/* BTC Sustainability Analysis */}
            <div className="mt-4 p-3 bg-white rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">BTC Crashout Likelihood:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  (() => {
                    const analysis = analyzeBitcoinSustainability();
                    switch (analysis.riskLevel) {
                      case 'low': return 'bg-green-100 text-green-800';
                      case 'medium': return 'bg-yellow-100 text-yellow-800';
                      case 'high': return 'bg-red-100 text-red-800';
                      default: return 'bg-gray-100 text-gray-800';
                    }
                  })()
                }`}>
                  {(() => {
                    const analysis = analyzeBitcoinSustainability();
                    if (analysis.sustainable) {
                      return analysis.riskLevel === 'low' 
                        ? 'VERY LOW RISK' 
                        : analysis.riskLevel === 'medium' 
                        ? 'MODERATE RISK' 
                        : 'MANAGEABLE';
                    } else {
                      return 'HIGH RISK';
                    }
                  })()}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {(() => {
                  const analysis = analyzeBitcoinSustainability();
                  if (analysis.sustainable) {
                    const remainingBTC = analysis.estimatedBTCRemaining.toFixed(6);
                    const years = Math.floor(analysis.months / 12);
                    return `Sustainable through ${years}-year term with ~${remainingBTC} BTC remaining`;
                  } else {
                    return analysis.message + ' - consider reducing monthly shortfall or increasing Bitcoin investment';
                  }
                })()}
              </p>
            </div>

            {/* Payoff Trigger Settings - moved into Bitcoin Position */}
            <div className="mt-4 p-3 bg-white rounded-lg border-t border-gray-100">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Loan Payoff Trigger Settings</h4>
              <div className="grid grid-cols-6 gap-4">
                <div className="col-span-3">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Trigger Type
                  </label>
                  <select
                    value={payoffTriggerType}
                    onChange={(e) => {
                      const newType = e.target.value as 'hodl_only' | 'percentage' | 'retained_amount';
                      setPayoffTriggerType(newType);
                      // Set default values for each option
                      if (newType === 'hodl_only') {
                        setPayoffTriggerValue('');
                      } else if (newType === 'percentage') {
                        setPayoffTriggerValue('2.0');
                      } else if (newType === 'retained_amount') {
                        setPayoffTriggerValue('');
                      }
                    }}
                    className="input-field text-sm"
                  >
                    <option value="hodl_only">HODL Only</option>
                    <option value="percentage">BTC Value</option>
                    <option value="retained_amount">BTC to Keep</option>
                  </select>
                </div>

                {payoffTriggerType !== 'hodl_only' && (
                  <div className="col-span-3">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      {payoffTriggerType === 'percentage' ? 'Trigger Multiplier' : 'BTC Amount to Keep'}
                    </label>
                    <div className="relative">
                      {payoffTriggerType === 'percentage' ? (
                        <>
                          <input
                            type="number"
                            step="0.1"
                            value={payoffTriggerValue}
                            onChange={(e) => setPayoffTriggerValue(e.target.value)}
                            className="input-field pr-8 text-sm"
                            placeholder="2.0"
                            min="1.0"
                          />
                          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">x</span>
                        </>
                      ) : (
                        <>
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">BTC</span>
                          <input
                            type="number"
                            step="0.01"
                            value={payoffTriggerValue}
                            onChange={(e) => setPayoffTriggerValue(e.target.value)}
                            className="input-field pl-12 text-sm"
                            placeholder=""
                          />
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
              {payoffTriggerType !== 'hodl_only' && (
                <p className="mt-2 text-xs text-gray-500">
                  {payoffTriggerType === 'percentage' 
                    ? `Payoff when BTC value is ${payoffTriggerValue}x the remaining debt (retaining ${calculateRetainedPercentage(payoffTriggerValue)}% of BTC)`
                    : 'Trigger payoff while retaining this amount in BTC'
                  }
                </p>
              )}
              {payoffTriggerType === 'hodl_only' && (
                <p className="mt-2 text-xs text-gray-500">
                  No automatic payoff trigger - hold Bitcoin for maximum growth potential
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Bitcoin Price Modeling */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Bitcoin Price Modeling</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Current Price:</span>
              <span className={`text-sm font-semibold ${bitcoinLoading ? 'text-gray-400' : 'text-green-600'}`}>
                {bitcoinLoading ? 'Loading...' : `$${formatDollar(currentBitcoinPrice)}`}
              </span>
              <button
                type="button"
                onClick={fetchCurrentBitcoinPrice}
                className="text-xs text-blue-600 hover:text-blue-800"
                disabled={bitcoinLoading}
              >
                Refresh
              </button>
            </div>
          </div>

          {/* Persistent Auto-Config Buttons */}
          <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setBitcoinPerformanceSentiment('bullish');
                  setCustomAnnualGrowthRate('60');
                  setEnableDiminishingReturns(true);
                  setFinalCAGR('15');
                  setEnableFlatteningCycles(true);
                  setBitcoinDrawdownPercent('60');
                  setFlatteningCyclePercent('25');
                  setBitcoinPerformanceModel('cycles');
                  setSelectedPreset('bullish');
                  setIsCustomConfigExpanded(false);
                }}
                className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                  selectedPreset === 'bullish' 
                    ? 'bg-blue-500 text-white border-blue-500' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Bullish
              </button>
              <button
                type="button"
                onClick={() => {
                  setBitcoinPerformanceSentiment('realist');
                  setCustomAnnualGrowthRate('20');
                  setEnableDiminishingReturns(true);
                  setFinalCAGR('15');
                  setEnableFlatteningCycles(true);
                  setBitcoinDrawdownPercent('70');
                  setFlatteningCyclePercent('45');
                  setBitcoinPerformanceModel('cycles');
                  setSelectedPreset('realist');
                  setIsCustomConfigExpanded(false);
                }}
                className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                  selectedPreset === 'realist' 
                    ? 'bg-blue-500 text-white border-blue-500' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Realist
              </button>
              <button
                type="button"
                onClick={() => {
                  setBitcoinPerformanceSentiment('3xmaxi');
                  setCustomAnnualGrowthRate('60');
                  setEnableDiminishingReturns(true);
                  setFinalCAGR('20');
                  setEnableFlatteningCycles(true);
                  setBitcoinDrawdownPercent('60');
                  setFlatteningCyclePercent('40');
                  setBitcoinPerformanceModel('cycles');
                  setSelectedPreset('3xmaxi');
                  setIsCustomConfigExpanded(false);
                }}
                className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                  selectedPreset === '3xmaxi' 
                    ? 'bg-blue-500 text-white border-blue-500' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                3x Maxi
              </button>
              <button
                type="button"
                onClick={() => {
                  setBitcoinPerformanceSentiment('bearish');
                  setCustomAnnualGrowthRate('10');
                  setEnableDiminishingReturns(true);
                  setFinalCAGR('-10');
                  setEnableFlatteningCycles(true);
                  setBitcoinDrawdownPercent('80');
                  setFlatteningCyclePercent('60');
                  setBitcoinPerformanceModel('cycles');
                  setSelectedPreset('bearish');
                  setIsCustomConfigExpanded(false);
                }}
                className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                  selectedPreset === 'bearish' 
                    ? 'bg-blue-500 text-white border-blue-500' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Bearish
              </button>
          </div>

          {/* Compact Status Display for Presets */}
          {!isCustomConfigExpanded && selectedPreset !== 'custom' && (
            <div className="bg-gray-50 p-2 rounded text-xs text-gray-600 border-l-4 border-blue-500 flex items-center justify-between">
              <div>
                <span className="font-semibold capitalize">{selectedPreset}:</span>
                <span className="ml-1">
                  {customAnnualGrowthRate}%{enableDiminishingReturns && ` → ${finalCAGR}%`}, 
                  {bitcoinPerformanceModel === 'cycles' ? ' Cycles' : ' Flat Growth'}, 
                  {bitcoinDrawdownPercent}% drawdown
                  {enableFlatteningCycles && `, ${flatteningCyclePercent}% flattening`}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedPreset('custom');
                  setIsCustomConfigExpanded(true);
                }}
                className="px-3 py-1 text-xs rounded border transition-colors bg-white text-gray-700 border-gray-300 hover:bg-gray-50 ml-2"
              >
                Custom
              </button>
            </div>
          )}

          {/* Custom Status Display */}
          {!isCustomConfigExpanded && selectedPreset === 'custom' && (
            <div className="bg-gray-50 p-2 rounded text-xs text-gray-600 border-l-4 border-gray-500 flex items-center justify-between">
              <div>
                <span className="font-semibold">Custom:</span>
                <span className="ml-1">
                  {customAnnualGrowthRate}%{enableDiminishingReturns && ` → ${finalCAGR}%`}, 
                  {bitcoinPerformanceModel === 'cycles' ? ' Cycles' : ' Flat Growth'}, 
                  {bitcoinDrawdownPercent}% drawdown
                  {enableFlatteningCycles && `, ${flatteningCyclePercent}% flattening`}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsCustomConfigExpanded(true);
                }}
                className="px-3 py-1 text-xs rounded border transition-colors bg-white text-gray-700 border-gray-300 hover:bg-gray-50 ml-2"
              >
                Edit
              </button>
            </div>
          )}

          {/* Collapsible Custom Configuration */}
          {isCustomConfigExpanded && (
            <div className="space-y-6 border-t pt-4 transition-all duration-300 ease-in-out">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column: Growth Rate Settings */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {enableDiminishingReturns ? 'Avg Annual Return & Diminishes To' : 'Avg Annual Return'}
                    </label>
                    <div className="flex space-x-2">
                      <div className="relative w-fit">
                        <input
                          type="number"
                          step="0.1"
                          value={customAnnualGrowthRate}
                          onChange={(e) => {
                            const value = e.target.value;
                            setCustomAnnualGrowthRate(value);
                            setBitcoinPerformanceSentiment('custom');
                          }}
                          className="input-field pr-8 w-24"
                          placeholder="25"
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                      </div>
                      {enableDiminishingReturns && (
                        <div className="relative w-fit">
                          <input
                            type="number"
                            step="0.1"
                            value={finalCAGR}
                            onChange={(e) => setFinalCAGR(e.target.value)}
                            className="input-field pr-8 w-24"
                            placeholder="10"
                          />
                          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                        </div>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      {enableDiminishingReturns ? 'Bitcoin performance will decline from initial to final CAGR over loan term' : 'Annual growth rate expectation'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {enableFlatteningCycles ? 'Bear Cycle Drawdown Max & Flattens To' : 'Bear Cycle Drawdown'}
                    </label>
                    <div className="flex space-x-2">
                      <div className="relative w-fit">
                        <input
                          type="number"
                          step="5"
                          min="10"
                          max="90"
                          value={bitcoinDrawdownPercent}
                          onChange={(e) => setBitcoinDrawdownPercent(e.target.value)}
                          className="input-field pr-8 w-24"
                          placeholder="70"
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                      </div>
                      {enableFlatteningCycles && (
                        <div className="relative w-fit">
                          <input
                            type="number"
                            step="5"
                            min="10"
                            max="90"
                            value={flatteningCyclePercent}
                            onChange={(e) => setFlatteningCyclePercent(e.target.value)}
                            className="input-field pr-8 w-24"
                            placeholder="30"
                          />
                          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                        </div>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      {enableFlatteningCycles ? 'Drawdown starts at max and flattens to lower percentage over time' : 'Maximum drawdown after bull market tops'}
                    </p>
                  </div>
                </div>

                {/* Right Column: Model and Cycle Settings */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price Model
                    </label>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => setBitcoinPerformanceModel('cycles')}
                        className={`px-4 py-2 rounded-lg border transition-colors ${
                          bitcoinPerformanceModel === 'cycles' 
                            ? 'bg-blue-500 text-white border-blue-500' 
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        4yr Cycles
                      </button>
                      <button
                        type="button"
                        onClick={() => setBitcoinPerformanceModel('flat')}
                        className={`px-4 py-2 rounded-lg border transition-colors ${
                          bitcoinPerformanceModel === 'flat' 
                            ? 'bg-blue-500 text-white border-blue-500' 
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        Flat Growth
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      Cycles use market patterns, Flat uses steady growth
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cycle Settings
                    </label>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="enableDiminishingReturns"
                          checked={enableDiminishingReturns}
                          onChange={(e) => setEnableDiminishingReturns(e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="enableDiminishingReturns" className="ml-2 block text-sm text-gray-900">
                          Enable Diminishing Returns
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="enableFlatteningCycles"
                          checked={enableFlatteningCycles}
                          onChange={(e) => setEnableFlatteningCycles(e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="enableFlatteningCycles" className="ml-2 block text-sm text-gray-900">
                          Enable Flattening Cycles
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Amortization Timeline Visualization */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <h3 className="text-lg font-semibold text-gray-900 p-3 pb-0">Timeline Visualization</h3>
          <AmortizationChart 
            data={realChartData || generateSampleChartData()}
            height={480}
          />
          <div className="p-3 pt-0">
            <p className="text-sm text-gray-600 mb-2">
              20-year projection showing debt paydown, property appreciation, and Bitcoin performance
            </p>
            <div className="flex flex-wrap gap-4 text-xs">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-600 rounded mr-2"></div>
                <span>Debt</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-600 rounded mr-2"></div>
                <span>Base Equity</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-400 rounded mr-2"></div>
                <span>Appreciation</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-orange-600 rounded mr-2"></div>
                <span>BTC Value</span>
              </div>
            </div>
          </div>
        </div>

        {/* Auto-submit on input change - no manual button needed */}
        
        {errors.length > 0 && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600 font-medium">Please fix the following errors:</p>
            <ul className="mt-1 text-sm text-red-600 list-disc list-inside">
              {errors.map((error, index) => (
                <li key={index}>{error.message}</li>
              ))}
            </ul>
          </div>
        )}
      </form>
    </div>
  );
} 
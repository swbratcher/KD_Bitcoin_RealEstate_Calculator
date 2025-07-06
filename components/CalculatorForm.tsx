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
import { validateAmortizationInputs } from '@/lib/calculations';
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
  const [payoffTriggerType, setPayoffTriggerType] = useState<'percentage' | 'retained_amount'>('percentage');
  const [payoffTriggerValue, setPayoffTriggerValue] = useState<string>('200'); // 200% of debt or $200k retained
  
  // NEW: Bitcoin performance settings
  const [bitcoinPerformanceModel, setBitcoinPerformanceModel] = useState<string>('cycles'); // cycles, flat
  const [bitcoinDrawdownPercent, setBitcoinDrawdownPercent] = useState<string>('70'); // Default 70% drawdown
  const [bitcoinPerformanceSentiment, setBitcoinPerformanceSentiment] = useState<string>('bullish'); // bearish, realist, bullish, 3xmaxi, custom
  const [customAnnualGrowthRate, setCustomAnnualGrowthRate] = useState<string>('25');
  
  // NEW: Enhanced Bitcoin algorithm settings
  const [enableDiminishingReturns, setEnableDiminishingReturns] = useState<boolean>(false);
  const [finalCAGR, setFinalCAGR] = useState<string>('10'); // Final CAGR for diminishing returns
  
  // NEW: Property appreciation setting
  const [propertyAppreciationRate, setPropertyAppreciationRate] = useState<string>('3'); // 3% annual default

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
      value: parseFloat(payoffTriggerValue) || 200,
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

  // Helper function to get combined T&I amount
  const getTaxesInsurance = (): number => {
    return parseFloat(monthlyTaxesInsurance) || 0;
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


          </div>


        </div>

        {/* Current Mortgage */}
        <div className="space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    className="ml-1 text-blue-500 cursor-help" 
                    title="Total monthly payment including Principal, Interest, Taxes & Insurance"
                  >
                    ℹ️
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
        </div>

        {/* Property Income & Expenses */}
        <div className="space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>

          {/* Payment breakdown calculation */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Calculated Payment Breakdown</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">P&I Amount:</span>
                <span className="font-semibold ml-2">${formatDollar((parseFloat(monthlyPayment) || 0) - (parseFloat(monthlyTaxesInsurance) || 0))}</span>
              </div>
              <div>
                <span className="text-gray-600">T&I Amount:</span>
                <span className="font-semibold ml-2">${formatDollar(parseFloat(monthlyTaxesInsurance) || 0)}</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              These values will be used for mortgage calculations
            </p>
          </div>


        </div>

        {/* Available Equity Summary */}
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-xl font-semibold text-blue-900">
              ${formatDollar(availableEquity)} ({((availableEquity / (parseFloat(propertyValue) || 1)) * 100).toFixed(0)}%)
            </div>
            <div className="text-sm text-blue-700 mt-1">
              Max Cash-Out (80% LTV): ${formatDollar(maxCashOut)}
            </div>
          </div>
        </div>

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

        {/* Cash-Out Amount */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Investment Amount</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cash-Out Amount (Bitcoin Investment) *
              </label>
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                OR Equity Percentage
              </label>
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
              <p className="mt-1 text-xs text-gray-500">
                Percentage of property value
              </p>
            </div>
          </div>


        </div>

        {/* Loan Terms */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {loanType === 'refinance' ? 'Refinance Terms' : 'HELOC Terms'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
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

            <div>
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

        {/* Bitcoin Performance */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Bitcoin Performance</h3>
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Performance Model
              </label>
              <select
                value={bitcoinPerformanceModel}
                onChange={(e) => setBitcoinPerformanceModel(e.target.value)}
                className="input-field"
              >
                <option value="cycles">Cycles</option>
                <option value="flat">Flat</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Cycles use market patterns, Flat uses steady growth
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Drawdown
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="5"
                  min="10"
                  max="90"
                  value={bitcoinDrawdownPercent}
                  onChange={(e) => setBitcoinDrawdownPercent(e.target.value)}
                  className="input-field pr-8"
                  placeholder="70"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Maximum drawdown after bull market tops
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Performance Sentiment
              </label>
              <select
                value={bitcoinPerformanceSentiment}
                onChange={(e) => setBitcoinPerformanceSentiment(e.target.value)}
                className="input-field"
              >
                <option value="bearish">Bearish (-20%)</option>
                <option value="realist">Realist (20%)</option>
                <option value="bullish">Bullish (40%)</option>
                <option value="3xmaxi">3xMaxi (60%)</option>
                <option value="custom">Custom</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Annual growth rate expectation
              </p>
            </div>

            {bitcoinPerformanceSentiment === 'custom' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Annual Growth Rate
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={customAnnualGrowthRate}
                    onChange={(e) => setCustomAnnualGrowthRate(e.target.value)}
                    className="input-field pr-8"
                    placeholder="25"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Appreciation
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={propertyAppreciationRate}
                  onChange={(e) => setPropertyAppreciationRate(e.target.value)}
                  className="input-field pr-8"
                  placeholder="3"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Annual property value appreciation
              </p>
            </div>
          </div>

          {/* Enhanced Algorithm Settings */}
          <div className="mt-6 space-y-4">
            <h4 className="text-md font-semibold text-gray-800">Enhanced Algorithm Settings</h4>
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <div className="flex items-center mb-3">
                  <input
                    type="checkbox"
                    id="enableDiminishingReturns"
                    checked={enableDiminishingReturns}
                    onChange={(e) => setEnableDiminishingReturns(e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="enableDiminishingReturns" className="text-sm font-medium text-gray-700">
                    Enable Diminishing Returns
                  </label>
                </div>
                {enableDiminishingReturns && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Final CAGR (Last Cycle)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        value={finalCAGR}
                        onChange={(e) => setFinalCAGR(e.target.value)}
                        className="input-field pr-8"
                        placeholder="10"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Bitcoin performance will decline from initial to final CAGR over loan term
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Payoff Trigger Settings - MOVED ABOVE BITCOIN PERFORMANCE REPORT */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Payoff Trigger Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trigger Type
              </label>
              <select
                value={payoffTriggerType}
                onChange={(e) => setPayoffTriggerType(e.target.value as 'percentage' | 'retained_amount')}
                className="input-field"
              >
                <option value="percentage">BTC Value as % of Remaining Debt</option>
                <option value="retained_amount">Retain Specific BTC Amount</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {payoffTriggerType === 'percentage' ? 'Trigger Percentage' : 'Retained Amount'}
              </label>
              <div className="relative">
                {payoffTriggerType === 'percentage' ? (
                  <>
                    <input
                      type="number"
                      value={payoffTriggerValue}
                      onChange={(e) => setPayoffTriggerValue(e.target.value)}
                      className="input-field pr-8"
                      placeholder="200"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                  </>
                ) : (
                  <>
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">BTC</span>
                    <input
                      type="number"
                      step="0.01"
                      value={payoffTriggerValue}
                      onChange={(e) => setPayoffTriggerValue(e.target.value)}
                      className="input-field pl-12"
                      placeholder="1.5"
                    />
                  </>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {payoffTriggerType === 'percentage' 
                  ? 'Trigger payoff when BTC value reaches this % of remaining debt'
                  : 'Trigger payoff while retaining this amount in BTC'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Bitcoin Performance Report */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Bitcoin Performance Report</h3>
          
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
                <span className="text-xs text-gray-600 font-medium">BTC Target %</span>
                <div className="text-lg font-bold text-blue-600">
                  {payoffTriggerType === 'percentage' ? payoffTriggerValue : '200'}%
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

            {/* BTC Status Indicator */}
            <div className="mt-4 p-3 bg-white rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">BTC Crashout Status:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  getSentimentPercentage() >= 20 && monthlyShortfall < (parseFloat(cashOutAmount) || 0) * 0.1
                    ? 'bg-green-100 text-green-800' 
                    : getSentimentPercentage() >= 0 
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {getSentimentPercentage() >= 20 && monthlyShortfall < (parseFloat(cashOutAmount) || 0) * 0.1
                    ? 'You never run out of Bitcoin at this shortfall.' 
                    : getSentimentPercentage() >= 0 
                    ? 'CAUTION'
                    : 'RISK'
                  }
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Based on performance sentiment and monthly cash flow requirements
              </p>
            </div>
          </div>
        </div>

        {/* Amortization Timeline Visualization */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Timeline Visualization</h3>
          <div className="bg-white p-6 border border-gray-200 rounded-lg">
            <div className="mb-4">
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
            
            <AmortizationChart 
              data={realChartData || generateSampleChartData()}
              height={350}
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t">
          <button
            type="submit"
            disabled={loading}
            className={`w-full btn-primary ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Calculating...' : 'Calculate Payoff Scenarios'}
          </button>
          
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
        </div>
      </form>
    </div>
  );
} 
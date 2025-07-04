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

interface CalculatorFormProps {
  onSubmit: (inputs: CalculatorInputs) => void;
  onInputChange?: (inputs: Partial<CalculatorInputs>) => void;
  loading?: boolean;
  initialValues?: Partial<CalculatorInputs>;
}

export default function CalculatorForm({ 
  onSubmit, 
  onInputChange, 
  loading = false,
  initialValues 
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
  const [monthlyRentalIncome, setMonthlyRentalIncome] = useState<string>('600');
  const [monthlyTaxes, setMonthlyTaxes] = useState<string>('100');
  const [monthlyInsurance, setMonthlyInsurance] = useState<string>('100');
  const [monthlyHOA, setMonthlyHOA] = useState<string>('0');
  
  // NEW: Payoff trigger settings
  const [payoffTriggerType, setPayoffTriggerType] = useState<'percentage' | 'retained_amount'>('percentage');
  const [payoffTriggerValue, setPayoffTriggerValue] = useState<string>('200'); // 200% of debt or $200k retained
  
  // NEW: Bitcoin performance settings
  const [bitcoinPerformanceModel, setBitcoinPerformanceModel] = useState<string>('seasonal'); // seasonal, steady, custom
  const [customAnnualGrowthRate, setCustomAnnualGrowthRate] = useState<string>('25');

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
        const originalTI = (parseFloat(monthlyTaxes) || 0) + (parseFloat(monthlyInsurance) || 0);
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
  }, [loanType, currentBalance, cashOutAmount, closingCosts, newInterestRate, newLoanTermYears, helocInterestRate, monthlyTaxes, monthlyInsurance, monthlyPayment]);

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

  // Set monthly rental income to current monthly payment as default
  useEffect(() => {
    if (!monthlyRentalIncome && monthlyPayment) {
      setMonthlyRentalIncome(monthlyPayment);
    }
  }, [monthlyPayment, monthlyRentalIncome]);

  // Auto-trigger calculations when key fields change
  useEffect(() => {
    const hasMinimumData = propertyValue && currentBalance && monthlyPayment && 
                          currentInterestRate && cashOutAmount && newInterestRate;
    
    if (hasMinimumData) {
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
      monthlyRentalIncome, monthlyTaxes, monthlyInsurance, monthlyHOA, loanType,
      cashOutAmount, newLoanTermYears, newInterestRate, closingCosts, helocInterestRate,
      helocTermYears, payoffTriggerType, payoffTriggerValue, bitcoinPerformanceModel,
      customAnnualGrowthRate, userDesiredPayment]);

  // Calculate net monthly cash flow
  useEffect(() => {
    const rentalIncome = parseFloat(monthlyRentalIncome) || 0;
    const taxes = parseFloat(monthlyTaxes) || 0;
    const insurance = parseFloat(monthlyInsurance) || 0;
    const hoa = parseFloat(monthlyHOA) || 0;
    const mortgagePI = parseFloat(monthlyPayment) || 0;
    
    // Net cash flow = Rental Income - (Taxes + Insurance + HOA + Current Mortgage P&I)
    const netCashFlow = rentalIncome - (taxes + insurance + hoa + mortgagePI);
    setNetMonthlyCashFlow(netCashFlow);
  }, [monthlyRentalIncome, monthlyTaxes, monthlyInsurance, monthlyHOA, monthlyPayment]);

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
      purchasePrice: parseFloat(purchasePrice),
      purchaseYear: parseInt(purchaseYear),
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
      monthlyRentalIncome: parseFloat(monthlyRentalIncome) || 0,
      monthlyTaxes: parseFloat(monthlyTaxes) || 0,
      monthlyInsurance: parseFloat(monthlyInsurance) || 0,
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
        model: bitcoinPerformanceModel as 'seasonal' | 'steady' | 'custom',
        customAnnualGrowthRate: bitcoinPerformanceModel === 'custom' ? parseFloat(customAnnualGrowthRate) : undefined,
        useSeasonalFactors: bitcoinPerformanceModel === 'seasonal',
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

  // Helper function to calculate original T&I amount
  const getOriginalTI = (): number => {
    return (parseFloat(monthlyTaxes) || 0) + (parseFloat(monthlyInsurance) || 0);
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Purchase Price
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  className="input-field pl-8"
                  placeholder="100,000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available Equity
              </label>
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-lg font-semibold text-blue-900">
                  ${formatDollar(availableEquity)} ({((availableEquity / (parseFloat(propertyValue) || 1)) * 100).toFixed(0)}%)
                </div>
                <div className="text-sm text-blue-700 mt-1">
                  Max Cash-Out (80% LTV): ${formatDollar(maxCashOut)}
                </div>
              </div>
            </div>
          </div>


        </div>

        {/* Current Mortgage */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Current Mortgage</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Balance *
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Interest Rate *
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
                Remaining Years
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

        {/* Property Income & Expenses */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Property Income & Expenses</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center">
                  Monthly Rental Income / Desired Payment
                  <span 
                    className="ml-1 text-blue-500 cursor-help" 
                    title="Rental income or amount you want to pay monthly"
                  >
                    ℹ️
                  </span>
                </span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={monthlyRentalIncome}
                  onChange={(e) => setMonthlyRentalIncome(e.target.value)}
                  className="input-field pl-8"
                  placeholder="600"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Property Taxes (Optional)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={monthlyTaxes}
                  onChange={(e) => setMonthlyTaxes(e.target.value)}
                  className="input-field pl-8"
                  placeholder="100"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Only enter if known separately from total payment
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Insurance (Optional)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={monthlyInsurance}
                  onChange={(e) => setMonthlyInsurance(e.target.value)}
                  className="input-field pl-8"
                  placeholder="100"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Only enter if known separately from total payment
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
                <span className="font-semibold ml-2">${formatDollar((parseFloat(monthlyPayment) || 0) - (parseFloat(monthlyTaxes) || 0) - (parseFloat(monthlyInsurance) || 0))}</span>
              </div>
              <div>
                <span className="text-gray-600">T&I Amount:</span>
                <span className="font-semibold ml-2">${formatDollar((parseFloat(monthlyTaxes) || 0) + (parseFloat(monthlyInsurance) || 0))}</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              These values will be used for mortgage calculations
            </p>
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
                OR Cash-Out Percentage
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

          {/* HELOC Equity Targeting - only show for HELOC */}
          {loanType === 'heloc' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Equity Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={equityTargetPercent}
                    onChange={(e) => {
                      setEquityTargetPercent(e.target.value);
                      const amount = parseFloat(e.target.value) || 0;
                      const propValue = parseFloat(propertyValue) || 1;
                      const percentage = ((amount / propValue) * 100).toFixed(1);
                      setCashOutPercentage(percentage);
                      setCashOutAmount(amount.toString());
                    }}
                    className="input-field pl-8"
                    placeholder="40,000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  OR Target Equity %
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={((parseFloat(equityTargetPercent) || 0) / (parseFloat(propertyValue) || 1) * 100).toFixed(1)}
                    onChange={(e) => {
                      const percentage = parseFloat(e.target.value) || 0;
                      const propValue = parseFloat(propertyValue) || 0;
                      const amount = ((percentage / 100) * propValue).toFixed(0);
                      setEquityTargetPercent(amount);
                      setCashOutPercentage(percentage.toString());
                      setCashOutAmount(amount);
                    }}
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
          )}

          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Maximum:</strong> ${formatDollar(maxCashOut)} (80% LTV limit)
            </p>
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
                    (getOriginalTI() > 0 ? 
                      `Includes $${formatDollar(getOriginalTI())} original Tax & Ins` : 
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

        {/* Bitcoin Performance Settings */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Bitcoin Performance Settings</h3>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Performance Model
              </label>
              <select
                value={bitcoinPerformanceModel}
                onChange={(e) => setBitcoinPerformanceModel(e.target.value)}
                className="input-field"
              >
                <option value="seasonal">Seasonal (Summer/Fall/Spring Cycles)</option>
                <option value="steady">Steady Growth</option>
                <option value="custom">Custom Rate</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Seasonal model uses complex market cycle patterns
              </p>
            </div>

            {bitcoinPerformanceModel === 'custom' && (
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
          </div>
        </div>

        {/* Bitcoin Price Scenarios (Legacy - for backward compatibility) - MOVED ABOVE PAYOFF TRIGGER */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Scenario Analysis (Optional)</h3>
          
          <div className="space-y-3">
            {targetScenarios.map((scenario, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Scenario Name
                  </label>
                  <input
                    type="text"
                    value={scenario.name}
                    onChange={(e) => updateScenario(index, 'name', e.target.value)}
                    className="input-field text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    <span className="flex items-center">
                      CAGR
                      <span 
                        className="ml-1 text-blue-500 cursor-help" 
                        title="Compound Annual Growth Rate as the average rate of value increase across the number of years of the loan term. Averages out bull and bear market cycles."
                      >
                        ℹ️
                      </span>
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={(scenario.annualGrowthRate * 100).toFixed(1)}
                      onChange={(e) => updateScenario(index, 'annualGrowthRate', parseFloat(e.target.value) / 100)}
                      className="input-field text-sm pr-6"
                    />
                    <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs">%</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Time Horizon (Loan Term)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={scenario.timeHorizonYears}
                      onChange={(e) => updateScenario(index, 'timeHorizonYears', parseFloat(e.target.value))}
                      className="input-field text-sm pr-8"
                      readOnly
                    />
                    <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs">years</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Auto-set to loan term</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payoff Trigger Settings - MOVED BELOW SCENARIO ANALYSIS */}
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
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={payoffTriggerValue}
                      onChange={(e) => setPayoffTriggerValue(e.target.value)}
                      className="input-field pl-8"
                      placeholder="200,000"
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
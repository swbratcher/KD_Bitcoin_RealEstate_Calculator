/**
 * Debug script to trace BTC value calculations
 */

const { generateComprehensiveAmortizationTable, calculatePerformanceSummary } = require('./lib/calculations/comprehensive-amortization');

// Create test inputs similar to the UI defaults
const testInputs = {
  property: {
    currentValue: 200000,
    purchasePrice: 100000,
    appreciationRate: 0.03
  },
  currentMortgage: {
    currentBalance: 50000,
    monthlyPayment: 600,
    interestRate: 0.04,
    remainingYears: 20
  },
  propertyIncome: {
    monthlyRentalIncome: 1500, // Using desired payment
    monthlyTaxes: 100,
    monthlyInsurance: 100,
    monthlyHOA: 0,
    netMonthlyCashFlow: 800
  },
  refinanceScenario: {
    type: 'cash-out-refinance',
    cashOutAmount: 40000,
    newLoanAmount: 90000, // 50k existing + 40k cash out
    newInterestRate: 0.06,
    newLoanTermYears: 30,
    newMonthlyPayment: 539,
    closingCosts: 2000,
    monthlyPaymentIncrease: -61
  },
  bitcoinInvestment: {
    investmentAmount: 40000,
    currentBitcoinPrice: 100000,
    targetScenarios: [],
    performanceSettings: {
      model: 'cycles',
      initialCAGR: 20,
      useSeasonalFactors: true,
      maxDrawdownPercent: 70,
      sentiment: 'bullish',
      customAnnualGrowthRate: null,
      enableDiminishingReturns: false,
      finalCAGR: 10,
      loanStartDate: new Date('2024-07-01')
    }
  },
  payoffTrigger: {
    type: 'percentage',
    value: 200
  }
};

console.log('Generating schedule...');
const schedule = generateComprehensiveAmortizationTable(testInputs);

// Find the payoff month
let payoffMonth = null;
for (const entry of schedule) {
  if (entry.payoffTriggerMet && entry.canPayOff) {
    payoffMonth = entry.month;
    console.log(`Payoff triggered at month ${payoffMonth}:`);
    console.log(`  BTC Value: $${entry.btcValue.toLocaleString()}`);
    console.log(`  BTC Held: ${entry.btcHeld} BTC`);
    console.log(`  BTC Spot Price: $${entry.btcSpotPrice.toLocaleString()}`);
    console.log(`  Debt Balance: $${entry.debtBalance.toLocaleString()}`);
    break;
  }
}

// Check what the performance summary shows
const performanceSummary = calculatePerformanceSummary(schedule, testInputs);
console.log('\nPerformance Summary:');
console.log(`  Final Total Asset: $${performanceSummary.finalTotalAsset.toLocaleString()}`);
console.log(`  Final BTC Value: $${performanceSummary.finalBTCValue.toLocaleString()}`);
console.log(`  Final Property Value: $${performanceSummary.finalPropertyValue.toLocaleString()}`);

// Check a few entries around the payoff month
if (payoffMonth) {
  console.log(`\nEntries around payoff month ${payoffMonth}:`);
  for (let i = Math.max(0, payoffMonth - 2); i < Math.min(schedule.length, payoffMonth + 3); i++) {
    const entry = schedule[i];
    console.log(`Month ${entry.month}: BTC=$${entry.btcValue.toLocaleString()} (${entry.btcHeld.toFixed(6)} BTC @ $${entry.btcSpotPrice.toLocaleString()}) Debt=$${entry.debtBalance.toLocaleString()}`);
  }
}
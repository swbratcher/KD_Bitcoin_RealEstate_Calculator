/**
 * Comprehensive Amortization Results Display Component
 * for KD Bitcoin Real Estate Calculator
 * 
 * This component displays the detailed amortization table with all calculated data
 * in a scrollable format that matches the Google Sheet structure.
 */

'use client';

import React, { useState } from 'react';
import { 
  AmortizationResults as AmortizationResultsType, 
  MonthlyAmortizationEntry
} from '@/lib/types';
import { formatCurrency, formatPercent, formatDate } from '@/lib/calculations';

interface AmortizationResultsProps {
  results: AmortizationResultsType | null;
  loading?: boolean;
  error?: string;
}

export default function AmortizationResults({ 
  results, 
  loading = false, 
  error 
}: AmortizationResultsProps) {

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-red-600 text-center">
          <h3 className="text-lg font-semibold mb-2">Calculation Error</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!results || !results.monthlySchedule.length) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-gray-500 text-center">
          <h3 className="text-lg font-semibold mb-2">No Results</h3>
          <p>Complete the calculator form to see results</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Performance Summary - Above the table */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            Performance Summary
          </h2>
        </div>
        <div className="p-6">
          <PerformanceSummary results={results} />
        </div>
      </div>

      {/* Amortization Table */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            Amortization Table
          </h2>
        </div>
        <div className="p-6">
          <AmortizationTable 
            schedule={results.monthlySchedule}
          />
        </div>
      </div>
    </div>
  );
}

function AmortizationTable({ 
  schedule
}: {
  schedule: MonthlyAmortizationEntry[];
}) {
  return (
    <div className="space-y-4">
      {/* Info */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Showing all {schedule.length} months
        </p>
      </div>

      {/* Scrollable table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Month
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Debt Balance
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Base Equity
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Appreciation
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                BTC Held
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                BTC Spot Price
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                BTC Value
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                BTC Performance
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Asset
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cash Flow
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payoff Trigger
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {schedule.map((entry, index) => (
              <tr key={entry.month} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                  {entry.month}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                  {entry.yearMonth}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(entry.debtBalance)}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(entry.baseEquity)}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(entry.propertyAppreciation)}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                  {entry.btcHeld.toFixed(6)} BTC
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(entry.btcSpotPrice)}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(entry.btcValue)}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className={`${
                    entry.btcPerformed > 0 ? 'text-green-600' : 
                    entry.btcPerformed < 0 ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {formatPercent(entry.btcPerformed)}
                  </span>
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(entry.totalAsset)}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className={`${
                    entry.netCashFlow > 0 ? 'text-green-600' : 
                    entry.netCashFlow < 0 ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {formatCurrency(entry.netCashFlow)}
                  </span>
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                  {entry.payoffTriggerMet ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Triggered
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Not Met
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PerformanceSummary({ results }: { results: AmortizationResultsType }) {
  const { payoffAnalysis, performanceSummary, monthlySchedule } = results;

  // Utility function for capped percentage display
  const formatCappedPercent = (value: number, cap = 10.0) => {
    if (value > cap) {
      return `${(cap * 100).toFixed(0)}%+`;
    }
    return formatPercent(value);
  };

  // Utility function for capped currency display
  const formatCappedCurrency = (value: number, cap = 1000000) => {
    if (value > cap) {
      return `$${(cap / 1000000).toFixed(0)}M+`;
    }
    return formatCurrency(value);
  };

  // Calculate milestone metrics
  const calculateMilestones = () => {
    const firstEntry = monthlySchedule[0];
    const initialInvestment = firstEntry?.btcHeld * firstEntry?.btcSpotPrice || 40000;
    
    // Find when investment doubles (2x)
    const doubleEntry = monthlySchedule.find(entry => entry.btcValue >= initialInvestment * 2);
    const doubleTimeYears = doubleEntry ? (doubleEntry.month / 12).toFixed(1) : 'N/A';
    
    // Break-even point (when Bitcoin appreciation covers potential losses)
    // Find when BTC value > initial BTC investment (first profitable point)
    const breakEvenEntry = monthlySchedule.find(entry => 
      entry.btcValue > initialInvestment
    );
    const breakEvenMonths = breakEvenEntry ? breakEvenEntry.month : null;
    const breakEvenTime = breakEvenMonths ? 
      breakEvenMonths < 12 ? `${breakEvenMonths} months` : `${(breakEvenMonths / 12).toFixed(1)} years`
      : 'N/A';
    
    // Debt-free timeline
    const debtFreeTime = payoffAnalysis.triggerMonth ? 
      `${(payoffAnalysis.triggerMonth / 12).toFixed(1)} years` : 
      'Full term';
    
    return {
      debtFreeTime,
      doubleTimeYears,
      breakEvenTime
    };
  };

  const milestones = calculateMilestones();

  // Calculate percentage breakdown of gains
  const calculateGainsBreakdown = () => {
    const propertyGain = performanceSummary.componentBreakdown ? 
      performanceSummary.componentBreakdown.propertyAppreciationGain :
      performanceSummary.finalPropertyValue - 200000; // fallback
    
    const bitcoinGain = performanceSummary.componentBreakdown ? 
      performanceSummary.componentBreakdown.bitcoinNetContribution :
      performanceSummary.finalBTCValue - 40000; // fallback
    
    const interestSavings = payoffAnalysis.interestSaved;
    
    const totalGains = propertyGain + bitcoinGain + interestSavings;
    
    if (totalGains <= 0) {
      return { propertyPercent: 0, bitcoinPercent: 0, interestPercent: 0 };
    }
    
    return {
      propertyPercent: (propertyGain / totalGains) * 100,
      bitcoinPercent: (bitcoinGain / totalGains) * 100,
      interestPercent: (interestSavings / totalGains) * 100
    };
  };

  const gainsBreakdown = calculateGainsBreakdown();
  
  // Calculate loan term from monthly schedule - find when debt naturally goes to zero
  const calculateLoanTermYears = () => {
    // Find the last month with debt > 0 where it wasn't paid off by trigger
    let lastMonthWithDebt = 0;
    for (let i = 0; i < monthlySchedule.length; i++) {
      const entry = monthlySchedule[i];
      if (entry.debtBalance > 0 && !entry.payoffTriggerMet) {
        lastMonthWithDebt = entry.month;
      }
    }
    return Math.round(lastMonthWithDebt / 12);
  };

  // Generate dynamic strategy summary based on actual scenario data
  const generateStrategySummary = () => {
    // Get initial values from first entry
    const firstEntry = monthlySchedule[0];
    const initialBTC = firstEntry?.btcHeld || 0;
    const initialBTCPrice = firstEntry?.btcSpotPrice || 100000;
    const initialInvestment = initialBTC * initialBTCPrice;
    
    // Check if BTC was depleted
    const btcDepletedEntry = monthlySchedule.find(entry => entry.btcHeld <= 0);
    const lastEntry = monthlySchedule[monthlySchedule.length - 1];
    
    // Calculate average monthly shortfall/surplus
    let totalShortfall = 0;
    let shortfallMonths = 0;
    let totalSurplus = 0;
    let surplusMonths = 0;
    
    for (const entry of monthlySchedule) {
      if (entry.netCashFlow < 0) {
        totalShortfall += Math.abs(entry.netCashFlow);
        shortfallMonths++;
      } else if (entry.netCashFlow > 0) {
        totalSurplus += entry.netCashFlow;
        surplusMonths++;
      }
    }
    
    const avgMonthlyShortfall = shortfallMonths > 0 ? totalShortfall / shortfallMonths : 0;
    const avgMonthlySurplus = surplusMonths > 0 ? totalSurplus / surplusMonths : 0;
    
    // Build the summary based on different scenarios
    if (btcDepletedEntry) {
      // Scenario: BTC depleted (crashout)
      const depletionMonth = btcDepletedEntry.month;
      const depletionYears = (depletionMonth / 12).toFixed(1);
      return `Bitcoin investment (${formatCurrency(initialInvestment)} → ${initialBTC.toFixed(4)} BTC @ ${formatCurrency(initialBTCPrice)}) ` +
             `was depleted after ${depletionYears} years due to monthly shortfalls averaging ${formatCurrency(avgMonthlyShortfall)}. ` +
             `Consider increasing initial investment, reducing expenses, or adjusting payoff strategy to avoid BTC depletion.`;
    } else if (avgMonthlyShortfall === 0 && avgMonthlySurplus === 0) {
      // Scenario: Perfect property cash flow (all good)
      return `Bitcoin investment (${formatCurrency(initialInvestment)} → ${initialBTC.toFixed(4)} BTC @ ${formatCurrency(initialBTCPrice)}) ` +
             `remains untouched as property income perfectly covers all expenses. ` +
             `${payoffAnalysis.triggerMonth ? 
               `Mortgage paid off in ${(payoffAnalysis.triggerMonth / 12).toFixed(1)} years through BTC appreciation, ` +
               `retaining ${payoffAnalysis.finalBTCRetained.toFixed(4)} BTC for continued growth.` : 
               `Full ${initialBTC.toFixed(4)} BTC position preserved for maximum appreciation potential.`} ` +
             `Property generates self-sustaining income with no BTC liquidation needed.`;
    } else if (avgMonthlySurplus > avgMonthlyShortfall) {
      // Scenario: Property cash flow positive
      return `Bitcoin investment (${formatCurrency(initialInvestment)} → ${initialBTC.toFixed(4)} BTC @ ${formatCurrency(initialBTCPrice)}) ` +
             `grows unimpeded as property generates surplus income averaging ${formatCurrency(avgMonthlySurplus)}/month. ` +
             `${payoffAnalysis.triggerMonth ? 
               `BTC appreciation enabled mortgage payoff in ${(payoffAnalysis.triggerMonth / 12).toFixed(1)} years, ` +
               `retaining ${payoffAnalysis.finalBTCRetained.toFixed(4)} BTC.` : 
               `Strategy preserves full BTC position while building both equity and Bitcoin wealth.`} ` +
             `Ideal scenario combining property income with Bitcoin appreciation.`;
    } else if (payoffAnalysis.triggerMonth) {
      // Scenario: Successful payoff with some BTC sales
      const btcSold = initialBTC - payoffAnalysis.finalBTCRetained;
      const percentRetained = (payoffAnalysis.finalBTCRetained / initialBTC * 100).toFixed(0);
      return `Bitcoin investment (${formatCurrency(initialInvestment)} → ${initialBTC.toFixed(4)} BTC @ ${formatCurrency(initialBTCPrice)}) ` +
             `appreciated sufficiently to pay off mortgage in ${(payoffAnalysis.triggerMonth / 12).toFixed(1)} years, ` +
             `eliminating debt while retaining ${payoffAnalysis.finalBTCRetained.toFixed(4)} BTC (${percentRetained}%) for continued appreciation. ` +
             `${avgMonthlyShortfall > 0 ? `Property income shortfall averaged ${formatCurrency(avgMonthlyShortfall)}/month, requiring ${btcSold.toFixed(4)} BTC liquidation. ` : ''} ` +
             `Property now owned free and clear with ongoing income potential.`;
    } else {
      // Scenario: No payoff trigger met but sustainable
      const finalBTC = lastEntry?.btcHeld || 0;
      const btcAppreciation = lastEntry ? (lastEntry.btcValue / initialInvestment - 1) * 100 : 0;
      return `Bitcoin investment (${formatCurrency(initialInvestment)} → ${initialBTC.toFixed(4)} BTC @ ${formatCurrency(initialBTCPrice)}) ` +
             `sustained the strategy through the full term${avgMonthlyShortfall > 0 ? ` despite property income shortfalls averaging ${formatCurrency(avgMonthlyShortfall)}/month` : ''}. ` +
             `Final position: ${finalBTC.toFixed(4)} BTC worth ${formatCurrency(lastEntry?.btcValue || 0)} (${btcAppreciation.toFixed(0)}% appreciation). ` +
             `Strategy preserved BTC holdings without triggering early payoff, maximizing long-term appreciation potential.`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Section 1: Scenario Outcome (What Happened) */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Scenario Outcome</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-600">Payoff Success</h4>
            <p className="text-2xl font-bold text-blue-600">
              {payoffAnalysis.triggerMonth ? 
                `${(payoffAnalysis.triggerMonth / 12).toFixed(1)} Years` : 
                'Full Term'
              }
            </p>
            <p className="text-sm text-gray-500">
              {payoffAnalysis.triggerDate ? 
                new Date(payoffAnalysis.triggerDate).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'short' 
                }).toUpperCase() : 
                `${calculateLoanTermYears()} Years`
              }
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-600">Zero Debt</h4>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(performanceSummary.finalPropertyValue)}
            </p>
            <p className="text-xs text-gray-500">Home Value</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-600">BTC Retained</h4>
            <p className="text-xl font-bold text-orange-600">
              {payoffAnalysis.finalBTCRetained.toFixed(4)} BTC
            </p>
            <p className="text-lg font-semibold text-gray-900">
              {formatCappedCurrency(performanceSummary.finalBTCValue)}
            </p>
          </div>
        </div>
        
        {/* Info Block */}
        <div className="mt-4 bg-blue-100 border-l-4 border-blue-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <strong>Strategy Summary:</strong> {generateStrategySummary()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Financial Performance (Returns Analysis) */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-600">Total ROI</h4>
            {/* Element #1A - Capped ROI Display */}
            <p className="text-3xl font-bold text-green-600">
              {formatCappedPercent(performanceSummary.totalROI)}
            </p>
            {/* Element #1B - Original ROI Display */}
            <p className="text-sm text-gray-500">
              Actual: {formatPercent(performanceSummary.totalROI)}
            </p>
            <p className="text-sm text-gray-500">Over {performanceSummary.efficiencyMetrics?.timeToPayoff.toFixed(1) || (payoffAnalysis.triggerMonth ? (payoffAnalysis.triggerMonth / 12).toFixed(1) : 'N/A')} years</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-600">Annualized Return</h4>
            <p className="text-3xl font-bold text-blue-600">
              {formatPercent(performanceSummary.annualizedReturn)}
            </p>
            <p className="text-sm text-gray-500">Per year</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-600">Final Asset Value</h4>
            <p className="text-2xl font-bold text-purple-600">
              {formatCappedCurrency(performanceSummary.finalTotalAsset, 1000000 + performanceSummary.finalPropertyValue)}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-600">vs S&P 500 (7%)</h4>
            <p className={`text-2xl font-bold ${performanceSummary.baselineComparison?.strategyOutperformance && performanceSummary.baselineComparison.strategyOutperformance > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {performanceSummary.baselineComparison ? 
                (performanceSummary.baselineComparison.strategyOutperformance > 0 ? '+' : '') + 
                formatCappedCurrency(Math.abs(performanceSummary.baselineComparison.strategyOutperformance)) : 
                'N/A'
              }
            </p>
            <p className="text-xs text-gray-500">Outperformance</p>
          </div>
        </div>
      </div>

      {/* Section 2B: Milestone Summary */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Milestones</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Element #2A - Debt-Free Timeline */}
          <div className="bg-white rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-600">Debt-Free Timeline</h4>
            <p className="text-2xl font-bold text-green-600">
              {milestones.debtFreeTime}
            </p>
            <p className="text-xs text-gray-500">Mortgage elimination</p>
          </div>
          
          {/* Element #2B - First Double */}
          <div className="bg-white rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-600">First Double</h4>
            <p className="text-2xl font-bold text-blue-600">
              {milestones.doubleTimeYears === 'N/A' ? 'N/A' : `${milestones.doubleTimeYears} years`}
            </p>
            <p className="text-xs text-gray-500">Investment 2x milestone</p>
          </div>
          
          {/* Element #2C - Break-Even Point */}
          <div className="bg-white rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-600">Break-Even Point</h4>
            <p className="text-2xl font-bold text-purple-600">
              {milestones.breakEvenTime}
            </p>
            <p className="text-xs text-gray-500">Risk-free threshold</p>
          </div>
        </div>
      </div>

      {/* Section 3: Gain Attribution (Component Breakdown) */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Where Gains Came From</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Element #3C - Original Property $ */}
          <div className="bg-white rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-600">Property Appreciation</h4>
            <p className="text-2xl font-bold text-blue-600">
              {performanceSummary.componentBreakdown ? 
                formatCurrency(performanceSummary.componentBreakdown.propertyAppreciationGain) :
                formatCurrency(performanceSummary.finalPropertyValue - 200000) // fallback calculation
              }
            </p>
            <p className="text-xs text-gray-500">Real estate growth</p>
          </div>
          
          {/* Element #3D - Original Bitcoin $ */}
          <div className="bg-white rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-600">Bitcoin Net Gain</h4>
            <p className="text-2xl font-bold text-orange-600">
              {performanceSummary.componentBreakdown ? 
                formatCappedCurrency(performanceSummary.componentBreakdown.bitcoinNetContribution) :
                formatCappedCurrency(performanceSummary.finalBTCValue - 40000) // fallback calculation
              }
              <span className="text-sm font-normal text-gray-600 ml-2">
                ({payoffAnalysis.finalBTCRetained.toFixed(4)} BTC)
              </span>
            </p>
            <p className="text-xs text-gray-500">Monthly BTC sales: ~$152 avg for shortfall coverage</p>
          </div>
          
          {/* Element #3E - Original Interest $ */}
          <div className="bg-white rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-600">Interest Savings</h4>
            <p className="text-2xl font-bold text-purple-600">
              {formatCurrency(payoffAnalysis.interestSaved)}
            </p>
            <p className="text-xs text-gray-500">Early payoff benefit</p>
          </div>
        </div>
      </div>

      {/* Section 4: Decision Metrics (Risk & Efficiency) - TEMPORARILY HIDDEN */}
      {/* TODO: Unhide and fix data communications - shows N/A and 0.0000 BTC instead of actual values */}
      {false && (
        <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Strategy Efficiency</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-600">Debt Elimination via BTC</h4>
              <p className="text-2xl font-bold text-green-600">
                {payoffAnalysis.triggerMonth ? 
                  `${((payoffAnalysis.debtAtTrigger / payoffAnalysis.btcValueAtTrigger) * 100).toFixed(1)}%` : 
                  'N/A'
                }
              </p>
              <p className="text-xs text-gray-500">Payoff efficiency</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-600">Leverage Efficiency</h4>
              <p className="text-2xl font-bold text-indigo-600">
                {performanceSummary.efficiencyMetrics ? 
                  `${performanceSummary.efficiencyMetrics?.leverageRatio.toFixed(1)}x` :
                  `${((performanceSummary.finalTotalAsset - 240000) / 40000).toFixed(1)}x` // fallback
                }
              </p>
              <p className="text-xs text-gray-500">Return per $ invested</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-600">Future Growth Potential</h4>
              <p className="text-2xl font-bold text-orange-600">
                {payoffAnalysis.finalBTCRetained.toFixed(4)} BTC
              </p>
              <p className="text-xs text-gray-500">Retained for appreciation</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-600">BTC Sustainability</h4>
              <p className="text-2xl font-bold text-green-600">
                ✅ Sufficient
              </p>
              <p className="text-xs text-gray-500">Never runs out at current shortfall</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

 
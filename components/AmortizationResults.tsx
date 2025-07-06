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
  const { payoffAnalysis, performanceSummary } = results;

  return (
    <div className="space-y-6">
      {/* Payoff Analysis */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payoff Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-600">Trigger Month</h4>
            <p className="text-2xl font-bold text-blue-600">
              {payoffAnalysis.triggerMonth ? `Month ${payoffAnalysis.triggerMonth}` : 'Not Triggered'}
            </p>
            <p className="text-sm text-gray-500">
              {payoffAnalysis.triggerDate || 'N/A'}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-600">BTC Value at Trigger</h4>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(payoffAnalysis.btcValueAtTrigger)}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-600">Debt at Trigger</h4>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(payoffAnalysis.debtAtTrigger)}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-600">Interest Saved</h4>
            <p className="text-2xl font-bold text-purple-600">
              {formatCurrency(payoffAnalysis.interestSaved)}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-600">BTC Retained</h4>
            <p className="text-2xl font-bold text-orange-600">
              {payoffAnalysis.finalBTCRetained.toFixed(8)} BTC
            </p>
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Summary At Payoff</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-600">Total Asset at Payoff</h4>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(performanceSummary.finalTotalAsset)}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-600">Property Value at Payoff</h4>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(performanceSummary.finalPropertyValue)}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-600">BTC Value at Payoff</h4>
            <p className="text-2xl font-bold text-orange-600">
              {formatCurrency(performanceSummary.finalBTCValue)}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-600">Total ROI</h4>
            <p className="text-2xl font-bold text-purple-600">
              {formatPercent(performanceSummary.totalROI)}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-600">Annualized Return</h4>
            <p className="text-2xl font-bold text-indigo-600">
              {formatPercent(performanceSummary.annualizedReturn)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

 
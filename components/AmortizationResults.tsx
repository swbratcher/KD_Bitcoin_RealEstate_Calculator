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
  MonthlyAmortizationEntry,
  StackedChartDataPoint 
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
  const [activeTab, setActiveTab] = useState<'table' | 'summary' | 'chart'>('table');
  const [showAllMonths, setShowAllMonths] = useState(false);

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

  const displayedMonths = showAllMonths ? results.monthlySchedule : results.monthlySchedule.slice(0, 60);

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header with tabs */}
      <div className="border-b border-gray-200">
        <div className="p-6 pb-0">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Amortization Results
          </h2>
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('table')}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg ${
                activeTab === 'table'
                  ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Amortization Table
            </button>
            <button
              onClick={() => setActiveTab('summary')}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg ${
                activeTab === 'summary'
                  ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Performance Summary
            </button>
            <button
              onClick={() => setActiveTab('chart')}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg ${
                activeTab === 'chart'
                  ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Chart Data
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'table' && (
          <AmortizationTable 
            schedule={displayedMonths}
            showAllMonths={showAllMonths}
            onToggleShowAll={() => setShowAllMonths(!showAllMonths)}
            totalMonths={results.monthlySchedule.length}
          />
        )}

        {activeTab === 'summary' && (
          <PerformanceSummary 
            results={results}
          />
        )}

        {activeTab === 'chart' && (
          <ChartDataView 
            chartData={results.stackedChartData}
          />
        )}
      </div>
    </div>
  );
}

function AmortizationTable({ 
  schedule, 
  showAllMonths, 
  onToggleShowAll, 
  totalMonths 
}: {
  schedule: MonthlyAmortizationEntry[];
  showAllMonths: boolean;
  onToggleShowAll: () => void;
  totalMonths: number;
}) {
  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Showing {schedule.length} of {totalMonths} months
        </p>
        <button
          onClick={onToggleShowAll}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {showAllMonths ? 'Show First 5 Years' : 'Show All Months'}
        </button>
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
              {formatCurrency(payoffAnalysis.finalBTCRetained)}
            </p>
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-600">Final Total Asset</h4>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(performanceSummary.finalTotalAsset)}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-600">Final Property Value</h4>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(performanceSummary.finalPropertyValue)}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-600">Final BTC Value</h4>
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

function ChartDataView({ chartData }: { chartData: StackedChartDataPoint[] }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Stacked Chart Data (20-Year View)</h3>
      <p className="text-sm text-gray-600">
        This data powers the stacked area chart visualization showing debt, equity, appreciation, and BTC value over time.
      </p>
      
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Month
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Debt (Red)
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Base Equity (Green)
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Appreciation (Light Green)
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                BTC Value (Gold)
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Value
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {chartData.slice(0, 60).map((dataPoint, index) => (
              <tr key={dataPoint.month} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                  {dataPoint.month}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(dataPoint.date).toLocaleDateString()}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-red-600">
                  {formatCurrency(dataPoint.debt)}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-green-600">
                  {formatCurrency(dataPoint.baseEquity)}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-green-400">
                  {formatCurrency(dataPoint.appreciation)}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-yellow-600">
                  {formatCurrency(dataPoint.btcValue)}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                  {formatCurrency(dataPoint.totalValue)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <p className="text-sm text-gray-500">
        Showing first 60 months of chart data. Full dataset contains {chartData.length} months.
      </p>
    </div>
  );
} 
'use client';

import { useState } from 'react';
import CalculatorForm from '@/components/CalculatorForm';
import AmortizationResults from '@/components/AmortizationResults';
import { CalculatorInputs, AmortizationResults as AmortizationResultsType } from '@/lib/types';
import { generateAmortizationResults, validateAmortizationInputs } from '@/lib/calculations';

export default function HomePage() {
  const [amortizationResults, setAmortizationResults] = useState<AmortizationResultsType | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCalculation = async (inputs: CalculatorInputs) => {
    setCalculating(true);
    setError(null);
    
    try {
      console.log('🧮 Starting comprehensive amortization calculation with inputs:', inputs);
      
      // Validate inputs first
      const validation = validateAmortizationInputs(inputs);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }
      
      // Generate comprehensive amortization results
      const results = generateAmortizationResults(inputs);
      
      console.log('✅ Comprehensive calculation completed:', results);
      setAmortizationResults(results);
      
    } catch (err) {
      console.error('❌ Calculation error:', err);
      setError(err instanceof Error ? err.message : 'Calculation failed');
    } finally {
      setCalculating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            KD Bitcoin Real Estate Calculator
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Discover when Bitcoin holdings could pay off your refinanced mortgage
          </p>
          <div className="mt-4 text-sm text-blue-600">
            🧪 <strong>Testing Mode:</strong> Core functionality integration test
          </div>
        </div>

        {/* Calculator Form - Full Width */}
        <div className="space-y-8">
          {/* Input Panel - Full Width */}
          <div className="w-full">
            <CalculatorForm 
              onSubmit={handleCalculation}
              loading={calculating}
            />
          </div>

          {/* Results Panel - Billboard Area */}
          <div className="w-full space-y-4">
            {/* Quick Summary (when results available) */}
            {amortizationResults && !calculating && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-green-800 font-semibold">✅ Calculation Complete!</h3>
                <div className="mt-2 text-sm text-green-700">
                  <p><strong>Total months calculated:</strong> {amortizationResults.monthlySchedule.length}</p>
                  {amortizationResults.payoffAnalysis.triggerMonth && (
                    <p><strong>Payoff trigger month:</strong> {amortizationResults.payoffAnalysis.triggerMonth}</p>
                  )}
                  <p><strong>Total ROI:</strong> {((amortizationResults.performanceSummary.totalROI || 0) * 100).toFixed(1)}%</p>
                </div>
              </div>
            )}
            
            {/* Comprehensive Amortization Results */}
            <AmortizationResults 
              results={amortizationResults}
              loading={calculating}
              error={error || undefined}
            />
          </div>
        </div>

        {/* Debug Info */}
        {amortizationResults && (
          <details className="mt-8">
            <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
              🔍 Debug Information (Click to expand)
            </summary>
            <pre className="mt-2 text-xs bg-gray-100 p-4 rounded overflow-auto max-h-96">
              {JSON.stringify({
                payoffAnalysis: amortizationResults.payoffAnalysis,
                performanceSummary: amortizationResults.performanceSummary,
                monthlyScheduleLength: amortizationResults.monthlySchedule.length,
                firstThreeMonths: amortizationResults.monthlySchedule.slice(0, 3),
                chartDataLength: amortizationResults.stackedChartData.length
              }, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
} 
'use client';

import { useState } from 'react';

export default function TestPage() {
  const [tests, setTests] = useState<any[]>([]);
  const [running, setRunning] = useState(false);

  const runTests = async () => {
    setRunning(true);
    const testResults: any[] = [];

    // Test 1: Bitcoin Price API (CoinGecko Direct)
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
      const data = await response.json();
      const success = data.bitcoin && data.bitcoin.usd;
      testResults.push({
        test: 'Bitcoin Price API',
        success: success,
        result: success ? `$${data.bitcoin.usd.toLocaleString()}` : 'Failed to fetch price',
        data: data
      });
    } catch (error) {
      testResults.push({
        test: 'Bitcoin Price API',
        success: false,
        result: `Error: ${error}`,
        data: null
      });
    }

    // Test 2: Calculation Functions
    try {
      const { calculateMonthlyPayment, calculateBitcoinValueAtTime } = await import('@/lib/calculations');
      
      const monthlyPayment = calculateMonthlyPayment(400000, 0.07, 30);
      const bitcoinValue = calculateBitcoinValueAtTime(400000, 45000, 0.20, 24);
      
      testResults.push({
        test: 'Calculation Functions',
        success: true,
        result: `Monthly payment: $${Math.round(monthlyPayment).toLocaleString()}, Bitcoin value (2yr): $${Math.round(bitcoinValue.bitcoinValue).toLocaleString()}`,
        data: { monthlyPayment, bitcoinValue }
      });
    } catch (error) {
      testResults.push({
        test: 'Calculation Functions',
        success: false,
        result: `Error: ${error}`,
        data: null
      });
    }

    // Test 3: Type Definitions
    try {
      const { formatCurrency, formatPercent } = await import('@/lib/calculations');
      
      const currency = formatCurrency(1234567);
      const percent = formatPercent(0.1234);
      
      testResults.push({
        test: 'Utility Functions',
        success: true,
        result: `Currency: ${currency}, Percent: ${percent}`,
        data: { currency, percent }
      });
    } catch (error) {
      testResults.push({
        test: 'Utility Functions',
        success: false,
        result: `Error: ${error}`,
        data: null
      });
    }

    setTests(testResults);
    setRunning(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">🧪 System Tests</h1>
        <p className="mt-2 text-gray-600">Core functionality verification</p>
      </div>

      <div className="mb-6">
        <button
          onClick={runTests}
          disabled={running}
          className="w-full btn-primary"
        >
          {running ? 'Running Tests...' : 'Run All Tests'}
        </button>
      </div>

      {tests.length > 0 && (
        <div className="space-y-4">
          {tests.map((test, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${
                test.success 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className={`font-semibold ${
                  test.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {test.success ? '✅' : '❌'} {test.test}
                </h3>
              </div>
              <p className={`mt-1 text-sm ${
                test.success ? 'text-green-700' : 'text-red-700'
              }`}>
                {test.result}
              </p>
              {test.data && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs text-gray-600">
                    View detailed data
                  </summary>
                  <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-auto">
                    {JSON.stringify(test.data, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-800">Manual Tests to Run:</h4>
        <ol className="mt-2 text-sm text-blue-700 list-decimal list-inside space-y-1">
          <li>Go to main page and fill out the calculator form</li>
          <li>Verify Bitcoin price loads automatically</li>
          <li>Submit form with valid data and check console logs</li>
          <li>Try invalid data to test validation</li>
          <li>Check browser network tab for API calls</li>
        </ol>
      </div>
    </div>
  );
} 
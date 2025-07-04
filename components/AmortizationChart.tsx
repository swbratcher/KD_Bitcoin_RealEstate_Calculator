import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine
} from 'recharts';

interface AmortizationChartProps {
  data: {
    date: string;
    debt: number;
    baseEquity: number;
    appreciation: number;
    btcValue: number;
    totalValue: number;
  }[];
  height?: number;
}

const AmortizationChart: React.FC<AmortizationChartProps> = ({ 
  data, 
  height = 400 
}) => {
  // Format currency for tooltips
  const formatCurrency = (value: number) => {
    return `$${Math.round(value).toLocaleString()}`;
  };

  // Calculate reasonable Y-axis maximum to keep base components visible
  const calculateYAxisMax = () => {
    if (!data || data.length === 0) return undefined;
    
    const firstDataPoint = data[0];
    const initialTotalAssets = firstDataPoint.debt + firstDataPoint.baseEquity + firstDataPoint.appreciation + firstDataPoint.btcValue;
    
    // Cap at 2x initial total assets to keep debt and equity visible
    const yAxisMax = initialTotalAssets * 2;
    
    return yAxisMax;
  };

  const yAxisMax = calculateYAxisMax();

  // Generate halving reference lines based on real Bitcoin halving dates
  // Last halving: April 20, 2024
  // Next halvings: approximately every 4 years
  const generateHalvingLines = () => {
    const halvingDates = [
      { year: '2024', date: 'Apr 20' },
      { year: '2028', date: 'Apr 13' }, // Estimated
      { year: '2032', date: 'Apr 15' }, // Estimated
      { year: '2036', date: 'Apr 17' }, // Estimated
      { year: '2040', date: 'Apr 19' }, // Estimated
      { year: '2044', date: 'Apr 21' }, // Estimated
    ];
    
    // Find the date range of the data to determine which halvings to show
    const dataYears = data.map(d => parseInt(d.date)).filter(year => !isNaN(year));
    const minYear = Math.min(...dataYears);
    const maxYear = Math.max(...dataYears);
    
    return halvingDates.filter(halving => {
      const halvingYear = parseInt(halving.year);
      return halvingYear >= minYear && halvingYear <= maxYear + 1; // Show relevant halvings
    });
  };

  const halvingDates = generateHalvingLines();

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const totalValue = payload.find((p: any) => p.name === 'BTC Value')?.payload.totalValue || 0;
      const isValueCapped = yAxisMax && totalValue > yAxisMax;
      
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              <span className="font-medium">{entry.name}:</span> {formatCurrency(entry.value)}
            </p>
          ))}
          <div className="border-t pt-2 mt-2">
            <p className="text-sm font-semibold text-gray-700">
              Total Value: {formatCurrency(totalValue)}
            </p>
            {isValueCapped && (
              <p className="text-xs text-orange-600 mt-1">
                ⚠️ Chart Y-axis capped for visibility - actual values shown above
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Check if any data points exceed the Y-axis cap
  const hasValuesCapped = data.some(point => 
    point.totalValue > (yAxisMax || Infinity)
  );

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: '#ccc' }}
            interval={0}
            tickFormatter={(value, index) => {
              // Show every 12th tick (annual) and ensure it's a 4-digit year
              return index % 12 === 0 && value.length === 4 ? value : '';
            }}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: '#ccc' }}
            tickFormatter={formatCurrency}
            domain={[0, yAxisMax]}
            allowDataOverflow={true}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          
          {/* Bitcoin Halving Reference Lines */}
          {halvingDates.map((halving) => (
            <ReferenceLine 
              key={halving.year}
              x={halving.year} 
              stroke="#f7931a" 
              strokeWidth={2}
              strokeDasharray="5 5"
              label={{ 
                value: `₿ Halving ${halving.date}`, 
                position: 'topRight', 
                fontSize: 10,
                fill: '#f7931a'
              }}
            />
          ))}
          
          {/* Debt (Red) - Bottom layer */}
          <Area
            type="monotone"
            dataKey="debt"
            stackId="1"
            stroke="#dc2626"
            fill="#dc2626"
            fillOpacity={0.8}
            name="Debt"
          />
          
          {/* Base Equity (Green) */}
          <Area
            type="monotone"
            dataKey="baseEquity"
            stackId="2"
            stroke="#16a34a"
            fill="#16a34a"
            fillOpacity={0.8}
            name="Base Equity"
          />
          
          {/* Appreciation (Light Green) */}
          <Area
            type="monotone"
            dataKey="appreciation"
            stackId="2"
            stroke="#4ade80"
            fill="#4ade80"
            fillOpacity={0.7}
            name="Appreciation"
          />
          
          {/* BTC Value (Orange) */}
          <Area
            type="monotone"
            dataKey="btcValue"
            stackId="2"
            stroke="#ea580c"
            fill="#ea580c"
            fillOpacity={0.8}
            name="BTC Value"
          />
        </AreaChart>
      </ResponsiveContainer>
      
      {/* Chart capping notice */}
      {hasValuesCapped && (
        <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded text-sm text-orange-700">
          <span className="font-medium">📊 Chart Y-axis capped for visibility:</span> 
          {' '}Values above {formatCurrency(yAxisMax || 0)} go off-chart but show actual amounts on hover. 
          Orange dashed lines indicate Bitcoin halving events.
        </div>
      )}
    </div>
  );
};

export default AmortizationChart; 
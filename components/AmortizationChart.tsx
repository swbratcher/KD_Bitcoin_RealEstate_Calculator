import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
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
  // Format currency for tooltips (full format)
  const formatCurrency = (value: number) => {
    return `$${Math.round(value).toLocaleString()}`;
  };

  // Format currency for Y-axis (abbreviated format)
  const formatCurrencyShort = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${Math.round(value).toLocaleString()}`;
  };

  // Calculate reasonable Y-axis maximum to keep base components visible
  const calculateYAxisMax = () => {
    if (!data || data.length === 0) return undefined;
    
    const firstDataPoint = data[0];
    const initialTotalAssets = firstDataPoint.debt + firstDataPoint.baseEquity + firstDataPoint.appreciation + firstDataPoint.btcValue;
    
    // Cap at 2.3x initial total assets (15% more headroom) to show Bitcoin performance better
    const yAxisMax = initialTotalAssets * 2.3;
    
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
    // Handle both "2024" and "2024-01" date formats
    const dataYears = data.map(d => {
      const year = d.date.includes('-') ? parseInt(d.date.split('-')[0]) : parseInt(d.date);
      return year;
    }).filter(year => !isNaN(year));
    
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
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart
          data={data}
          margin={{
            top: 0,
            right: 0,
            left: 0,
            bottom: 35,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="date" 
            angle={-90}
            textAnchor="end"
            tick={{ fontSize: 11 }}
            tickLine={{ stroke: '#ccc' }}
            interval={11}
            tickFormatter={(value: string) => {
              // Extract year from date format
              const year = value.includes('-') ? value.split('-')[0] : value;
              return year;
            }}
            height={60}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: '#ccc' }}
            tickFormatter={formatCurrencyShort}
            domain={[0, yAxisMax || 1000000]}
            allowDataOverflow={true}
          />
          <Tooltip content={<CustomTooltip />} />
          
          {/* Bitcoin Halving Reference Lines */}
          {data && halvingDates.map((halving) => {
            // Find the data point that matches the halving year
            const halvingDataPoint = data.find(d => {
              const dataYear = d.date.includes('-') ? d.date.split('-')[0] : d.date;
              return dataYear === halving.year;
            });
            
            if (halvingDataPoint) {
              return (
                <ReferenceLine 
                  key={halving.year}
                  x={halvingDataPoint.date} 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  strokeDasharray="none"
                />
              );
            }
            return null;
          })}
          
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
            stackId="1"
            stroke="#16a34a"
            fill="#16a34a"
            fillOpacity={0.8}
            name="Base Equity"
          />
          
          {/* Appreciation (Light Green) */}
          <Area
            type="monotone"
            dataKey="appreciation"
            stackId="1"
            stroke="#4ade80"
            fill="#4ade80"
            fillOpacity={0.7}
            name="Appreciation"
          />
          
          {/* BTC Value (Orange) */}
          <Area
            type="monotone"
            dataKey="btcValue"
            stackId="1"
            stroke="#ea580c"
            fill="#ea580c"
            fillOpacity={0.8}
            name="BTC Value"
          />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default AmortizationChart; 
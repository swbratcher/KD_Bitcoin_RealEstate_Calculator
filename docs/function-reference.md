# Function Reference Guide

## Core Calculation Functions

### Enhanced Bitcoin Performance Engine
**File**: `lib/calculations/enhanced-bitcoin-performance.ts`

#### `generateEnhancedBitcoinPerformanceTimeline(inputs, maxMonths?)`
Creates month-by-month Bitcoin performance data with seasonal cycles.

**Parameters**:
- `inputs: CalculatorInputs` - Complete user input data
- `maxMonths?: number` - Override loan term length

**Returns**: `BitcoinPerformanceData[]` - Array of monthly performance data

**Key Logic**:
- Uses real halving dates for cycle positioning
- Generates 18/12/6/6 month seasonal cycles
- Applies diminishing returns across multiple cycles

#### `calculateEnhancedBitcoinValueAtMonth(month, initialInvestment, initialPrice, performanceTimeline)`
Calculates Bitcoin value at specific month with safety bounds.

**Parameters**:
- `month: number` - Month number (0-based)
- `initialInvestment: number` - Initial Bitcoin investment amount
- `initialPrice: number` - Starting Bitcoin price
- `performanceTimeline: BitcoinPerformanceData[]` - Performance data array

**Returns**: Object with `totalValue`, `bitcoinHeld`, `averagePrice`, `currentSpotPrice`

#### `calculateCycleCAGR(cycleNumber, totalCycles, initialCAGR, finalCAGR?)`
Calculates CAGR for specific cycle with optional diminishing returns.

**Parameters**:
- `cycleNumber: number` - Current cycle (1-based)
- `totalCycles: number` - Total cycles in loan term
- `initialCAGR: number` - Starting CAGR percentage
- `finalCAGR?: number | null` - Ending CAGR (enables diminishing returns)

**Returns**: `number` - CAGR percentage for this cycle

### Comprehensive Amortization Engine
**File**: `lib/calculations/comprehensive-amortization.ts`

#### `generateComprehensiveAmortizationTable(inputs, maxMonths?)`
Creates complete month-by-month amortization schedule.

**Parameters**:
- `inputs: CalculatorInputs` - Complete user input data
- `maxMonths?: number` - Override loan term length

**Returns**: `MonthlyAmortizationEntry[]` - Complete monthly schedule

**Key Features**:
- Combines debt paydown with Bitcoin performance
- Tracks cash flow and BTC sales
- Analyzes payoff trigger conditions

#### `generateStackedChartData(amortizationSchedule, property)`
Converts amortization schedule to chart visualization data.

**Parameters**:
- `amortizationSchedule: MonthlyAmortizationEntry[]` - Monthly schedule data
- `property: { currentValue: number }` - Property information

**Returns**: `StackedChartDataPoint[]` - Chart-ready data points

#### `generateAmortizationResults(inputs, maxMonths?)`
Main orchestration function that generates complete results package.

**Parameters**:
- `inputs: CalculatorInputs` - Complete user input data
- `maxMonths?: number` - Default 360 months (30 years)

**Returns**: `AmortizationResults` - Complete results with schedule, chart data, and analysis

**Data Flow**:
1. Generates comprehensive amortization table
2. Creates stacked chart data from table
3. Analyzes payoff trigger conditions
4. Calculates performance summary

#### `analyzePayoffTrigger(amortizationSchedule)`
Analyzes when payoff trigger conditions are met.

**Returns**: Object with `triggerMonth`, `triggerDate`, `btcValueAtTrigger`, etc.

#### `calculatePerformanceSummary(amortizationSchedule, inputs)`
Calculates final performance metrics.

**Returns**: Object with `finalTotalAsset`, `totalROI`, `annualizedReturn`, etc.

### Halving Date Utilities
**File**: `lib/utils/halving-date-utils.ts`

#### `getLastHalvingDate(referenceDate?)`
Gets most recent Bitcoin halving before reference date.

**Parameters**:
- `referenceDate?: Date` - Default: current date

**Returns**: `Date` - Most recent halving date

#### `getCyclePosition(referenceDate?)`
Calculates position within 48-month halving cycle.

**Parameters**:
- `referenceDate?: Date` - Default: current date

**Returns**: `number` - Position (0-47) within current cycle

#### `getCurrentSeason(cyclePosition)`
Maps cycle position to Bitcoin season.

**Parameters**:
- `cyclePosition: number` - Position within 48-month cycle

**Returns**: Object with `season`, `monthInSeason`, `totalMonthsInSeason`

**Season Mapping**:
- Summer: 0-17 (18 months)
- Fall: 18-29 (12 months)
- Winter: 30-35 (6 months)
- Spring: 36-47 (6 months)

#### `addMonths(date, months)`
Utility to add months to a date.

#### `getCycleInfo(referenceDate?)`
Debug function that returns complete cycle information.

## Validation Functions

### `validateAmortizationInputs(inputs)`
**File**: `lib/calculations/comprehensive-amortization.ts`

Validates all calculator inputs before processing.

**Parameters**:
- `inputs: CalculatorInputs` - Complete user input data

**Returns**: `{ isValid: boolean; errors: string[] }`

**Validation Rules**:
- Property value > 0
- Bitcoin investment amount > 0
- Current Bitcoin price > 0
- Payoff trigger value > 0
- Payoff trigger percentage ≤ 1000%

## Base Calculation Functions

### Mortgage Utilities
**File**: `lib/calculations/mortgage.ts`

#### `calculateMonthlyPayment(loanAmount, interestRate, termYears)`
Standard mortgage payment calculation.

#### `calculateRemainingBalance(loanAmount, interestRate, termYears, monthsPaid)`
Calculates remaining loan balance after payments.

### Amortization Utilities
**File**: `lib/calculations/amortization.ts`

#### `createBaseAmortizationSchedule(inputs, maxMonths)`
Creates base debt paydown schedule without Bitcoin calculations.

#### `calculatePropertyAppreciation(initialValue, annualRate, monthNumber)`
Calculates property appreciation for given month.

**Note**: Property appreciation starts in month 2 (month 1 = $0)

## Legacy Functions (Still Present)

### Old Bitcoin Engine
**File**: `lib/calculations/bitcoin-performance.ts`

#### `generateBitcoinPerformanceTimeline()` ⚠️ LEGACY
Old Bitcoin algorithm - replaced by enhanced version.

#### `calculateBTCSalesForShortfall(shortfall, spotPrice, remainingBTC)`
Still used by comprehensive engine for BTC sales calculations.

### Bitcoin Scenarios
**File**: `lib/calculations/bitcoin.ts`

Various scenario-based calculations - mostly superseded by enhanced algorithm.

## Utility Functions

### Formatting
**File**: `lib/calculations/index.ts`

#### `formatCurrency(amount)`
Formats number as USD currency.

#### `formatPercent(decimal)`
Formats decimal as percentage.

#### `formatDate(dateString)`
Formats date string for display.

#### `formatMonthYear(dateString)`
Formats date as "Month Year".

## Component Function Map

### CalculatorForm Functions

#### `buildCalculatorInputs()`
Converts form state to `CalculatorInputs` object.

**Key Mappings**:
- `getSentimentPercentage()` → `initialCAGR`
- `bitcoinPerformanceModel === 'cycles'` → `useSeasonalFactors`
- Form fields → Structured input types

#### `fetchCurrentBitcoinPrice()`
Calls CoinGecko API for live Bitcoin price.

#### `generateSampleChartData()` ⚠️ FALLBACK ONLY
Creates sample chart data when real data unavailable.

### Chart Functions

#### `calculateYAxisMax()`
**File**: `components/AmortizationChart.tsx`

Calculates appropriate Y-axis maximum to keep base components visible.

#### `generateHalvingLines()`
Creates reference lines for Bitcoin halving dates on chart.

## Error Handling Patterns

### Common Error Scenarios
1. **Invalid inputs**: Caught by `validateAmortizationInputs()`
2. **API failures**: Bitcoin price fetch with fallback
3. **Calculation errors**: Try-catch in main calculation flow
4. **NaN propagation**: Safety checks in enhanced algorithm

### Error Recovery
- Bitcoin price: Falls back to default if API fails
- Invalid inputs: Shows validation errors in UI
- Calculation failures: Displays error message in results panel

## Performance Considerations

### Calculation Optimization
- **Loan term limiting**: Max 360 months for performance
- **Chart data limiting**: Max 240 months (20 years) for visualization
- **Safety bounds**: Prevents extreme Bitcoin price movements

### Memory Management
- Arrays are bounded by loan term length
- Chart data is subset of full calculation data
- Results are cleared when new calculation starts

## Development Utilities

### Debug Functions
- `getCycleInfo()` - Complete cycle debugging information
- Console logging in enhanced algorithm (can be enabled)
- Debug panel in main page (expandable)

### Testing Utilities
- Mock data generators in test files
- Validation test cases
- Edge case scenarios

---

*Function Reference Guide - Version 1.0*  
*Last Updated: July 6, 2025*
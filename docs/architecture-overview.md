# KD Bitcoin Real Estate Calculator - Architecture Overview

## Project Summary
Client-side only Bitcoin + Real Estate investment calculator with comprehensive amortization analysis. Built with Next.js 14, TypeScript, and enhanced Bitcoin seasonal performance modeling.

## Core Architecture

### Technology Stack
- **Framework**: Next.js 14 (static export)
- **Language**: TypeScript
- **UI**: React 18 + Tailwind CSS
- **Charts**: Recharts (stacked area charts)
- **Testing**: Jest + ts-jest
- **Deployment**: Static export to CPanel

### Primary Data Flow
```
User Input → Validation → Enhanced Bitcoin Algorithm → Comprehensive Amortization → Results Display
     ↓             ↓                    ↓                        ↓                    ↓
CalculatorForm → validateInputs → enhanced-bitcoin-performance → comprehensive-amortization → AmortizationResults + Chart
```

## File Structure Map

### `/app` - Next.js App Router
```
app/
├── layout.tsx          # Global layout and metadata
├── page.tsx            # Main calculator page (orchestrates data flow)
├── api/
│   ├── bitcoin-price/  # CoinGecko API integration
│   └── bitcoin-history/ # Historical price data (unused)
└── test/               # Test page for development
```

### `/components` - React UI Components
```
components/
├── CalculatorForm.tsx      # Input collection + chart display
├── AmortizationResults.tsx # Monthly amortization table display
└── AmortizationChart.tsx   # Stacked area chart visualization
```

### `/lib` - Core Business Logic

#### `/lib/types` - TypeScript Definitions
```
lib/types/
├── index.ts           # Central type exports
├── property.ts        # Input types (CalculatorInputs, BitcoinPerformanceSettings)
├── calculations.ts    # Output types (AmortizationResults, MonthlyAmortizationEntry)
└── api.ts            # API response types
```

#### `/lib/calculations` - Calculation Engines
```
lib/calculations/
├── index.ts                           # Central function exports
├── enhanced-bitcoin-performance.ts   # 🎯 PRIMARY: Seasonal Bitcoin algorithm
├── comprehensive-amortization.ts      # 🎯 PRIMARY: Complete amortization engine
├── halving-date-utils.ts             # Real Bitcoin halving date utilities
├── amortization.ts                   # Base amortization functions
├── mortgage.ts                       # Mortgage calculation utilities
├── bitcoin-performance.ts            # ⚠️ LEGACY: Old Bitcoin algorithm
├── bitcoin.ts                        # ⚠️ LEGACY: Scenario calculations
└── __tests__/                        # Unit tests
```

#### `/lib/utils` - Utility Functions
```
lib/utils/
└── halving-date-utils.ts  # Bitcoin cycle positioning utilities
```

#### `/lib/api` - External API Integration
```
lib/api/
├── index.ts           # API exports
└── bitcoin-price.ts   # CoinGecko price fetching
```

## Core Calculation Engines

### 1. Enhanced Bitcoin Performance Engine
**File**: `lib/calculations/enhanced-bitcoin-performance.ts`

**Purpose**: Season-based Bitcoin performance with real halving alignment

**Key Functions**:
- `generateEnhancedBitcoinPerformanceTimeline()` - Creates 48-month seasonal cycles
- `calculateEnhancedBitcoinValueAtMonth()` - Monthly Bitcoin value calculation
- `calculateCycleCAGR()` - Diminishing returns across cycles
- `getMonthlyPerformanceFactor()` - Smooth seasonal transitions

**Key Features**:
- Real halving dates (April 20, 2024 = last halving)
- 18/12/6/6 month seasonal cycles (Summer/Fall/Winter/Spring)
- Diminishing returns with `initialCAGR` → `finalCAGR`
- Smooth multiplicative factors (eliminates spikes)
- Exact loan term length compliance

### 2. Comprehensive Amortization Engine
**File**: `lib/calculations/comprehensive-amortization.ts`

**Purpose**: Combines debt paydown + Bitcoin performance + cash flow analysis

**Key Functions**:
- `generateComprehensiveAmortizationTable()` - Month-by-month schedule
- `generateStackedChartData()` - Chart data from schedule
- `generateAmortizationResults()` - Complete results package
- `analyzePayoffTrigger()` - Payoff trigger analysis

**Data Flow**:
```
Enhanced Bitcoin Timeline → Monthly Schedule → Chart Data → Final Results
```

### 3. Halving Date Utilities
**File**: `lib/utils/halving-date-utils.ts`

**Purpose**: Real-world Bitcoin cycle positioning

**Key Data**:
- `BITCOIN_HALVINGS` - Historical and projected halving dates
- Current: April 20, 2024 (actual)
- Next: April 2028 (projected)

**Key Functions**:
- `getLastHalvingDate()` - Most recent halving
- `getCyclePosition()` - 0-47 months since last halving
- `getCurrentSeason()` - Maps cycle position to Summer/Fall/Winter/Spring

## Data Flow Architecture

### Input Collection (CalculatorForm.tsx)
```typescript
User Inputs → buildCalculatorInputs() → CalculatorInputs
├── Property data (value, appreciation)
├── Mortgage data (balance, payment, rate)
├── Property income (rental, taxes, insurance)
├── Refinance scenario (cash-out amount, new terms)
├── Bitcoin investment (amount, current price)
├── Performance settings (initialCAGR, seasonal factors)
└── Payoff trigger (percentage or amount)
```

### Calculation Pipeline
```typescript
CalculatorInputs → validateAmortizationInputs() → Enhanced Algorithm → Results
├── Enhanced Bitcoin Timeline (seasonal cycles)
├── Base Amortization Schedule (debt paydown)
├── Comprehensive Monthly Schedule (combined)
├── Stacked Chart Data (visualization)
├── Payoff Analysis (trigger conditions)
└── Performance Summary (ROI, annualized return)
```

### Display Components
```typescript
AmortizationResults → Monthly table display
├── Data source: results.monthlySchedule
├── Columns: Month, Date, Debt, Bitcoin data, Cash flow
└── Scrollable format matching Google Sheets

AmortizationChart → Stacked area visualization
├── Data source: results.stackedChartData
├── Layers: Debt (red), Base Equity (green), Appreciation (light green), BTC Value (orange)
└── Features: Halving reference lines, responsive tooltips
```

## Key Timeline & Dates

### Current Timeline Foundation
- **Last Bitcoin Halving**: April 20, 2024
- **Today's Date**: Dynamic (new Date())
- **Loan Start (Month 1)**: First day of current month
- **Current Cycle Position**: Calculated dynamically from current date

### Seasonal Cycle Mapping
```
April 2024 (Halving) → Summer (18 months) → Oct 2025 (Fall) → Oct 2026 (Winter) → Apr 2027 (Spring) → Apr 2028 (Next Halving)
                           ↑ Current position calculated dynamically
```

## Component Integration Map

### Main Page (app/page.tsx)
```typescript
State Management:
├── amortizationResults: AmortizationResults | null
├── calculating: boolean
└── error: string | null

Data Flow:
handleCalculation(inputs) → generateAmortizationResults(inputs) → setAmortizationResults(results)

Component Props:
├── CalculatorForm: realChartData={amortizationResults?.stackedChartData}
└── AmortizationResults: results={amortizationResults}
```

### Calculator Form (components/CalculatorForm.tsx)
```typescript
State Management:
├── currentBitcoinPrice: number (from CoinGecko API)
├── Form fields: propertyValue, cashOutAmount, etc.
└── Auto-calculation triggers on input changes

Key Data Mapping:
├── getSentimentPercentage() → initialCAGR
├── bitcoinPerformanceModel === 'cycles' → useSeasonalFactors
├── currentBitcoinPrice → Bitcoin investment data
└── loanStartDate: new Date() (first day of current month)

Chart Integration:
AmortizationChart data={realChartData || generateSampleChartData()}
```

## Bitcoin Algorithm Details

### Enhanced Seasonal Algorithm
```typescript
Cycle Structure:
├── Total cycle: 48 months (4 years)
├── Summer: 18 months (65% growth allocation)
├── Fall: 12 months (bear market decline)
├── Winter: 6 months (consolidation)
└── Spring: 6 months (35% growth allocation)

Performance Calculation:
├── Smooth baseline: Math.pow(cycleCAGR, 1/12)
├── Seasonal multipliers: Summer 1.05x, Fall 0.98x, Winter 1.0x, Spring 1.02x
├── Diminishing returns: initialCAGR → finalCAGR across cycles
└── Safety bounds: Max 20% monthly drop protection
```

### Data Pollution Prevention
```typescript
✅ RESOLVED ISSUES:
├── Chart/Table mismatch: Chart now uses stackedChartData
├── Hardcoded dates: All dates now use July 6, 2025
├── UI mapping: customAnnualGrowthRate → initialCAGR
└── Live Bitcoin price: Properly integrated

⚠️ LEGACY CODE (Still present but unused):
├── bitcoin-performance.ts (old algorithm)
├── bitcoin.ts (scenario calculations)
└── generateSampleChartData() (fallback only)
```

## Testing Strategy

### Current Test Coverage
```
lib/calculations/__tests__/
├── basic-calculations.test.ts  # Core calculation validation
├── mortgage.test.ts           # Mortgage calculation tests
└── Jest configuration: jest.config.js
```

### Test Commands
```bash
npm test                # Run all tests
npm run test:watch     # Watch mode
npm run test:coverage  # Coverage report
```

## Deployment Architecture

### Build Process
```bash
npm run build    # Next.js static export
npm run export   # Generates /out directory
```

### Deployment Target
- **Platform**: CPanel static hosting
- **Output**: `/out` directory (static files)
- **CI/CD**: GitHub Actions workflow available

## Development Protocols

### When Making Changes
1. **Architecture-first approach**: Map data flow before coding
2. **Search for competing implementations**: `grep -r "ComponentName" --include="*.tsx"`
3. **Verify single source of truth**: Check all calculation engines
4. **Test integration**: Ensure chart and table use same data
5. **Follow restart requirements**: Calculation changes need server restart

### Debug Commands
```bash
# Find all Bitcoin-related code
grep -r "bitcoin\|Bitcoin\|BTC" --include="*.ts" --include="*.tsx"

# Find component usage
grep -r "ComponentName" --include="*.tsx"

# Map data flow
grep -n "generateAmortizationResults\|stackedChartData\|monthlySchedule"
```

## Future Enhancement Areas

### Immediate Priorities
1. **Smooth seasonal transitions**: Verify enhanced algorithm produces smooth curves
2. **Payoff trigger execution**: Implement actual loan payoff when triggered
3. **UI controls**: Add controls for new Bitcoin performance settings (Task 2.11)

### Phase 2 Enhancements
1. **Purchase mode**: Alternative to refinancing analysis
2. **PDF export**: Professional reports generation
3. **Advanced metrics**: Additional financial analysis tools
4. **Historical backtesting**: Validate algorithm against real Bitcoin data

---

*Architecture Overview - Version 1.0*  
*Last Updated: July 6, 2025*  
*Primary Calculation Engine: Enhanced Bitcoin Performance with Seasonal Cycles*
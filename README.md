# Bitcoin Real Estate Calculator

A comprehensive Bitcoin + Real Estate investment calculator with enhanced seasonal performance modeling and real-time price integration.

## Quick Start

### For Developers
```bash
npm install
npm run dev
```

### For AI Development Models 🤖

**⚠️ MANDATORY FIRST STEP**: Read the architecture documentation to understand the complete system before making any changes.

**Start Here**: [Architecture Overview](./docs/architecture-overview.md)

## Documentation Hierarchy (REQUIRED READING)

### 1. Business Requirements (PRD)
- **[Product Requirements Document](./docs/prd-real-property-calculator-revised.md)** - Business scope and user stories
- **[Task List](./docs/tasks-prd-real-property-calculator-revised.md)** - Implementation tasks with completion status

### 2. Technical Architecture (ESSENTIAL)
- **[Architecture Overview](./docs/architecture-overview.md)** - Complete system understanding (READ FIRST)
- **[Function Reference](./docs/function-reference.md)** - All calculation functions and APIs  
- **[Data Flow Map](./docs/data-flow-map.md)** - Complete data pipeline from input to visualization

### 3. Development Process (MDC Workflow)
- `create-prd.mdc` - PRD generation process
- `generate-tasks.mdc` - Task breakdown methodology  
- `process-task-list.mdc` - Development workflow protocols

## Current Implementation Status

This application has evolved **beyond the original MVP scope** and includes:

✅ **Enhanced Bitcoin Algorithm**: Seasonal performance with real halving alignment  
✅ **Comprehensive Amortization**: Complete cash flow and payoff analysis  
✅ **Real-time Integration**: Live Bitcoin pricing via CoinGecko API  
✅ **Advanced Visualization**: Stacked area charts with Recharts  
✅ **TypeScript Architecture**: Complete type safety and validation  

## Technology Stack

- **Framework**: Next.js 14 (App Router, Static Export)
- **Language**: TypeScript  
- **UI**: React 18 + Tailwind CSS
- **Charts**: Recharts (stacked area visualization)
- **Testing**: Jest + ts-jest
- **Deployment**: Static export to CPanel

## Key Features

### Bitcoin Performance Engine
- **Real Halving Alignment**: Based on April 20, 2024 halving
- **Seasonal Cycles**: 18/12/6/6 month Summer/Fall/Winter/Spring patterns
- **Diminishing Returns**: Optional CAGR progression across cycles
- **Smooth Price Action**: Eliminates spikes through multiplicative factors

### Comprehensive Analysis
- **Complete Amortization**: Month-by-month debt + Bitcoin + cash flow
- **Payoff Triggers**: Configurable loan payoff conditions
- **Risk Assessment**: Multiple scenario modeling
- **Export Ready**: Professional-grade calculations

### User Experience
- **Live Bitcoin Price**: Real-time CoinGecko integration
- **Instant Calculations**: Auto-updating results on input changes
- **Mobile Responsive**: Works on all devices
- **Data Privacy**: Client-side only, no data transmission

## Development Protocols for AI Models

### PERMANENT DEVELOPER PROTOCOLS

#### When User Says "Think Hard"
= STOP LINEAR THINKING IMMEDIATELY
- Map ENTIRE system architecture first
- Trace ALL data sources and flows  
- Find competing/parallel implementations
- Never assume - always verify programmatically

#### Universal Project Start (Complex Issues)
BEFORE ANY CHANGES:
1. Search entire codebase for all related components
2. Read architecture documentation files
3. Map complete data pipeline (input → processing → output)
4. Identify all data sources and potential conflicts
5. Document findings before coding

#### Debugging Protocol
When encountering data mismatches:
1. Search for ALL instances: `grep -r "ComponentName\|DataType" --include="*.tsx"`
2. Map ALL code paths that create/modify that data
3. Verify single source of truth exists  
4. Check for competing implementations

**RULE**: Complex debugging starts with architecture mapping, not code changes.

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── page.tsx           # Main calculator (orchestrates data flow)
│   ├── layout.tsx         # Global layout
│   └── api/               # API routes (Bitcoin price)
├── components/            # React UI Components  
│   ├── CalculatorForm.tsx     # Input collection + chart
│   ├── AmortizationResults.tsx # Monthly table display
│   └── AmortizationChart.tsx   # Stacked area visualization
├── lib/                   # Core Business Logic
│   ├── calculations/          # Calculation engines
│   │   ├── enhanced-bitcoin-performance.ts  # 🎯 PRIMARY: Seasonal algorithm
│   │   ├── comprehensive-amortization.ts    # 🎯 PRIMARY: Complete engine
│   │   ├── halving-date-utils.ts           # Real halving utilities
│   │   └── ...
│   ├── types/                # TypeScript definitions
│   ├── utils/                # Utility functions
│   └── api/                  # External API integration
├── docs/                  # Documentation
│   ├── architecture-overview.md    # System architecture
│   ├── function-reference.md       # Function documentation
│   ├── data-flow-map.md           # Data pipeline mapping
│   ├── prd-real-property-calculator-revised.md  # Business requirements
│   └── tasks-prd-real-property-calculator-revised.md  # Implementation tasks
└── *.mdc                  # MDC workflow files
```

## Getting Started for Development

### Prerequisites
```bash
npm install
```

### Development Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run test         # Run test suite
npm run lint         # Lint code
```

### For AI Models Working on This Codebase

1. **Read Architecture First**: Start with `docs/architecture-overview.md`
2. **Understand Data Flow**: Review `docs/data-flow-map.md`  
3. **Check Function Reference**: Use `docs/function-reference.md` for API details
4. **Follow Protocols**: Apply permanent developer protocols for all changes
5. **Verify Integration**: Ensure chart and table use same data sources

### Key Dates & Timeline
- **Last Bitcoin Halving**: April 20, 2024
- **Current Date**: Dynamic (new Date())
- **Loan Start**: First day of current month (Month 1)
- **Cycle Position**: Calculated dynamically from current date

## Contributing

This project follows a structured MDC workflow for feature development:

1. **PRD Creation**: Use `create-prd.mdc` for new features
2. **Task Generation**: Use `generate-tasks.mdc` to break down PRDs  
3. **Implementation**: Use `process-task-list.mdc` for systematic development
4. **Architecture Review**: Always consult technical documentation before changes

## License

Private project for KrigerDanes Bitcoin Real Estate Calculator.

---

**For AI Models**: This project requires architecture-first development. Always read the technical documentation before making changes to prevent data flow issues and maintain system integrity.
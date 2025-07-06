# AI Quick Start Guide

## ⚠️ MANDATORY READING FOR ALL AI MODELS

This guide ensures AI models working on this codebase understand the complete system before making changes.

## Start Here Checklist

### Step 1: Architecture Understanding (REQUIRED)
- [ ] Read: [Architecture Overview](./architecture-overview.md) 
- [ ] Understand: Primary vs Legacy code identification
- [ ] Note: Enhanced Bitcoin algorithm is the current system

### Step 2: Business Context (REQUIRED)
- [ ] Read: [Product Requirements Document](./prd-real-property-calculator-revised.md)
- [ ] Review: [Task List Status](./tasks-prd-real-property-calculator-revised.md)
- [ ] Understand: Current implementation exceeds original MVP scope

### Step 3: Technical Details (WHEN NEEDED)
- [ ] Reference: [Function Reference](./function-reference.md) for specific APIs
- [ ] Trace: [Data Flow Map](./data-flow-map.md) for debugging data issues
- [ ] Follow: Development protocols for complex changes

## Critical Understanding Points

### Data Flow Architecture
```
User Input (CalculatorForm) → Enhanced Bitcoin Algorithm → Comprehensive Amortization → Results Display
     ↓                              ↓                          ↓                         ↓
Form validation               Seasonal performance        Monthly schedule         Chart + Table
```

### Key Files to Know
```
🎯 PRIMARY CALCULATION ENGINES:
├── enhanced-bitcoin-performance.ts  # Seasonal Bitcoin algorithm
├── comprehensive-amortization.ts    # Complete amortization engine
├── halving-date-utils.ts           # Real halving cycle utilities

🎯 PRIMARY UI COMPONENTS:
├── app/page.tsx                    # Main orchestrator
├── CalculatorForm.tsx              # Input + chart
├── AmortizationResults.tsx         # Table display
├── AmortizationChart.tsx           # Visualization

⚠️ LEGACY (Don't use):
├── bitcoin-performance.ts          # Old algorithm
├── bitcoin.ts                      # Old scenarios
├── generateSampleChartData()       # Fallback only
```

### Critical Data Sources
- **Chart Data**: `amortizationResults.stackedChartData` (from monthly schedule)
- **Table Data**: `amortizationResults.monthlySchedule` (from enhanced algorithm)
- **Bitcoin Price**: Live from CoinGecko API
- **Timeline**: First day of current month = Month 1 of loan

## Common Pitfalls to Avoid

### ❌ DO NOT:
1. **Use legacy calculations** - `bitcoin-performance.ts`, `bitcoin.ts`
2. **Assume chart/table use different data** - They use the same source
3. **Make changes without architecture review** - Always map data flow first
4. **Use hardcoded dates/prices** - Everything should be dynamic
5. **Create competing implementations** - Enhance existing systems

### ✅ DO:
1. **Start with architecture understanding** - Read docs first
2. **Follow data flow map** - Trace complete pipeline
3. **Search for existing implementations** - `grep -r "ComponentName"`
4. **Verify single source of truth** - Check for data pollution
5. **Apply permanent developer protocols** - Architecture-first approach

## Emergency Debugging Protocol

### When Data Doesn't Match Between Components:
1. **Map the data flow**: Trace from input to output
2. **Search for competing sources**: `grep -r "DataType" --include="*.tsx"`
3. **Verify single calculation engine**: Check for multiple algorithms
4. **Check for fallback data**: Look for sample/mock data generation
5. **Test the pipeline**: Ensure same data flows to all components

### When User Says "Think Hard":
1. **STOP linear thinking immediately**
2. **Map ENTIRE system architecture**
3. **Search for ALL related implementations**
4. **Document findings before coding**
5. **Verify understanding with user**

## Development Workflow

### For Small Changes:
1. Read architecture overview
2. Make targeted changes
3. Test integration

### For Complex Features:
1. Read all documentation
2. Map complete data flow
3. Follow MDC workflow (PRD → Tasks → Implementation)
4. Apply permanent developer protocols

### For Debugging:
1. Start with data flow map
2. Search entire codebase for related code
3. Identify competing implementations
4. Fix at architecture level, not symptom level

## Quick Reference

### Current System Status (July 2025)
- **Enhanced Bitcoin Algorithm**: ✅ Active (seasonal cycles, smooth curves)
- **Comprehensive Amortization**: ✅ Active (complete cash flow analysis)
- **Real-time Bitcoin Price**: ✅ Active (CoinGecko integration)
- **Advanced Charts**: ✅ Active (Recharts stacked areas)
- **Legacy Algorithms**: ⚠️ Present but unused

### Key Timeline Data
- **Last Halving**: April 20, 2024
- **Today**: Dynamic (new Date())
- **Loan Start**: First day of current month (Month 1)
- **Cycle Position**: Calculated dynamically from current date

### Command Reference
```bash
# Development
npm run dev          # Start dev server
npm test            # Run tests  
npm run build       # Build production

# Debugging  
grep -r "ComponentName" --include="*.tsx"  # Find component usage
grep -r "bitcoin\|Bitcoin" --include="*.ts" # Find Bitcoin code
```

## Success Metrics

You're ready to work on this codebase when you can:
- [ ] Explain the complete data flow from input to visualization
- [ ] Identify primary vs legacy calculation engines
- [ ] Understand the enhanced Bitcoin seasonal algorithm
- [ ] Know why chart and table data should always match
- [ ] Apply architecture-first debugging protocols

---

**Remember**: This codebase requires architecture-first development. Always understand the complete system before making changes.
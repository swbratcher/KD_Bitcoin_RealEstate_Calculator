# Tasks for Real Property Calculator (REVISED)

Based on PRD: `prd-real-property-calculator-revised.md`

  Legend:
  - [X] = Completed tasks should be determined if a coresponding TDD test is warranted. 
  - [ ] = Incomplete tasks still needed should be reviewed to make sure scope fits the application as implemented
  - [?] = Tasks that may be out of scope need to be revisited in a systematic way to ensure that they are adapted or appropriately abandoned and removed.
  - [*] = Tasks implemented beyond original scope and just needs to become part of the scope for documentation generation.

## Phase Overview

**Phase 1 (MVP)**: Answer "When could Bitcoin pay off my refinanced loan?" - 2-3 weeks
**Phase 2 (Enhancement)**: Professional refinance analysis tool with advanced features - 2-3 weeks

## Architecture Documentation (REQUIRED READING)

**⚠️ IMPORTANT**: Before working on any tasks, AI models must read the architecture documentation to prevent data flow issues and understand the current system state.

### Technical Reference Documents
- **[Architecture Overview](./architecture-overview.md)** - Complete system understanding (READ FIRST)
- **[Function Reference](./function-reference.md)** - All calculation functions and APIs
- **[Data Flow Map](./data-flow-map.md)** - Complete data pipeline tracing

### Current Implementation Status
The application has evolved significantly beyond the original MVP scope. Current architecture includes:
- Enhanced Bitcoin seasonal performance algorithm (replaces simple scenarios)
- Comprehensive amortization engine (beyond basic calculations)
- Real-time Bitcoin price integration via CoinGecko API
- Advanced visualization with Recharts stacked area charts

## Relevant Files (Current Implementation)

### Core Application
- `next.config.js` - Next.js static export configuration
- `package.json` - Essential dependencies (Next.js, TypeScript, Tailwind, Recharts)
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.js` - KrigerDanes branding colors
- `app/page.tsx` - Main calculator page (App Router)
- `app/layout.tsx` - Global layout with branding

### Phase 1 Components  
- `components/RefinanceInput.tsx` - Essential refinance inputs (4 fields)
- `components/ResultsPanel.tsx` - Key metrics and payoff timeline display
- `components/ScenarioButtons.tsx` - Bitcoin performance scenario selector
- `lib/calculations/refinance.ts` - Essential refinance calculation functions
- `lib/api/bitcoin.ts` - Bitcoin price fetching with fallback
- `lib/types/calculator.ts` - TypeScript definitions
- `lib/utils/formatters.ts` - Currency and date formatting

### Phase 2 Components (Later)
- `components/AdvancedMetrics.tsx` - Detailed financial analysis
- `components/AmortizationTable.tsx` - Month-by-month projections  
- `components/Chart.tsx` - Interactive visualizations
- `components/ExportPanel.tsx` - Download functionality
- `components/PurchaseMode.tsx` - Alternative purchase scenario mode

### Styling & Assets
- `styles/globals.css` - Base styles and KrigerDanes branding
- `public/favicon.ico` - KrigerDanes favicon
- `public/logo.png` - Logo asset (harvested from main site)

### Notes
- **MVP First**: Focus on refinance scenario, add purchase mode in Phase 2
- **Testing**: Add `.test.tsx` files as features are built
- **API Fallback**: Bitcoin price with hardcoded fallback if API fails
- **Mobile First**: All components designed for mobile refinance analysis

## PHASE 1: MVP Tasks (Core Value Delivery)

### 1.0 Foundation Setup
- [X] 1.1 Initialize Next.js project with TypeScript and static export
- [X] 1.2 Configure Tailwind CSS with KrigerDanes color scheme
- [X] 1.3 Set up basic project structure (components, lib, styles)
- [X] 1.4 Create base layout with KrigerDanes branding elements
- [X] 1.5 Configure TypeScript definitions for refinance calculator data types

### 2.0 Core Calculation Engine (MVP - Refinance Focus)
- [X] 2.1 Implement refinance analysis calculations (new loan vs Bitcoin investment)
- [X] 2.2 Build equity calculation (current value vs existing mortgage)
- [X] 2.3 Create Bitcoin payoff timeline (when Bitcoin value equals remaining new loan)
- [*] 2.4 Implement advanced Bitcoin performance scenarios with cycles/flat models (beyond 3 preset scenarios)
- [*] 2.5 Build comprehensive risk assessment with BTC crashout status (beyond simple good/warning/poor)
- [X] 2.6 Add comprehensive unit tests for all refinance calculations
- [X] 2.7 Create halving date utilities for real-world cycle alignment
- [X] 2.8 Implement enhanced Bitcoin algorithm with season-based cycles
- [X] 2.9 Add diminishing returns support with dual CAGR inputs
- [X] 2.10 Integrate enhanced algorithm with existing comprehensive amortization
- [ ] 2.11 Update UI controls for new Bitcoin performance settings

### 3.0 User Interface (MVP - Refinance Focus)
- [*] 3.1 Build comprehensive input form (far beyond 4 fields - includes property income, expenses, etc.)
- [X] 3.2 Create refinance smart defaults (realistic equity tap example)
- [X] 3.3 Implement results panel with refinance metrics (new loan payoff date, monthly BTC sold)
- [*] 3.4 Build advanced performance settings with sentiment controls (beyond simple scenario buttons)
- [X] 3.5 Add input validation and error handling for refinance inputs
- [X] 3.6 Ensure mobile-responsive design optimized for refinance analysis

### 4.0 Bitcoin Integration (MVP)
- [X] 4.1 Implement CoinGecko API integration for real-time Bitcoin price
- [X] 4.2 Build fallback system for API failures (hardcoded price/manual entry)
- [X] 4.3 Add Bitcoin price display in refinance results
- [?] 4.4 Implement price caching to minimize API calls - SKIPPED: No caching for privacy/simplicity
- [ ] 4.5 Test API integration with error scenarios - RELEVANT: CoinGecko API is used

### 5.0 MVP Polish & Deployment
- [X] 5.1 Apply KrigerDanes styling and branding throughout
- [ ] 5.2 Optimize mobile user experience for refinance analysis - ON HOLD: Other UI/UX enhancements prioritized
- [X] 5.3 Add loading states and smooth transitions
- [X] 5.4 Configure build process for CPanel deployment
- [ ] 5.5 Conduct full MVP testing across devices and browsers (refinance focus)
- [X] 5.6 Deploy MVP to staging environment for review
- [ ] 5.7 Set up GitHub Actions auto-deployment (guide created in docs/)

## PHASE 2: Enhanced Features (After MVP Success)

### 6.0 Advanced Calculations
- [*] 6.1 Add comprehensive financial metrics (Cap Rate, ROE, Debt Coverage Ratio) - implemented in comprehensive calculations
- [?] 6.2 Implement multiple property valuation sources
- [*] 6.3 Build detailed expense category handling - implemented with property income/expense fields
- [*] 6.4 Create advanced Bitcoin modeling with custom scenarios - implemented with cycles/flat models and custom sentiment
- [?] 6.5 Add purchase mode as alternative to refinance analysis

### 7.0 Advanced Visualizations  
- [*] 7.1 Implement interactive stacked area chart (BTC + Real Estate over time) - implemented with AmortizationChart
- [*] 7.2 Build sortable/filterable amortization table display - implemented in AmortizationResults component
- [?] 7.3 Add chart zoom/pan controls and multiple view options
- [?] 7.4 Create timeline visualization for payoff scenarios

### 8.0 Export & Professional Features
- [?] 8.1 Build PDF export functionality for refinance analysis
- [?] 8.2 Add chart download capabilities
- [?] 8.3 Create print-optimized layouts
- [?] 8.4 Implement mode switching (refinance vs purchase analysis)
- [?] 8.5 Add comprehensive help/documentation system

## Success Criteria

### Phase 1 (MVP) Complete When:
✅ User can get refinance payoff timeline within 60 seconds of page load  
✅ Refinance calculator works perfectly on mobile devices  
✅ Bitcoin price integration functions with fallback  
✅ 3 scenario buttons provide instant different refinance results  
✅ Smart defaults show realistic equity tap example  
✅ KrigerDanes branding properly applied  

### Phase 2 (Enhancement) Complete When:
✅ Professional-grade refinance metrics displayed  
✅ Interactive charts provide additional insights  
✅ Export functionality produces usable refinance reports  
✅ Purchase mode provides alternative analysis  
✅ User experience rivals sophisticated financial tools  

## Risk Mitigation Built In

- **Scope Control**: MVP refinance focus must work before Phase 2 enhancements
- **API Dependencies**: Fallback systems for all external services  
- **Technical Complexity**: Start with refinance, add purchase mode later
- **Mobile First**: Every feature designed for mobile refinance analysis
- **User Testing**: Validate refinance MVP with real users before enhancement

This revised approach focuses on the primary refinance/HELOC use case while maintaining the path to comprehensive analysis tools. 
# Tasks for Real Property Calculator

Based on PRD: `prd-real-property-calculator.md`

## Relevant Files

- `next.config.js` - Next.js configuration for static export and CPanel deployment
- `package.json` - Project dependencies including React, TypeScript, chart libraries
- `tailwind.config.js` - Tailwind CSS configuration with KrigerDanes branding colors
- `tsconfig.json` - TypeScript configuration for type-safe development
- `pages/index.tsx` - Main calculator page component
- `pages/_app.tsx` - Global app wrapper with branding and styles
- `components/PropertyInput/PropertyInput.tsx` - Property details input form component
- `components/PropertyInput/PropertyInput.test.tsx` - Unit tests for property input
- `components/FinancialMetrics/FinancialMetrics.tsx` - Financial calculations display component
- `components/FinancialMetrics/FinancialMetrics.test.tsx` - Unit tests for financial metrics
- `components/BitcoinPanel/BitcoinPanel.tsx` - Bitcoin integration and controls component
- `components/BitcoinPanel/BitcoinPanel.test.tsx` - Unit tests for Bitcoin panel
- `components/AmortizationTable/AmortizationTable.tsx` - Amortization schedule display
- `components/AmortizationTable/AmortizationTable.test.tsx` - Unit tests for amortization table
- `components/Chart/BTCRealEstateChart.tsx` - Stacked area chart visualization component
- `components/Chart/BTCRealEstateChart.test.tsx` - Unit tests for chart component
- `lib/calculations/propertyAnalysis.ts` - Core property calculation functions
- `lib/calculations/propertyAnalysis.test.ts` - Unit tests for property calculations
- `lib/calculations/bitcoinModeling.ts` - Bitcoin projection and performance calculations
- `lib/calculations/bitcoinModeling.test.ts` - Unit tests for Bitcoin calculations
- `lib/calculations/amortization.ts` - Loan amortization and payoff calculations
- `lib/calculations/amortization.test.ts` - Unit tests for amortization calculations
- `lib/api/bitcoinPrice.ts` - Bitcoin price fetching and caching service
- `lib/api/bitcoinPrice.test.ts` - Unit tests for Bitcoin API service
- `lib/api/zestRent.ts` - ZestRent rental estimate integration (if available)
- `lib/api/zestRent.test.ts` - Unit tests for ZestRent integration
- `lib/types/calculator.ts` - TypeScript type definitions for all data structures
- `lib/utils/formatters.ts` - Currency, percentage, and date formatting utilities
- `lib/utils/formatters.test.ts` - Unit tests for formatting utilities
- `lib/utils/validators.ts` - Input validation and sanitization functions
- `lib/utils/validators.test.ts` - Unit tests for validators
- `lib/utils/exportHelpers.ts` - Export functionality for results and charts
- `lib/utils/exportHelpers.test.ts` - Unit tests for export helpers
- `styles/globals.css` - Global styles and KrigerDanes branding
- `styles/components.css` - Component-specific styling
- `public/favicon.ico` - KrigerDanes favicon
- `public/logo.png` - KrigerDanes logo asset

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `PropertyInput.tsx` and `PropertyInput.test.tsx` in the same directory).
- Use `npm test` to run all tests. Use `npm test [filename]` to run specific test files.
- Chart library will be determined during implementation (Chart.js, Recharts, or similar).
- Bitcoin API will be selected based on reliability and rate limits (CoinGecko, CoinMarketCap).

## Tasks

- [ ] 1.0 Project Foundation & Setup
  - [ ] 1.1 Initialize Next.js project with TypeScript and configure for static export
  - [ ] 1.2 Set up Tailwind CSS with KrigerDanes branding colors and typography
  - [ ] 1.3 Configure project structure with components, lib, and styles directories
  - [ ] 1.4 Install and configure testing framework (Jest + React Testing Library)
  - [ ] 1.5 Set up type definitions and global TypeScript configurations
  - [ ] 1.6 Create base layout components with KrigerDanes branding elements
  - [ ] 1.7 Configure build process for CPanel deployment optimization

- [ ] 2.0 Core Calculation Engine Development
  - [ ] 2.1 Implement property analysis calculations (cash flow, expenses, income)
  - [ ] 2.2 Build financial metrics calculators (CapRate, DebtCovRatio, LoanToValue, ROE)
  - [ ] 2.3 Create multiple valuation handling (Wholesale, Bank Appraisal, Zillow)
  - [ ] 2.4 Develop Bitcoin investment calculations (BTC bought, coupled amount, monthly sold)
  - [ ] 2.5 Implement amortization modeling with Bitcoin performance overlay
  - [ ] 2.6 Build payoff trigger calculation logic with date intersection analysis
  - [ ] 2.7 Create frontend cash and upfront cost calculation functions
  - [ ] 2.8 Implement risk assessment logic (BTC Crashout status indicators)
  - [ ] 2.9 Build scenario comparison engine for multiple Bitcoin performance models
  - [ ] 2.10 Develop tax assessed vs purchase price distinction handling
  - [ ] 2.11 Create comprehensive unit tests for all calculation functions

- [ ] 3.0 User Interface & Data Input System
  - [ ] 3.1 Build property details input form (address, units, bedrooms, bathrooms, sqft)
  - [ ] 3.2 Create financial inputs section (purchase price, mortgage, interest, terms)
  - [ ] 3.3 Implement expense category inputs (insurance, taxes, ExpSave, management, finance)
  - [ ] 3.4 Build income source controls (manual rent entry vs ZestRent estimates)
  - [ ] 3.5 Create validation system with real-time feedback for all inputs
  - [ ] 3.6 Implement smart defaults system for quick calculation setup
  - [ ] 3.7 Build flexible entry mode (detailed vs simplified input options)
  - [ ] 3.8 Create purchase scenario controls (Purchase Max vs Actual Purchase)
  - [ ] 3.9 Implement responsive dashboard layout with organized data panels
  - [ ] 3.10 Build tabular data display components for financial metrics
  - [ ] 3.11 Create color-coded section headers and visual hierarchy
  - [ ] 3.12 Add status indicators and progress feedback for calculations

- [ ] 4.0 Bitcoin Integration & API Services
  - [ ] 4.1 Implement Bitcoin price API integration with error handling and fallbacks
  - [ ] 4.2 Build Bitcoin sentiment control system (Maxi, Bullish, Mild Bull, Bearish presets)
  - [ ] 4.3 Create custom percentage input system for user-defined performance scenarios
  - [ ] 4.4 Implement BTC Activity percentage settings with 30% default
  - [ ] 4.5 Build bear market scenario modeling (-25% to +50% range)
  - [ ] 4.6 Create Bitcoin projection engine with multiple performance models
  - [ ] 4.7 Implement price caching system to respect API rate limits
  - [ ] 4.8 Build ZestRent API integration for automated rental estimates (if available)
  - [ ] 4.9 Create Bitcoin metrics display (BTC bought, coupled, monthly sold, remaining)
  - [ ] 4.10 Implement real-time price display with spot price tracking
  - [ ] 4.11 Build comprehensive error handling for all API integrations

- [ ] 5.0 Visualization & Export Features
  - [ ] 5.1 Implement "BTC Alongside Real Estate" stacked area chart component
  - [ ] 5.2 Build interactive amortization table with month-by-month projections
  - [ ] 5.3 Create chart data layers (BTC value, appreciation, base equity, debt)
  - [ ] 5.4 Implement timeline configuration (2025-2045 default range)
  - [ ] 5.5 Build payoff analysis display with trigger percentage controls
  - [ ] 5.6 Create risk indicator visualizations and status displays
  - [ ] 5.7 Implement total asset tracking visualization over time
  - [ ] 5.8 Build comprehensive metrics dashboard (property + Bitcoin + performance)
  - [ ] 5.9 Create export functionality for calculation results and charts
  - [ ] 5.10 Implement chart download and data export capabilities
  - [ ] 5.11 Build print-friendly layout and screenshot functionality
  - [ ] 5.12 Add interactive chart controls and zoom/pan capabilities 
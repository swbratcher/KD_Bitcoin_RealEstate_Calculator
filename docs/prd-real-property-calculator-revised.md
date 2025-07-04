# Product Requirements Document: Real Property Calculator (REVISED)

## Introduction/Overview

The Real Property Calculator is a focused single-page web application that enables users to model when Bitcoin holdings could potentially pay off remaining mortgage debt on a property investment. The tool provides clear, immediate analysis while maintaining complete user anonymity.

**Core Value Proposition**: Answer the question "When could my Bitcoin pay off my property mortgage?" with minimal input and maximum clarity.

## Primary User Journey

### **Core Question**: "When could my Bitcoin pay off my refinanced loan?"

#### **Primary Scenario (Refinance/HELOC Strategy)**
1. **Land on Calculator** → See working example of refinance scenario with realistic equity tap
2. **Modify Key Values** → Current property value, existing mortgage, cash-out amount, Bitcoin scenario
3. **Instant Results** → See when Bitcoin pays off new loan, monthly requirements, risk assessment
4. **Scenario Comparison** → Try different Bitcoin performance levels (Conservative/Optimistic/Aggressive)
5. **Export/Share** → Download analysis for lender or advisor (Phase 2)

#### **Secondary Scenario (New Purchase)**
- Alternative input mode for property purchase analysis
- Same core calculations but different input flow

## Goals (Prioritized)

### MVP Goals (Phase 1)
1. **Immediate Clarity**: Show refinance payoff timeline within 30 seconds of page load
2. **Simple Input**: Require only 4 essential refinance values with smart defaults
3. **Clear Results**: Display key answer (when Bitcoin pays off new loan) prominently
4. **Mobile Ready**: Work perfectly on all devices for refinance analysis

### Enhanced Goals (Phase 2)  
5. **Advanced Modeling**: Multiple Bitcoin performance scenarios with custom percentages
6. **Detailed Analysis**: Comprehensive financial metrics and amortization tables
7. **Professional Export**: Downloadable reports for lenders/advisors
8. **Dual Mode**: Both refinance and purchase analysis options

## User Stories (MVP Focus)

**Primary User Story**: As a homeowner with equity, I want to quickly see if/when Bitcoin bought with cash-out refinance proceeds could pay off my new loan with minimal data entry.

**Secondary Stories**:
- As a property owner, I want to model tapping my equity for Bitcoin investment
- As an investor, I want to compare different Bitcoin optimism levels against my refinance
- As someone considering a HELOC, I want to see Bitcoin payoff scenarios vs traditional equity use

## Functional Requirements

### Phase 1: Core MVP (Must Have)

#### Essential Calculations (8 requirements)
1. **Refinance Analysis**: New loan payment vs Bitcoin investment from cash-out
2. **Equity Calculation**: Available equity based on current value vs existing mortgage
3. **Bitcoin Payoff Timeline**: When Bitcoin value equals remaining new loan balance
4. **Performance Scenarios**: 3 preset Bitcoin scenarios (Conservative, Optimistic, Aggressive)
5. **Cash-Out Modeling**: Amount to tap for Bitcoin vs new loan terms
6. **Risk Assessment**: Simple good/warning/poor for refinance scenario
7. **Monthly Requirements**: How much Bitcoin to sell monthly to cover shortfall
8. **Real-time Bitcoin Price**: Current BTC price for all calculations

#### Essential User Interface (6 requirements)
9. **Refinance Smart Defaults**: Pre-populated realistic refinance example
10. **Essential Inputs Only**: Current property value, existing mortgage, cash-out amount, Bitcoin scenario
11. **Instant Feedback**: Results update as user modifies refinance parameters
12. **Clear Results Panel**: Prominent display of "When Bitcoin pays off new loan"
13. **Scenario Buttons**: Easy switching between Bitcoin performance assumptions
14. **Mobile-First Design**: Optimized for mobile refinance analysis

### Phase 2: Enhanced Features (Nice to Have)

#### Advanced Analysis (8 requirements)
15. **Detailed Financial Metrics**: Cap rate, ROE, debt coverage ratio
16. **Multiple Property Valuations**: Wholesale, appraisal, Zillow estimates  
17. **Comprehensive Expenses**: Insurance, taxes, management, maintenance
18. **Advanced Bitcoin Modeling**: Custom percentages, bear market scenarios
19. **Amortization Tables**: Month-by-month projections
20. **Multiple Purchase Scenarios**: Different acquisition strategies
21. **Income Options**: Rental income vs. primary residence scenarios
22. **Tax Assessment Integration**: Separate tax valuation handling

#### Advanced Visualization (6 requirements)
23. **Stacked Area Chart**: Visual timeline of assets vs. debt
24. **Interactive Tables**: Sortable, filterable amortization data
25. **Multiple Chart Views**: Different visualization perspectives
26. **Zoom/Pan Controls**: Detailed timeline exploration
27. **Export Functionality**: PDF reports and chart downloads
28. **Print Optimization**: Clean printable layouts

## Revised Technical Approach

### MVP Technical Stack
- **Next.js**: Static export for simple deployment
- **TypeScript**: Type safety for calculations
- **Tailwind CSS**: Rapid styling with KrigerDanes colors
- **CoinGecko API**: Free Bitcoin price (with fallback to hardcoded price)
- **Client-side Only**: No server, no database, no user tracking

### Enhanced Features (Phase 2)
- **Chart.js**: Interactive visualizations
- **jsPDF**: Export functionality  
- **Advanced API Integration**: Multiple price sources, rental estimates
- **Progressive Web App**: Offline capability

## Success Metrics (Simplified)

### MVP Success
1. **Time to Answer**: User gets payoff timeline within 60 seconds
2. **Mobile Usage**: 80%+ of calculations complete successfully on mobile
3. **User Retention**: 40%+ try multiple scenarios in one session

### Enhanced Success
4. **Export Usage**: 20%+ download results
5. **Return Visits**: Users bookmark and return for updates

## Risk Mitigation

### Technical Risks
- **Bitcoin API Failure**: Fallback to last known price or manual entry
- **Calculation Complexity**: Start simple, add sophistication in Phase 2
- **Mobile Performance**: Optimize for mobile-first experience

### Scope Risks  
- **Feature Creep**: Strict MVP discipline - only add Phase 2 after MVP works
- **Over-Engineering**: Simple solutions first, optimize later
- **Complex Formulas**: Start with approximations, refine based on user feedback

## Open Questions (Reduced)

### Critical for MVP
1. **Smart Defaults**: What example property scenario should be pre-loaded?
2. **Core Formula**: Exact payoff trigger calculation methodology?
3. **Bitcoin Scenarios**: What are the 3 preset performance assumptions?

### Important for Phase 2
4. **Chart Preferences**: Which visualization library best fits KrigerDanes aesthetic?
5. **Export Format**: PDF, Excel, or image exports preferred?
6. **Advanced Features**: Which Phase 2 features provide most user value?

## Implementation Phases

### Phase 1: MVP (2-3 weeks)
**Goal**: Working calculator that answers the core question
- Basic property input (5 fields max)
- Bitcoin price integration
- Simple payoff calculation
- 3 scenario buttons
- Mobile-responsive results
- KrigerDanes styling

### Phase 2: Enhancement (2-3 weeks)
**Goal**: Professional-grade analysis tool
- Advanced financial metrics
- Interactive visualizations  
- Export functionality
- Comprehensive input options
- Detailed amortization tables

This revised approach is much more manageable, focuses on delivering core value quickly, and provides a clear path for enhancement. 
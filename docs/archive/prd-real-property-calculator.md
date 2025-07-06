# Product Requirements Document: Real Property Calculator

## Introduction/Overview

The Real Property Calculator is a single-page web application that enables users to analyze real estate investment scenarios combined with Bitcoin strategy modeling. The tool helps users understand when Bitcoin holdings could potentially pay off remaining mortgage debt on a property investment, providing sophisticated financial projections while maintaining complete user anonymity.

The application solves the problem of complex real estate + cryptocurrency investment analysis by providing an intuitive interface that converts sophisticated Google Sheets calculations into an accessible web tool for investors, advisors, and property owners.

## Goals

1. **Simplify Complex Analysis**: Transform multi-variable real estate and Bitcoin calculations into an intuitive web interface
2. **Provide Investment Clarity**: Show users clear payoff scenarios and timeline projections for Bitcoin-leveraged property investments
3. **Enable Quick Comparisons**: Allow rapid scenario modeling with different Bitcoin projection settings
4. **Maintain Privacy**: Provide anonymous calculations with no data persistence or user tracking
5. **Professional Integration**: Seamlessly integrate with KrigerDanes.com branding and user experience

## User Stories

**As a real estate investor**, I want to quickly evaluate whether Bitcoin holdings could pay off my property mortgage so that I can make informed investment decisions.

**As a financial advisor**, I want to show clients different Bitcoin performance scenarios against property debt so that I can provide comprehensive investment guidance.

**As a property owner**, I want to understand when my Bitcoin investment might eliminate my mortgage debt so that I can plan my financial future.

**As a cryptocurrency enthusiast**, I want to model different Bitcoin sentiment scenarios (Maxi, Bullish, Bearish) so that I can see how my optimism level affects property investment outcomes.

**As a casual user**, I want to enter minimal property data and get immediate results so that I can quickly explore this investment strategy.

## Functional Requirements

### Core Calculation Engine
1. **Property Analysis**: Calculate monthly cash flow, expenses, and income for real estate investments
2. **Multiple Valuation Sources**: Support Wholesale, Bank Appraisal, and Zillow valuation inputs
3. **Bitcoin Integration**: Real-time Bitcoin price fetching with projection modeling
4. **Amortization Modeling**: Generate loan amortization tables with Bitcoin performance overlays
5. **Payoff Trigger Calculation**: Determine intersection points where Bitcoin value equals specified percentage of remaining debt
6. **Scenario Comparison**: Allow multiple Bitcoin performance models including bear market scenarios (-25% to +50%)
7. **ROE Calculations**: Calculate Return on Equity and other performance metrics
8. **Frontend Cash Logic**: Calculate upfront cash requirements for property acquisition
9. **Risk Assessment**: BTC Crashout status and risk indicators
10. **Tax vs Purchase Distinction**: Handle Tax Assessed value separately from Purchase Price

### Data Input System
11. **Smart Defaults**: Provide reasonable default values for quick calculations
12. **Flexible Entry**: Support either detailed property data OR simple monthly totals
13. **Property Details**: Address, units, bedrooms, bathrooms, square footage
14. **Financial Inputs**: Purchase price, mortgage details, interest rates, loan terms
15. **Expense Categories**: Insurance, taxes, expense savings (ExpSave), management fees, finance costs
16. **Income Sources**: Manual rent entry OR ZestRent automated estimates
17. **Real-time Validation**: Basic field validation with immediate feedback
18. **Bitcoin Sentiment Controls**: Preset buttons (Maxi, Bullish, Mild Bull, Bearish) plus custom percentage inputs
19. **BTC Activity Settings**: Configurable BTC activity percentage (default 30%)
20. **Purchase Scenarios**: Support for Purchase Max vs Actual Purchase modeling
21. **Anonymous Operation**: No user accounts, data persistence, or tracking

### Visualization & Output
22. **Interactive Charts**: Dynamic "BTC Alongside Real Estate" stacked area visualization
23. **Amortization Tables**: Detailed month-by-month projections with BTC performance tracking
24. **Property Metrics**: Cap Rate, Debt Coverage Ratio, Loan-to-Value, ROE calculations
25. **Financial Performance**: Profit Margin, Expense Margin, Annual Profit/Loss
26. **Bitcoin Metrics**: BTC bought, BTC coupled amount, monthly BTC sold, remaining BTC
27. **Payoff Analysis**: Trigger percentage settings, payoff dates, remaining asset values
28. **Risk Indicators**: BTC Crashout status, rent shortfall calculations
29. **Total Asset Tracking**: Combined property + Bitcoin value over time
30. **Export Functionality**: Download calculation results and charts

### User Interface
31. **Responsive Design**: Mobile-friendly interface that works across all device sizes
32. **KrigerDanes Branding**: Consistent styling and branding elements from krigerdanes.com
33. **Dashboard Layout**: Organized panels for Property Details, Bitcoin Model, Performance
34. **Tabular Data Display**: Clean tables for financial metrics and amortization schedules
35. **Color-Coded Sections**: Visual hierarchy with black headers and organized data sections
36. **Live Calculations**: Updates results as users modify inputs (button-triggered)
37. **Dropdown Controls**: Payoff trigger percentages, Bitcoin sentiment selections
38. **Status Indicators**: Visual feedback for risk levels and calculation status
39. **Chart Integration**: Embedded interactive visualizations within the dashboard

### Technical Integration
40. **Bitcoin API Integration**: Real-time price fetching from reliable cryptocurrency APIs
41. **ZestRent Integration**: Automated rental value estimation (if available via API)
42. **Client-side Processing**: All calculations performed in browser with no server data storage
43. **Modern React/Next.js**: Built with current web technologies for optimal performance
44. **TypeScript Implementation**: Type-safe financial calculations and data structures
45. **Chart.js/Recharts**: Interactive visualization library for financial charts
46. **CPanel Deployment**: Static export optimized for deployment alongside KrigerDanes.com

## Non-Goals (Out of Scope)

- User authentication or account management
- Data persistence beyond browser session
- Historical transaction tracking
- Tax calculation and reporting features
- Multi-property portfolio management
- Integration with external financial accounts
- Mobile app development
- Advanced real estate market analysis tools
- Legal or financial advice features

## Design Considerations

### Visual Design
- **Branding Alignment**: Harvest visual elements, colors, and styling from KrigerDanes.com
- **Professional Appearance**: Clean, modern interface suitable for financial analysis
- **Clear Data Hierarchy**: Logical organization of inputs, calculations, and results
- **Accessibility**: WCAG compliant design with proper contrast and navigation

### User Experience
- **Progressive Disclosure**: Start with essential inputs, reveal advanced options as needed
- **Immediate Feedback**: Real-time calculation updates and validation messages
- **Clear Error States**: Helpful messaging for invalid inputs or calculation failures
- **Loading States**: Smooth transitions and progress indicators for API calls

## Technical Considerations

### Architecture
- **Next.js Framework**: Server-side rendering with client-side calculations
- **React Components**: Modular, reusable UI components
- **TypeScript**: Type-safe development for reliable calculations
- **Responsive CSS**: Mobile-first design approach

### APIs and Integrations
- **Bitcoin Price APIs**: CoinGecko, CoinMarketCap, or similar reliable sources
- **Error Handling**: Graceful fallbacks for API failures
- **Rate Limiting**: Respect API limits with appropriate caching

### Performance
- **Client-side Calculations**: Heavy computation in browser to minimize server load
- **Optimized Bundle**: Code splitting and lazy loading for fast initial load
- **Caching Strategy**: Smart caching of Bitcoin price data

### Security
- **No Data Storage**: Complete client-side operation eliminates data breach risks
- **Input Sanitization**: Proper validation and sanitization of all user inputs
- **XSS Protection**: Standard security practices for user-generated content

## Success Metrics

1. **User Engagement**: Average time spent using calculator (target: 5+ minutes)
2. **Calculation Completion**: Percentage of users who complete full analysis (target: 70%+)
3. **Return Usage**: Users who perform multiple scenarios in single session (target: 60%+)
4. **Export Usage**: Percentage of users who download/export results (target: 30%+)
5. **Mobile Usage**: Successful calculations on mobile devices (target: 90%+ success rate)

## Open Questions

### Formula Clarifications Needed
1. **BTC Activity Percentage**: How does the 30% BTC Activity setting affect calculations?
2. **Frontend Cash Formula**: Exact calculation for upfront cash requirements ($427,000 in example)
3. **BTC Crashout Logic**: How is the "GOOD" status determined for risk assessment?
4. **ZestRent Integration**: API availability and accuracy for automated rent estimates
5. **ExpSave Calculation**: How monthly expense savings factor into overall analysis
6. **Purchase Max Logic**: How Purchase Max ($720,000) vs Actual Purchase ($25,000) affects scenarios
7. **ROE Formula**: Specific calculation method for Return on Equity (-3.79% in example)
8. **Bear Market Modeling**: How -25% scenario affects BTC projection timeline

### Technical Decisions
5. **Bitcoin API Selection**: Which cryptocurrency price API provides best reliability/features?
6. **Calculation Frequency**: How often should Bitcoin prices update during user session?
7. **Browser Compatibility**: Minimum browser version requirements?
8. **Performance Thresholds**: Maximum acceptable calculation time for complex scenarios?

### Design Elements
9. **Chart Library**: Preference for visualization library (Chart.js, D3, Recharts)?
10. **Asset Integration**: Specific images/assets to harvest from KrigerDanes.com?
11. **Color Scheme**: Primary/secondary colors to match existing branding?
12. **Typography**: Font preferences to maintain brand consistency? 
# Technical Implementation Details

## CoinGecko API Details

### Free Public API Endpoints
- **Endpoint**: `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd`
- **Rate Limits**: 10-50 calls/minute for demo/public API (sufficient for MVP)
- **Response Format**: `{ "bitcoin": { "usd": 43250.50 } }`
- **Fallback Strategy**: Hardcode fallback price (~$45,000) if API fails
- **Caching**: Store price in localStorage for 60 seconds to minimize API calls

### Implementation Code
```typescript
// lib/api/bitcoin.ts
const FALLBACK_PRICE = 45000;

export async function getBitcoinPrice(): Promise<number> {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd'
    );
    const data = await response.json();
    return data.bitcoin.usd;
  } catch (error) {
    console.warn('Bitcoin API failed, using fallback price:', FALLBACK_PRICE);
    return FALLBACK_PRICE;
  }
}
```

## Next.js Static Export Configuration

### next.config.js Setup
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true // Required for static export
  }
}

module.exports = nextConfig
```

### Deployment to CPanel
1. Build with `npm run build`
2. Upload contents of `out` folder to `public_html/real_property_calculator/`
3. Configure URL: `https://krigerdanes.com/real_property_calculator`

## Mortgage Calculation Formulas

### Monthly Payment Formula
```typescript
// Monthly Payment = P * [r(1+r)^n] / [(1+r)^n - 1]
export function calculateMonthlyPayment(
  principal: number,
  annualRate: number,
  termMonths: number
): number {
  const monthlyRate = annualRate / 100 / 12;
  const n = termMonths;
  
  if (monthlyRate === 0) return principal / n;
  
  const monthlyPayment = principal * 
    (monthlyRate * Math.pow(1 + monthlyRate, n)) / 
    (Math.pow(1 + monthlyRate, n) - 1);
    
  return Math.round(monthlyPayment * 100) / 100;
}
```

### Remaining Balance Formula
```typescript
export function calculateRemainingBalance(
  principal: number,
  monthlyPayment: number,
  annualRate: number,
  monthsPaid: number
): number {
  const monthlyRate = annualRate / 100 / 12;
  
  if (monthlyRate === 0) {
    return principal - (monthlyPayment * monthsPaid);
  }
  
  const remaining = principal * Math.pow(1 + monthlyRate, monthsPaid) - 
    monthlyPayment * ((Math.pow(1 + monthlyRate, monthsPaid) - 1) / monthlyRate);
    
  return Math.max(0, Math.round(remaining * 100) / 100);
}
```

## Bitcoin Performance Scenarios

### Three Preset Scenarios
```typescript
export const BITCOIN_SCENARIOS = {
  conservative: {
    name: 'Conservative',
    annualGrowthRate: 15, // 15% per year
    description: 'Modest long-term growth'
  },
  optimistic: {
    name: 'Optimistic', 
    annualGrowthRate: 25, // 25% per year
    description: 'Strong bull market performance'
  },
  aggressive: {
    name: 'Aggressive',
    annualGrowthRate: 40, // 40% per year
    description: 'Maximum growth potential'
  }
};
```

## KrigerDanes Branding Research

### Status: Requires Clarification
- Could not locate active KrigerDanes.com website
- Multiple similar Danish companies found (Krüger VVS, etc.)
- **Action Required**: Client needs to provide:
  - Logo files (.svg, .png)
  - Brand colors (hex codes)
  - Typography preferences
  - Existing style guide if available

### Fallback Branding Plan
- Use professional color scheme: `#1f2937` (dark gray), `#3b82f6` (blue), `#10b981` (green)
- Clean, modern typography: Inter font family
- Minimalist design approach
- Can be easily updated once brand assets are provided

## TypeScript Definitions

### Core Calculator Types
```typescript
// lib/types/calculator.ts
export interface PropertyInputs {
  propertyPrice: number;
  mortgageAmount: number;
  downPayment: number;
  bitcoinInvestment: number;
  bitcoinScenario: 'conservative' | 'optimistic' | 'aggressive';
}

export interface CalculationResults {
  monthlyPayment: number;
  payoffDate: Date;
  monthlyBitcoinSold: number;
  riskLevel: 'good' | 'warning' | 'poor';
  remainingEquity: number;
  totalInterestSaved: number;
}
```

## Primary Use Case: Refinance/HELOC Strategy

### User Scenario
**Most Common Use Case**: Homeowner refinances or gets HELOC to tap existing equity, uses that cash to buy Bitcoin, Bitcoin growth pays off the new loan.

### Input Flow
1. **Current Property Value**: What's the property worth today?
2. **Existing Mortgage Balance**: How much is still owed?
3. **Available Equity**: Property value - existing mortgage
4. **Cash-Out Amount**: How much equity to tap (becomes Bitcoin investment)
5. **New Loan Terms**: Rate and term for refi/HELOC

### Updated Smart Defaults (Refinance Scenario)
```typescript
export const REFINANCE_SMART_DEFAULTS = {
  currentPropertyValue: 900000,    // Current property value
  existingMortgage: 200000,        // Existing mortgage balance
  availableEquity: 700000,         // Available equity (90% LTV)
  cashOutAmount: 400000,           // Amount to tap for Bitcoin
  newLoanAmount: 600000,           // New total mortgage (existing + cash out)
  bitcoinInvestment: 400000,       // Cash-out amount = Bitcoin investment
  bitcoinScenario: 'optimistic'
};
```

### Calculation Differences
- **No down payment calculation** (already own property)
- **Focus on equity tap vs new purchase**
- **New loan payment vs original mortgage savings**
- **Bitcoin pays off new loan, not original mortgage**

## Smart Defaults for MVP

### Example Property Scenario
```typescript
export const SMART_DEFAULTS: PropertyInputs = {
  propertyPrice: 900000,    // $900K property
  mortgageAmount: 452000,   // ~50% LTV
  downPayment: 448000,      // $448K down payment  
  bitcoinInvestment: 427000, // $427K Bitcoin position
  bitcoinScenario: 'optimistic'
};
```

## Performance Optimizations

### Critical Loading Strategy
1. **Bitcoin Price**: Load immediately on page mount
2. **Calculations**: Debounce input changes by 300ms
3. **Results**: Update in real-time as user types
4. **Caching**: Store API responses and calculations in localStorage

## Browser Compatibility

### Supported Features
- All modern browsers (Chrome 88+, Firefox 85+, Safari 14+, Edge 88+)
- Mobile responsive design
- Touch-friendly interfaces
- Offline calculation capability (after initial load)

## Security Considerations

### Client-Side Only
- No server = no database vulnerabilities
- No user data stored or transmitted
- Anonymous usage (privacy-friendly)
- API keys not required for CoinGecko public endpoints
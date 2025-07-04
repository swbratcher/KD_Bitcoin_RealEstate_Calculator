# Cash-Out Refinance vs HELOC Research

## Core User Scenario: Equity Tapping Strategy

### The Process
1. **Homeowner has existing property** with accumulated equity
2. **Chooses equity tapping method**:
   - **Cash-Out Refinance**: Replace existing mortgage with larger loan
   - **HELOC**: Second mortgage/line of credit on top of existing mortgage
3. **Uses cash from equity tap** to purchase Bitcoin
4. **Bitcoin appreciation** pays off the new loan over time

### Cash-Out Refinance Mechanics
- **Replaces existing mortgage** with new, larger loan
- **Lump sum at closing** - difference between new loan and old balance
- **Single monthly payment** - combines original mortgage + cash-out amount
- **Typically lower interest rates** than HELOC
- **Higher closing costs** (2-5% of loan amount)
- **Fixed interest rate** options available
- **Resets loan term** (15-30 years typically)

#### Example Cash-Out Refinance:
- Home worth: $400,000
- Existing mortgage: $250,000
- New loan amount: $320,000
- Cash received: $70,000 (goes to Bitcoin)
- Result: Single $320,000 mortgage payment

### HELOC Mechanics
- **Second mortgage** - keeps existing mortgage unchanged
- **Revolving credit line** - borrow as needed up to limit
- **Two phases**: Draw period (10 years, interest-only) + Repayment period (20 years)
- **Variable interest rates** typically higher than cash-out refi
- **Lower closing costs** - may be waived by some lenders
- **Flexible borrowing** - don't have to take full amount at once

#### Example HELOC:
- Home worth: $400,000
- Existing mortgage: $250,000 (unchanged)
- HELOC limit: $70,000
- Result: Original mortgage payment + HELOC payment

## Key Differences for Calculator

### Financial Impact
| Factor | Cash-Out Refinance | HELOC |
|--------|-------------------|--------|
| Monthly Payment | Single new payment | Two separate payments |
| Interest Rate | Lower, fixed | Higher, variable |
| Closing Costs | Higher ($6,000-$16,000) | Lower ($500-$2,000) |
| Borrowing Limit | 80% of equity | 80-85% of equity |
| Access to Funds | Lump sum only | As needed |

### When to Choose Each
**Cash-Out Refinance Best For:**
- Large one-time Bitcoin investment
- Current mortgage rate is high (can refinance to lower rate)
- Want single monthly payment
- Planning to stay in home long-term
- Need predictable fixed payments

**HELOC Best For:**
- Current mortgage rate is low (don't want to refinance)
- Want flexibility in Bitcoin purchase timing
- Smaller equity tap amounts
- Want lower upfront costs
- Comfortable with variable rates

## Texas-Specific Considerations

### Texas Cash-Out Refinance Rules
- **80% LTV maximum** - must retain 20% equity
- **"Once a cash-out, always a cash-out"** - future refinances treated as cash-out
- **12-month waiting period** between cash-out loans
- **2% closing cost cap** (excluding taxes/insurance)
- **Cannot do multiple cash-out loans simultaneously**

### Impact on Calculator
- More restrictive than other states
- Must model 20% equity retention requirement
- HELOC may be more flexible option for Texas users

## User Flow Implications

### Primary User Journey (Refinance Focus)
1. **Current Property Value**: $900,000
2. **Existing Mortgage**: $200,000
3. **Available Equity**: $700,000 (but limited by 80% LTV rule)
4. **Maximum Cash-Out**: $520,000 (80% of value - existing mortgage)
5. **Bitcoin Investment**: Amount chosen for equity tap
6. **New Mortgage**: $200,000 + cash-out amount
7. **Analysis**: When Bitcoin growth pays off new mortgage

### Calculator Inputs Needed
- Current property value
- Existing mortgage balance
- Desired cash-out amount (for Bitcoin)
- Current mortgage rate
- New mortgage rate available
- Bitcoin performance scenario

### Key Calculations
- **Available equity**: Property value - existing mortgage
- **Maximum cash-out**: (Property value × 0.8) - existing mortgage
- **New mortgage amount**: Existing mortgage + cash-out amount
- **Bitcoin payoff timeline**: When Bitcoin value equals remaining mortgage balance

## API Integration Notes

### Bitcoin Price Integration
- **CoinGecko API**: Free tier sufficient for MVP
- **Fallback pricing**: Hardcoded ~$45,000 if API fails
- **Real-time calculations**: Update payoff timeline as Bitcoin price changes

### Refinance Rate Integration
- **Could integrate mortgage rate APIs** in Phase 2
- **MVP approach**: User-input current and available rates
- **Smart defaults**: Common rate scenarios pre-filled

This research confirms the user flow is clear and the calculator can accurately model the equity-tapping → Bitcoin investment → loan payoff strategy. 
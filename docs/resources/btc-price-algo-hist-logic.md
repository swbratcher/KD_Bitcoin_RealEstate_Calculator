## Bitcoin Performance Cycle Algorithm

### 1. Inputs
- `annualRate` ← target annual return (e.g. 0.20 for 20%)  
- `termStartDate` ← start date of the loan (e.g. from H24)  
- `termYears` ← loan term in years (e.g. from F14)  
- `halvingDate` ← date of the most recent Bitcoin halving (April 2024)  

### 2. Derived Constants
monthsInTerm     = termYears × 12
cycleMonths      = 48        # 4-year halving cycle
summerMonths     = 18
fallMonths       = 12
winterMonths     = 6
springMonths     = 6
targetFallFactor = 0.30      # 70% total drop over fallMonths
winterFactor     = 1.0       # no change in winter

### 3. Compute 4-Year Cycle Return
cycleReturn4y   = (1 + annualRate) ^ 4
netGainFactor   = cycleReturn4y ÷ targetFallFactor

### 4. Solve Per-Month Segment Factors
summerFactorPerMonth = netGainFactor ^ (0.65 ÷ summerMonths)
springFactorPerMonth = netGainFactor ^ (0.35 ÷ springMonths)
fallFactorPerMonth   = targetFallFactor ^ (1 ÷ fallMonths)
winterFactorPerMonth = winterFactor

### 5. Generate Monthly % Changes
for n from 0 to monthsInTerm–1:
  currentDate       = addMonths(termStartDate, n)
  totalMonthsSince  = (year(currentDate)*12 + month(currentDate))
                      – (2024*12 + 4)
  offset            = totalMonthsSince mod cycleMonths

  if offset < summerMonths:
    factor = summerFactorPerMonth
  else if offset < summerMonths + fallMonths:
    factor = fallFactorPerMonth
  else if offset < summerMonths + fallMonths + winterMonths:
    factor = winterFactorPerMonth
  else:
    factor = springFactorPerMonth

  monthlyPctChange[n] = (n = 0 ? 0 : factor − 1)

### 6. Output
* An array `monthlyPctChange[0…monthsInTerm−1]`
* `monthlyPctChange[0] = 0`
* Each subsequent entry is the signed decimal change (e.g. +0.02 or −0.1363) for that month.
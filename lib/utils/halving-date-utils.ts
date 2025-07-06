/**
 * Bitcoin Halving Date Utilities
 * for KD Bitcoin Real Estate Calculator
 * 
 * Provides utilities for calculating position within Bitcoin halving cycles
 * based on real-world halving dates.
 */

// Bitcoin halving history and future projections
export const BITCOIN_HALVINGS = {
  // Historical halvings
  2012: new Date(2012, 10, 28), // November 28, 2012
  2016: new Date(2016, 6, 9),   // July 9, 2016
  2020: new Date(2020, 4, 11),  // May 11, 2020
  2024: new Date(2024, 3, 20),  // April 20, 2024 (actual)
  
  // Future projected halvings (approximately every 4 years)
  2028: new Date(2028, 3, 20),  // April 2028 (projected)
  2032: new Date(2032, 3, 20),  // April 2032 (projected)
  2036: new Date(2036, 3, 20),  // April 2036 (projected)
  2040: new Date(2040, 3, 20),  // April 2040 (projected)
};

/**
 * Get the most recent halving date relative to a given date
 */
export function getLastHalvingDate(referenceDate: Date = new Date()): Date {
  const halvingDates = Object.values(BITCOIN_HALVINGS).sort((a, b) => a.getTime() - b.getTime());
  
  // Find the most recent halving before or on the reference date
  for (let i = halvingDates.length - 1; i >= 0; i--) {
    if (halvingDates[i] <= referenceDate) {
      return halvingDates[i];
    }
  }
  
  // Fallback to earliest halving if reference date is before all halvings
  return halvingDates[0];
}

/**
 * Get the next halving date relative to a given date
 */
export function getNextHalvingDate(referenceDate: Date = new Date()): Date {
  const halvingDates = Object.values(BITCOIN_HALVINGS).sort((a, b) => a.getTime() - b.getTime());
  
  // Find the first halving after the reference date
  for (const halvingDate of halvingDates) {
    if (halvingDate > referenceDate) {
      return halvingDate;
    }
  }
  
  // If no future halving found, project next one (4 years after last)
  const lastHalving = halvingDates[halvingDates.length - 1];
  return new Date(lastHalving.getFullYear() + 4, lastHalving.getMonth(), lastHalving.getDate());
}

/**
 * Calculate months between two dates
 */
export function calculateMonthsBetween(startDate: Date, endDate: Date): number {
  const yearDiff = endDate.getFullYear() - startDate.getFullYear();
  const monthDiff = endDate.getMonth() - startDate.getMonth();
  return yearDiff * 12 + monthDiff;
}

/**
 * Get position within current 48-month halving cycle
 * Returns 0-47 representing months since last halving
 */
export function getCyclePosition(referenceDate: Date = new Date()): number {
  const lastHalving = getLastHalvingDate(referenceDate);
  const monthsSinceHalving = calculateMonthsBetween(lastHalving, referenceDate);
  
  // Return position within 48-month cycle (0-47)
  return monthsSinceHalving % 48;
}

/**
 * Get cycle position for a loan starting at a specific date
 */
export function getLoanStartCyclePosition(loanStartDate: Date): number {
  return getCyclePosition(loanStartDate);
}

/**
 * Determine which season we're in based on cycle position
 */
export function getCurrentSeason(cyclePosition: number): {
  season: 'summer' | 'fall' | 'winter' | 'spring';
  monthInSeason: number;
  totalMonthsInSeason: number;
} {
  // Season definitions based on original algorithm
  const SUMMER_MONTHS = 18; // Months 0-17
  const FALL_MONTHS = 12;   // Months 18-29
  const WINTER_MONTHS = 6;  // Months 30-35
  const SPRING_MONTHS = 6;  // Months 36-47
  
  if (cyclePosition < SUMMER_MONTHS) {
    return {
      season: 'summer',
      monthInSeason: cyclePosition,
      totalMonthsInSeason: SUMMER_MONTHS
    };
  } else if (cyclePosition < SUMMER_MONTHS + FALL_MONTHS) {
    return {
      season: 'fall',
      monthInSeason: cyclePosition - SUMMER_MONTHS,
      totalMonthsInSeason: FALL_MONTHS
    };
  } else if (cyclePosition < SUMMER_MONTHS + FALL_MONTHS + WINTER_MONTHS) {
    return {
      season: 'winter',
      monthInSeason: cyclePosition - SUMMER_MONTHS - FALL_MONTHS,
      totalMonthsInSeason: WINTER_MONTHS
    };
  } else {
    return {
      season: 'spring',
      monthInSeason: cyclePosition - SUMMER_MONTHS - FALL_MONTHS - WINTER_MONTHS,
      totalMonthsInSeason: SPRING_MONTHS
    };
  }
}

/**
 * Add months to a date
 */
export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

/**
 * Get cycle information for debugging/display
 */
export function getCycleInfo(referenceDate: Date = new Date()) {
  const lastHalving = getLastHalvingDate(referenceDate);
  const nextHalving = getNextHalvingDate(referenceDate);
  const cyclePosition = getCyclePosition(referenceDate);
  const seasonInfo = getCurrentSeason(cyclePosition);
  
  return {
    lastHalving: lastHalving.toISOString().split('T')[0],
    nextHalving: nextHalving.toISOString().split('T')[0],
    cyclePosition,
    season: seasonInfo.season,
    monthInSeason: seasonInfo.monthInSeason,
    monthsSinceLastHalving: calculateMonthsBetween(lastHalving, referenceDate),
    monthsToNextHalving: calculateMonthsBetween(referenceDate, nextHalving)
  };
}
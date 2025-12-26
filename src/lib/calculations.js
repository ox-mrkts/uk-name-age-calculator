/**
 * UK Name Age Calculator - Core Calculation Logic
 *
 * This module calculates age distributions for given names based on:
 * 1. Birth data (number of babies given the name each year)
 * 2. Life tables (survival probabilities by age)
 */

const CURRENT_YEAR = 2025;

/**
 * Calculate age distribution for a given name
 *
 * @param {string} name - The name to analyze
 * @param {string} gender - 'male' or 'female'
 * @param {Object} babyNamesData - Baby names data: { "1996": 4532, "1997": 5123, ... }
 * @param {Object} lifeTablesData - Life tables: { "1996": [1.0, 0.999, ...], "1997": [...], ... }
 * @returns {Array} - Array of {year, births, living, age} objects
 */
export function calculateAgeDistribution(name, gender, babyNamesData, lifeTablesData) {
  if (!name || !babyNamesData || !lifeTablesData) {
    return [];
  }

  const distribution = [];
  const years = Object.keys(babyNamesData).map(Number).sort((a, b) => a - b);

  for (const year of years) {
    const births = babyNamesData[year] || 0;

    // Skip years with no births
    if (births === 0) {
      continue;
    }

    // Calculate current age for this birth cohort
    const age = CURRENT_YEAR - year;

    // Get survival probability for this age from life tables
    let survivalProbability = 1.0;

    if (lifeTablesData[year] && lifeTablesData[year][age] !== undefined) {
      survivalProbability = lifeTablesData[year][age];
    } else {
      // Fallback: use most recent year's life table, or estimate
      const availableYears = Object.keys(lifeTablesData).map(Number).sort((a, b) => b - a);
      const closestYear = availableYears.find(y => lifeTablesData[y][age] !== undefined);

      if (closestYear && lifeTablesData[closestYear][age] !== undefined) {
        survivalProbability = lifeTablesData[closestYear][age];
      } else {
        // Simple approximation if no data available
        survivalProbability = Math.max(0, 1 - (age * 0.012));
      }
    }

    // Calculate estimated living population
    const living = Math.round(births * survivalProbability);

    distribution.push({
      year,
      births,
      living,
      age
    });
  }

  return distribution;
}

/**
 * Calculate median age weighted by living population
 *
 * @param {Array} distribution - Array of {year, births, living, age} objects
 * @returns {number} - Median age (rounded to nearest year)
 */
export function calculateMedianAge(distribution) {
  if (!distribution || distribution.length === 0) {
    return 0;
  }

  // Calculate total living population
  const totalLiving = distribution.reduce((sum, d) => sum + d.living, 0);

  if (totalLiving === 0) {
    return 0;
  }

  // Find the age at which we've accounted for 50% of the living population
  const halfPopulation = totalLiving / 2;
  let cumulativeLiving = 0;

  // Sort by age (descending) to accumulate from oldest to youngest
  const sortedByAge = [...distribution].sort((a, b) => b.age - a.age);

  for (const entry of sortedByAge) {
    cumulativeLiving += entry.living;
    if (cumulativeLiving >= halfPopulation) {
      return entry.age;
    }
  }

  // Fallback: return most common age
  const mostCommon = distribution.reduce((max, d) => d.living > max.living ? d : max, distribution[0]);
  return mostCommon.age;
}

/**
 * Calculate total estimated living population with the name
 *
 * @param {Array} distribution - Array of {year, births, living, age} objects
 * @returns {number} - Total living population
 */
export function calculateTotalLiving(distribution) {
  if (!distribution || distribution.length === 0) {
    return 0;
  }

  return distribution.reduce((sum, d) => sum + d.living, 0);
}

/**
 * Find the most popular birth year (highest number of births)
 *
 * @param {Array} distribution - Array of {year, births, living, age} objects
 * @returns {Object} - {year, births} for the peak year
 */
export function findPeakBirthYear(distribution) {
  if (!distribution || distribution.length === 0) {
    return { year: 0, births: 0 };
  }

  const peak = distribution.reduce((max, d) => d.births > max.births ? d : max, distribution[0]);
  return { year: peak.year, births: peak.births };
}

/**
 * Calculate age range percentiles
 *
 * @param {Array} distribution - Array of {year, births, living, age} objects
 * @param {number} lowerPercentile - Lower percentile (e.g., 10 for 10th percentile)
 * @param {number} upperPercentile - Upper percentile (e.g., 90 for 90th percentile)
 * @returns {Object} - {lower: age, upper: age}
 */
export function calculateAgeRange(distribution, lowerPercentile = 10, upperPercentile = 90) {
  if (!distribution || distribution.length === 0) {
    return { lower: 0, upper: 0 };
  }

  const totalLiving = distribution.reduce((sum, d) => sum + d.living, 0);

  if (totalLiving === 0) {
    return { lower: 0, upper: 0 };
  }

  const lowerTarget = totalLiving * (lowerPercentile / 100);
  const upperTarget = totalLiving * (upperPercentile / 100);

  // Sort by age (descending)
  const sortedByAge = [...distribution].sort((a, b) => b.age - a.age);

  let cumulativeLiving = 0;
  let lowerAge = null;
  let upperAge = null;

  for (const entry of sortedByAge) {
    cumulativeLiving += entry.living;

    if (upperAge === null && cumulativeLiving >= totalLiving - upperTarget) {
      upperAge = entry.age;
    }

    if (lowerAge === null && cumulativeLiving >= totalLiving - lowerTarget) {
      lowerAge = entry.age;
    }

    if (lowerAge !== null && upperAge !== null) {
      break;
    }
  }

  return {
    lower: lowerAge || 0,
    upper: upperAge || 0
  };
}

/**
 * Get summary statistics for a name
 *
 * @param {Array} distribution - Array of {year, births, living, age} objects
 * @returns {Object} - Complete statistics summary
 */
export function calculateStats(distribution) {
  const totalLiving = calculateTotalLiving(distribution);
  const medianAge = calculateMedianAge(distribution);
  const peakBirthYear = findPeakBirthYear(distribution);
  const ageRange = calculateAgeRange(distribution, 10, 90);

  return {
    totalLiving,
    medianAge,
    peakBirthYear,
    ageRange,
    yearRange: {
      earliest: distribution.length > 0 ? distribution[0].year : 0,
      latest: distribution.length > 0 ? distribution[distribution.length - 1].year : 0
    }
  };
}

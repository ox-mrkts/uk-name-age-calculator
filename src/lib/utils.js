/**
 * Utility Functions
 *
 * Helper functions for formatting, validation, and data manipulation
 */

/**
 * Format a large number with comma separators
 *
 * @param {number} num - Number to format
 * @returns {string} - Formatted number (e.g., "1,234,567")
 */
export function formatNumber(num) {
  if (typeof num !== 'number' || isNaN(num)) {
    return '0';
  }

  return num.toLocaleString('en-GB');
}

/**
 * Normalize a name for comparison and lookup
 *
 * @param {string} name - Name to normalize
 * @returns {string} - Normalized name
 */
export function normalizeName(name) {
  if (typeof name !== 'string') {
    return '';
  }

  return name.trim();
}

/**
 * Validate that a name is valid (not empty, reasonable length)
 *
 * @param {string} name - Name to validate
 * @returns {boolean} - True if valid
 */
export function isValidName(name) {
  const normalized = normalizeName(name);

  return normalized.length > 0 && normalized.length <= 50;
}

/**
 * Format an age for display
 *
 * @param {number} age - Age in years
 * @returns {string} - Formatted age (e.g., "25 years old", "1 year old")
 */
export function formatAge(age) {
  if (typeof age !== 'number' || isNaN(age) || age < 0) {
    return '0 years old';
  }

  if (age === 1) {
    return '1 year old';
  }

  return `${age} years old`;
}

/**
 * Format a year range
 *
 * @param {number} startYear - Start year
 * @param {number} endYear - End year
 * @returns {string} - Formatted range (e.g., "1996-2024")
 */
export function formatYearRange(startYear, endYear) {
  if (!startYear || !endYear) {
    return '';
  }

  if (startYear === endYear) {
    return `${startYear}`;
  }

  return `${startYear}-${endYear}`;
}

/**
 * Get a suggested gender based on name presence in datasets
 *
 * @param {string} name - Name to check
 * @param {Object} boysData - Boys names data
 * @param {Object} girlsData - Girls names data
 * @returns {string} - 'male', 'female', or 'both'
 */
export function suggestGender(name, boysData, girlsData) {
  const normalizedName = normalizeName(name);

  const inBoys = boysData && normalizedName in boysData;
  const inGirls = girlsData && normalizedName in girlsData;

  if (inBoys && inGirls) {
    return 'both';
  } else if (inBoys) {
    return 'male';
  } else if (inGirls) {
    return 'female';
  }

  return null;
}

/**
 * Debounce a function call
 *
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
export function debounce(func, wait = 300) {
  let timeout;

  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Get ordinal suffix for a number (1st, 2nd, 3rd, etc.)
 *
 * @param {number} num - Number to get suffix for
 * @returns {string} - Ordinal suffix (st, nd, rd, th)
 */
export function getOrdinalSuffix(num) {
  const j = num % 10;
  const k = num % 100;

  if (j === 1 && k !== 11) {
    return 'st';
  }
  if (j === 2 && k !== 12) {
    return 'nd';
  }
  if (j === 3 && k !== 13) {
    return 'rd';
  }

  return 'th';
}

/**
 * Format number with ordinal suffix (1st, 2nd, 3rd, etc.)
 *
 * @param {number} num - Number to format
 * @returns {string} - Formatted ordinal number
 */
export function formatOrdinal(num) {
  return `${num}${getOrdinalSuffix(num)}`;
}

/**
 * Get a color based on gender
 *
 * @param {string} gender - 'male' or 'female'
 * @returns {Object} - { primary, secondary } colors
 */
export function getGenderColors(gender) {
  if (gender === 'female') {
    return {
      primary: '#ec4899', // Pink
      secondary: '#fce7f3', // Light pink
      line: '#9d174d' // Dark pink
    };
  }

  // Default to male colors
  return {
    primary: '#3b82f6', // Blue
    secondary: '#dbeafe', // Light blue
    line: '#1e40af' // Dark blue
  };
}

/**
 * Calculate percentage
 *
 * @param {number} value - Value
 * @param {number} total - Total
 * @returns {number} - Percentage (0-100)
 */
export function calculatePercentage(value, total) {
  if (total === 0) {
    return 0;
  }

  return (value / total) * 100;
}

/**
 * Format percentage
 *
 * @param {number} percentage - Percentage to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} - Formatted percentage (e.g., "25.5%")
 */
export function formatPercentage(percentage, decimals = 1) {
  if (typeof percentage !== 'number' || isNaN(percentage)) {
    return '0%';
  }

  return `${percentage.toFixed(decimals)}%`;
}

/**
 * Clamp a value between min and max
 *
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} - Clamped value
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

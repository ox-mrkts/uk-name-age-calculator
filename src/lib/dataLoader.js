/**
 * Data Loader Module
 *
 * Handles fetching and caching of baby names and life tables data
 */

// In-memory cache to avoid repeated fetches
let cache = {
  babyNamesBoys: null,
  babyNamesGirls: null,
  lifeTablesMale: null,
  lifeTablesFemale: null
};

/**
 * Fetch JSON data from public directory
 *
 * @param {string} path - Path to JSON file (relative to /public)
 * @returns {Promise<Object>} - Parsed JSON data
 */
async function fetchJSON(path) {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${path}: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Load baby names data for a specific gender
 *
 * @param {string} gender - 'male' or 'female'
 * @returns {Promise<Object>} - Baby names data: { "Oliver": { "1996": 4532, ... }, ... }
 */
export async function loadBabyNames(gender) {
  const cacheKey = gender === 'male' ? 'babyNamesBoys' : 'babyNamesGirls';
  const filename = gender === 'male' ? 'baby-names-boys.json' : 'baby-names-girls.json';

  // Return from cache if available
  if (cache[cacheKey]) {
    return cache[cacheKey];
  }

  try {
    const data = await fetchJSON(`/data/${filename}`);
    cache[cacheKey] = data;
    return data;
  } catch (error) {
    console.error(`Error loading baby names data for ${gender}:`, error);
    throw new Error(`Could not load baby names data. Please ensure data files have been processed.`);
  }
}

/**
 * Load life tables data for a specific gender
 *
 * @param {string} gender - 'male' or 'female'
 * @returns {Promise<Object>} - Life tables data: { "1996": [1.0, 0.999, ...], "1997": [...], ... }
 */
export async function loadLifeTables(gender) {
  const cacheKey = gender === 'male' ? 'lifeTablesMale' : 'lifeTablesFemale';
  const filename = `life-tables-${gender}.json`;

  // Return from cache if available
  if (cache[cacheKey]) {
    return cache[cacheKey];
  }

  try {
    const data = await fetchJSON(`/data/${filename}`);
    cache[cacheKey] = data;
    return data;
  } catch (error) {
    console.error(`Error loading life tables data for ${gender}:`, error);
    throw new Error(`Could not load life tables data. Please ensure data files have been processed.`);
  }
}

/**
 * Load all data for a specific gender
 *
 * @param {string} gender - 'male' or 'female'
 * @returns {Promise<Object>} - { babyNames, lifeTables }
 */
export async function loadAllData(gender) {
  try {
    const [babyNames, lifeTables] = await Promise.all([
      loadBabyNames(gender),
      loadLifeTables(gender)
    ]);

    return { babyNames, lifeTables };
  } catch (error) {
    console.error(`Error loading data for ${gender}:`, error);
    throw error;
  }
}

/**
 * Check if a name exists in the dataset (case-insensitive)
 *
 * @param {string} name - Name to search for
 * @param {string} gender - 'male' or 'female'
 * @param {Object} babyNamesData - Baby names data object
 * @returns {boolean} - True if name exists
 */
export function nameExists(name, gender, babyNamesData) {
  if (!name || !babyNamesData) {
    return false;
  }

  // Normalize name for case-insensitive comparison
  const normalizedName = name.trim();
  const lowerCaseName = normalizedName.toLowerCase();

  // Check if exact match exists first
  if (normalizedName in babyNamesData) {
    return true;
  }

  // Otherwise do case-insensitive search
  return Object.keys(babyNamesData).some(key => key.toLowerCase() === lowerCaseName);
}

/**
 * Get name data for a specific name (case-insensitive)
 *
 * @param {string} name - Name to retrieve
 * @param {Object} babyNamesData - Baby names data object
 * @returns {Object|null} - Name data by year or null if not found
 */
export function getNameData(name, babyNamesData) {
  if (!name || !babyNamesData) {
    return null;
  }

  const normalizedName = name.trim();

  // Try exact match first
  if (babyNamesData[normalizedName]) {
    return babyNamesData[normalizedName];
  }

  // Case-insensitive search
  const lowerCaseName = normalizedName.toLowerCase();
  const matchingKey = Object.keys(babyNamesData).find(key => key.toLowerCase() === lowerCaseName);

  return matchingKey ? babyNamesData[matchingKey] : null;
}

/**
 * Get list of all available names for autocomplete
 *
 * @param {Object} babyNamesData - Baby names data object
 * @param {number} limit - Maximum number of names to return
 * @returns {Array<string>} - Array of names sorted alphabetically
 */
export function getAllNames(babyNamesData, limit = 1000) {
  if (!babyNamesData) {
    return [];
  }

  const names = Object.keys(babyNamesData).sort();

  return limit ? names.slice(0, limit) : names;
}

/**
 * Search for names matching a query
 *
 * @param {string} query - Search query
 * @param {Object} babyNamesData - Baby names data object
 * @param {number} limit - Maximum number of results
 * @returns {Array<string>} - Array of matching names
 */
export function searchNames(query, babyNamesData, limit = 20) {
  if (!query || !babyNamesData) {
    return [];
  }

  const normalizedQuery = query.trim().toLowerCase();

  if (normalizedQuery.length === 0) {
    return [];
  }

  const allNames = Object.keys(babyNamesData);

  // Find names that start with the query
  const startsWith = allNames.filter(name =>
    name.toLowerCase().startsWith(normalizedQuery)
  );

  // If we have enough matches, return them
  if (startsWith.length >= limit) {
    return startsWith.slice(0, limit).sort();
  }

  // Otherwise, also include names that contain the query
  const contains = allNames.filter(name =>
    name.toLowerCase().includes(normalizedQuery) &&
    !name.toLowerCase().startsWith(normalizedQuery)
  );

  return [...startsWith, ...contains].slice(0, limit).sort();
}

/**
 * Clear the cache (useful for testing or if data is updated)
 */
export function clearCache() {
  cache = {
    babyNamesBoys: null,
    babyNamesGirls: null,
    lifeTablesMale: null,
    lifeTablesFemale: null
  };
}

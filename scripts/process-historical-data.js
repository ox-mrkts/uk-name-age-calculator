const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

console.log('=== Processing Historical Baby Names (1904-1994) ===\n');

// Configuration
const RAW_DIR = path.join(__dirname, '../data/raw');
const OUTPUT_DIR = path.join(__dirname, '../public/data');

// Historical decades to process
const HISTORICAL_DECADES = [1904, 1914, 1924, 1934, 1944, 1954, 1964, 1974, 1984, 1994];

/**
 * Estimate birth counts from ranking position
 *
 * Uses an exponential decay model:
 * - Rank 1: ~50,000 births (very popular name)
 * - Rank 10: ~20,000 births
 * - Rank 50: ~3,000 births
 * - Rank 100: ~500 births
 *
 * This is a rough approximation based on the fact that historical names
 * were more concentrated than modern names.
 */
function estimateBirthsFromRank(rank) {
  if (rank < 1 || rank > 100) {
    return 0;
  }

  // Exponential decay: count = 50000 * e^(-0.045 * rank)
  const estimatedBirths = Math.round(50000 * Math.exp(-0.045 * rank));

  return estimatedBirths;
}

/**
 * Interpolate estimated births between two decades
 *
 * @param {number} year - Year to interpolate for
 * @param {number} decadeStart - Start decade (e.g., 1974)
 * @param {number} decadeEnd - End decade (e.g., 1984)
 * @param {number} birthsStart - Estimated births at start decade
 * @param {number} birthsEnd - Estimated births at end decade
 */
function interpolate(year, decadeStart, decadeEnd, birthsStart, birthsEnd) {
  if (year === decadeStart) return birthsStart;
  if (year === decadeEnd) return birthsEnd;

  const ratio = (year - decadeStart) / (decadeEnd - decadeStart);
  return Math.round(birthsStart + ratio * (birthsEnd - birthsStart));
}

/**
 * Process historical rankings file
 */
function processHistoricalRankings() {
  const historicalFile = path.join(RAW_DIR, 'historical-names-1904-2024.xlsx');

  if (!fs.existsSync(historicalFile)) {
    console.error('❌ Historical rankings file not found:', historicalFile);
    return null;
  }

  const workbook = XLSX.readFile(historicalFile);

  const genders = {
    'Table_1': { output: 'historical-girls.json', label: 'girls' },
    'Table_2': { output: 'historical-boys.json', label: 'boys' }
  };

  const results = {};

  for (const [sheetName, config] of Object.entries(genders)) {
    console.log(`Processing historical ${config.label} rankings from ${sheetName}...`);

    const sheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Find header row with decade years
    let headerRowIndex = -1;
    for (let i = 0; i < Math.min(10, rawData.length); i++) {
      const row = rawData[i];
      if (row[0] === 'Rank' || row[0] === 'rank') {
        headerRowIndex = i;
        break;
      }
    }

    if (headerRowIndex === -1) {
      console.error(`❌ Could not find header row in ${sheetName}`);
      continue;
    }

    const headers = rawData[headerRowIndex];

    // Map decade years to their column indices
    const decadeColumns = {};
    for (let i = 1; i < headers.length; i++) {
      const year = parseInt(headers[i]);
      if (!isNaN(year) && HISTORICAL_DECADES.includes(year)) {
        decadeColumns[year] = i;
      }
    }

    console.log(`Found decades: ${Object.keys(decadeColumns).sort().join(', ')}`);

    // Extract rankings for each decade
    // Structure: { 1904: { "Mary": rank, "Florence": rank, ... }, 1914: { ... } }
    const rankingsByDecade = {};

    for (const decade of HISTORICAL_DECADES) {
      rankingsByDecade[decade] = {};
    }

    // Process each row (rank 1-100)
    for (let i = headerRowIndex + 1; i < rawData.length && i < headerRowIndex + 101; i++) {
      const row = rawData[i];
      const rank = parseInt(row[0]);

      if (isNaN(rank) || rank < 1 || rank > 100) {
        continue;
      }

      // For each decade, record the name at this rank
      for (const decade of HISTORICAL_DECADES) {
        const colIndex = decadeColumns[decade];
        if (colIndex !== undefined) {
          const name = row[colIndex];
          if (name && typeof name === 'string') {
            rankingsByDecade[decade][name] = rank;
          }
        }
      }
    }

    // Convert rankings to estimated birth counts
    // Structure: { "Mary": { 1904: 50000, 1914: 48000, ... }, ... }
    const estimatedCounts = {};

    for (const [decade, rankings] of Object.entries(rankingsByDecade)) {
      for (const [name, rank] of Object.entries(rankings)) {
        if (!estimatedCounts[name]) {
          estimatedCounts[name] = {};
        }
        estimatedCounts[name][decade] = estimateBirthsFromRank(rank);
      }
    }

    // Interpolate years between decades
    const allNames = Object.keys(estimatedCounts);

    for (const name of allNames) {
      const nameDecades = Object.keys(estimatedCounts[name]).map(Number).sort((a, b) => a - b);

      // For each pair of consecutive decades
      for (let i = 0; i < nameDecades.length - 1; i++) {
        const decadeStart = nameDecades[i];
        const decadeEnd = nameDecades[i + 1];
        const birthsStart = estimatedCounts[name][decadeStart];
        const birthsEnd = estimatedCounts[name][decadeEnd];

        // Interpolate years between
        for (let year = decadeStart + 1; year < decadeEnd; year++) {
          estimatedCounts[name][year] = interpolate(
            year,
            decadeStart,
            decadeEnd,
            birthsStart,
            birthsEnd
          );
        }
      }

      // Extend from first decade back to 1904 (if needed)
      const firstDecade = nameDecades[0];
      if (firstDecade > 1904) {
        const firstCount = estimatedCounts[name][firstDecade];
        for (let year = 1904; year < firstDecade; year++) {
          estimatedCounts[name][year] = firstCount;
        }
      }

      // Extend from last decade to 1995 (to connect with 1996 data)
      const lastDecade = nameDecades[nameDecades.length - 1];
      if (lastDecade < 1995) {
        const lastCount = estimatedCounts[name][lastDecade];
        for (let year = lastDecade + 1; year <= 1995; year++) {
          // Gradually fade out to avoid sharp discontinuity with 1996
          const fadeRatio = 1 - ((year - lastDecade) / (1996 - lastDecade)) * 0.3;
          estimatedCounts[name][year] = Math.round(lastCount * fadeRatio);
        }
      }
    }

    console.log(`Processed ${allNames.length} unique ${config.label} names from historical rankings`);
    results[config.label] = estimatedCounts;
  }

  return results;
}

/**
 * Merge historical estimates with modern data
 */
function mergeWithModernData(historicalData) {
  console.log('\nMerging historical estimates with modern data...\n');

  const genders = [
    { label: 'boys', historicalFile: 'historical-boys.json', modernFile: 'baby-names-boys.json', outputFile: 'baby-names-boys.json' },
    { label: 'girls', historicalFile: 'historical-girls.json', modernFile: 'baby-names-girls.json', outputFile: 'baby-names-girls.json' }
  ];

  for (const gender of genders) {
    console.log(`Merging ${gender.label} data...`);

    const historical = historicalData[gender.label] || {};
    const modernPath = path.join(OUTPUT_DIR, gender.modernFile);

    // Load existing modern data
    let modern = {};
    if (fs.existsSync(modernPath)) {
      modern = JSON.parse(fs.readFileSync(modernPath, 'utf8'));
    }

    // Merge: modern data takes precedence for 1996+
    const merged = { ...historical };

    for (const [name, years] of Object.entries(modern)) {
      if (!merged[name]) {
        merged[name] = {};
      }

      // Add/overwrite with modern data
      for (const [year, count] of Object.entries(years)) {
        merged[name][year] = count;
      }
    }

    // Count names with historical data
    let historicalCount = 0;
    let modernOnlyCount = 0;
    let bothCount = 0;

    for (const [name, years] of Object.entries(merged)) {
      const hasHistorical = Object.keys(years).some(y => parseInt(y) < 1996);
      const hasModern = Object.keys(years).some(y => parseInt(y) >= 1996);

      if (hasHistorical && hasModern) {
        bothCount++;
      } else if (hasHistorical) {
        historicalCount++;
      } else if (hasModern) {
        modernOnlyCount++;
      }
    }

    console.log(`  Names with both historical & modern data: ${bothCount}`);
    console.log(`  Names with only historical data (pre-1996): ${historicalCount}`);
    console.log(`  Names with only modern data (1996+): ${modernOnlyCount}`);
    console.log(`  Total unique names: ${Object.keys(merged).length}`);

    // Save merged data
    const outputPath = path.join(OUTPUT_DIR, gender.outputFile);

    // Backup original modern data first
    const backupPath = path.join(OUTPUT_DIR, `${gender.modernFile}.backup`);
    if (fs.existsSync(modernPath) && !fs.existsSync(backupPath)) {
      fs.copyFileSync(modernPath, backupPath);
      console.log(`  Created backup: ${gender.modernFile}.backup`);
    }

    fs.writeFileSync(outputPath, JSON.stringify(merged, null, 2));
    const stats = fs.statSync(outputPath);
    console.log(`  ✓ Saved to ${gender.outputFile} (${(stats.size / 1024 / 1024).toFixed(2)} MB)\n`);
  }
}

/**
 * Main function
 */
function main() {
  const historicalData = processHistoricalRankings();

  if (!historicalData) {
    console.error('Failed to process historical rankings');
    process.exit(1);
  }

  mergeWithModernData(historicalData);

  console.log('=== Historical Data Processing Complete! ===\n');
  console.log('Data now extends from 1904 to 2024 (121 years)');
  console.log('Top 100 historical names have estimated counts for 1904-1995');
  console.log('All names have exact counts for 1996-2024\n');
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { estimateBirthsFromRank, interpolate };
